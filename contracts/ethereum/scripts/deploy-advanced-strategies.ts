import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment of Advanced Limit Order Strategy contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy CrossChainHTLC first (if not already deployed)
  console.log("\n📦 Deploying CrossChainHTLC...");
  const CrossChainHTLC = await ethers.getContractFactory("CrossChainHTLC");
  const htlc = await CrossChainHTLC.deploy();
  await htlc.waitForDeployment();
  const htlcAddress = await htlc.getAddress();
  console.log("✅ CrossChainHTLC deployed to:", htlcAddress);

  // Set fee recipient (deployer for now, can be changed later)
  const feeRecipient = deployer.address;
  console.log("💳 Fee recipient set to:", feeRecipient);

  // Deploy AdvancedLimitOrderStrategy
  console.log("\n📦 Deploying AdvancedLimitOrderStrategy...");
  const AdvancedLimitOrderStrategy = await ethers.getContractFactory("AdvancedLimitOrderStrategy");
  const strategy = await AdvancedLimitOrderStrategy.deploy(htlcAddress, feeRecipient);
  await strategy.waitForDeployment();
  const strategyAddress = await strategy.getAddress();
  console.log("✅ AdvancedLimitOrderStrategy deployed to:", strategyAddress);

  // Verify initial configuration
  console.log("\n🔍 Verifying deployment configuration...");
  const protocolFee = await strategy.protocolFee();
  const feeRecipientAddr = await strategy.feeRecipient();
  
  console.log("Protocol fee:", protocolFee, "basis points (", Number(protocolFee) / 100, "%)");
  console.log("Fee recipient:", feeRecipientAddr);
  console.log("HTLC contract:", await strategy.htlc());

  // Deploy test tokens for demonstration (optional)
  console.log("\n📦 Deploying test tokens for demonstration...");
  
  const TestToken = await ethers.getContractFactory("MockERC20");
  
  // Deploy USDC-like token
  const usdc = await TestToken.deploy("USD Coin", "USDC", ethers.parseUnits("1000000", 6)); // 1M USDC with 6 decimals
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ Test USDC deployed to:", usdcAddress);

  // Deploy WETH-like token
  const weth = await TestToken.deploy("Wrapped Ether", "WETH", ethers.parseEther("10000")); // 10K WETH
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("✅ Test WETH deployed to:", wethAddress);

  // Deploy another test token
  const dai = await TestToken.deploy("Dai Stablecoin", "DAI", ethers.parseEther("1000000")); // 1M DAI
  await dai.waitForDeployment();
  const daiAddress = await dai.getAddress();
  console.log("✅ Test DAI deployed to:", daiAddress);

  // Create sample orders for demonstration
  console.log("\n🎯 Creating sample orders for demonstration...");

  try {
    // Approve tokens for strategy contract
    const approvalAmount = ethers.parseEther("10000");
    
    await usdc.approve(strategyAddress, approvalAmount);
    await weth.approve(strategyAddress, approvalAmount);
    await dai.approve(strategyAddress, approvalAmount);
    
    console.log("✅ Tokens approved for strategy contract");

    // Create a sample TWAP order
    console.log("📊 Creating sample TWAP order...");
    const twapTx = await strategy.createTWAPOrder(
      usdcAddress,
      wethAddress,
      ethers.parseUnits("1000", 6), // 1000 USDC
      10, // 10 intervals
      3600, // 1 hour intervals
      ethers.parseEther("0.0004"), // Min price (1 USDC = 0.0004 ETH)
      ethers.parseEther("0.0006"), // Max price (1 USDC = 0.0006 ETH)
      ethers.ZeroHash // No Sui integration for demo
    );
    await twapTx.wait();
    console.log("✅ Sample TWAP order created");

    // Create a sample DCA order
    console.log("💰 Creating sample DCA order...");
    const dcaTx = await strategy.createDCAOrder(
      daiAddress,
      wethAddress,
      ethers.parseEther("5000"), // 5000 DAI total
      86400, // Daily frequency
      ethers.parseEther("100"), // 100 DAI per execution
      100 // 1% max slippage
    );
    await dcaTx.wait();
    console.log("✅ Sample DCA order created");

    // Create a sample Grid order
    console.log("🎯 Creating sample Grid order...");
    const gridTx = await strategy.createGridTradingOrder(
      wethAddress,
      usdcAddress,
      5, // 5 grid levels
      ethers.parseEther("0.01"), // 0.01 ETH price step
      ethers.parseEther("1.0"), // 1.0 ETH base price
      ethers.parseEther("1") // 1 ETH per grid
    );
    await gridTx.wait();
    console.log("✅ Sample Grid order created");

    // Create a sample Option order
    console.log("🔮 Creating sample Option order...");
    const expiry = Math.floor(Date.now() / 1000) + 86400 * 7; // 1 week from now
    const optionTx = await strategy.createOptionOrder(
      wethAddress,
      ethers.parseEther("2000"), // $2000 strike price
      ethers.parseEther("0.1"), // 0.1 ETH premium
      expiry,
      true, // Call option
      ethers.parseEther("10") // 10 ETH collateral
    );
    await optionTx.wait();
    console.log("✅ Sample Option order created");

    // Create a sample Liquidity position
    console.log("💧 Creating sample Liquidity position...");
    const liquidityTx = await strategy.createConcentratedLiquidityPosition(
      wethAddress,
      usdcAddress,
      ethers.parseEther("5"), // 5 ETH
      ethers.parseUnits("10000", 6), // 10000 USDC
      -887220, // Lower tick
      887220 // Upper tick
    );
    await liquidityTx.wait();
    console.log("✅ Sample Liquidity position created");

  } catch (error) {
    console.log("⚠️  Sample order creation failed (this is normal if tokens aren't funded):", error.message);
  }

  // Summary
  console.log("\n📋 Deployment Summary:");
  console.log("════════════════════════════════════════");
  console.log("CrossChainHTLC:", htlcAddress);
  console.log("AdvancedLimitOrderStrategy:", strategyAddress);
  console.log("Test USDC:", usdcAddress);
  console.log("Test WETH:", wethAddress);
  console.log("Test DAI:", daiAddress);
  console.log("Protocol Fee:", Number(protocolFee) / 100, "%");
  console.log("Fee Recipient:", feeRecipientAddr);
  console.log("Deployer:", deployer.address);
  console.log("════════════════════════════════════════");

  // Contract verification info
  console.log("\n🔍 Contract Verification:");
  console.log("Run the following commands to verify on Etherscan:");
  console.log(`npx hardhat verify --network <network> ${htlcAddress}`);
  console.log(`npx hardhat verify --network <network> ${strategyAddress} "${htlcAddress}" "${feeRecipient}"`);
  console.log(`npx hardhat verify --network <network> ${usdcAddress} "USD Coin" "USDC" "1000000000000"`); // 1M with 6 decimals
  console.log(`npx hardhat verify --network <network> ${wethAddress} "Wrapped Ether" "WETH" "10000000000000000000000"`); // 10K ETH
  console.log(`npx hardhat verify --network <network> ${daiAddress} "Dai Stablecoin" "DAI" "1000000000000000000000000"`); // 1M DAI

  // Usage instructions
  console.log("\n📚 Usage Instructions:");
  console.log("1. Import the contract addresses into your frontend");
  console.log("2. Use the AdvancedStrategyDashboard component to interact with the contracts");
  console.log("3. Approve tokens before creating orders");
  console.log("4. Monitor orders using the getUserXXXOrders functions");
  console.log("5. Execute orders when conditions are met");

  // Integration with 1inch
  console.log("\n🔗 1inch Integration:");
  console.log("- The getExpectedAmountOut function is a placeholder");
  console.log("- Integrate with 1inch API for real price quotes");
  console.log("- Use 1inch swap functionality in execution functions");
  console.log("- Consider using 1inch Limit Order Protocol for enhanced features");

  console.log("\n✅ Deployment completed successfully!");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
