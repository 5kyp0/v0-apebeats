const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking native token balance on Curtis testnet...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Wallet address:", deployer.address);
    
    // Check native balance (APE on ApeChain)
    const balance = await deployer.provider.getBalance(deployer.address);
    const formattedBalance = ethers.formatEther(balance);
    
    console.log("Native Token Balance:", formattedBalance, "APE");
    
    if (balance > 0) {
      console.log("✅ You have native APE tokens! Ready for deployment.");
    } else {
      console.log("❌ No native APE tokens found. Please get some from the faucet:");
      console.log("🌐 https://docs.apechain.com/faucet");
      console.log("📝 Your address:", deployer.address);
      console.log("\n💡 Note: ApeChain uses APE as the native gas token.");
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

