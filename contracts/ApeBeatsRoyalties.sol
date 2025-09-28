// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ApeBeatsRoyalties is Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant ROYALTY_WINDOW = 1 minutes;

    address public treasury;
    address public founder;
    uint256 public totalMinted;
    uint256 public poolRoyalties;

    struct TransferRecord {
        uint256 tokenId;
        uint256 timestamp;
    }
    TransferRecord[] public recentTransfers;
    uint256 public transferIndex;

    mapping(uint256 => uint256) public royaltyBalancesPerToken;
    mapping(address => uint256) public royaltyBalances;
    mapping(uint256 => address) public originalMinters;
    mapping(address => uint256) public mintedPerWallet;

    event RoyaltiesReceived(uint256 indexed tokenId, uint256 amount);
    event RoyaltiesPooled(uint256 amount);
    event RoyaltiesClaimed(address indexed claimant, uint256 amount);

    constructor(address _treasury, address _founder) Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
        founder = _founder;
    }

    receive() external payable {
        uint256 amount = msg.value;
        if (recentTransfers.length > 0) {
            TransferRecord memory lastTransfer = recentTransfers[recentTransfers.length - 1];
            if (block.timestamp <= lastTransfer.timestamp + ROYALTY_WINDOW) {
                uint256 tokenId = lastTransfer.tokenId;
                royaltyBalancesPerToken[tokenId] += amount;
                address originalMinter = originalMinters[tokenId];
                require(originalMinter != address(0), "Invalid original minter");
                royaltyBalances[originalMinter] += amount;
                emit RoyaltiesReceived(tokenId, amount);
                return;
            }
        }
        poolRoyalties += amount;
        emit RoyaltiesPooled(amount);
    }

    function claimRoyalties() external nonReentrant {
        uint256 amount = royaltyBalances[msg.sender];
        require(amount > 0, "No royalties to claim");
        royaltyBalances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send royalties");
        emit RoyaltiesClaimed(msg.sender, amount);
    }

    function claimPoolRoyalties() external nonReentrant {
        require(totalMinted > 0, "No tokens minted yet");
        uint256 poolAmount = poolRoyalties;
        require(poolAmount > 0, "No pool royalties to claim");

        uint256 founderShare = poolAmount * 25 / 100;
        uint256 treasuryShare = poolAmount * 25 / 100;
        uint256 mintersShare = poolAmount * 50 / 100;

        poolRoyalties = 0;

        (bool sentFounder, ) = founder.call{value: founderShare}("");
        require(sentFounder, "Failed to send founder share");
        (bool sentTreasury, ) = treasury.call{value: treasuryShare}("");
        require(sentTreasury, "Failed to send treasury share");

        if (msg.sender == founder || msg.sender == treasury) {
            return;
        }
        uint256 senderMinted = mintedPerWallet[msg.sender];
        require(senderMinted > 0, "No tokens minted by claimant");
        uint256 senderShare = (mintersShare * senderMinted) / totalMinted;
        royaltyBalances[msg.sender] += senderShare;
        (bool sentMinter, ) = msg.sender.call{value: senderShare}("");
        require(sentMinter, "Failed to send minter share");
        emit RoyaltiesClaimed(msg.sender, senderShare);
    }

    function recordTransfer(uint256 tokenId) external onlyOwner {
        recentTransfers.push(TransferRecord(tokenId, block.timestamp));
        transferIndex++;
        while (recentTransfers.length > 100 || (recentTransfers.length > 0 && block.timestamp > recentTransfers[0].timestamp + ROYALTY_WINDOW * 2)) {
            recentTransfers[transferIndex % recentTransfers.length] = recentTransfers[recentTransfers.length - 1];
            recentTransfers.pop();
        }
    }

    function setOriginalMinter(uint256 tokenId, address minter, uint256 amountMinted) public onlyOwner {
        originalMinters[tokenId] = minter;
        mintedPerWallet[minter] += amountMinted;
        totalMinted += amountMinted;
    }

    function mintAndRecord(uint256 tokenId, address minter, uint256 amountMinted) external onlyOwner {
        setOriginalMinter(tokenId, minter, amountMinted);
    }

    function toHexString(address addr) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(addr)), 20);
    }
}
