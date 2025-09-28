// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Chainlink VRF interface for better randomness
interface VRFCoordinatorV2Interface {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}

// Improved metadata library with better randomness and security
contract ApeBeatsMetadataLibV2 is Ownable, ReentrancyGuard {
    using Strings for uint256;

    struct WaveData {
        uint8 bass;
        uint8 drums;
        uint8 melody;
        uint8 fx;
        uint8 colorWave;
        uint8 colorBg;
    }

    struct RandomnessRequest {
        uint256 tokenId;
        address tokenOwner;
        bool fulfilled;
        uint256 randomSeed;
    }

    // Audio loops and colors
    string[5] public bassLoops;
    string[5] public drumLoops;
    string[5] public melodyLoops;
    string[5] public fxLoops;
    string[11] public COLORS = [
        "#B9F2FF", "#FFD700", "#C0C0C0", "#CD7F32", "Rainbow", 
        "#000000", "#FF0000", "#0000FF", "#00FF00", "#800080", "#FFA500"
    ];

    // State variables
    bool public revealed;
    mapping(uint256 => WaveData) public waveData;
    mapping(uint256 => string) public mixedAudioURIs;
    mapping(uint256 => string) public waveformURIs;
    mapping(uint256 => uint256) public rarityScore;
    
    // Randomness tracking
    mapping(uint256 => RandomnessRequest) public randomnessRequests;
    mapping(uint256 => uint256) public requestIdToTokenId;
    uint256 public nextRequestId = 1;
    
    // Chainlink VRF configuration
    VRFCoordinatorV2Interface public vrfCoordinator;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    
    // Security: Only allow one randomness request per token
    mapping(uint256 => bool) public randomnessRequested;
    
    // Events
    event WaveformURIUpdated(uint256 indexed tokenId, string uri);
    event RandomnessRequested(uint256 indexed tokenId, uint256 indexed requestId);
    event RandomnessFulfilled(uint256 indexed tokenId, uint256 randomSeed);
    event MetadataRevealed(uint256 indexed tokenId, WaveData waveData, uint256 rarity);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) Ownable(msg.sender) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }

    // Owner functions
    function setRevealed(bool _revealed) external onlyOwner {
        revealed = _revealed;
    }

    function setWaveformURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(revealed, "Reveal not active");
        require(bytes(uri).length > 0, "URI cannot be empty");
        waveformURIs[tokenId] = uri;
        emit WaveformURIUpdated(tokenId, uri);
    }

    function setMixedAudioURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(revealed, "Reveal not active");
        require(bytes(uri).length > 0, "URI cannot be empty");
        mixedAudioURIs[tokenId] = uri;
    }

    function setVRFConfig(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) external onlyOwner {
        require(_vrfCoordinator != address(0), "Invalid VRF coordinator");
        require(_keyHash != bytes32(0), "Invalid key hash");
        require(_subscriptionId > 0, "Invalid subscription ID");
        
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    // Request randomness for a token (can only be called once per token)
    function requestRandomness(uint256 tokenId, address tokenOwner) external onlyOwner nonReentrant {
        require(tokenOwner != address(0), "Token does not exist");
        require(!randomnessRequested[tokenId], "Randomness already requested");
        require(!randomnessRequests[tokenId].fulfilled, "Randomness already fulfilled");
        
        randomnessRequested[tokenId] = true;
        
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1 // Number of random words
        );
        
        randomnessRequests[tokenId] = RandomnessRequest({
            tokenId: tokenId,
            tokenOwner: tokenOwner,
            fulfilled: false,
            randomSeed: 0
        });
        
        requestIdToTokenId[requestId] = tokenId;
        
        emit RandomnessRequested(tokenId, requestId);
    }

    // Chainlink VRF callback
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        require(msg.sender == address(vrfCoordinator), "Only VRF coordinator can fulfill");
        
        uint256 tokenId = requestIdToTokenId[requestId];
        require(tokenId > 0, "Invalid request ID");
        
        RandomnessRequest storage request = randomnessRequests[tokenId];
        require(!request.fulfilled, "Request already fulfilled");
        
        request.fulfilled = true;
        request.randomSeed = randomWords[0];
        
        emit RandomnessFulfilled(tokenId, request.randomSeed);
    }

    // Reveal token with secure randomness
    function reveal(uint256 tokenId) external onlyOwner {
        require(revealed, "Reveal not active");
        require(randomnessRequests[tokenId].fulfilled, "Randomness not fulfilled");
        require(bytes(mixedAudioURIs[tokenId]).length > 0, "Audio URI not set");
        require(bytes(waveformURIs[tokenId]).length > 0, "Waveform URI not set");
        
        RandomnessRequest memory request = randomnessRequests[tokenId];
        require(request.tokenOwner != address(0), "Token does not exist");
        
        // Use the secure random seed from Chainlink VRF
        uint256 randomSeed = request.randomSeed;
        
        // Generate wave data using secure randomness
        WaveData memory data = WaveData({
            bass: uint8(randomSeed % 5),
            drums: uint8((randomSeed / 5) % 5),
            melody: uint8((randomSeed / 25) % 5),
            fx: uint8((randomSeed / 125) % 5),
            colorWave: uint8((randomSeed / 625) % 11),
            colorBg: uint8((randomSeed / 6875) % 11)
        });
        
        waveData[tokenId] = data;
        rarityScore[tokenId] = (randomSeed % 100) + 1;
        
        emit MetadataRevealed(tokenId, data, rarityScore[tokenId]);
    }

    // Fallback reveal function using commit-reveal scheme for backward compatibility
    function revealWithCommitReveal(
        uint256 tokenId,
        bytes32 commitHash,
        uint256 nonce
    ) external onlyOwner {
        require(revealed, "Reveal not active");
        require(bytes(mixedAudioURIs[tokenId]).length > 0, "Audio URI not set");
        require(bytes(waveformURIs[tokenId]).length > 0, "Waveform URI not set");
        
        // Verify the commit-reveal
        bytes32 computedHash = keccak256(abi.encodePacked(tokenId, nonce, block.timestamp));
        require(computedHash == commitHash, "Invalid commit-reveal");
        
        // Use multiple entropy sources for better randomness
        uint256 entropy = uint256(keccak256(abi.encodePacked(
            tokenId,
            nonce,
            block.timestamp,
            block.difficulty,
            block.coinbase,
            msg.sender
        )));
        
        WaveData memory data = WaveData({
            bass: uint8(entropy % 5),
            drums: uint8((entropy / 5) % 5),
            melody: uint8((entropy / 25) % 5),
            fx: uint8((entropy / 125) % 5),
            colorWave: uint8((entropy / 625) % 11),
            colorBg: uint8((entropy / 6875) % 11)
        });
        
        waveData[tokenId] = data;
        rarityScore[tokenId] = (entropy % 100) + 1;
        
        emit MetadataRevealed(tokenId, data, rarityScore[tokenId]);
    }

    // Get revealed URI with improved security
    function getRevealedURI(
        uint256 tokenId,
        string[5] memory bassLoopsArg,
        string[5] memory drumLoopsArg,
        string[5] memory melodyLoopsArg,
        string[5] memory fxLoopsArg,
        WaveData memory data,
        uint256 rarity,
        string memory mixedAudioURI,
        string memory waveformURI,
        string[11] memory colors
    ) public pure returns (string memory) {
        // Validate inputs
        require(data.bass < 5, "Invalid bass index");
        require(data.drums < 5, "Invalid drums index");
        require(data.melody < 5, "Invalid melody index");
        require(data.fx < 5, "Invalid fx index");
        require(data.colorWave < 11, "Invalid wave color index");
        require(data.colorBg < 11, "Invalid bg color index");
        require(rarity > 0 && rarity <= 100, "Invalid rarity score");
        
        string memory json = Base64.encode(abi.encodePacked(
            '{"name":"ApeBeatsGenesis #', tokenId.toString(), '",',
            '"description":"Unique audio-visual NFT with secure randomness",',
            '"image":"', waveformURI, '",',
            '"animation_url":"', mixedAudioURI, '",',
            '"onchain_data":{',
                '"bass":"', bassLoopsArg[data.bass], '",',
                '"drums":"', drumLoopsArg[data.drums], '",',
                '"melody":"', melodyLoopsArg[data.melody], '",',
                '"fx":"', fxLoopsArg[data.fx], '",',
                '"wave_color":"', colors[data.colorWave], '",',
                '"bg_color":"', colors[data.colorBg], '",',
                '"rarity":"', rarity.toString(), '"',
            '},',
            '"attributes":['
                '{"trait_type":"Bass","value":"', bassLoopsArg[data.bass], '"},',
                '{"trait_type":"Drums","value":"', drumLoopsArg[data.drums], '"},',
                '{"trait_type":"Melody","value":"', melodyLoopsArg[data.melody], '"},',
                '{"trait_type":"FX","value":"', fxLoopsArg[data.fx], '"},',
                '{"trait_type":"Wave Color","value":"', colors[data.colorWave], '"},',
                '{"trait_type":"Background Color","value":"', colors[data.colorBg], '"},',
                '{"trait_type":"Rarity Score","value":"', rarity.toString(), '"}'
            ']}'
        ));
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // Get token URI with improved security
    function getTokenURI(
        uint256 tokenId,
        string memory prerevealNoiseBase64,
        address tokenOwner
    ) external view returns (string memory) {
        require(tokenOwner != address(0), "Token does not exist");
        
        if (!revealed) {
            return prerevealNoiseBase64;
        }
        
        require(bytes(mixedAudioURIs[tokenId]).length > 0, "Audio URI not set");
        require(bytes(waveformURIs[tokenId]).length > 0, "Waveform URI not set");
        require(randomnessRequests[tokenId].fulfilled, "Randomness not fulfilled");
        
        return getRevealedURI(
            tokenId,
            bassLoops,
            drumLoops,
            melodyLoops,
            fxLoops,
            waveData[tokenId],
            rarityScore[tokenId],
            mixedAudioURIs[tokenId],
            waveformURIs[tokenId],
            COLORS
        );
    }

    // Check if randomness is ready for a token
    function isRandomnessReady(uint256 tokenId) external view returns (bool) {
        return randomnessRequests[tokenId].fulfilled;
    }

    // Get randomness request status
    function getRandomnessStatus(uint256 tokenId) external view returns (
        bool requested,
        bool fulfilled,
        uint256 randomSeed
    ) {
        RandomnessRequest memory request = randomnessRequests[tokenId];
        return (
            randomnessRequested[tokenId],
            request.fulfilled,
            request.randomSeed
        );
    }
}
