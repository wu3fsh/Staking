import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { expect } from "chai";

describe("Token", function () {
  const name: string = "Test Coin";
  const symbol: string = "Test Coin";
  const decimals: number = 2;
  const totalSupply: number = 100;
  let owner: Signer;
  let addresses: Signer[];
  let factory: ContractFactory;
  let token: Contract;

  beforeEach(async function () {
    [owner, ...addresses] = await ethers.getSigners();
    factory = await ethers.getContractFactory('ERC20Token');
    token = await factory.deploy(name, symbol, decimals, totalSupply);
  });

  it("should get expected info", async function () {
    const totalSupplyWithDecimals: number = totalSupply * (10 ** decimals);
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.decimals()).to.equal(decimals);
    expect(await token.totalSupply()).to.equal(totalSupplyWithDecimals);
    expect(await token.balanceOf(owner.getAddress())).to.equal(totalSupplyWithDecimals);
  });

  it("should transfer tokens", async function () {
    const amount: number = 100;
    expect(await token.balanceOf(owner.getAddress())).to.equal(totalSupply * (10 ** decimals));
    await token.transfer(addresses[1].getAddress(), amount);
    expect(await token.balanceOf(owner.getAddress())).to.equal(totalSupply * (10 ** decimals) - amount);
    expect(await token.balanceOf(addresses[1].getAddress())).to.equal(amount);
  });

  it("Should throw an exception if account doesn't have enough money to transfer", async function () {
    try {
      expect(
        await token.transfer(addresses[1].getAddress(), totalSupply * (10 ** decimals) + 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Account doesn't have enough money to transfer");
    }
  });

  it("should approve an address and amount of tokens to transferFrom", async function () {
    const amount: number = 10;
    await token.approve(addresses[1].getAddress(), amount);
    expect(await token.allowance(owner.getAddress(), addresses[1].getAddress())).to.equal(amount);
  });

  it("should transferFrom one address to another", async function () {
    const amount: number = 10;
    const to: string = await addresses[1].getAddress();
    const from: string = await owner.getAddress();

    await token.approve(to, amount);

    expect(await token.allowance(from, to)).to.equal(amount);
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals));

    await token.connect(addresses[1]).transferFrom(from, to, amount);

    expect(await token.allowance(from, to)).to.equal(0);
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals) - amount);
    expect(await token.balanceOf(to)).to.equal(amount);
  });

  it("Should throw an exception if account doesn't have enough money to transfer", async function () {
    try {
      const amount: number = 10;
      const to: string = await addresses[1].getAddress();
      const from: string = await owner.getAddress();
      await token.approve(to, amount);
      expect(await token.allowance(from, to)).to.equal(amount);
      expect(await token.connect(addresses[1]).transferFrom(from, to, totalSupply * (10 ** decimals) + 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Account doesn't have enough money to transfer");
    }
  });

  it("Should throw an exception if money transfer limit exceeded", async function () {
    try {
      const amount: number = 10;
      const to: string = await addresses[1].getAddress();
      const from: string = await owner.getAddress();
      await token.approve(to, amount);
      expect(await token.allowance(from, to)).to.equal(amount);
      expect(await token.connect(addresses[1]).transferFrom(from, to, amount));
      expect(await token.connect(addresses[1]).transferFrom(from, to, 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Money transfer limit exceeded");
    }
  });

  it("Should throw an exception if account doesn't have enough money to burn", async function () {
    try {
      const amount: number = 10;
      const from: string = await addresses[1].getAddress();
      expect(await token.burn(from, amount)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Account doesn't have enough money to burn");
    }
  });

  it("Should throw an exception if a non-owner address tries to burn tokens", async function () {
    try {
      const amount: number = 10;
      const from: string = await addresses[1].getAddress();
      expect(await token.connect(addresses[1]).burn(from, amount)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  });

  it("should burn tokens", async function () {
    const amount: number = 10;
    const from: string = await owner.getAddress();
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals));
    expect(await token.burn(from, amount));
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals) - amount);
    expect(await token.totalSupply()).to.equal(totalSupply * (10 ** decimals) - amount);
  });

  it("should mint tokens", async function () {
    const amount: number = 10;
    const from: string = await owner.getAddress();
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals));
    expect(await token.mint(from, amount));
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals) + amount);
    expect(await token.totalSupply()).to.equal(totalSupply * (10 ** decimals) + amount);
  });

  it("Should throw an exception if a non-owner address tries to mint tokens", async function () {
    try {
      const amount: number = 10;
      const from: string = await addresses[1].getAddress();
      expect(await token.connect(addresses[1]).mint(from, amount)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  });
});

describe("Staking", function () {
  const name: string = "Test Coin";
  const lpName: string = "LP Test Coin";
  const symbol: string = "Test Coin";
  const lpSymbol: string = "LP Test Coin";
  const decimals: number = 2;
  const totalSupply: number = 100;
  let owner: Signer;
  let addresses: Signer[];
  let tokensFactory: ContractFactory;
  let stakingFactory: ContractFactory;
  let rewardsToken: Contract;
  let lpToken: Contract;
  let stakingContract: Contract;

  beforeEach(async function () {
    [owner, ...addresses] = await ethers.getSigners();
    tokensFactory = await ethers.getContractFactory('ERC20Token');
    rewardsToken = await tokensFactory.connect(addresses[1]).deploy(name, symbol, decimals, totalSupply);
    lpToken = await tokensFactory.deploy(lpName, lpSymbol, decimals, totalSupply);
    stakingFactory = await ethers.getContractFactory('StakingContract');
    stakingContract = await stakingFactory.deploy(rewardsToken.address, lpToken.address);
  });

  it("should get default settings", async function () {
    expect(await stakingContract.claimTimeout()).to.equal(600);
    expect(await stakingContract.unstakeTimeout()).to.equal(1200);
    expect(await stakingContract.rewardRate()).to.equal(5);
  });

  it("should change settings", async function () {
    const rewardTimeoutSeconds = 11;
    const unstakeTimeoutSeconds = 12;
    const rewardRate = 13;
    await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);
    expect(await stakingContract.claimTimeout()).to.equal(rewardTimeoutSeconds);
    expect(await stakingContract.unstakeTimeout()).to.equal(unstakeTimeoutSeconds);
    expect(await stakingContract.rewardRate()).to.equal(rewardRate);
  });

  it("Should throw an exception if a non-owner address tries to change staking settings", async function () {
    try {
      expect(await stakingContract.connect(addresses[1]).changeSettings(1, 1, 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  });

  it("Should throw an exception if reward rate is 0", async function () {
    try {
      expect(await stakingContract.changeSettings(1, 1, 0)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Reward rate must be greater than 0");
    }
  });

  it("should stake lp tokens", async function () {
    const tokensAmount = 10;
    await lpToken.approve(stakingContract.address, tokensAmount + 1);
    expect(await lpToken.allowance(owner.getAddress(), stakingContract.address)).to.equal(tokensAmount + 1);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);
    const from = owner.getAddress();
    const to = stakingContract.address;
    const balance = await lpToken.balanceOf(from);

    await stakingContract.stake(tokensAmount);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(tokensAmount);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).not.to.equal(0);

    await stakingContract.stake(1);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(1 + tokensAmount);

    expect(await lpToken.balanceOf(from)).to.equal(balance - tokensAmount - 1);
    expect(await lpToken.balanceOf(to)).to.equal(tokensAmount + 1);
  });

  it("should unstake lp tokens", async function () {
    const tokensAmount = 10;
    await lpToken.approve(stakingContract.address, tokensAmount);
    expect(await lpToken.allowance(owner.getAddress(), stakingContract.address)).to.equal(tokensAmount);

    const rewardTimeoutSeconds = 1;
    const unstakeTimeoutSeconds = 1;
    const rewardRate = 2;
    await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);
    expect(await stakingContract.claimTimeout()).to.equal(rewardTimeoutSeconds);
    expect(await stakingContract.unstakeTimeout()).to.equal(unstakeTimeoutSeconds);
    expect(await stakingContract.rewardRate()).to.equal(rewardRate);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);

    const from = owner.getAddress();
    const to = stakingContract.address;
    const balance = await lpToken.balanceOf(from);

    await stakingContract.stake(tokensAmount);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(tokensAmount);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).not.to.equal(0);
    expect(await lpToken.balanceOf(from)).to.equal(balance - tokensAmount);
    expect(await lpToken.balanceOf(to)).to.equal(tokensAmount);

    await stakingContract.unstake();

    expect(await lpToken.balanceOf(from)).to.equal(balance);
    expect(await lpToken.balanceOf(to)).to.equal(0);
    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);
  });

  it("Should throw an exception if nothing to unstake", async function () {
    try {
      expect(await stakingContract.unstake()
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Nothing to unstake");
    }
  });

  it("Should throw an exception if unstake timeout has not expired yet", async function () {
    try {
      const tokensAmount = 10;
      await lpToken.approve(stakingContract.address, tokensAmount + 1);
      expect(await lpToken.allowance(owner.getAddress(), stakingContract.address)).to.equal(tokensAmount + 1);

      expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
      expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);

      await stakingContract.stake(1);

      const rewardTimeoutSeconds = 1;
      const unstakeTimeoutSeconds = 1000;
      const rewardRate = 2;
      await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);
      expect(await stakingContract.claimTimeout()).to.equal(rewardTimeoutSeconds);
      expect(await stakingContract.unstakeTimeout()).to.equal(unstakeTimeoutSeconds);
      expect(await stakingContract.rewardRate()).to.equal(rewardRate);

      expect(await stakingContract.unstake()
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Unstake timeout has not expired yet");
    }
  });

  it("should claim rewards tokens", async function () {
    const from = stakingContract.address;
    const to = owner.getAddress();
    await rewardsToken.transfer(from, totalSupply);
    const rewardTokenBalance = await rewardsToken.balanceOf(from);
    const lpTokensAmount = 10;

    await lpToken.approve(stakingContract.address, lpTokensAmount);
    expect(await lpToken.allowance(owner.getAddress(), stakingContract.address)).to.equal(lpTokensAmount);

    const rewardTimeoutSeconds = 1;
    const unstakeTimeoutSeconds = 1;
    const rewardRate = 2;
    await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);
    expect(await stakingContract.claimTimeout()).to.equal(rewardTimeoutSeconds);
    expect(await stakingContract.unstakeTimeout()).to.equal(unstakeTimeoutSeconds);
    expect(await stakingContract.rewardRate()).to.equal(rewardRate);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);

    await stakingContract.stake(lpTokensAmount);

    expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(lpTokensAmount);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).not.to.equal(0);

    expect(await rewardsToken.balanceOf(from)).to.equal(rewardTokenBalance);
    expect(await rewardsToken.balanceOf(to)).to.equal(0);

    await stakingContract.claim();

    expect(await rewardsToken.balanceOf(from)).to.equal(rewardTokenBalance - lpTokensAmount / rewardRate);
    expect(await rewardsToken.balanceOf(to)).to.equal(lpTokensAmount / rewardRate);
    expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);
  });

  it("Should throw an exception if nothing to claim", async function () {
    try {
      expect(await stakingContract.claim()
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Nothing to claim");
    }
  });

  it("Should throw an exception if nothing to claim", async function () {
    try {
      const tokensAmount = 10;
      await lpToken.approve(stakingContract.address, tokensAmount + 1);
      expect(await lpToken.allowance(owner.getAddress(), stakingContract.address)).to.equal(tokensAmount + 1);

      expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
      expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);

      await stakingContract.stake(0);

      const rewardTimeoutSeconds = 1;
      const unstakeTimeoutSeconds = 1;
      const rewardRate = 2;
      await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);
      expect(await stakingContract.claimTimeout()).to.equal(rewardTimeoutSeconds);
      expect(await stakingContract.unstakeTimeout()).to.equal(unstakeTimeoutSeconds);
      expect(await stakingContract.rewardRate()).to.equal(rewardRate);
      expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
      expect(await stakingContract.getStakingTimestamp(owner.getAddress())).not.to.equal(0);
      expect(await stakingContract.claim()
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Nothing to claim");
    }
  });

  it("Should throw an exception if reward timeout has not expired yet", async function () {
    try {
      const tokensAmount = 10;
      await lpToken.approve(stakingContract.address, tokensAmount + 1);
      expect(await lpToken.allowance(owner.getAddress(), stakingContract.address)).to.equal(tokensAmount + 1);

      expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(0);
      expect(await stakingContract.getStakingTimestamp(owner.getAddress())).to.equal(0);

      await stakingContract.stake(1);

      const rewardTimeoutSeconds = 10000;
      const unstakeTimeoutSeconds = 1;
      const rewardRate = 2;
      await stakingContract.changeSettings(rewardTimeoutSeconds, unstakeTimeoutSeconds, rewardRate);
      expect(await stakingContract.claimTimeout()).to.equal(rewardTimeoutSeconds);
      expect(await stakingContract.unstakeTimeout()).to.equal(unstakeTimeoutSeconds);
      expect(await stakingContract.rewardRate()).to.equal(rewardRate);
      expect(await stakingContract.getStakingAmount(owner.getAddress())).to.equal(1);
      expect(await stakingContract.getStakingTimestamp(owner.getAddress())).not.to.equal(0);
      expect(await stakingContract.claim()
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Reward timeout has not expired yet");
    }
  });
});