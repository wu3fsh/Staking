import { task } from "hardhat/config";

task("change-settings", "Change default settings of staking contract")
  .addParam('staking', "Staking contract address")
  .addParam('claimseconds', "Claim timeout in seconds")
  .addParam('stakeseconds', "Unstaking timeout in seconds")
  .addParam('rewardpercentage', "Reward percentage")
  .setAction(async (taskArgs, hre) => {
    const stakingContractAddress = taskArgs.staking;
    const stakingContractFactory = await hre.ethers.getContractFactory('StakingContract');
    const stakingContract = stakingContractFactory.attach(stakingContractAddress);

    const rewardTimeoutSeconds = taskArgs.claimseconds;
    const unstakeTimeoutSeconds = taskArgs.stakeseconds;
    const rewardPercentage = taskArgs.rewardpercentage;
    await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardPercentage);

    console.log("Done");
  });