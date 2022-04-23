import { task } from "hardhat/config";

task("claim", "Claim rewards tokens")
  .addParam('staking', "Staking contract address")
  // .addParam('spender', "The address that will be allowed to transfer your tokens")
  // .addParam('allowance', "The address that will be allowed to transfer your tokens")
  // .addParam('amount', "The address that will be allowed to transfer your tokens")
  .setAction(async (taskArgs, hre) => {
    // const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS!;
    const stakingContractAddress = taskArgs.staking;

    const stakingContractFactory = await hre.ethers.getContractFactory('StakingContract');
    const stakingContract = stakingContractFactory.attach(stakingContractAddress);
    await stakingContract.claim();

    console.log("Done");
  });