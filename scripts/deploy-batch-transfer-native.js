const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying BatchTransferNative contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy the contract
  const BatchTransferNative = await ethers.getContractFactory("BatchTransferNative");
  
  // Set fee recipient to deployer for now
  const feeRecipient = deployer.address;
  
  console.log("🔧 Deploying BatchTransferNative with fee recipient:", feeRecipient);
  
  const batchTransfer = await BatchTransferNative.deploy(feeRecipient);
  await batchTransfer.waitForDeployment();

  const contractAddress = await batchTransfer.getAddress();
  console.log("✅ BatchTransferNative deployed to:", contractAddress);

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  const networkName = network.name === "unknown" ? "local" : network.name;

  console.log("🌐 Network:", networkName, "Chain ID:", chainId);

  // Create deployment info
  const deploymentInfo = {
    network: {
      chainId: chainId,
      name: networkName,
      rpcUrl: process.env.RPC_URL || "http://localhost:8545",
      explorerUrl: chainId === 33111 ? "https://curtis.apescan.io" : 
                   chainId === 1 ? "https://etherscan.io" : 
                   chainId === 137 ? "https://polygonscan.com" : ""
    },
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BatchTransferNative: contractAddress
    },
    configuration: {
      feeRecipient: feeRecipient,
      feeBps: 50, // 0.5%
      maxRecipients: 50,
      maxFeeBps: 1000, // 10%
      minFee: "1000000000000000" // 0.001 APE
    }
  };

  // Save deployment info
  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentDir, `${networkName.toLowerCase()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));

  console.log("💾 Deployment info saved to:", deploymentFile);

  // Update .env.local if it exists
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update or add the contract address
    if (envContent.includes("NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("🔧 Updated .env.local with new contract address");
  } else {
    // Create .env.local
    const envContent = `NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS=${contractAddress}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log("📝 Created .env.local with contract address");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Fee Recipient:", feeRecipient);
  console.log("📊 Fee Rate:", "0.5%");
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const feeBps = await batchTransfer.feeBps();
  const maxRecipients = await batchTransfer.MAX_RECIPIENTS();
  const owner = await batchTransfer.owner();
  
  console.log("✅ Fee BPS:", feeBps.toString());
  console.log("✅ Max Recipients:", maxRecipients.toString());
  console.log("✅ Owner:", owner);
  
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✅ Owner verification passed");
  } else {
    console.log("❌ Owner verification failed");
  }

  console.log("\n🚀 Ready to use! Update your frontend to use the new contract address.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
