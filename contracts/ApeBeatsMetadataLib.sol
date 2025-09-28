// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApeBeatsMetadataLib is Ownable {
    using Strings for uint256;

    struct WaveData {
        uint8 bass;
        uint8 drums;
        uint8 melody;
        uint8 fx;
        uint8 colorWave;
        uint8 colorBg;
    }

    string[5] public bassLoops;
    string[5] public drumLoops;
    string[5] public melodyLoops;
    string[5] public fxLoops;
    string[11] public COLORS = ["#B9F2FF", "#FFD700", "#C0C0C0", "#CD7F32", "Rainbow", "#000000", "#FF0000", "#0000FF", "#00FF00", "#800080", "#FFA500"];

    bool public revealed;
    mapping(uint256 => WaveData) public waveData;
    mapping(uint256 => string) public mixedAudioURIs;
    mapping(uint256 => string) public waveformURIs;
    mapping(uint256 => uint256) public rarityScore;

    event WaveformURIUpdated(uint256 indexed tokenId, string uri);

    constructor() Ownable(msg.sender) {}

    function setRevealed(bool _revealed) external onlyOwner {
        revealed = _revealed;
    }

    function setWaveformURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(revealed, "Reveal not active");
        waveformURIs[tokenId] = uri;
        emit WaveformURIUpdated(tokenId, uri);
    }

    function setMixedAudioURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(revealed, "Reveal not active");
        mixedAudioURIs[tokenId] = uri;
    }

    function reveal(uint256 tokenId, address tokenOwner) external onlyOwner {
        require(tokenOwner != address(0), "Token does not exist");
        require(revealed, "Reveal not active");
        require(bytes(mixedAudioURIs[tokenId]).length == 0, "Already revealed");

        uint256 pseudoRandom = uint256(keccak256(abi.encodePacked(block.timestamp, tokenId, msg.sender)));
        waveData[tokenId] = WaveData({
            bass: uint8(pseudoRandom % 5),
            drums: uint8((pseudoRandom / 5) % 5),
            melody: uint8((pseudoRandom / 25) % 5),
            fx: uint8((pseudoRandom / 125) % 5),
            colorWave: uint8((pseudoRandom / 625) % 11),
            colorBg: uint8((pseudoRandom / 6875) % 11)
        });
        rarityScore[tokenId] = (pseudoRandom % 100) + 1;
    }

    function getRevealedURI(
        uint256 tokenId, string[5] memory bassLoopsArg, string[5] memory drumLoopsArg,
        string[5] memory melodyLoopsArg, string[5] memory fxLoopsArg, WaveData memory data,
        uint256 rarity, string memory mixedAudioURI, string memory waveformURI, string[11] memory colors
    ) public pure returns (string memory) {
        string memory json = Base64.encode(abi.encodePacked(
            '{"name":"ApeBeatsGenesis #', tokenId.toString(), '",',
            '"description":"Unique audio-visual NFT",',
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
}
