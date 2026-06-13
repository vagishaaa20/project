const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
      networks: {
            amoy: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        process.env.POLYGON_RPC_URL
      ),
      network_id: 80002,
      gas:                 2000000,      // lower gas limit
      maxFeePerGas:        35000000000,  // 35 Gwei max fee
      maxPriorityFeePerGas:25000000000,  // 25 Gwei tip (meets minimum)
      confirmations:       2,
      timeoutBlocks:       200,
      skipDryRun:          true,
    },
  },
  compilers: {
    solc: { version: "0.8.19" }
  }
};