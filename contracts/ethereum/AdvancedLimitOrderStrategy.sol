// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@1inch/limit-order-protocol/contracts/LimitOrderProtocol.sol";
import "./CrossChainHTLC.sol";

contract AdvancedLimitOrderStrategy {
    struct TWAPOrder {
        address token;
        uint256 totalAmount;
        uint256 executedAmount;
        uint256 intervals;
        uint256 intervalDuration;
        uint256 startTime;
        uint256 lastExecutionTime;
        bytes32 suiOrderHash;
        bool active;
    }

    mapping(bytes32 => TWAPOrder) public twapOrders;
    LimitOrderProtocol public limitOrderProtocol;
    CrossChainHTLC public htlc;

    event TWAPOrderCreated(bytes32 indexed orderId, address indexed creator);
    event TWAPOrderExecuted(bytes32 indexed orderId, uint256 executedAmount);

    constructor(address _limitOrderProtocol, address _htlc) {
        limitOrderProtocol = LimitOrderProtocol(_limitOrderProtocol);
        htlc = CrossChainHTLC(_htlc);
    }

    function createTWAPOrder(
        address _token,
        uint256 _totalAmount,
        uint256 _intervals,
        uint256 _intervalDuration,
        bytes32 _suiOrderHash
    ) external returns (bytes32 orderId) {
        orderId = keccak256(abi.encodePacked(
            msg.sender,
            _token,
            _totalAmount,
            _intervals,
            block.timestamp
        ));

        twapOrders[orderId] = TWAPOrder({
            token: _token,
            totalAmount: _totalAmount,
            executedAmount: 0,
            intervals: _intervals,
            intervalDuration: _intervalDuration,
            startTime: block.timestamp,
            lastExecutionTime: 0,
            suiOrderHash: _suiOrderHash,
            active: true
        });

        emit TWAPOrderCreated(orderId, msg.sender);
    }

    function executeTWAPInterval(bytes32 _orderId) external {
        TWAPOrder storage order = twapOrders[_orderId];
        require(order.active, "Order not active");
        require(
            block.timestamp >= order.lastExecutionTime + order.intervalDuration,
            "Interval not ready"
        );

        uint256 intervalAmount = order.totalAmount / order.intervals;
        require(
            order.executedAmount + intervalAmount <= order.totalAmount,
            "Execution complete"
        );

        order.executedAmount += intervalAmount;
        order.lastExecutionTime = block.timestamp;

        if (order.executedAmount >= order.totalAmount) {
            order.active = false;
        }

        emit TWAPOrderExecuted(_orderId, intervalAmount);
    }
}
