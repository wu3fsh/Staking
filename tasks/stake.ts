import { task } from "hardhat/config";

task("stake", "Stake LP tokens")
  .addParam('staking', "Staking contract address")
  .addParam('amount', "Amount of LP tokens")
  // .addParam('spender', "The address that will be allowed to transfer your tokens")
  // .addParam('allowance', "The address that will be allowed to transfer your tokens")
  // .addParam('amount', "The address that will be allowed to transfer your tokens")
  .setAction(async (taskArgs, hre) => {
    // const lpTokenAddress = process.env.LP_ERC20_TOKEN_ADDRESS!;
    // const rewardTokenAddress = process.env.ERC20_TOKEN_ADDRESS;
    // const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS!;
    // const totalAllowance = 10;
    // const tokensAmount = 1;
    // const IERC20_SOURCE = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";
    // const accounts = await hre.ethers.getSigners();

    // const lpToken = await hre.ethers.getContractAt(IERC20_SOURCE, lpTokenAddress, accounts[0]);
    // await lpToken.approve(stakingContractAddress, totalAllowance);

    // const stakingContractFactory = await hre.ethers.getContractFactory('StakingContract');
    // const stakingContract = stakingContractFactory.attach(stakingContractAddress);
    // await stakingContract.stake(tokensAmount);

    // const rewardTokenFactory = await hre.ethers.getContractFactory('ERC20Token');
    // const rewardToken = rewardTokenFactory.attach(rewardTokenAddress!);

    // const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS!;
    const stakingContractAddress = taskArgs.staking;
    const tokensAmount = taskArgs.amount;

    const stakingContractFactory = await hre.ethers.getContractFactory('StakingContract');
    const stakingContract = stakingContractFactory.attach(stakingContractAddress);
    await stakingContract.stake(tokensAmount);

    console.log("Done");
  });