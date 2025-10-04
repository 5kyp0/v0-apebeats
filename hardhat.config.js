require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    curtis: {
      url: "https://curtis.rpc.caldera.xyz/http",
      chainId: 33111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 50000000,
      gasPrice: "auto",
    },
    apechain: {
      url: "https://apechain.rpc.caldera.xyz/http",
      chainId: 33110,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "curtis-testnet": "your-api-key-here",
      "apechain-mainnet": "your-api-key-here",
    },
    customChains: [
      {
        network: "curtis-testnet",
        chainId: 33111,
        urls: {
          apiURL: "https://curtis.apescan.io/api",
          browserURL: "https://curtis.apescan.io"
        }
      },
      {
        network: "apechain-mainnet",
        chainId: 33144,
        urls: {
          apiURL: "https://apescan.io/api",
          browserURL: "https://apescan.io"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
