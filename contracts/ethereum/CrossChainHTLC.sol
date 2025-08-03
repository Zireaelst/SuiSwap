// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CrossChainHTLC - Hash Time Lock Contract for Cross-chain Swaps
/// @notice Implements HTLC functionality for Ethereum-Sui cross-chain atomic swaps
/// @dev Supports both full and partial fills for Fusion+ integration
contract CrossChainHTLC is ReentrancyGuard, Ownable {
    
    struct HTLCOrder {
        address initiator;
        address recipient;
        address token;
        uint256 amount;
        uint256 filledAmount;
        bytes32 hashlock;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bytes32 suiOrderId;
        uint256 partialFillCount;
        mapping(uint256 => PartialFill) partialFills;
    }

    struct PartialFill {
        address filler;
        uint256 amount;
        bytes32 preimage;
        uint256 timestamp;
    }

    struct OrderInfo {
        address initiator;
        address recipient;
        address token;
        uint256 amount;
        uint256 filledAmount;
        bytes32 hashlock;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bytes32 suiOrderId;
        uint256 partialFillCount;
    }

    mapping(bytes32 => HTLCOrder) public orders;
    mapping(bytes32 => bool) public usedPreimages;
    
    // Fusion+ integration variables
    uint256 public constant MIN_TIMELOCK_DURATION = 1 hours;
    uint256 public constant MAX_TIMELOCK_DURATION = 24 hours;
    uint256 public fusionPlusFee = 30; // 0.3% in basis points
    address public fusionPlusTreasury;
    
    // Events
    event HTLCCreated(
        bytes32 indexed orderId, 
        address indexed initiator, 
        address indexed recipient,
        bytes32 suiOrderId,
        uint256 amount,
        address token
    );
    
    event HTLCWithdrawn(
        bytes32 indexed orderId, 
        bytes32 preimage,
        address indexed recipient,
        uint256 amount
    );
    
    event HTLCPartiallyFilled(
        bytes32 indexed orderId,
        address indexed filler,
        uint256 fillAmount,
        uint256 remainingAmount
    );
    
    event HTLCRefunded(bytes32 indexed orderId, uint256 amount);
    
    event SecretRevealed(bytes32 indexed orderId, bytes32 secret);

    constructor(address _fusionPlusTreasury) Ownable(msg.sender) {
        fusionPlusTreasury = _fusionPlusTreasury;
    }

    /// @notice Create HTLC order for cross-chain swap
    /// @param _recipient Address that can claim the funds on this chain
    /// @param _token Token contract address (address(0) for ETH)
    /// @param _amount Amount of tokens to lock
    /// @param _hashlock Hash of the secret
    /// @param _timelock Timestamp after which refund is possible
    /// @param _suiOrderId Corresponding order ID on Sui
    function createHTLC(
        address _recipient,
        address _token,
        uint256 _amount,
        bytes32 _hashlock,
        uint256 _timelock,
        bytes32 _suiOrderId
    ) external payable nonReentrant returns (bytes32 orderId) {
        require(_recipient != address(0), "Invalid recipient");
        require(_timelock > block.timestamp + MIN_TIMELOCK_DURATION, "Timelock too short");
        require(_timelock < block.timestamp + MAX_TIMELOCK_DURATION, "Timelock too long");
        require(_hashlock != bytes32(0), "Invalid hashlock");

        orderId = keccak256(abi.encodePacked(
            msg.sender,
            _recipient,
            _token,
            _amount,
            _hashlock,
            _timelock,
            block.timestamp,
            _suiOrderId
        ));

        require(orders[orderId].initiator == address(0), "Order already exists");

        if (_token == address(0)) {
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not allowed for token transfers");
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }

        HTLCOrder storage order = orders[orderId];
        order.initiator = msg.sender;
        order.recipient = _recipient;
        order.token = _token;
        order.amount = _amount;
        order.filledAmount = 0;
        order.hashlock = _hashlock;
        order.timelock = _timelock;
        order.withdrawn = false;
        order.refunded = false;
        order.suiOrderId = _suiOrderId;
        order.partialFillCount = 0;

        emit HTLCCreated(orderId, msg.sender, _recipient, _suiOrderId, _amount, _token);
        return orderId;
    }

    /// @notice Withdraw funds with preimage (complete or partial fill)
    /// @param _orderId Order identifier
    /// @param _preimage Secret that hashes to the hashlock
    /// @param _amount Amount to withdraw (0 for full withdrawal)
    function withdraw(
        bytes32 _orderId, 
        bytes32 _preimage,
        uint256 _amount
    ) external nonReentrant {
        HTLCOrder storage order = orders[_orderId];
        require(order.initiator != address(0), "Order does not exist");
        require(!order.withdrawn, "Already withdrawn");
        require(!order.refunded, "Already refunded");
        require(block.timestamp <= order.timelock, "Timelock expired");
        require(keccak256(abi.encodePacked(_preimage)) == order.hashlock, "Invalid preimage");
        require(!usedPreimages[_preimage], "Preimage already used");

        uint256 remainingAmount = order.amount - order.filledAmount;
        require(remainingAmount > 0, "Order fully filled");

        uint256 withdrawAmount = _amount == 0 ? remainingAmount : _amount;
        require(withdrawAmount <= remainingAmount, "Amount exceeds remaining");

        // Mark preimage as used to prevent reuse
        usedPreimages[_preimage] = true;

        // Calculate Fusion+ fee
        uint256 fee = (withdrawAmount * fusionPlusFee) / 10000;
        uint256 netAmount = withdrawAmount - fee;

        // Update order state
        order.filledAmount += withdrawAmount;
        
        // Record partial fill
        order.partialFills[order.partialFillCount] = PartialFill({
            filler: msg.sender,
            amount: withdrawAmount,
            preimage: _preimage,
            timestamp: block.timestamp
        });
        order.partialFillCount++;

        if (order.filledAmount == order.amount) {
            order.withdrawn = true;
        }

        // Transfer funds
        if (order.token == address(0)) {
            payable(order.recipient).transfer(netAmount);
            if (fee > 0) {
                payable(fusionPlusTreasury).transfer(fee);
            }
        } else {
            IERC20(order.token).transfer(order.recipient, netAmount);
            if (fee > 0) {
                IERC20(order.token).transfer(fusionPlusTreasury, fee);
            }
        }

        emit HTLCWithdrawn(_orderId, _preimage, order.recipient, withdrawAmount);
        emit SecretRevealed(_orderId, _preimage);

        if (!order.withdrawn) {
            emit HTLCPartiallyFilled(_orderId, msg.sender, withdrawAmount, remainingAmount - withdrawAmount);
        }
    }

    /// @notice Refund after timelock expires
    /// @param _orderId Order identifier
    function refund(bytes32 _orderId) external nonReentrant {
        HTLCOrder storage order = orders[_orderId];
        require(msg.sender == order.initiator, "Only initiator can refund");
        require(!order.withdrawn, "Already withdrawn");
        require(!order.refunded, "Already refunded");
        require(block.timestamp > order.timelock, "Timelock not expired");

        order.refunded = true;
        uint256 refundAmount = order.amount - order.filledAmount;

        if (order.token == address(0)) {
            payable(order.initiator).transfer(refundAmount);
        } else {
            IERC20(order.token).transfer(order.initiator, refundAmount);
        }

        emit HTLCRefunded(_orderId, refundAmount);
    }

    /// @notice Get order information
    /// @param _orderId Order identifier
    function getOrderInfo(bytes32 _orderId) external view returns (OrderInfo memory) {
        HTLCOrder storage order = orders[_orderId];
        return OrderInfo({
            initiator: order.initiator,
            recipient: order.recipient,
            token: order.token,
            amount: order.amount,
            filledAmount: order.filledAmount,
            hashlock: order.hashlock,
            timelock: order.timelock,
            withdrawn: order.withdrawn,
            refunded: order.refunded,
            suiOrderId: order.suiOrderId,
            partialFillCount: order.partialFillCount
        });
    }

    /// @notice Get partial fill details
    /// @param _orderId Order identifier
    /// @param _fillIndex Fill index
    function getPartialFill(bytes32 _orderId, uint256 _fillIndex) external view returns (PartialFill memory) {
        require(_fillIndex < orders[_orderId].partialFillCount, "Invalid fill index");
        return orders[_orderId].partialFills[_fillIndex];
    }

    /// @notice Check if order can be withdrawn
    /// @param _orderId Order identifier
    function canWithdraw(bytes32 _orderId) external view returns (bool) {
        HTLCOrder storage order = orders[_orderId];
        return !order.withdrawn && !order.refunded && 
               block.timestamp <= order.timelock && 
               order.filledAmount < order.amount;
    }

    /// @notice Check if order can be refunded
    /// @param _orderId Order identifier
    function canRefund(bytes32 _orderId) external view returns (bool) {
        HTLCOrder storage order = orders[_orderId];
        return !order.withdrawn && !order.refunded && block.timestamp > order.timelock;
    }

    /// @notice Get remaining amount available for withdrawal
    /// @param _orderId Order identifier
    function getRemainingAmount(bytes32 _orderId) external view returns (uint256) {
        HTLCOrder storage order = orders[_orderId];
        return order.amount - order.filledAmount;
    }

    /// @notice Update Fusion+ fee (only owner)
    /// @param _newFee New fee in basis points
    function setFusionPlusFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        fusionPlusFee = _newFee;
    }

    /// @notice Update Fusion+ treasury address (only owner)
    /// @param _newTreasury New treasury address
    function setFusionPlusTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        fusionPlusTreasury = _newTreasury;
    }

    /// @notice Emergency withdrawal (only owner, for upgrades/emergencies)
    /// @param _orderId Order identifier
    function emergencyWithdraw(bytes32 _orderId) external onlyOwner {
        HTLCOrder storage order = orders[_orderId];
        require(!order.refunded, "Already refunded");
        
        order.refunded = true;
        uint256 amount = order.amount - order.filledAmount;

        if (order.token == address(0)) {
            payable(order.initiator).transfer(amount);
        } else {
            IERC20(order.token).transfer(order.initiator, amount);
        }

        emit HTLCRefunded(_orderId, amount);
    }
}
