const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting BatchTransferSecure deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Contract addresses - Update these for your deployment
  // Note: This contract is designed for ERC20 tokens, not native APE transfers
  // You can deploy with any ERC20 token address and add more tokens later via addSupportedToken()
  const APE_TOKEN_ADDRESS = process.env.APE_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TEST_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const FEE_RECIPIENT = process.env.FEE_RECIPIENT || deployer.address; // Use deployer as fee recipient if not specified
  
  // Validate addresses
  if (!ethers.isAddress(FEE_RECIPIENT)) {
    throw new Error("Invalid FEE_RECIPIENT address");
  }
  if (!ethers.isAddress(APE_TOKEN_ADDRESS)) {
    throw new Error("Invalid APE_TOKEN_ADDRESS. Please set APE_TOKEN_ADDRESS or NEXT_PUBLIC_TEST_TOKEN_ADDRESS environment variable with a valid ERC20 token address.");
  }
  
  console.log("\n📋 Deployment Configuration:");
  console.log("- APE Token Address:", APE_TOKEN_ADDRESS);
  console.log("- Fee Recipient:", FEE_RECIPIENT);
  console.log("- Deployer:", deployer.address);

  // Deploy the contract
  console.log("\n🔨 Deploying BatchTransferSecure contract...");
  const BatchTransferSecure = await ethers.getContractFactory("BatchTransferSecure");
  const batchTransfer = await BatchTransferSecure.deploy(
    APE_TOKEN_ADDRESS,
    FEE_RECIPIENT
  );
  
  await batchTransfer.waitForDeployment();
  const contractAddress = await batchTransfer.getAddress();
  
  console.log("✅ BatchTransferSecure deployed to:", contractAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  try {
    const apeToken = await batchTransfer.apeToken();
    const feeRecipient = await batchTransfer.feeRecipient();
    const feeBps = await batchTransfer.feeBps();
    const owner = await batchTransfer.owner();
    const maxRecipients = await batchTransfer.MAX_RECIPIENTS();
    
    console.log("✅ Deployment verification successful:");
    console.log("- APE Token:", apeToken);
    console.log("- Fee Recipient:", feeRecipient);
    console.log("- Fee Rate:", feeBps.toString(), "basis points (", (Number(feeBps) / 100).toFixed(2), "%)");
    console.log("- Owner:", owner);
    console.log("- Max Recipients:", maxRecipients.toString());
  } catch (error) {
    console.error("❌ Deployment verification failed:", error);
  }

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  try {
    // Test fee calculation
    const testAmount = ethers.parseEther("100"); // 100 APE
    const calculatedFee = await batchTransfer.calculateFee(testAmount);
    console.log("- Fee calculation test: 100 APE ->", ethers.formatEther(calculatedFee), "APE fee");
    
    // Test role assignments
    const hasAdminRole = await batchTransfer.hasRole(await batchTransfer.DEFAULT_ADMIN_ROLE(), deployer.address);
    const hasTeamRole = await batchTransfer.hasRole(await batchTransfer.TEAM_ROLE(), deployer.address);
    const hasFeeManagerRole = await batchTransfer.hasRole(await batchTransfer.FEE_MANAGER_ROLE(), deployer.address);
    
    console.log("- Role assignments:");
    console.log("  - Admin Role:", hasAdminRole);
    console.log("  - Team Role:", hasTeamRole);
    console.log("  - Fee Manager Role:", hasFeeManagerRole);
    
    console.log("✅ Basic functionality tests passed");
  } catch (error) {
    console.error("❌ Basic functionality tests failed:", error);
  }

  // Generate environment variables
  console.log("\n📝 Environment Variables to add to your .env.local:");
  console.log("NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=" + contractAddress);
  console.log("NEXT_PUBLIC_APE_TOKEN_ADDRESS=" + APE_TOKEN_ADDRESS);
  console.log("NEXT_PUBLIC_FEE_RECIPIENT=" + FEE_RECIPIENT);
  console.log("\n💡 Note: This contract works with ERC20 tokens only, not native APE transfers.");
  console.log("   You can add more supported tokens using the addSupportedToken() function.");
  console.log("   For testing, deploy a test token first using: pnpm hardhat run scripts/deploy-test-token.js --network curtis");

  // Add this after line 79 
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = `# Batch Transfer Contract
NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_APE_TOKEN_ADDRESS=${APE_TOKEN_ADDRESS}
NEXT_PUBLIC_FEE_RECIPIENT=${FEE_RECIPIENT}
`;

  // Append to .env.local
  if (fs.existsSync(envPath)) {
    // Read existing content
    let existingContent = fs.readFileSync(envPath, 'utf8');
    
    // Remove old batch transfer entries
    existingContent = existingContent.replace(/NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=.*\n/g, '');
    existingContent = existingContent.replace(/NEXT_PUBLIC_APE_TOKEN_ADDRESS=.*\n/g, '');
    existingContent = existingContent.replace(/NEXT_PUBLIC_FEE_RECIPIENT=.*\n/g, '');
    
    // Append new entries
    fs.writeFileSync(envPath, existingContent + '\n' + envContent);
  } else {
    // Create new .env.local file
    fs.writeFileSync(envPath, envContent);
  }

  console.log("✅ Updated .env.local with contract address");

  // Generate deployment summary
  console.log("\n📊 Deployment Summary:");
  console.log("=" .repeat(50));
  console.log("Contract Address:", contractAddress);
  console.log("Network:", await deployer.provider.getNetwork().then(n => n.name));
  console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
  console.log("Deployer:", deployer.address);
  console.log("Deployment Time:", new Date().toISOString());
  console.log("=" .repeat(50));

  // Save deployment info to file
  const deploymentInfo = {
    contractAddress,
    apeTokenAddress: APE_TOKEN_ADDRESS,
    feeRecipient: FEE_RECIPIENT,
    deployer: deployer.address,
    network: (await deployer.provider.getNetwork()).name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    deploymentTime: new Date().toISOString(),
    transactionHash: batchTransfer.deploymentTransaction()?.hash
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const networkName = (await deployer.provider.getNetwork()).name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}-batch-transfer.json`);
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. ✅ .env.local has been automatically updated with contract address");
  console.log("2. Test the contract functionality");
  console.log("3. Set up team roles if needed");
  console.log("4. Configure fee rates");
  console.log("5. Deploy to production when ready");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
