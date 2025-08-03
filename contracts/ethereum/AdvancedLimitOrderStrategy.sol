// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./CrossChainHTLC.sol";

/// @title AdvancedLimitOrderStrategy - Advanced strategies for 1inch Limit Order Protocol
/// @notice Implements TWAP, Options, Concentrated Liquidity, DCA, and other advanced trading strategies
/// @dev Extends 1inch Limit Order Protocol with custom hooks and advanced execution logic
contract AdvancedLimitOrderStrategy is ReentrancyGuard, Ownable {
    
    using Math for uint256;

    struct TWAPOrder {
        address maker;
        IERC20 tokenIn;
        IERC20 tokenOut;
        uint256 totalAmount;
        uint256 executedAmount;
        uint256 intervals;
        uint256 intervalDuration;
        uint256 lastExecutionTime;
        uint256 minPricePerToken;
        uint256 maxPricePerToken;
        bool isActive;
        bytes32 orderHash;
        bytes32 suiOrderHash; // For cross-chain compatibility
    }

    struct OptionOrder {
        address maker;
        IERC20 underlying;
        uint256 strikePrice;
        uint256 premium;
        uint256 expiry;
        bool isCall; // true for call, false for put
        bool isExecuted;
        bool isPremiumPaid;
        uint256 collateralAmount;
        bytes32 orderHash;
    }

    struct ConcentratedLiquidityPosition {
        address provider;
        IERC20 token0;
        IERC20 token1;
        uint256 amount0;
        uint256 amount1;
        uint256 lowerTick;
        uint256 upperTick;
        uint256 liquidity;
        uint256 feesEarned0;
        uint256 feesEarned1;
        bool isActive;
        bytes32 positionHash;
    }

    struct DCAOrder {
        address maker;
        IERC20 tokenIn;
        IERC20 tokenOut;
        uint256 totalAmount;
        uint256 executedAmount;
        uint256 frequency; // in seconds
        uint256 amountPerExecution;
        uint256 lastExecutionTime;
        uint256 maxSlippage;
        bool isActive;
        bytes32 orderHash;
    }

    struct GridTradingOrder {
        address maker;
        IERC20 baseToken;
        IERC20 quoteToken;
        uint256 gridLevels;
        uint256 priceStep;
        uint256 basePrice;
        uint256 amountPerGrid;
        uint256 executedGrids;
        bool isActive;
        bytes32 orderHash;
    }

    // Storage mappings
    mapping(bytes32 => TWAPOrder) public twapOrders;
    mapping(bytes32 => OptionOrder) public optionOrders;
    mapping(bytes32 => ConcentratedLiquidityPosition) public liquidityPositions;
    mapping(bytes32 => DCAOrder) public dcaOrders;
    mapping(bytes32 => GridTradingOrder) public gridOrders;
    mapping(address => bytes32[]) public userTWAPOrders;
    mapping(address => bytes32[]) public userOptionOrders;
    mapping(address => bytes32[]) public userLiquidityPositions;
    mapping(address => bytes32[]) public userDCAOrders;
    mapping(address => bytes32[]) public userGridOrders;

    // Protocol components
    CrossChainHTLC public htlc;
    
    // Protocol parameters
    uint256 public constant MAX_SLIPPAGE = 1000; // 10%
    uint256 public constant MIN_INTERVAL_DURATION = 300; // 5 minutes
    uint256 public constant MAX_GRID_LEVELS = 50;
    uint256 public protocolFee = 30; // 0.3%
    address public feeRecipient;
    uint256 public nonce;

    // Events
    event TWAPOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 totalAmount);
    event TWAPOrderExecuted(bytes32 indexed orderHash, uint256 amountIn, uint256 amountOut);
    event OptionOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 strikePrice);
    event OptionExecuted(bytes32 indexed orderHash, address indexed executor);
    event LiquidityPositionCreated(bytes32 indexed positionHash, address indexed provider);
    event LiquidityRemoved(bytes32 indexed positionHash, uint256 amount0, uint256 amount1);
    event DCAOrderCreated(bytes32 indexed orderHash, address indexed maker);
    event DCAOrderExecuted(bytes32 indexed orderHash, uint256 amountIn, uint256 amountOut);
    event GridOrderCreated(bytes32 indexed orderHash, address indexed maker, uint256 gridLevels);
    event GridOrderExecuted(bytes32 indexed orderHash, uint256 gridLevel, uint256 amountIn, uint256 amountOut);

    constructor(address _htlc, address _feeRecipient) Ownable(msg.sender) {
        htlc = CrossChainHTLC(_htlc);
        feeRecipient = _feeRecipient;
    }

    /// @notice Create TWAP (Time-Weighted Average Price) order
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param totalAmount Total amount to be swapped over time
    /// @param intervals Number of intervals to split the order
    /// @param intervalDuration Duration of each interval in seconds
    /// @param minPricePerToken Minimum acceptable price per token
    /// @param maxPricePerToken Maximum acceptable price per token
    /// @param suiOrderHash Optional cross-chain order hash for Sui integration
    function createTWAPOrder(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 totalAmount,
        uint256 intervals,
        uint256 intervalDuration,
        uint256 minPricePerToken,
        uint256 maxPricePerToken,
        bytes32 suiOrderHash
    ) external nonReentrant returns (bytes32 orderHash) {
        require(totalAmount > 0, "Invalid total amount");
        require(intervals > 0 && intervals <= 100, "Invalid intervals");
        require(intervalDuration >= MIN_INTERVAL_DURATION, "Interval too short");
        require(minPricePerToken < maxPricePerToken, "Invalid price range");

        // Transfer tokens to contract
        tokenIn.transferFrom(msg.sender, address(this), totalAmount);

        // Generate unique order hash
        orderHash = keccak256(abi.encodePacked(
            msg.sender,
            address(tokenIn),
            address(tokenOut),
            totalAmount,
            intervals,
            block.timestamp,
            nonce++
        ));

        // Create TWAP order
        twapOrders[orderHash] = TWAPOrder({
            maker: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            totalAmount: totalAmount,
            executedAmount: 0,
            intervals: intervals,
            intervalDuration: intervalDuration,
            lastExecutionTime: block.timestamp,
            minPricePerToken: minPricePerToken,
            maxPricePerToken: maxPricePerToken,
            isActive: true,
            orderHash: orderHash,
            suiOrderHash: suiOrderHash
        });

        userTWAPOrders[msg.sender].push(orderHash);
        emit TWAPOrderCreated(orderHash, msg.sender, totalAmount);
    }

    /// @notice Execute TWAP order interval
    /// @param orderHash Hash of the TWAP order
    /// @param amountOut Expected output amount for this interval
    function executeTWAPInterval(
        bytes32 orderHash,
        uint256 amountOut
    ) external nonReentrant {
        TWAPOrder storage order = twapOrders[orderHash];
        require(order.isActive, "Order not active");
        require(block.timestamp >= order.lastExecutionTime + order.intervalDuration, "Too early");
        
        uint256 remainingIntervals = order.intervals - (order.executedAmount * order.intervals / order.totalAmount);
        require(remainingIntervals > 0, "Order completed");

        uint256 amountPerInterval = order.totalAmount / order.intervals;
        uint256 actualAmountIn = Math.min(amountPerInterval, order.totalAmount - order.executedAmount);
        
        // Price validation
        uint256 pricePerToken = (amountOut * 1e18) / actualAmountIn;
        require(pricePerToken >= order.minPricePerToken && pricePerToken <= order.maxPricePerToken, "Price out of range");

        // Calculate and deduct protocol fee
        uint256 fee = (actualAmountIn * protocolFee) / 10000;
        uint256 netAmountIn = actualAmountIn - fee;

        // Execute swap (integrate with 1inch API here)
        order.tokenIn.transfer(msg.sender, netAmountIn);
        order.tokenIn.transfer(feeRecipient, fee);

        // Update order state
        order.executedAmount += actualAmountIn;
        order.lastExecutionTime = block.timestamp;

        if (order.executedAmount >= order.totalAmount) {
            order.isActive = false;
        }

        emit TWAPOrderExecuted(orderHash, actualAmountIn, amountOut);
    }

    /// @notice Create option order (call or put)
    /// @param underlying Underlying token address
    /// @param strikePrice Strike price for the option
    /// @param premium Premium to be paid for the option
    /// @param expiry Expiry timestamp
    /// @param isCall True for call option, false for put option
    /// @param collateralAmount Amount of collateral to lock
    function createOptionOrder(
        IERC20 underlying,
        uint256 strikePrice,
        uint256 premium,
        uint256 expiry,
        bool isCall,
        uint256 collateralAmount
    ) external nonReentrant returns (bytes32 orderHash) {
        require(expiry > block.timestamp, "Invalid expiry");
        require(strikePrice > 0, "Invalid strike price");
        require(collateralAmount > 0, "Invalid collateral");

        // Generate unique order hash
        orderHash = keccak256(abi.encodePacked(
            msg.sender,
            address(underlying),
            strikePrice,
            expiry,
            isCall,
            block.timestamp,
            nonce++
        ));

        // Lock collateral
        underlying.transferFrom(msg.sender, address(this), collateralAmount);

        // Create option order
        optionOrders[orderHash] = OptionOrder({
            maker: msg.sender,
            underlying: underlying,
            strikePrice: strikePrice,
            premium: premium,
            expiry: expiry,
            isCall: isCall,
            isExecuted: false,
            isPremiumPaid: false,
            collateralAmount: collateralAmount,
            orderHash: orderHash
        });

        userOptionOrders[msg.sender].push(orderHash);
        emit OptionOrderCreated(orderHash, msg.sender, strikePrice);
    }

    /// @notice Exercise option order
    /// @param orderHash Hash of the option order
    /// @param currentPrice Current price of the underlying asset
    function exerciseOption(
        bytes32 orderHash,
        uint256 currentPrice
    ) external payable nonReentrant {
        OptionOrder storage option = optionOrders[orderHash];
        require(!option.isExecuted, "Already executed");
        require(block.timestamp <= option.expiry, "Option expired");
        require(msg.value >= option.premium, "Insufficient premium");

        bool shouldExecute = false;
        if (option.isCall && currentPrice > option.strikePrice) {
            shouldExecute = true;
        } else if (!option.isCall && currentPrice < option.strikePrice) {
            shouldExecute = true;
        }

        require(shouldExecute, "Option not profitable");

        // Transfer premium to option writer
        payable(option.maker).transfer(option.premium);
        
        // Calculate payout
        uint256 payout;
        if (option.isCall) {
            payout = ((currentPrice - option.strikePrice) * option.collateralAmount) / currentPrice;
        } else {
            payout = ((option.strikePrice - currentPrice) * option.collateralAmount) / option.strikePrice;
        }

        // Transfer payout to option buyer
        option.underlying.transfer(msg.sender, payout);
        
        // Return remaining collateral to writer
        uint256 remaining = option.collateralAmount - payout;
        if (remaining > 0) {
            option.underlying.transfer(option.maker, remaining);
        }

        option.isExecuted = true;
        option.isPremiumPaid = true;

        emit OptionExecuted(orderHash, msg.sender);
    }

    /// @notice Create concentrated liquidity position
    /// @param token0 First token address
    /// @param token1 Second token address
    /// @param amount0 Amount of first token
    /// @param amount1 Amount of second token
    /// @param lowerTick Lower price tick
    /// @param upperTick Upper price tick
    function createConcentratedLiquidityPosition(
        IERC20 token0,
        IERC20 token1,
        uint256 amount0,
        uint256 amount1,
        uint256 lowerTick,
        uint256 upperTick
    ) external nonReentrant returns (bytes32 positionHash) {
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");
        require(lowerTick < upperTick, "Invalid tick range");

        // Transfer tokens to contract
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);

        // Generate unique position hash
        positionHash = keccak256(abi.encodePacked(
            msg.sender,
            address(token0),
            address(token1),
            lowerTick,
            upperTick,
            block.timestamp,
            nonce++
        ));

        // Calculate liquidity (simplified)
        uint256 liquidity = Math.sqrt(amount0 * amount1);

        // Create position
        liquidityPositions[positionHash] = ConcentratedLiquidityPosition({
            provider: msg.sender,
            token0: token0,
            token1: token1,
            amount0: amount0,
            amount1: amount1,
            lowerTick: lowerTick,
            upperTick: upperTick,
            liquidity: liquidity,
            feesEarned0: 0,
            feesEarned1: 0,
            isActive: true,
            positionHash: positionHash
        });

        userLiquidityPositions[msg.sender].push(positionHash);
        emit LiquidityPositionCreated(positionHash, msg.sender);
    }

    /// @notice Create Dollar Cost Averaging (DCA) order
    /// @param tokenIn Input token address
    /// @param tokenOut Output token address
    /// @param totalAmount Total amount to be swapped over time
    /// @param frequency Frequency of execution in seconds
    /// @param amountPerExecution Amount to swap per execution
    /// @param maxSlippage Maximum acceptable slippage
    function createDCAOrder(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 totalAmount,
        uint256 frequency,
        uint256 amountPerExecution,
        uint256 maxSlippage
    ) external nonReentrant returns (bytes32 orderHash) {
        require(totalAmount > 0, "Invalid total amount");
        require(frequency >= MIN_INTERVAL_DURATION, "Frequency too short");
        require(amountPerExecution > 0 && amountPerExecution <= totalAmount, "Invalid amount per execution");
        require(maxSlippage <= MAX_SLIPPAGE, "Slippage too high");

        // Transfer tokens to contract
        tokenIn.transferFrom(msg.sender, address(this), totalAmount);

        // Generate unique order hash
        orderHash = keccak256(abi.encodePacked(
            msg.sender,
            address(tokenIn),
            address(tokenOut),
            totalAmount,
            frequency,
            block.timestamp,
            nonce++
        ));

        // Create DCA order
        dcaOrders[orderHash] = DCAOrder({
            maker: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            totalAmount: totalAmount,
            executedAmount: 0,
            frequency: frequency,
            amountPerExecution: amountPerExecution,
            lastExecutionTime: block.timestamp,
            maxSlippage: maxSlippage,
            isActive: true,
            orderHash: orderHash
        });

        userDCAOrders[msg.sender].push(orderHash);
        emit DCAOrderCreated(orderHash, msg.sender);
    }

    /// @notice Execute DCA order
    /// @param orderHash Hash of the DCA order
    /// @param amountOut Expected output amount
    function executeDCAOrder(
        bytes32 orderHash,
        uint256 amountOut
    ) external nonReentrant {
        DCAOrder storage order = dcaOrders[orderHash];
        require(order.isActive, "Order not active");
        require(block.timestamp >= order.lastExecutionTime + order.frequency, "Too early");
        
        uint256 remainingAmount = order.totalAmount - order.executedAmount;
        require(remainingAmount > 0, "Order completed");

        uint256 amountIn = Math.min(order.amountPerExecution, remainingAmount);
        
        // Slippage validation
        uint256 expectedAmountOut = getExpectedAmountOut(address(order.tokenIn), address(order.tokenOut), amountIn);
        uint256 minAmountOut = expectedAmountOut * (10000 - order.maxSlippage) / 10000;
        require(amountOut >= minAmountOut, "Slippage too high");

        // Calculate and deduct protocol fee
        uint256 fee = (amountIn * protocolFee) / 10000;
        uint256 netAmountIn = amountIn - fee;

        // Execute swap (integrate with 1inch API here)
        order.tokenIn.transfer(msg.sender, netAmountIn);
        order.tokenIn.transfer(feeRecipient, fee);

        // Update order state
        order.executedAmount += amountIn;
        order.lastExecutionTime = block.timestamp;

        if (order.executedAmount >= order.totalAmount) {
            order.isActive = false;
        }

        emit DCAOrderExecuted(orderHash, amountIn, amountOut);
    }

    /// @notice Create Grid Trading order
    /// @param baseToken Base token address
    /// @param quoteToken Quote token address
    /// @param gridLevels Number of grid levels
    /// @param priceStep Price step between grid levels
    /// @param basePrice Starting base price
    /// @param amountPerGrid Amount per grid level
    function createGridTradingOrder(
        IERC20 baseToken,
        IERC20 quoteToken,
        uint256 gridLevels,
        uint256 priceStep,
        uint256 basePrice,
        uint256 amountPerGrid
    ) external nonReentrant returns (bytes32 orderHash) {
        require(gridLevels > 0 && gridLevels <= MAX_GRID_LEVELS, "Invalid grid levels");
        require(priceStep > 0, "Invalid price step");
        require(basePrice > 0, "Invalid base price");
        require(amountPerGrid > 0, "Invalid amount per grid");

        uint256 totalAmount = gridLevels * amountPerGrid;
        
        // Transfer tokens to contract (simplified - would need both tokens for full grid)
        baseToken.transferFrom(msg.sender, address(this), totalAmount);

        // Generate unique order hash
        orderHash = keccak256(abi.encodePacked(
            msg.sender,
            address(baseToken),
            address(quoteToken),
            gridLevels,
            priceStep,
            block.timestamp,
            nonce++
        ));

        // Create grid order
        gridOrders[orderHash] = GridTradingOrder({
            maker: msg.sender,
            baseToken: baseToken,
            quoteToken: quoteToken,
            gridLevels: gridLevels,
            priceStep: priceStep,
            basePrice: basePrice,
            amountPerGrid: amountPerGrid,
            executedGrids: 0,
            isActive: true,
            orderHash: orderHash
        });

        userGridOrders[msg.sender].push(orderHash);
        emit GridOrderCreated(orderHash, msg.sender, gridLevels);
    }

    /// @notice Execute Grid Trading order at specific grid level
    /// @param orderHash Hash of the grid order
    /// @param gridLevel Grid level to execute (0-based)
    /// @param amountOut Expected output amount
    function executeGridOrder(
        bytes32 orderHash,
        uint256 gridLevel,
        uint256 amountOut
    ) external nonReentrant {
        GridTradingOrder storage order = gridOrders[orderHash];
        require(order.isActive, "Order not active");
        require(gridLevel < order.gridLevels, "Invalid grid level");
        require(order.executedGrids < order.gridLevels, "All grids executed");

        uint256 currentPrice = order.basePrice + (gridLevel * order.priceStep);
        uint256 expectedAmountOut = (order.amountPerGrid * currentPrice) / 1e18;
        
        // Price validation (allow 1% tolerance)
        require(amountOut >= expectedAmountOut * 99 / 100, "Price too low");

        // Calculate and deduct protocol fee
        uint256 fee = (order.amountPerGrid * protocolFee) / 10000;
        uint256 netAmountIn = order.amountPerGrid - fee;

        // Execute swap
        order.baseToken.transfer(msg.sender, netAmountIn);
        order.baseToken.transfer(feeRecipient, fee);

        // Update order state
        order.executedGrids++;

        if (order.executedGrids >= order.gridLevels) {
            order.isActive = false;
        }

        emit GridOrderExecuted(orderHash, gridLevel, order.amountPerGrid, amountOut);
    }

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
    function getExpectedAmountOut(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256) {
        return amountIn * 95 / 100; // Simplified 5% price impact - integrate with 1inch API
    }

    /// @notice Remove liquidity position
    function removeLiquidityPosition(bytes32 positionHash) external nonReentrant {
        ConcentratedLiquidityPosition storage position = liquidityPositions[positionHash];
        require(position.provider == msg.sender, "Not position provider");
        require(position.isActive, "Position not active");

        position.isActive = false;
        position.token0.transfer(msg.sender, position.amount0 + position.feesEarned0);
        position.token1.transfer(msg.sender, position.amount1 + position.feesEarned1);

        emit LiquidityRemoved(positionHash, position.amount0, position.amount1);
    }

    /// @notice Update protocol fee (only owner)
    function setProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        protocolFee = newFee;
    }

    /// @notice Update fee recipient (only owner)
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /// @notice Get user's orders by type
    function getUserTWAPOrders(address user) external view returns (bytes32[] memory) { return userTWAPOrders[user]; }
    function getUserOptionOrders(address user) external view returns (bytes32[] memory) { return userOptionOrders[user]; }
    function getUserLiquidityPositions(address user) external view returns (bytes32[] memory) { return userLiquidityPositions[user]; }
    function getUserDCAOrders(address user) external view returns (bytes32[] memory) { return userDCAOrders[user]; }
    function getUserGridOrders(address user) external view returns (bytes32[] memory) { return userGridOrders[user]; }

    /// @notice Get order status
    function getOrderStatus(bytes32 orderHash, uint8 orderType) external view returns (bool isActive, uint256 executedAmount, uint256 totalAmount) {
        if (orderType == 0) {
            TWAPOrder storage order = twapOrders[orderHash];
            return (order.isActive, order.executedAmount, order.totalAmount);
        } else if (orderType == 2) {
            DCAOrder storage order = dcaOrders[orderHash];
            return (order.isActive, order.executedAmount, order.totalAmount);
        } else if (orderType == 3) {
            GridTradingOrder storage order = gridOrders[orderHash];
            return (order.isActive, order.executedGrids * order.amountPerGrid, order.gridLevels * order.amountPerGrid);
        }
        return (false, 0, 0);
    }

    /// @notice Integration with CrossChainHTLC for cross-chain orders
    function createCrossChainOrder(bytes32 orderHash, bytes32 suiOrderHash, uint256 amount, bytes32 hashlock, uint256 timelock) external {
        TWAPOrder storage order = twapOrders[orderHash];
        require(order.maker == msg.sender, "Not order maker");
        require(order.isActive, "Order not active");
        
        order.suiOrderHash = suiOrderHash;
        htlc.createHTLC(msg.sender, msg.sender, address(order.tokenIn), amount, hashlock, timelock);
    }

    /// @notice Emergency withdrawal (only owner)
    function emergencyWithdraw(IERC20 token, uint256 amount) external onlyOwner {
        token.transfer(owner(), amount);
    }
}
}
