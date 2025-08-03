const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AdvancedLimitOrderStrategy", function () {
  let advancedStrategy;
  let htlc;
  let owner;
  let addr1;
  let addr2;
  let feeRecipient;
  let mockToken;

  beforeEach(async function () {
    [owner, addr1, addr2, feeRecipient] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Test Token", "TEST", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Deploy CrossChainHTLC (simplified version for testing)
    const CrossChainHTLC = await ethers.getContractFactory("CrossChainHTLC");
    htlc = await CrossChainHTLC.deploy();
    await htlc.waitForDeployment();

    // Deploy AdvancedLimitOrderStrategy
    const AdvancedLimitOrderStrategy = await ethers.getContractFactory("AdvancedLimitOrderStrategy");
    advancedStrategy = await AdvancedLimitOrderStrategy.deploy(
      await htlc.getAddress(),
      feeRecipient.address
    );
    await advancedStrategy.waitForDeployment();

    // Transfer tokens to test addresses
    await mockToken.transfer(addr1.address, ethers.parseEther("10000"));
    await mockToken.transfer(addr2.address, ethers.parseEther("10000"));
  });

  describe("TWAP Orders", function () {
    it("Should create a TWAP order", async function () {
      const tokenInAddress = await mockToken.getAddress();
      const tokenOutAddress = ethers.ZeroAddress; // ETH
      const totalAmount = ethers.parseEther("1000");
      const intervals = 10;
      const intervalDuration = 3600; // 1 hour
      const minPrice = ethers.parseEther("0.95");
      const maxPrice = ethers.parseEther("1.05");

      // Approve tokens
      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);

      // Create TWAP order
      const tx = await advancedStrategy.connect(addr1).createTWAPOrder(
        tokenInAddress,
        tokenOutAddress,
        totalAmount,
        intervals,
        intervalDuration,
        minPrice,
        maxPrice,
        ethers.ZeroHash
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'TWAPOrderCreated');
      
      expect(event).to.not.be.undefined;
      expect(event.args.maker).to.equal(addr1.address);
      expect(event.args.totalAmount).to.equal(totalAmount);

      // Check order was stored
      const userOrders = await advancedStrategy.getUserTWAPOrders(addr1.address);
      expect(userOrders.length).to.equal(1);
    });

    it("Should execute TWAP order interval", async function () {
      // First create a TWAP order
      const tokenInAddress = await mockToken.getAddress();
      const tokenOutAddress = ethers.ZeroAddress;
      const totalAmount = ethers.parseEther("1000");
      const intervals = 10;
      const intervalDuration = 1; // 1 second for testing
      const minPrice = ethers.parseEther("0.95");
      const maxPrice = ethers.parseEther("1.05");

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);

      const createTx = await advancedStrategy.connect(addr1).createTWAPOrder(
        tokenInAddress,
        tokenOutAddress,
        totalAmount,
        intervals,
        intervalDuration,
        minPrice,
        maxPrice,
        ethers.ZeroHash
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'TWAPOrderCreated');
      const orderHash = createEvent.args.orderHash;

      // Wait for interval
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Execute interval
      const amountOut = ethers.parseEther("95"); // Within price range
      await expect(advancedStrategy.connect(addr2).executeTWAPInterval(orderHash, amountOut))
        .to.emit(advancedStrategy, "TWAPOrderExecuted");

      // Check order status
      const [isActive, executedAmount, totalAmountStored] = await advancedStrategy.getOrderStatus(orderHash, 0);
      expect(isActive).to.be.true;
      expect(executedAmount).to.be.greaterThan(0);
    });

    it("Should cancel TWAP order", async function () {
      // Create order first
      const tokenInAddress = await mockToken.getAddress();
      const totalAmount = ethers.parseEther("1000");
      
      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);
      
      const createTx = await advancedStrategy.connect(addr1).createTWAPOrder(
        tokenInAddress,
        ethers.ZeroAddress,
        totalAmount,
        10,
        3600,
        ethers.parseEther("0.95"),
        ethers.parseEther("1.05"),
        ethers.ZeroHash
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'TWAPOrderCreated');
      const orderHash = createEvent.args.orderHash;

      // Cancel order
      await advancedStrategy.connect(addr1).cancelOrder(orderHash, 0);

      // Check order is cancelled
      const [isActive] = await advancedStrategy.getOrderStatus(orderHash, 0);
      expect(isActive).to.be.false;
    });
  });

  describe("Option Orders", function () {
    it("Should create an option order", async function () {
      const underlyingAddress = await mockToken.getAddress();
      const strikePrice = ethers.parseEther("100");
      const premium = ethers.parseEther("0.1");
      const expiry = Math.floor(Date.now() / 1000) + 86400; // 1 day
      const isCall = true;
      const collateralAmount = ethers.parseEther("1000");

      // Approve tokens for collateral
      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), collateralAmount);

      // Create option order
      const tx = await advancedStrategy.connect(addr1).createOptionOrder(
        underlyingAddress,
        strikePrice,
        premium,
        expiry,
        isCall,
        collateralAmount
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'OptionOrderCreated');
      
      expect(event).to.not.be.undefined;
      expect(event.args.maker).to.equal(addr1.address);
      expect(event.args.strikePrice).to.equal(strikePrice);

      // Check order was stored
      const userOrders = await advancedStrategy.getUserOptionOrders(addr1.address);
      expect(userOrders.length).to.equal(1);
    });

    it("Should exercise profitable call option", async function () {
      const underlyingAddress = await mockToken.getAddress();
      const strikePrice = ethers.parseEther("100");
      const premium = ethers.parseEther("0.1");
      const expiry = Math.floor(Date.now() / 1000) + 86400;
      const collateralAmount = ethers.parseEther("1000");

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), collateralAmount);

      const createTx = await advancedStrategy.connect(addr1).createOptionOrder(
        underlyingAddress,
        strikePrice,
        premium,
        expiry,
        true, // call option
        collateralAmount
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'OptionOrderCreated');
      const orderHash = createEvent.args.orderHash;

      // Exercise option with profitable price
      const currentPrice = ethers.parseEther("120"); // Above strike price
      await expect(
        advancedStrategy.connect(addr2).exerciseOption(orderHash, currentPrice, { value: premium })
      ).to.emit(advancedStrategy, "OptionExecuted");
    });
  });

  describe("DCA Orders", function () {
    it("Should create a DCA order", async function () {
      const tokenInAddress = await mockToken.getAddress();
      const tokenOutAddress = ethers.ZeroAddress;
      const totalAmount = ethers.parseEther("1000");
      const frequency = 86400; // 1 day
      const amountPerExecution = ethers.parseEther("100");
      const maxSlippage = 100; // 1%

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);

      const tx = await advancedStrategy.connect(addr1).createDCAOrder(
        tokenInAddress,
        tokenOutAddress,
        totalAmount,
        frequency,
        amountPerExecution,
        maxSlippage
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'DCAOrderCreated');
      
      expect(event).to.not.be.undefined;
      expect(event.args.maker).to.equal(addr1.address);

      // Check order was stored
      const userOrders = await advancedStrategy.getUserDCAOrders(addr1.address);
      expect(userOrders.length).to.equal(1);
    });

    it("Should execute DCA order", async function () {
      const tokenInAddress = await mockToken.getAddress();
      const totalAmount = ethers.parseEther("1000");
      const frequency = 1; // 1 second for testing
      const amountPerExecution = ethers.parseEther("100");

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);

      const createTx = await advancedStrategy.connect(addr1).createDCAOrder(
        tokenInAddress,
        ethers.ZeroAddress,
        totalAmount,
        frequency,
        amountPerExecution,
        1000 // 10% slippage
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'DCAOrderCreated');
      const orderHash = createEvent.args.orderHash;

      // Wait for frequency
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Execute DCA order
      const amountOut = ethers.parseEther("95");
      await expect(advancedStrategy.connect(addr2).executeDCAOrder(orderHash, amountOut))
        .to.emit(advancedStrategy, "DCAOrderExecuted");
    });
  });

  describe("Grid Trading Orders", function () {
    it("Should create a grid trading order", async function () {
      const baseTokenAddress = await mockToken.getAddress();
      const quoteTokenAddress = ethers.ZeroAddress;
      const gridLevels = 10;
      const priceStep = ethers.parseEther("0.01");
      const basePrice = ethers.parseEther("1.0");
      const amountPerGrid = ethers.parseEther("100");

      const totalAmount = BigInt(gridLevels) * amountPerGrid;
      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);

      const tx = await advancedStrategy.connect(addr1).createGridTradingOrder(
        baseTokenAddress,
        quoteTokenAddress,
        gridLevels,
        priceStep,
        basePrice,
        amountPerGrid
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'GridOrderCreated');
      
      expect(event).to.not.be.undefined;
      expect(event.args.maker).to.equal(addr1.address);
      expect(event.args.gridLevels).to.equal(gridLevels);

      // Check order was stored
      const userOrders = await advancedStrategy.getUserGridOrders(addr1.address);
      expect(userOrders.length).to.equal(1);
    });

    it("Should execute grid order at specific level", async function () {
      const baseTokenAddress = await mockToken.getAddress();
      const gridLevels = 5;
      const amountPerGrid = ethers.parseEther("100");
      const totalAmount = BigInt(gridLevels) * amountPerGrid;

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);

      const createTx = await advancedStrategy.connect(addr1).createGridTradingOrder(
        baseTokenAddress,
        ethers.ZeroAddress,
        gridLevels,
        ethers.parseEther("0.01"),
        ethers.parseEther("1.0"),
        amountPerGrid
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'GridOrderCreated');
      const orderHash = createEvent.args.orderHash;

      // Execute grid at level 0
      const gridLevel = 0;
      const amountOut = ethers.parseEther("99");
      await expect(
        advancedStrategy.connect(addr2).executeGridOrder(orderHash, gridLevel, amountOut)
      ).to.emit(advancedStrategy, "GridOrderExecuted");
    });
  });

  describe("Concentrated Liquidity", function () {
    it("Should create a concentrated liquidity position", async function () {
      const token0Address = await mockToken.getAddress();
      const token1Address = ethers.ZeroAddress;
      const amount0 = ethers.parseEther("1000");
      const amount1 = ethers.parseEther("1000");
      const lowerTick = -887220;
      const upperTick = 887220;

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), amount0);

      const tx = await advancedStrategy.connect(addr1).createConcentratedLiquidityPosition(
        token0Address,
        token1Address,
        amount0,
        amount1,
        lowerTick,
        upperTick,
        { value: amount1 } // ETH for token1
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'LiquidityPositionCreated');
      
      expect(event).to.not.be.undefined;
      expect(event.args.provider).to.equal(addr1.address);

      // Check position was stored
      const userPositions = await advancedStrategy.getUserLiquidityPositions(addr1.address);
      expect(userPositions.length).to.equal(1);
    });

    it("Should remove liquidity position", async function () {
      const token0Address = await mockToken.getAddress();
      const amount0 = ethers.parseEther("1000");
      const amount1 = ethers.parseEther("1000");

      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), amount0);

      const createTx = await advancedStrategy.connect(addr1).createConcentratedLiquidityPosition(
        token0Address,
        ethers.ZeroAddress,
        amount0,
        amount1,
        -887220,
        887220,
        { value: amount1 }
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'LiquidityPositionCreated');
      const positionHash = createEvent.args.positionHash;

      // Remove liquidity position
      await expect(advancedStrategy.connect(addr1).removeLiquidityPosition(positionHash))
        .to.emit(advancedStrategy, "LiquidityRemoved");
    });
  });

  describe("Utility Functions", function () {
    it("Should get expected amount out", async function () {
      const tokenIn = await mockToken.getAddress();
      const tokenOut = ethers.ZeroAddress;
      const amountIn = ethers.parseEther("100");

      const expectedOut = await advancedStrategy.getExpectedAmountOut(tokenIn, tokenOut, amountIn);
      expect(expectedOut).to.be.greaterThan(0);
    });

    it("Should allow owner to set protocol fee", async function () {
      const newFee = 50; // 0.5%
      await advancedStrategy.connect(owner).setProtocolFee(newFee);
      
      const protocolFee = await advancedStrategy.protocolFee();
      expect(protocolFee).to.equal(newFee);
    });

    it("Should allow owner to set fee recipient", async function () {
      const newRecipient = addr2.address;
      await advancedStrategy.connect(owner).setFeeRecipient(newRecipient);
      
      const feeRecipientAddress = await advancedStrategy.feeRecipient();
      expect(feeRecipientAddress).to.equal(newRecipient);
    });

    it("Should not allow non-owner to set protocol parameters", async function () {
      await expect(advancedStrategy.connect(addr1).setProtocolFee(50))
        .to.be.reverted;
      
      await expect(advancedStrategy.connect(addr1).setFeeRecipient(addr2.address))
        .to.be.reverted;
    });
  });

  describe("Error Cases", function () {
    it("Should reject TWAP order with invalid parameters", async function () {
      const tokenInAddress = await mockToken.getAddress();
      
      // Invalid intervals
      await expect(
        advancedStrategy.connect(addr1).createTWAPOrder(
          tokenInAddress,
          ethers.ZeroAddress,
          ethers.parseEther("1000"),
          0, // Invalid intervals
          3600,
          ethers.parseEther("0.95"),
          ethers.parseEther("1.05"),
          ethers.ZeroHash
        )
      ).to.be.revertedWith("Invalid intervals");

      // Invalid price range
      await expect(
        advancedStrategy.connect(addr1).createTWAPOrder(
          tokenInAddress,
          ethers.ZeroAddress,
          ethers.parseEther("1000"),
          10,
          3600,
          ethers.parseEther("1.05"), // Min > Max
          ethers.parseEther("0.95"),
          ethers.ZeroHash
        )
      ).to.be.revertedWith("Invalid price range");
    });

    it("Should reject option order with invalid expiry", async function () {
      const underlyingAddress = await mockToken.getAddress();
      const pastExpiry = Math.floor(Date.now() / 1000) - 86400; // Past date

      await expect(
        advancedStrategy.connect(addr1).createOptionOrder(
          underlyingAddress,
          ethers.parseEther("100"),
          ethers.parseEther("0.1"),
          pastExpiry,
          true,
          ethers.parseEther("1000")
        )
      ).to.be.revertedWith("Invalid expiry");
    });

    it("Should reject DCA order with invalid frequency", async function () {
      const tokenInAddress = await mockToken.getAddress();

      await expect(
        advancedStrategy.connect(addr1).createDCAOrder(
          tokenInAddress,
          ethers.ZeroAddress,
          ethers.parseEther("1000"),
          100, // Too short frequency
          ethers.parseEther("100"),
          100
        )
      ).to.be.revertedWith("Frequency too short");
    });

    it("Should reject execution of non-existent orders", async function () {
      const fakeOrderHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));

      await expect(
        advancedStrategy.connect(addr1).executeTWAPInterval(fakeOrderHash, ethers.parseEther("100"))
      ).to.be.revertedWith("Order not active");

      await expect(
        advancedStrategy.connect(addr1).executeDCAOrder(fakeOrderHash, ethers.parseEther("100"))
      ).to.be.revertedWith("Order not active");
    });
  });

  describe("Integration with CrossChainHTLC", function () {
    it("Should create cross-chain order integration", async function () {
      // First create a TWAP order
      const tokenInAddress = await mockToken.getAddress();
      const totalAmount = ethers.parseEther("1000");
      
      await mockToken.connect(addr1).approve(await advancedStrategy.getAddress(), totalAmount);
      
      const createTx = await advancedStrategy.connect(addr1).createTWAPOrder(
        tokenInAddress,
        ethers.ZeroAddress,
        totalAmount,
        10,
        3600,
        ethers.parseEther("0.95"),
        ethers.parseEther("1.05"),
        ethers.ZeroHash
      );

      const createReceipt = await createTx.wait();
      const createEvent = createReceipt.logs.find(log => log.fragment?.name === 'TWAPOrderCreated');
      const orderHash = createEvent.args.orderHash;

      // Create cross-chain integration
      const suiOrderHash = ethers.keccak256(ethers.toUtf8Bytes("sui-order"));
      const amount = ethers.parseEther("100");
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      const timelock = Math.floor(Date.now() / 1000) + 3600;

      // This should not revert (basic integration test)
      await expect(
        advancedStrategy.connect(addr1).createCrossChainOrder(
          orderHash,
          suiOrderHash,
          amount,
          hashlock,
          timelock
        )
      ).to.not.be.reverted;
    });
  });
});

// Mock ERC20 contract for testing
const MockERC20 = {
  abi: [
    "constructor(string memory name, string memory symbol, uint256 totalSupply)",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)",
    "function allowance(address owner, address spender) public view returns (uint256)"
  ],
  bytecode: "0x608060405234801561001057600080fd5b506040516107a63803806107a68339818101604052810190610032919061018a565b82600090805190602001906100489291906100ba565b50816001908051906020019061005f9291906100ba565b508060028190555033600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050506102df565b8280546100c69061022e565b90600052602060002090601f0160209004810192826100e8576000855561012f565b82601f1061010157805160ff191683800117855561012f565b8280016001018555821561012f579182015b8281111561012e578251825591602001919060010190610113565b5b50905061013c9190610140565b5090565b5b80821115610159576000816000905550600101610141565b5090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6101b982610170565b810181811067ffffffffffffffff821117156101d8576101d7610181565b5b80604052505050565b60006101eb61015d565b90506101f782826101b0565b919050565b600067ffffffffffffffff82111561021757610216610181565b5b61022082610170565b9050602081019050919050565b6000819050602082019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061028657607f821691505b6020821081141561029a57610299610257565b5b50919050565b6000815190506102af816102c8565b92915050565b6000602082840312156102cb576102ca610167565b5b60006102d9848285016102a0565b91505092915050565b6104b8806102ee6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063095ea7b31461004657806318160ddd1461007657806370a0823114610094575b600080fd5b610060600480360381019061005b91906102b5565b6100c4565b60405161006d919061030a565b60405180910390f35b61007e6101b6565b60405161008b9190610334565b60405180910390f35b6100ae60048036038101906100a9919061034f565b6101bc565b6040516100bb9190610334565b60405180910390f35b60008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211156101525760009050610198565b81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b92915050565b60025481565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061023182610206565b9050919050565b61024181610226565b811461024c57600080fd5b50565b60008135905061025e81610238565b92915050565b6000819050919050565b61027781610264565b811461028257600080fd5b50565b6000813590506102948161026e565b92915050565b600080604083850312156102b1576102b0610201565b5b60006102bf8582860161024f565b92505060206102d085828601610285565b9150509250929050565b60008115159050919050565b6102ef816102da565b82525050565b600060208201905061030a60008301846102e6565b92915050565b61031981610264565b82525050565b60006020820190506103346000830184610310565b92915050565b60006020828403121561035057610351610201565b5b600061035e8482850161024f565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fdfea2646970667358221220c4e1b1f5c3e8f9e8b3f2a1d4e5b7c9d0f3a8b6c7e1f2a9b4d8c5f1e8a7b2c3d69564736f6c63430008090033"
};
