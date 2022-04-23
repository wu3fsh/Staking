import { task } from "hardhat/config";

task("unstake", "Unstake LP tokens")
  .addParam('staking', "Staking contract address")
  .setAction(async (taskArgs, hre) => {
    // const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS!;
    const stakingContractAddress = taskArgs.staking;

    const stakingContractFactory = await hre.ethers.getContractFactory('StakingContract');
    const stakingContract = stakingContractFactory.attach(stakingContractAddress);
    await stakingContract.unstake();

    console.log("Done");
  });