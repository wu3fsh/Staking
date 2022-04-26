import { task } from "hardhat/config";

task("approve-lp", "Approve LP tokens for staking contract")
  .addParam('staking', "The address that will be allowed to transfer your tokens")
  .addParam('lp', "The address that will be allowed to transfer your tokens")
  .addParam('allowance', "The address that will be allowed to transfer your tokens")
  .setAction(async (taskArgs, hre) => {
    const stakingContractAddress = taskArgs.staking;
    const lpTokenAddress = taskArgs.lp;
    const totalAllowance = taskArgs.allowance;
    const IERC20_SOURCE = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";
    const accounts = await hre.ethers.getSigners();

    const lpToken = await hre.ethers.getContractAt(IERC20_SOURCE, lpTokenAddress, accounts[0]);
    await lpToken.approve(stakingContractAddress, totalAllowance);

    console.log("Done");
  });