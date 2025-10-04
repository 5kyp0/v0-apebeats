// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BatchTransferNative
 * @dev Secure implementation of batch transfer contract supporting both native APE and ERC20 tokens
 * @notice This contract allows batch transfers of native APE (gas token) and ERC20 tokens with fee collection and team management.
 */
contract BatchTransferNative is Ownable, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Role definitions
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // State variables
    address public feeRecipient;
    uint256 public feeBps = 50; // 0.5%
    uint256 public constant MAX_RECIPIENTS = 50;
    uint256 public constant MAX_FEE_BPS = 1000; // 10% maximum fee
    uint256 public constant MIN_FEE = 1e15; // Minimum fee in wei (0.001 tokens for 18 decimals)
    
    // Multi-token support
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenFeeBps;
    
    // Enhanced security and tracking
    mapping(address => uint256) public userTotalTransferred;
    mapping(address => uint256) public userTransferCount;
    uint256 public totalVolumeTransferred;
    uint256 public totalTransfersExecuted;
    
    // Events
    event BatchTransferExecuted(
        address indexed sender,
        address indexed token,
        uint256 totalAmount,
        uint256 fee,
        uint256 recipientCount,
        bytes32 batchId
    );
    
    event FeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newFeeRecipient);
    event TokenSupported(address indexed token, bool supported, uint256 feeBps);
    event TeamMemberAdded(address indexed member, bytes32 role);
    event TeamMemberRemoved(address indexed member, bytes32 role);

    // Custom errors
    error TooManyRecipients();
    error InvalidAmount();
    error InsufficientBalance();
    error DuplicateRecipient();
    error UnsupportedToken();
    error InvalidFeeBps();
    error TransferFailed();

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TEAM_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Batch transfer with equal amounts to multiple recipients (Native APE)
     * @param recipients Array of recipient addresses
     * @param amountPerRecipient Amount to transfer to each recipient
     */
    function batchTransferEqual(
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external payable nonReentrant whenNotPaused {
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();
        if (amountPerRecipient == 0) revert InvalidAmount();

        // Validate recipients and check for duplicates
        _validateRecipients(recipients);

        // Check for overflow before multiplication
        require(amountPerRecipient <= type(uint256).max / recipients.length, "Overflow risk");
        
        uint256 totalAmount;
        unchecked {
            totalAmount = amountPerRecipient * recipients.length;
        }
        
        uint256 fee = _calculateFeeWithMinimum(totalAmount);
        uint256 totalRequired = totalAmount + fee;

        if (msg.value < totalRequired) revert InsufficientBalance();

        // Transfer fee to fee recipient
        if (fee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: fee}("");
            if (!feeSuccess) revert TransferFailed();
        }

        // Transfer to recipients
        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            (bool success, ) = payable(recipients[i]).call{value: amountPerRecipient}("");
            if (!success) revert TransferFailed();
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(msg.sender, address(0), totalAmount, fee, recipientsLength, batchId);
    }

    /**
     * @dev Batch transfer with custom amounts to multiple recipients (Native APE)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer to each recipient
     */
    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant whenNotPaused {
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();
        if (recipients.length != amounts.length) revert InvalidAmount();

        // Validate recipients and check for duplicates
        _validateRecipients(recipients);

        uint256 totalAmount;
        for (uint256 i = 0; i < amounts.length;) {
            if (amounts[i] == 0) revert InvalidAmount();
            totalAmount += amounts[i];
            unchecked { ++i; }
        }
        
        uint256 fee = _calculateFeeWithMinimum(totalAmount);
        uint256 totalRequired = totalAmount + fee;

        if (msg.value < totalRequired) revert InsufficientBalance();

        // Transfer fee to fee recipient
        if (fee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: fee}("");
            if (!feeSuccess) revert TransferFailed();
        }

        // Transfer to recipients
        for (uint256 i = 0; i < recipients.length;) {
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            if (!success) revert TransferFailed();
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(msg.sender, address(0), totalAmount, fee, recipients.length, batchId);
    }

    /**
     * @dev Batch transfer with equal amounts to multiple recipients (ERC20 tokens)
     * @param token ERC20 token address (address(0) for native APE)
     * @param recipients Array of recipient addresses
     * @param amountPerRecipient Amount to transfer to each recipient
     */
    function batchTransferTokenEqual(
        address token,
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external nonReentrant whenNotPaused {
        if (token == address(0)) revert UnsupportedToken();
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();
        if (amountPerRecipient == 0) revert InvalidAmount();

        // Validate recipients and check for duplicates
        _validateRecipients(recipients);

        // Check for overflow before multiplication
        require(amountPerRecipient <= type(uint256).max / recipients.length, "Overflow risk");
        
        uint256 totalAmount;
        unchecked {
            totalAmount = amountPerRecipient * recipients.length;
        }
        
        uint256 fee = _calculateFeeWithMinimum(totalAmount);
        uint256 totalRequired = totalAmount + fee;

        IERC20 tokenContract = IERC20(token);
        if (tokenContract.balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        tokenContract.safeTransferFrom(msg.sender, address(this), totalRequired);

        if (fee > 0) {
            tokenContract.safeTransfer(feeRecipient, fee);
        }

        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            tokenContract.safeTransfer(recipients[i], amountPerRecipient);
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(msg.sender, token, totalAmount, fee, recipientsLength, batchId);
    }

    /**
     * @dev Batch transfer with custom amounts to multiple recipients (ERC20 tokens)
     * @param token ERC20 token address
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer to each recipient
     */
    function batchTransferToken(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (token == address(0)) revert UnsupportedToken();
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();
        if (recipients.length != amounts.length) revert InvalidAmount();

        // Validate recipients and check for duplicates
        _validateRecipients(recipients);

        uint256 totalAmount;
        for (uint256 i = 0; i < amounts.length;) {
            if (amounts[i] == 0) revert InvalidAmount();
            totalAmount += amounts[i];
            unchecked { ++i; }
        }
        
        uint256 fee = _calculateFeeWithMinimum(totalAmount);
        uint256 totalRequired = totalAmount + fee;

        IERC20 tokenContract = IERC20(token);
        if (tokenContract.balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        tokenContract.safeTransferFrom(msg.sender, address(this), totalRequired);

        if (fee > 0) {
            tokenContract.safeTransfer(feeRecipient, fee);
        }

        for (uint256 i = 0; i < recipients.length;) {
            tokenContract.safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(msg.sender, token, totalAmount, fee, recipients.length, batchId);
    }

    // Internal functions
    function _validateRecipients(address[] calldata recipients) internal pure {
        for (uint256 i = 0; i < recipients.length; i++) {
            for (uint256 j = i + 1; j < recipients.length; j++) {
                if (recipients[i] == recipients[j]) {
                    revert DuplicateRecipient();
                }
            }
        }
    }

    function _calculateFeeWithMinimum(uint256 amount) internal view returns (uint256) {
        uint256 fee = (amount * feeBps) / 10000;
        return fee < MIN_FEE ? MIN_FEE : fee;
    }

    function _generateBatchId(uint256 totalAmount) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            msg.sender,
            totalAmount,
            block.timestamp,
            block.number
        ));
    }

    // Admin functions
    function setFeeBps(uint256 _feeBps) external onlyRole(FEE_MANAGER_ROLE) {
        if (_feeBps > MAX_FEE_BPS) revert InvalidFeeBps();
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    function setFeeRecipient(address _feeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_feeRecipient == address(0)) revert InvalidAmount();
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    function addSupportedToken(address token, uint256 _feeBps) external onlyRole(TEAM_ROLE) {
        if (token == address(0)) revert UnsupportedToken();
        if (_feeBps > MAX_FEE_BPS) revert InvalidFeeBps();
        supportedTokens[token] = true;
        tokenFeeBps[token] = _feeBps;
        emit TokenSupported(token, true, _feeBps);
    }

    function removeSupportedToken(address token) external onlyRole(TEAM_ROLE) {
        supportedTokens[token] = false;
        tokenFeeBps[token] = 0;
        emit TokenSupported(token, false, 0);
    }

    function grantTeamRole(address account, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
        emit TeamMemberAdded(account, role);
    }

    function revokeTeamRole(address account, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
        emit TeamMemberRemoved(account, role);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Emergency functions
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "Transfer failed");
        }
    }

    function emergencyWithdrawToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        if (balance > 0) {
            tokenContract.safeTransfer(owner(), balance);
        }
    }

    // View functions
    function getSupportedTokens() external view returns (address[] memory) {
        // This would need to be implemented with a mapping to array conversion
        // For now, return empty array
        return new address[](0);
    }

    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    function getTokenFeeBps(address token) external view returns (uint256) {
        return tokenFeeBps[token];
    }

    // Receive function to accept native APE
    receive() external payable {}
}
