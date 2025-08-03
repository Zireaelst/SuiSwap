// Hardhat deployment script for CrossChainHTLC
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CrossChainHTLC contract...");

  // Deploy CrossChainHTLC
  const fusionPlusTreasury = "0x1234567890123456789012345678901234567890"; // Replace with actual treasury
  
  const CrossChainHTLC = await ethers.getContractFactory("CrossChainHTLC");
  const htlc = await CrossChainHTLC.deploy(fusionPlusTreasury);

  await htlc.waitForDeployment();
  const htlcAddress = await htlc.getAddress();

  console.log(`CrossChainHTLC deployed to: ${htlcAddress}`);
  console.log(`Fusion+ Treasury set to: ${fusionPlusTreasury}`);

  // Verify the contract on Etherscan (optional)
  console.log("Waiting for block confirmations...");
  await htlc.deploymentTransaction()?.wait(5);

  console.log("Deployment completed!");
  
  // Output deployment info for frontend
  const deploymentInfo = {
    chainId: (await ethers.provider.getNetwork()).chainId,
    contractAddress: htlcAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    fusionPlusTreasury,
    deployedAt: new Date().toISOString(),
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file for frontend integration
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '../../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, 'CrossChainHTLC.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
