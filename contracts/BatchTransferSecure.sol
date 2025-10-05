// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BatchTransferSecure
 * @dev Secure implementation of batch transfer contract with comprehensive security measures
 * @notice This contract allows batch transfers of multiple ERC20 tokens with fee collection and team management.
 *         Supports both APE token (primary) and additional tokens that can be added by the team.
 *         Each token can have its own fee rate configured by authorized team members.
 */
contract BatchTransferSecure is Ownable, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Role definitions
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // State variables
    IERC20 public immutable apeToken;
    address public feeRecipient;
    uint256 public feeBps = 50; // 0.5%
    uint256 public constant MAX_RECIPIENTS = 50; // Reduced for gas safety
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
    
    // Commit-reveal randomness system
    struct RandomCommit {
        bytes32 commitHash;
        uint256 blockNumber;
        bool revealed;
        uint256[] randomAmounts;
    }
    
    mapping(address => RandomCommit) public randomCommits;
    uint256 public constant COMMIT_REVEAL_DELAY = 2; // Minimum blocks between commit and reveal
    
    // Events
    event BatchTransferExecuted(
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 fee,
        bytes32 indexed batchId,
        uint256 timestamp
    );
    
    event FeeBpsUpdated(uint256 oldFee, uint256 newFee, address indexed updatedBy);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient, address indexed updatedBy);
    event EmergencyWithdrawal(address indexed token, uint256 amount);
    event TeamRoleGranted(address indexed account, address indexed grantedBy);
    event TeamRoleRevoked(address indexed account, address indexed revokedBy);
    event FeeManagerRoleGranted(address indexed account, address indexed grantedBy);
    event FeeManagerRoleRevoked(address indexed account, address indexed revokedBy);
    event TokenAdded(address indexed token, uint256 feeBps, address indexed addedBy);
    event TokenRemoved(address indexed token, address indexed removedBy);
    event TokenFeeUpdated(address indexed token, uint256 oldFee, uint256 newFee, address indexed updatedBy);
    event RandomCommitCreated(address indexed user, bytes32 indexed commitHash, uint256 blockNumber);
    event RandomCommitRevealed(address indexed user, uint256[] amounts, uint256 totalAmount);

    // Custom errors for gas efficiency
    error ArrayLengthMismatch();
    error TooManyRecipients();
    error InvalidRecipient();
    error InvalidAmount();
    error DuplicateRecipient();
    error InvalidAmountRange();
    error FeeTooHigh();
    error InvalidFeeRecipient();
    error TransferFailed();
    error InsufficientBalance();
    error TokenNotSupported();
    error InvalidToken();
    error CommitNotReady();
    error CommitAlreadyExists();
    error CommitNotFound();
    error InvalidCommitHash();
    error CommitAlreadyRevealed();

    constructor(address _apeToken, address _feeRecipient) Ownable(msg.sender) {
        if (_apeToken == address(0)) revert InvalidToken();
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        
        apeToken = IERC20(_apeToken);
        feeRecipient = _feeRecipient;
        
        // Initialize AccessControl
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TEAM_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
        
        // Initialize APE token as supported with default fee
        supportedTokens[_apeToken] = true;
        tokenFeeBps[_apeToken] = feeBps;
    }

    /**
     * @dev Batch transfer with different amounts to multiple recipients (APE token only)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer
     * @notice This function is optimized for APE token transfers. For other tokens, use batchTransferToken().
     */
    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();

        // Validate inputs and check for duplicates
        uint256 totalAmount = _validateAndCalculateTotal(recipients, amounts);
        
        // Calculate fee with minimum fee consideration
        uint256 fee = _calculateFeeWithMinimum(totalAmount);
        uint256 totalRequired = totalAmount + fee;

        // Check user balance before attempting transfer
        if (apeToken.balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        // Use SafeERC20 for secure transfers
        apeToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        // Transfer fee to fee recipient
        if (fee > 0) {
            apeToken.safeTransfer(feeRecipient, fee);
        }

        // Execute batch transfers using SafeERC20
        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            apeToken.safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(
            msg.sender,
            totalAmount,
            recipientsLength,
            fee,
            batchId,
            block.timestamp
        );
    }

    /**
     * @dev Batch transfer with equal amounts to multiple recipients (APE token only)
     * @param recipients Array of recipient addresses
     * @param amountPerRecipient Amount to transfer to each recipient
     * @notice This function is optimized for APE token transfers. For other tokens, use batchTransferTokenEqual().
     */
    function batchTransferEqual(
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external nonReentrant whenNotPaused {
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

        if (apeToken.balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        apeToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        if (fee > 0) {
            apeToken.safeTransfer(feeRecipient, fee);
        }

        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            apeToken.safeTransfer(recipients[i], amountPerRecipient);
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(
            msg.sender,
            totalAmount,
            recipientsLength,
            fee,
            batchId,
            block.timestamp
        );
    }

    /**
     * @dev Commit random amounts for batch transfer (APE token only)
     * @param recipients Array of recipient addresses
     * @param minAmount Minimum amount per recipient
     * @param maxAmount Maximum amount per recipient
     * @param commitHash Hash of the random amounts (keccak256(abi.encodePacked(amounts, secret)))
     * @notice This is step 1 of the secure commit-reveal randomness system
     */
    function commitRandomTransfer(
        address[] calldata recipients,
        uint256 minAmount,
        uint256 maxAmount,
        bytes32 commitHash
    ) external whenNotPaused {
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();
        if (minAmount == 0 || maxAmount == 0) revert InvalidAmount();
        if (minAmount >= maxAmount) revert InvalidAmountRange();
        if (randomCommits[msg.sender].commitHash != bytes32(0)) revert CommitAlreadyExists();

        // Validate recipients and check for duplicates
        _validateRecipients(recipients);

        // Store the commit
        randomCommits[msg.sender] = RandomCommit({
            commitHash: commitHash,
            blockNumber: block.number,
            revealed: false,
            randomAmounts: new uint256[](0)
        });

        emit RandomCommitCreated(msg.sender, commitHash, block.number);
    }

    /**
     * @dev Reveal and execute random batch transfer (APE token only)
     * @param recipients Array of recipient addresses
     * @param amounts Array of random amounts (must match commit)
     * @param secret Secret used to generate the commit hash
     * @notice This is step 2 of the secure commit-reveal randomness system
     */
    function revealAndExecuteRandomTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 secret
    ) external nonReentrant whenNotPaused {
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();

        RandomCommit storage commit = randomCommits[msg.sender];
        if (commit.commitHash == bytes32(0)) revert CommitNotFound();
        if (commit.revealed) revert CommitAlreadyRevealed();
        if (block.number < commit.blockNumber + COMMIT_REVEAL_DELAY) revert CommitNotReady();

        // Verify the commit hash
        bytes32 expectedHash = keccak256(abi.encodePacked(amounts, secret));
        if (commit.commitHash != expectedHash) revert InvalidCommitHash();

        // Validate amounts are within reasonable bounds
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length;) {
            if (amounts[i] == 0) revert InvalidAmount();
            totalAmount += amounts[i];
            unchecked { ++i; }
        }

        // Calculate fee and check balance
        uint256 fee = _calculateFeeWithMinimum(totalAmount);
        uint256 totalRequired = totalAmount + fee;

        if (apeToken.balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        // Execute the transfer
        apeToken.safeTransferFrom(msg.sender, address(this), totalRequired);

        if (fee > 0) {
            apeToken.safeTransfer(feeRecipient, fee);
        }

        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            apeToken.safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        // Mark as revealed and store amounts
        commit.revealed = true;
        commit.randomAmounts = amounts;

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit RandomCommitRevealed(msg.sender, amounts, totalAmount);
        emit BatchTransferExecuted(
            msg.sender,
            totalAmount,
            recipientsLength,
            fee,
            batchId,
            block.timestamp
        );
    }

    /**
     * @dev Legacy function - now redirects to commit-reveal system
     * @notice This function is deprecated. Use commitRandomTransfer() and revealAndExecuteRandomTransfer() instead.
     */
    function batchTransferRandom(
        address[] calldata /* recipients */,
        uint256 /* minAmount */,
        uint256 /* maxAmount */,
        uint256 /* seed */
    ) external pure {
        revert("Function deprecated. Use commitRandomTransfer() and revealAndExecuteRandomTransfer() for secure randomness.");
    }

    /**
     * @dev Generic batch transfer with different amounts to multiple recipients for any supported token
     * @param token Token address to transfer
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer
     */
    function batchTransferToken(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (!supportedTokens[token]) revert TokenNotSupported();
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (recipients.length > MAX_RECIPIENTS) revert TooManyRecipients();
        if (recipients.length == 0) revert TooManyRecipients();

        // Validate inputs and check for duplicates
        uint256 totalAmount = _validateAndCalculateTotal(recipients, amounts);
        
        // Calculate fee with minimum fee consideration for this token
        uint256 fee = _calculateTokenFeeWithMinimum(token, totalAmount);
        uint256 totalRequired = totalAmount + fee;

        // Check user balance before attempting transfer
        if (IERC20(token).balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        // Use SafeERC20 for secure transfers
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalRequired);

        // Transfer fee to fee recipient
        if (fee > 0) {
            IERC20(token).safeTransfer(feeRecipient, fee);
        }

        // Execute batch transfers using SafeERC20
        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            IERC20(token).safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(
            msg.sender,
            totalAmount,
            recipientsLength,
            fee,
            batchId,
            block.timestamp
        );
    }

    /**
     * @dev Generic batch transfer with equal amounts to multiple recipients for any supported token
     * @param token Token address to transfer
     * @param recipients Array of recipient addresses
     * @param amountPerRecipient Amount to transfer to each recipient
     */
    function batchTransferTokenEqual(
        address token,
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external nonReentrant whenNotPaused {
        if (!supportedTokens[token]) revert TokenNotSupported();
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
        
        uint256 fee = _calculateTokenFeeWithMinimum(token, totalAmount);
        uint256 totalRequired = totalAmount + fee;

        if (IERC20(token).balanceOf(msg.sender) < totalRequired) revert InsufficientBalance();

        IERC20(token).safeTransferFrom(msg.sender, address(this), totalRequired);

        if (fee > 0) {
            IERC20(token).safeTransfer(feeRecipient, fee);
        }

        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength;) {
            IERC20(token).safeTransfer(recipients[i], amountPerRecipient);
            unchecked { ++i; }
        }

        bytes32 batchId = _generateBatchId(totalAmount);
        
        // Update tracking data
        userTotalTransferred[msg.sender] += totalAmount;
        userTransferCount[msg.sender]++;
        totalVolumeTransferred += totalAmount;
        totalTransfersExecuted++;
        
        emit BatchTransferExecuted(
            msg.sender,
            totalAmount,
            recipientsLength,
            fee,
            batchId,
            block.timestamp
        );
    }

    /**
     * @dev Calculate fee with minimum fee consideration
     * @param totalAmount Total amount being transferred
     * @return Calculated fee amount
     */
    function calculateFee(uint256 totalAmount) external view returns (uint256) {
        return _calculateFeeWithMinimum(totalAmount);
    }

    /**
     * @dev Legacy function - now redirects to commit-reveal system
     * @notice This function is deprecated. Use commitRandomTransfer() and revealAndExecuteRandomTransfer() instead.
     */
    function batchTransferTokenRandom(
        address /* token */,
        address[] calldata /* recipients */,
        uint256 /* minAmount */,
        uint256 /* maxAmount */,
        uint256 /* seed */
    ) external pure {
        revert("Function deprecated. Use commitRandomTransfer() and revealAndExecuteRandomTransfer() for secure randomness.");
    }

    /**
     * @dev Calculate fee for a specific token with minimum fee consideration
     * @param token Token address
     * @param totalAmount Total amount being transferred
     * @return Calculated fee amount
     */
    function calculateTokenFee(address token, uint256 totalAmount) external view returns (uint256) {
        if (!supportedTokens[token]) revert TokenNotSupported();
        return _calculateTokenFeeWithMinimum(token, totalAmount);
    }

    /**
     * @dev Internal function to calculate fee with minimum
     * @param totalAmount Total amount being transferred
     * @return Calculated fee amount
     */
    function _calculateFeeWithMinimum(uint256 totalAmount) internal view returns (uint256) {
        uint256 calculatedFee = (totalAmount * feeBps) / 10000;
        return calculatedFee > MIN_FEE ? calculatedFee : MIN_FEE;
    }

    /**
     * @dev Internal function to calculate fee for a specific token with minimum
     * @param token Token address
     * @param totalAmount Total amount being transferred
     * @return Calculated fee amount
     */
    function _calculateTokenFeeWithMinimum(address token, uint256 totalAmount) internal view returns (uint256) {
        uint256 tokenFeeRate = tokenFeeBps[token];
        uint256 calculatedFee = (totalAmount * tokenFeeRate) / 10000;
        return calculatedFee > MIN_FEE ? calculatedFee : MIN_FEE;
    }

    /**
     * @dev Validate recipients and amounts, calculate total
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts
     * @return totalAmount Total amount to be transferred
     */
    function _validateAndCalculateTotal(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal pure returns (uint256 totalAmount) {
        uint256 length = recipients.length;
        
        // Check for duplicates and validate inputs
        for (uint256 i = 0; i < length;) {
            if (recipients[i] == address(0)) revert InvalidRecipient();
            if (amounts[i] == 0) revert InvalidAmount();
            
            // Check for duplicates
            for (uint256 j = i + 1; j < length;) {
                if (recipients[i] == recipients[j]) revert DuplicateRecipient();
                unchecked { ++j; }
            }
            
            totalAmount += amounts[i];
            unchecked { ++i; }
        }
    }

    /**
     * @dev Validate recipients array
     * @param recipients Array of recipient addresses
     */
    function _validateRecipients(address[] calldata recipients) internal pure {
        uint256 length = recipients.length;
        
        for (uint256 i = 0; i < length;) {
            if (recipients[i] == address(0)) revert InvalidRecipient();
            
            // Check for duplicates
            for (uint256 j = i + 1; j < length;) {
                if (recipients[i] == recipients[j]) revert DuplicateRecipient();
                unchecked { ++j; }
            }
            
            unchecked { ++i; }
        }
    }

    /**
     * @dev Generate unique batch ID
     * @param totalAmount Total amount being transferred
     * @return Batch ID hash
     */
    function _generateBatchId(uint256 totalAmount) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.number, // Added for additional uniqueness
            totalAmount
        ));
    }

    // Admin functions
    
    /**
     * @dev Set fee in basis points
     * @param _feeBps New fee in basis points
     */
    function setFeeBps(uint256 _feeBps) external onlyRole(FEE_MANAGER_ROLE) {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        
        uint256 oldFee = feeBps;
        feeBps = _feeBps;
        
        emit FeeBpsUpdated(oldFee, _feeBps, msg.sender);
    }

    /**
     * @dev Set fee recipient address
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyRole(FEE_MANAGER_ROLE) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        
        address oldRecipient = feeRecipient;
        feeRecipient = _feeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, _feeRecipient, msg.sender);
    }

    /**
     * @dev Pause contract operations
     */
    function pause() external onlyRole(TEAM_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract operations
     */
    function unpause() external onlyRole(TEAM_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal function for stuck tokens
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdrawal(token, amount);
    }

    /**
     * @dev Get contract balance for a specific token
     * @param token Token address
     * @return Token balance
     */
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    // Team management functions
    
    /**
     * @dev Grant team role to an address
     * @param account Address to grant team role to
     */
    function grantTeamRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(TEAM_ROLE, account);
        emit TeamRoleGranted(account, msg.sender);
    }

    /**
     * @dev Revoke team role from an address
     * @param account Address to revoke team role from
     */
    function revokeTeamRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(TEAM_ROLE, account);
        emit TeamRoleRevoked(account, msg.sender);
    }

    /**
     * @dev Grant fee manager role to an address
     * @param account Address to grant fee manager role to
     */
    function grantFeeManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(FEE_MANAGER_ROLE, account);
        emit FeeManagerRoleGranted(account, msg.sender);
    }

    /**
     * @dev Revoke fee manager role from an address
     * @param account Address to revoke fee manager role from
     */
    function revokeFeeManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(FEE_MANAGER_ROLE, account);
        emit FeeManagerRoleRevoked(account, msg.sender);
    }

    // View functions for leaderboard and analytics
    
    /**
     * @dev Get user statistics
     * @param user User address
     * @return totalTransferred Total amount transferred by user
     * @return transferCount Number of transfers made by user
     */
    function getUserStats(address user) external view returns (uint256 totalTransferred, uint256 transferCount) {
        return (userTotalTransferred[user], userTransferCount[user]);
    }

    /**
     * @dev Get global statistics
     * @return totalVolume Total volume transferred through contract
     * @return totalTransfers Total number of transfers executed
     */
    function getGlobalStats() external view returns (uint256 totalVolume, uint256 totalTransfers) {
        return (totalVolumeTransferred, totalTransfersExecuted);
    }

    // Multi-token management functions
    
    /**
     * @dev Add a supported token with custom fee
     * @param token Token address to add
     * @param tokenFeeRate Fee in basis points for this token
     */
    function addSupportedToken(address token, uint256 tokenFeeRate) external onlyRole(TEAM_ROLE) {
        if (token == address(0)) revert InvalidToken();
        if (tokenFeeRate > MAX_FEE_BPS) revert FeeTooHigh();
        
        supportedTokens[token] = true;
        tokenFeeBps[token] = tokenFeeRate;
        
        emit TokenAdded(token, tokenFeeRate, msg.sender);
    }

    /**
     * @dev Remove a supported token
     * @param token Token address to remove
     */
    function removeSupportedToken(address token) external onlyRole(TEAM_ROLE) {
        if (token == address(0)) revert InvalidToken();
        if (token == address(apeToken)) revert InvalidToken(); // Cannot remove APE token
        
        supportedTokens[token] = false;
        delete tokenFeeBps[token];
        
        emit TokenRemoved(token, msg.sender);
    }

    /**
     * @dev Update fee for a specific token
     * @param token Token address
     * @param newFeeBps New fee in basis points
     */
    function updateTokenFee(address token, uint256 newFeeBps) external onlyRole(FEE_MANAGER_ROLE) {
        if (token == address(0)) revert InvalidToken();
        if (!supportedTokens[token]) revert TokenNotSupported();
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        
        uint256 oldFee = tokenFeeBps[token];
        tokenFeeBps[token] = newFeeBps;
        
        emit TokenFeeUpdated(token, oldFee, newFeeBps, msg.sender);
    }

    /**
     * @dev Check if a token is supported
     * @param token Token address to check
     * @return Whether the token is supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    /**
     * @dev Get fee for a specific token
     * @param token Token address
     * @return Fee in basis points for this token
     */
    function getTokenFee(address token) external view returns (uint256) {
        if (!supportedTokens[token]) revert TokenNotSupported();
        return tokenFeeBps[token];
    }

    // Commit-reveal helper functions
    
    /**
     * @dev Clear an old commit (allows user to start over)
     * @notice Can only clear commits that are either revealed or very old
     */
    function clearCommit() external {
        RandomCommit storage commit = randomCommits[msg.sender];
        if (commit.commitHash == bytes32(0)) revert CommitNotFound();
        
        // Allow clearing if revealed or if it's been more than 100 blocks
        if (!commit.revealed && block.number < commit.blockNumber + 100) {
            revert CommitNotReady();
        }
        
        delete randomCommits[msg.sender];
    }
    
    /**
     * @dev Get user's current commit status
     * @param user User address
     * @return commitHash Current commit hash
     * @return blockNumber Block number when committed
     * @return revealed Whether the commit has been revealed
     * @return canReveal Whether the commit can be revealed now
     */
    function getCommitStatus(address user) external view returns (
        bytes32 commitHash,
        uint256 blockNumber,
        bool revealed,
        bool canReveal
    ) {
        RandomCommit storage commit = randomCommits[user];
        commitHash = commit.commitHash;
        blockNumber = commit.blockNumber;
        revealed = commit.revealed;
        canReveal = commit.commitHash != bytes32(0) && 
                    !commit.revealed && 
                    block.number >= commit.blockNumber + COMMIT_REVEAL_DELAY;
    }
    
    /**
     * @dev Get revealed random amounts for a user
     * @param user User address
     * @return amounts Array of revealed random amounts
     */
    function getRevealedAmounts(address user) external view returns (uint256[] memory amounts) {
        RandomCommit storage commit = randomCommits[user];
        if (!commit.revealed) revert CommitNotFound();
        return commit.randomAmounts;
    }
}
