import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";
import "dotenv/config";
import "./tasks/approve-lp";
import "./tasks/stake";
import "./tasks/change-settings";
import "./tasks/claim";
import "./tasks/unstake";

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`, `${process.env.RINKEBY_PRIVATE_KEY_SECOND_ACC}`],
      gas: 5000_000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
