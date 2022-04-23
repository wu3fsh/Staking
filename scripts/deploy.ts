import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Account balance:', (await deployer.getBalance()).toString());

  const factory = await ethers.getContractFactory('StakingContract');
  const staking = await factory.deploy(process.env.REWARDS_ERC20_TOKEN_ADDRESS, process.env.LP_ERC20_TOKEN_ADDRESS);

  console.log('StakingContract address:', staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
