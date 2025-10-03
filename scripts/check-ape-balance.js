const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking APE token balance on Curtis testnet...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Wallet address:", deployer.address);
    
    // APE token contract address on Curtis testnet
    const APE_TOKEN_ADDRESS = "0x4d224452801aced8b2f0aebe155379bb5d594381";
    
    // Create APE token contract instance
    const apeToken = await ethers.getContractAt("IERC20", APE_TOKEN_ADDRESS);
    
    // Check balance
    const balance = await apeToken.balanceOf(deployer.address);
    const formattedBalance = ethers.formatEther(balance);
    
    console.log("APE Token Balance:", formattedBalance, "APE");
    
    if (balance > 0) {
      console.log("✅ You have APE tokens! Ready for deployment.");
    } else {
      console.log("❌ No APE tokens found. Please get some from the faucet:");
      console.log("🌐 https://docs.apechain.com/faucet");
      console.log("📝 Your address:", deployer.address);
    }
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

