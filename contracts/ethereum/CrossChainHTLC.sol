// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrossChainHTLC is ReentrancyGuard {
    struct HTLCOrder {
        address initiator;
        address token;
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bytes32 suiOrderId;
    }

    mapping(bytes32 => HTLCOrder) public orders;

    event HTLCCreated(bytes32 indexed orderId, address indexed initiator, bytes32 suiOrderId);
    event HTLCWithdrawn(bytes32 indexed orderId, bytes32 preimage);
    event HTLCRefunded(bytes32 indexed orderId);

    function createHTLC(
        address _token,
        uint256 _amount,
        bytes32 _hashlock,
        uint256 _timelock,
        bytes32 _suiOrderId
    ) external payable nonReentrant returns (bytes32 orderId) {
        require(_timelock > block.timestamp, "Timelock must be in future");

        orderId = keccak256(abi.encodePacked(
            msg.sender,
            _token,
            _amount,
            _hashlock,
            _timelock,
            block.timestamp
        ));

        require(orders[orderId].initiator == address(0), "Order already exists");

        if (_token == address(0)) {
            require(msg.value == _amount, "Incorrect ETH amount");
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }

        orders[orderId] = HTLCOrder({
            initiator: msg.sender,
            token: _token,
            amount: _amount,
            hashlock: _hashlock,
            timelock: _timelock,
            withdrawn: false,
            refunded: false,
            suiOrderId: _suiOrderId
        });

        emit HTLCCreated(orderId, msg.sender, _suiOrderId);
    }

    function withdraw(bytes32 _orderId, bytes32 _preimage) external nonReentrant {
        HTLCOrder storage order = orders[_orderId];
        require(!order.withdrawn, "Already withdrawn");
        require(!order.refunded, "Already refunded");
        require(order.hashlock == keccak256(abi.encodePacked(_preimage)), "Invalid preimage");
        require(block.timestamp <= order.timelock, "Timelock expired");

        order.withdrawn = true;

        if (order.token == address(0)) {
            payable(msg.sender).transfer(order.amount);
        } else {
            IERC20(order.token).transfer(msg.sender, order.amount);
        }

        emit HTLCWithdrawn(_orderId, _preimage);
    }

    function refund(bytes32 _orderId) external nonReentrant {
        HTLCOrder storage order = orders[_orderId];
        require(msg.sender == order.initiator, "Only initiator can refund");
        require(!order.withdrawn, "Already withdrawn");
        require(!order.refunded, "Already refunded");
        require(block.timestamp > order.timelock, "Timelock not expired");

        order.refunded = true;

        if (order.token == address(0)) {
            payable(order.initiator).transfer(order.amount);
        } else {
            IERC20(order.token).transfer(order.initiator, order.amount);
        }

        emit HTLCRefunded(_orderId);
    }
}
