// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./ApeBeatsMetadataLib.sol";
import "./ApeBeatsRoyalties.sol";

// Delegate.xyz registry interface
interface IDelegateRegistry {
    function checkDelegateForAll(address delegate, address vault) external view returns (bool);
}

contract ApeBeatsGenesis is Initializable, ERC721Upgradeable, ERC721RoyaltyUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using Strings for uint256;

    // Constants
    uint256 public constant TOTAL_SUPPLY = 420;
    uint256 public constant FOUNDER_MINT_AMOUNT = 4;
    uint256 public constant GTD_MINT_AMOUNT = 42;
    uint256 public constant GTD_PRICE = 4.2 ether;
    uint256 public constant FCFS_PRICE = 6.9 ether;
    uint256 public constant PUBLIC_PRICE = 6.9 ether;
    uint256 public constant GTD_MAX_PER_WALLET = 1;
    uint256 public constant FCFS_MAX_PER_WALLET = 4;
    uint256 public constant PUBLIC_MAX_PER_WALLET = 5;
    uint96 public constant ROYALTY_BASIS_POINTS = 420;

    // State variables
    uint256 public totalMinted;
    bytes32 public gtdMerkleRoot;  // Separate Merkle root for GTD phase
    bytes32 public fcfsMerkleRoot; // Renamed from wlFcfsMerkleRoot for clarity
    address public treasury;
    address public founder;
    ApeBeatsMetadataLib public metadataLib;
    ApeBeatsRoyalties public royaltiesContract;
    string public prerevealNoiseBase64;
    IDelegateRegistry public delegateRegistry;

    // Phase timestamps
    uint256 public founderMintStart;
    uint256 public gtdMintStart;
    uint256 public fcfsMintStart;
    uint256 public publicMintStart;

    // Phase durations
    uint256 public constant GTD_DURATION = 15 minutes;
    uint256 public constant FCFS_DURATION = 30 minutes;

    // Founder mint tracking
    uint256 public founderMinted;

    // Per-wallet mint tracking for each phase
    mapping(address => uint256) public mintedPerWalletGTD;
    mapping(address => uint256) public mintedPerWalletFCFS;
    mapping(address => uint256) public mintedPerWalletPublic;

    event Minted(address indexed to, uint256 indexed tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        bytes32 _gtdMerkleRoot,
        bytes32 _fcfsMerkleRoot,
        address _treasury,
        address _metadataLib,
        address payable _royaltiesContract,
        address _delegateRegistry
    ) external initializer {
        __ERC721_init("ApeBeatsGenesis", "ABG");
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __ERC721Royalty_init();

        require(_treasury != address(0), "Treasury cannot be zero address");
        require(_metadataLib != address(0), "MetadataLib cannot be zero address");
        require(_royaltiesContract != address(0), "Royalties contract cannot be zero address");
        require(_delegateRegistry != address(0), "Delegate registry cannot be zero address");

        gtdMerkleRoot = _gtdMerkleRoot;
        fcfsMerkleRoot = _fcfsMerkleRoot;
        treasury = _treasury;
        founder = msg.sender;
        metadataLib = ApeBeatsMetadataLib(_metadataLib);
        royaltiesContract = ApeBeatsRoyalties(_royaltiesContract);
        delegateRegistry = IDelegateRegistry(_delegateRegistry);
        _setDefaultRoyalty(address(royaltiesContract), ROYALTY_BASIS_POINTS);

        // Start founder mint phase immediately
        founderMintStart = block.timestamp;
    }

    function setPrerevealNoiseBase64(string calldata _prerevealNoiseBase64) external onlyOwner {
        require(bytes(_prerevealNoiseBase64).length > 0, "Prereveal URI cannot be empty");
        prerevealNoiseBase64 = _prerevealNoiseBase64;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721RoyaltyUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // **Founder Mint**: 4 free NFTs to founder, auto-transitions to GTD phase
    function mintFounder(uint256 amount) external nonReentrant {
        require(msg.sender == founder, "Only founder can mint");
        require(isFounderMintActive(), "Founder mint phase not active");
        require(founderMinted + amount <= FOUNDER_MINT_AMOUNT, "Exceeds founder mint limit");
        require(totalMinted + amount <= TOTAL_SUPPLY, "Exceeds total supply");

        founderMinted += amount;
        for (uint256 i = 0; i < amount; i++) {
            totalMinted++;
            _safeMint(founder, totalMinted);
            royaltiesContract.mintAndRecord(totalMinted, founder, 1);
            emit Minted(founder, totalMinted);
        }

        // Auto-transition to GTD mint after all 4 are minted
        if (founderMinted == FOUNDER_MINT_AMOUNT) {
            gtdMintStart = block.timestamp;
        }
    }

    // **GTD Mint**: 42 NFTs, 4.2 Ape, 1 per wallet, separate Merkle list, 15 min duration
    function mintGTD(address vault, bytes32[] calldata merkleProof) external payable nonReentrant {
        require(isGTDMintActive(), "GTD mint phase not active");
        require(totalMinted + 1 <= TOTAL_SUPPLY, "Exceeds total supply");
        require(msg.value >= GTD_PRICE, "Insufficient payment");

        address account = _getAccount(vault);
        require(mintedPerWalletGTD[account] == 0, "Already minted GTD");

        bytes32 leaf = keccak256(abi.encodePacked(account));
        require(MerkleProof.verify(merkleProof, gtdMerkleRoot, leaf), "Invalid Merkle proof");

        mintedPerWalletGTD[account] += 1;
        totalMinted++;
        _safeMint(msg.sender, totalMinted);
        royaltiesContract.mintAndRecord(totalMinted, msg.sender, 1);
        emit Minted(msg.sender, totalMinted);

        if (msg.value > GTD_PRICE) {
            (bool sent, ) = msg.sender.call{value: msg.value - GTD_PRICE}("");
            require(sent, "Refund failed");
        }

        // Auto-transition to FCFS after 15 minutes (handled in isGTDMintActive)
    }

    // **FCFS Mint**: 4 per wallet, 6.9 Ape, wide Merkle list, 30 min duration
    function mintFCFS(uint256 amount, address vault, bytes32[] calldata merkleProof) external payable nonReentrant {
        require(isFCFSMintActive(), "FCFS mint phase not active");
        require(totalMinted + amount <= TOTAL_SUPPLY, "Exceeds total supply");
        require(amount <= FCFS_MAX_PER_WALLET, "Exceeds FCFS limit");
        require(msg.value >= FCFS_PRICE * amount, "Insufficient payment");

        address account = _getAccount(vault);
        require(mintedPerWalletFCFS[account] + amount <= FCFS_MAX_PER_WALLET, "Exceeds wallet limit");

        bytes32 leaf = keccak256(abi.encodePacked(account));
        require(MerkleProof.verify(merkleProof, fcfsMerkleRoot, leaf), "Invalid Merkle proof");

        mintedPerWalletFCFS[account] += amount;
        for (uint256 i = 0; i < amount; i++) {
            totalMinted++;
            _safeMint(msg.sender, totalMinted);
            royaltiesContract.mintAndRecord(totalMinted, msg.sender, 1);
            emit Minted(msg.sender, totalMinted);
        }

        if (msg.value > FCFS_PRICE * amount) {
            (bool sent, ) = msg.sender.call{value: msg.value - FCFS_PRICE * amount}("");
            require(sent, "Refund failed");
        }

        // Auto-transition to Public after 30 minutes (handled in isFCFSMintActive)
    }

    // **Public Mint**: 5 per wallet, 6.9 Ape, until total supply reached
    function mintPublic(uint256 amount) external payable nonReentrant {
        require(isPublicMintActive(), "Public mint phase not active");
        require(totalMinted + amount <= TOTAL_SUPPLY, "Exceeds total supply");
        require(amount <= PUBLIC_MAX_PER_WALLET, "Exceeds public limit");
        require(mintedPerWalletPublic[msg.sender] + amount <= PUBLIC_MAX_PER_WALLET, "Exceeds wallet limit");
        require(msg.value >= PUBLIC_PRICE * amount, "Insufficient payment");

        mintedPerWalletPublic[msg.sender] += amount;
        for (uint256 i = 0; i < amount; i++) {
            totalMinted++;
            _safeMint(msg.sender, totalMinted);
            royaltiesContract.mintAndRecord(totalMinted, msg.sender, 1);
            emit Minted(msg.sender, totalMinted);
        }

        if (msg.value > PUBLIC_PRICE * amount) {
            (bool sent, ) = msg.sender.call{value: msg.value - PUBLIC_PRICE * amount}("");
            require(sent, "Refund failed");
        }
    }

    // Helper function for Delegate.xyz integration
    function _getAccount(address vault) internal view returns (address) {
        if (vault != address(0)) {
            bool isDelegateValid = delegateRegistry.checkDelegateForAll(msg.sender, vault);
            require(isDelegateValid, "Invalid delegate");
            return vault;
        }
        return msg.sender;
    }

    // Phase activity checks
    function isFounderMintActive() public view returns (bool) {
        return founderMintStart > 0 && founderMinted < FOUNDER_MINT_AMOUNT;
    }

    function isGTDMintActive() public view returns (bool) {
        return gtdMintStart > 0 && block.timestamp < gtdMintStart + GTD_DURATION && totalMinted < TOTAL_SUPPLY;
    }

    function isFCFSMintActive() public view returns (bool) {
        return fcfsMintStart > 0 && block.timestamp < fcfsMintStart + FCFS_DURATION && totalMinted < TOTAL_SUPPLY;
    }

    function isPublicMintActive() public view returns (bool) {
        return publicMintStart > 0 && totalMinted < TOTAL_SUPPLY;
    }

    // Manual phase transition functions (for owner control if needed)
    function startFCFSMint() external onlyOwner {
        require(gtdMintStart > 0 && block.timestamp >= gtdMintStart + GTD_DURATION, "GTD mint not ended");
        fcfsMintStart = block.timestamp;
    }

    function startPublicMint() external onlyOwner {
        require(fcfsMintStart > 0 && block.timestamp >= fcfsMintStart + FCFS_DURATION, "FCFS mint not ended");
        publicMintStart = block.timestamp;
    }

    // Existing functions (unchanged)
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable) returns (string memory) {
        return metadataLib.getTokenURI(tokenId, prerevealNoiseBase64, ownerOf(tokenId));
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            royaltiesContract.recordTransfer(tokenId);
        }
        return from;
    }

    function claimRoyalties() external nonReentrant {
        royaltiesContract.claimRoyalties();
    }

    function claimPoolRoyalties() external nonReentrant {
        royaltiesContract.claimPoolRoyalties();
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool sent, ) = treasury.call{value: balance}("");
        require(sent, "Withdrawal failed");
    }

    function setRevealed(bool _revealed) external onlyOwner {
        metadataLib.setRevealed(_revealed);
    }

    function setWaveformURI(uint256 tokenId, string memory uri) external onlyOwner {
        metadataLib.setWaveformURI(tokenId, uri);
    }

    function setMixedAudioURI(uint256 tokenId, string memory uri) external onlyOwner {
        metadataLib.setMixedAudioURI(tokenId, uri);
    }

    function reveal(uint256 tokenId) external onlyOwner {
        metadataLib.reveal(tokenId, ownerOf(tokenId));
    }
}
