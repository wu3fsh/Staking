import { task } from "hardhat/config";

task("change-settings", "Change default settings of staking contract")
  .addParam('staking', "Staking contract address")
  .addParam('claimseconds', "Claim timeout in seconds")
  .addParam('stakeseconds', "Unstaking timeout in seconds")
  .addParam('rewardrate', "Reward rate divider")
  .setAction(async (taskArgs, hre) => {
    // const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS!;
    const stakingContractAddress = taskArgs.staking;
    const stakingContractFactory = await hre.ethers.getContractFactory('StakingContract');
    const stakingContract = stakingContractFactory.attach(stakingContractAddress);

    const rewardTimeoutSeconds = taskArgs.claimseconds;
    const unstakeTimeoutSeconds = taskArgs.stakeseconds;
    const rewardRate = taskArgs.rewardrate;
    await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);

    console.log("Done");
  });