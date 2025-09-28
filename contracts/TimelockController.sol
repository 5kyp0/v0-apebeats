// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title ApeBeatsTimelockController
 * @dev Timelock controller for ApeBeats Genesis contract critical functions
 * This contract adds a delay to critical operations to prevent immediate execution
 */
contract ApeBeatsTimelockController is TimelockController {
    // Minimum delay for critical operations (24 hours)
    uint256 public constant MIN_DELAY = 24 hours;
    
    // Maximum delay for operations (7 days)
    uint256 public constant MAX_DELAY = 7 days;
    
    // Events for timelock operations
    event CriticalOperationScheduled(
        bytes32 indexed operationId,
        address indexed target,
        uint256 value,
        bytes data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    );
    
    event CriticalOperationExecuted(
        bytes32 indexed operationId,
        address indexed target,
        uint256 value,
        bytes data
    );
    
    event CriticalOperationCancelled(
        bytes32 indexed operationId,
        address indexed target,
        uint256 value,
        bytes data
    );
    
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        require(minDelay >= MIN_DELAY, "Delay too short");
        require(minDelay <= MAX_DELAY, "Delay too long");
    }
    
    /**
     * @dev Schedule a critical operation with additional validation
     * @param target The target contract address
     * @param value The value to send with the operation
     * @param data The calldata for the operation
     * @param predecessor The predecessor operation (if any)
     * @param salt The salt for the operation
     * @param delay The delay before execution
     */
    function scheduleCriticalOperation(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) external onlyRole(PROPOSER_ROLE) {
        require(delay >= MIN_DELAY, "Delay too short");
        require(delay <= MAX_DELAY, "Delay too long");
        
        bytes32 operationId = hashOperation(target, value, data, predecessor, salt);
        
        schedule(target, value, data, predecessor, salt, delay);
        
        emit CriticalOperationScheduled(
            operationId,
            target,
            value,
            data,
            predecessor,
            salt,
            delay
        );
    }
    
    /**
     * @dev Execute a critical operation with additional logging
     * @param target The target contract address
     * @param value The value to send with the operation
     * @param data The calldata for the operation
     * @param predecessor The predecessor operation (if any)
     * @param salt The salt for the operation
     */
    function executeCriticalOperation(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) external payable onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        bytes32 operationId = hashOperation(target, value, data, predecessor, salt);
        
        execute(target, value, data, predecessor, salt);
        
        emit CriticalOperationExecuted(
            operationId,
            target,
            value,
            data
        );
    }
    
    /**
     * @dev Cancel a critical operation with additional logging
     * @param target The target contract address
     * @param value The value to send with the operation
     * @param data The calldata for the operation
     * @param predecessor The predecessor operation (if any)
     * @param salt The salt for the operation
     */
    function cancelCriticalOperation(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) external onlyRole(CANCELLER_ROLE) {
        bytes32 operationId = hashOperation(target, value, data, predecessor, salt);
        
        cancel(target, value, data, predecessor, salt);
        
        emit CriticalOperationCancelled(
            operationId,
            target,
            value,
            data
        );
    }
    
    /**
     * @dev Check if an operation is ready for execution
     * @param target The target contract address
     * @param value The value to send with the operation
     * @param data The calldata for the operation
     * @param predecessor The predecessor operation (if any)
     * @param salt The salt for the operation
     * @return True if the operation is ready for execution
     */
    function isOperationReady(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) external view returns (bool) {
        bytes32 operationId = hashOperation(target, value, data, predecessor, salt);
        return isOperationReady(operationId);
    }
    
    /**
     * @dev Get the timestamp when an operation will be ready for execution
     * @param target The target contract address
     * @param value The value to send with the operation
     * @param data The calldata for the operation
     * @param predecessor The predecessor operation (if any)
     * @param salt The salt for the operation
     * @return The timestamp when the operation will be ready
     */
    function getOperationTimestamp(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) external view returns (uint256) {
        bytes32 operationId = hashOperation(target, value, data, predecessor, salt);
        return getTimestamp(operationId);
    }
}
