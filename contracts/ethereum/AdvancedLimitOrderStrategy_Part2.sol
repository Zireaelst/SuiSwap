    /// @notice Cancel active order
    /// @param orderHash Hash of the order to cancel
    /// @param orderType Type of order (0: TWAP, 1: Option, 2: DCA, 3: Grid)
    function cancelOrder(bytes32 orderHash, uint8 orderType) external nonReentrant {
        if (orderType == 0) {
            TWAPOrder storage order = twapOrders[orderHash];
            require(order.maker == msg.sender, "Not order maker");
            require(order.isActive, "Order not active");
            
            uint256 refundAmount = order.totalAmount - order.executedAmount;
            order.isActive = false;
            order.tokenIn.transfer(msg.sender, refundAmount);
        } else if (orderType == 1) {
            OptionOrder storage option = optionOrders[orderHash];
            require(option.maker == msg.sender, "Not option maker");
            require(!option.isExecuted && !option.isPremiumPaid, "Cannot cancel");
            
            option.underlying.transfer(msg.sender, option.collateralAmount);
        } else if (orderType == 2) {
            DCAOrder storage order = dcaOrders[orderHash];
            require(order.maker == msg.sender, "Not order maker");
            require(order.isActive, "Order not active");
            
            uint256 refundAmount = order.totalAmount - order.executedAmount;
            order.isActive = false;
            order.tokenIn.transfer(msg.sender, refundAmount);
        } else if (orderType == 3) {
            GridTradingOrder storage order = gridOrders[orderHash];
            require(order.maker == msg.sender, "Not order maker");
            require(order.isActive, "Order not active");
            
            uint256 remainingGrids = order.gridLevels - order.executedGrids;
            uint256 refundAmount = remainingGrids * order.amountPerGrid;
            order.isActive = false;
            order.baseToken.transfer(msg.sender, refundAmount);
        }
    }

    /// @notice Get expected amount out for a token swap (placeholder for 1inch integration)
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param amountIn Input amount
    /// @return Expected output amount
    function getExpectedAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256) {
        // Placeholder - integrate with 1inch API or price oracle
        // This would call 1inch quote API in production
        return amountIn * 95 / 100; // Simplified 5% price impact
    }

    /// @notice Remove liquidity position
    /// @param positionHash Hash of the position to remove
    function removeLiquidityPosition(bytes32 positionHash) external nonReentrant {
        ConcentratedLiquidityPosition storage position = liquidityPositions[positionHash];
        require(position.provider == msg.sender, "Not position provider");
        require(position.isActive, "Position not active");

        position.isActive = false;
        
        // Return tokens plus accumulated fees
        position.token0.transfer(msg.sender, position.amount0 + position.feesEarned0);
        position.token1.transfer(msg.sender, position.amount1 + position.feesEarned1);

        emit LiquidityRemoved(positionHash, position.amount0, position.amount1);
    }

    /// @notice Collect fees from liquidity position
    /// @param positionHash Hash of the position
    function collectLiquidityFees(bytes32 positionHash) external nonReentrant {
        ConcentratedLiquidityPosition storage position = liquidityPositions[positionHash];
        require(position.provider == msg.sender, "Not position provider");
        require(position.isActive, "Position not active");
        
        uint256 fees0 = position.feesEarned0;
        uint256 fees1 = position.feesEarned1;
        
        if (fees0 > 0) {
            position.feesEarned0 = 0;
            position.token0.transfer(msg.sender, fees0);
        }
        
        if (fees1 > 0) {
            position.feesEarned1 = 0;
            position.token1.transfer(msg.sender, fees1);
        }
    }

    /// @notice Add fees to liquidity position (called by liquidity pool)
    /// @param positionHash Hash of the position
    /// @param fees0 Fees in token0
    /// @param fees1 Fees in token1
    function addLiquidityFees(bytes32 positionHash, uint256 fees0, uint256 fees1) external {
        ConcentratedLiquidityPosition storage position = liquidityPositions[positionHash];
        require(position.isActive, "Position not active");
        
        position.feesEarned0 += fees0;
        position.feesEarned1 += fees1;
    }

    /// @notice Batch execute multiple orders
    /// @param orderHashes Array of order hashes
    /// @param orderTypes Array of order types
    /// @param executionData Array of execution data for each order
    function batchExecuteOrders(
        bytes32[] calldata orderHashes,
        uint8[] calldata orderTypes,
        bytes[] calldata executionData
    ) external nonReentrant {
        require(orderHashes.length == orderTypes.length, "Length mismatch");
        require(orderHashes.length == executionData.length, "Length mismatch");
        
        for (uint256 i = 0; i < orderHashes.length; i++) {
            if (orderTypes[i] == 0) {
                // TWAP order
                uint256 amountOut = abi.decode(executionData[i], (uint256));
                executeTWAPInterval(orderHashes[i], amountOut);
            } else if (orderTypes[i] == 2) {
                // DCA order
                uint256 amountOut = abi.decode(executionData[i], (uint256));
                executeDCAOrder(orderHashes[i], amountOut);
            } else if (orderTypes[i] == 3) {
                // Grid order
                (uint256 gridLevel, uint256 amountOut) = abi.decode(executionData[i], (uint256, uint256));
                executeGridOrder(orderHashes[i], gridLevel, amountOut);
            }
        }
    }

    /// @notice Update protocol fee (only owner)
    /// @param newFee New protocol fee in basis points
    function setProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        protocolFee = newFee;
    }

    /// @notice Update fee recipient (only owner)
    /// @param newRecipient New fee recipient address
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /// @notice Get user's TWAP orders
    /// @param user User address
    /// @return Array of order hashes
    function getUserTWAPOrders(address user) external view returns (bytes32[] memory) {
        return userTWAPOrders[user];
    }

    /// @notice Get user's option orders
    /// @param user User address
    /// @return Array of order hashes
    function getUserOptionOrders(address user) external view returns (bytes32[] memory) {
        return userOptionOrders[user];
    }

    /// @notice Get user's liquidity positions
    /// @param user User address
    /// @return Array of position hashes
    function getUserLiquidityPositions(address user) external view returns (bytes32[] memory) {
        return userLiquidityPositions[user];
    }

    /// @notice Get user's DCA orders
    /// @param user User address
    /// @return Array of order hashes
    function getUserDCAOrders(address user) external view returns (bytes32[] memory) {
        return userDCAOrders[user];
    }

    /// @notice Get user's Grid orders
    /// @param user User address
    /// @return Array of order hashes
    function getUserGridOrders(address user) external view returns (bytes32[] memory) {
        return userGridOrders[user];
    }

    /// @notice Get order status
    /// @param orderHash Hash of the order
    /// @param orderType Type of order
    /// @return isActive Whether the order is active
    /// @return executedAmount Amount already executed
    /// @return totalAmount Total order amount
    function getOrderStatus(bytes32 orderHash, uint8 orderType) external view returns (
        bool isActive,
        uint256 executedAmount,
        uint256 totalAmount
    ) {
        if (orderType == 0) {
            TWAPOrder storage order = twapOrders[orderHash];
            return (order.isActive, order.executedAmount, order.totalAmount);
        } else if (orderType == 2) {
            DCAOrder storage order = dcaOrders[orderHash];
            return (order.isActive, order.executedAmount, order.totalAmount);
        } else if (orderType == 3) {
            GridTradingOrder storage order = gridOrders[orderHash];
            uint256 executed = order.executedGrids * order.amountPerGrid;
            uint256 total = order.gridLevels * order.amountPerGrid;
            return (order.isActive, executed, total);
        }
        
        return (false, 0, 0);
    }

    /// @notice Get next execution time for time-based orders
    /// @param orderHash Hash of the order
    /// @param orderType Type of order (0: TWAP, 2: DCA)
    /// @return nextExecutionTime Next execution timestamp
    function getNextExecutionTime(bytes32 orderHash, uint8 orderType) external view returns (uint256 nextExecutionTime) {
        if (orderType == 0) {
            TWAPOrder storage order = twapOrders[orderHash];
            if (order.isActive) {
                nextExecutionTime = order.lastExecutionTime + order.intervalDuration;
            }
        } else if (orderType == 2) {
            DCAOrder storage order = dcaOrders[orderHash];
            if (order.isActive) {
                nextExecutionTime = order.lastExecutionTime + order.frequency;
            }
        }
    }

    /// @notice Integration with CrossChainHTLC for cross-chain orders
    /// @param orderHash Local order hash
    /// @param suiOrderHash Corresponding Sui order hash
    /// @param amount Amount to lock for cross-chain
    /// @param hashlock Hash lock for HTLC
    /// @param timelock Time lock for HTLC
    function createCrossChainOrder(
        bytes32 orderHash,
        bytes32 suiOrderHash,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    ) external {
        TWAPOrder storage order = twapOrders[orderHash];
        require(order.maker == msg.sender, "Not order maker");
        require(order.isActive, "Order not active");
        
        // Update order with cross-chain information
        order.suiOrderHash = suiOrderHash;
        
        // Create HTLC for cross-chain execution
        htlc.createHTLC(
            msg.sender,
            msg.sender, // receiver (will be updated for cross-chain)
            address(order.tokenIn),
            amount,
            hashlock,
            timelock
        );
    }

    /// @notice Emergency withdrawal (only owner)
    /// @param token Token to withdraw
    /// @param amount Amount to withdraw
    function emergencyWithdraw(IERC20 token, uint256 amount) external onlyOwner {
        token.transfer(owner(), amount);
    }

    /// @notice Pause contract (only owner)
    bool public paused = false;
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    /// @notice Check if order can be executed
    /// @param orderHash Hash of the order
    /// @param orderType Type of order
    /// @return canExecute Whether the order can be executed
    /// @return reason Reason if cannot execute
    function canExecuteOrder(bytes32 orderHash, uint8 orderType) external view returns (
        bool canExecute,
        string memory reason
    ) {
        if (orderType == 0) {
            TWAPOrder storage order = twapOrders[orderHash];
            if (!order.isActive) {
                return (false, "Order not active");
            }
            if (block.timestamp < order.lastExecutionTime + order.intervalDuration) {
                return (false, "Too early");
            }
            if (order.executedAmount >= order.totalAmount) {
                return (false, "Order completed");
            }
            return (true, "");
        } else if (orderType == 2) {
            DCAOrder storage order = dcaOrders[orderHash];
            if (!order.isActive) {
                return (false, "Order not active");
            }
            if (block.timestamp < order.lastExecutionTime + order.frequency) {
                return (false, "Too early");
            }
            if (order.executedAmount >= order.totalAmount) {
                return (false, "Order completed");
            }
            return (true, "");
        }
        
        return (false, "Invalid order type");
    }
}
