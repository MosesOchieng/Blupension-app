const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BluToken", function () {
  let bluToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const BluToken = await ethers.getContractFactory("BluToken");
    bluToken = await BluToken.deploy();
    await bluToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right admin role", async function () {
      const DEFAULT_ADMIN_ROLE = await bluToken.DEFAULT_ADMIN_ROLE();
      expect(await bluToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await bluToken.balanceOf(owner.address);
      expect(await bluToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set up roles correctly", async function () {
      const MINTER_ROLE = await bluToken.MINTER_ROLE();
      const BURNER_ROLE = await bluToken.BURNER_ROLE();
      const PAUSER_ROLE = await bluToken.PAUSER_ROLE();

      expect(await bluToken.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
      expect(await bluToken.hasRole(BURNER_ROLE, owner.address)).to.equal(true);
      expect(await bluToken.hasRole(PAUSER_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await bluToken.transfer(addr1.address, 50);
      const addr1Balance = await bluToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await bluToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await bluToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await bluToken.balanceOf(owner.address);
      await expect(
        bluToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await bluToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Staking", function () {
    const stakeAmount = ethers.utils.parseEther("1000");

    beforeEach(async function () {
      // Transfer tokens to addr1 for testing
      await bluToken.transfer(addr1.address, stakeAmount.mul(2));
    });

    it("Should allow staking tokens", async function () {
      await bluToken.connect(addr1).stake(stakeAmount);
      expect(await bluToken.stakedBalance(addr1.address)).to.equal(stakeAmount);
    });

    it("Should fail staking with insufficient balance", async function () {
      const tooMuch = stakeAmount.mul(3);
      await expect(
        bluToken.connect(addr1).stake(tooMuch)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow unstaking before time", async function () {
      await bluToken.connect(addr1).stake(stakeAmount);
      await expect(
        bluToken.connect(addr1).unstake(stakeAmount)
      ).to.be.revertedWith("Staking period not completed");
    });

    it("Should allow unstaking after staking period", async function () {
      await bluToken.connect(addr1).stake(stakeAmount);
      await time.increase(365 * 24 * 60 * 60); // Increase time by 1 year
      await bluToken.connect(addr1).unstake(stakeAmount);
      expect(await bluToken.stakedBalance(addr1.address)).to.equal(0);
    });

    it("Should calculate rewards correctly", async function () {
      await bluToken.connect(addr1).stake(stakeAmount);
      await time.increase(365 * 24 * 60 * 60); // Increase time by 1 year
      
      const rewards = await bluToken.calculateRewards(addr1.address, 365 * 24 * 60 * 60);
      const expectedRewards = stakeAmount.mul(5).div(100); // 5% annual reward
      expect(rewards).to.be.closeTo(expectedRewards, expectedRewards.div(100)); // Allow 1% deviation
    });

    it("Should allow claiming rewards", async function () {
      await bluToken.connect(addr1).stake(stakeAmount);
      await time.increase(365 * 24 * 60 * 60); // Increase time by 1 year
      
      const initialBalance = await bluToken.balanceOf(addr1.address);
      await bluToken.connect(addr1).claimRewards();
      const finalBalance = await bluToken.balanceOf(addr1.address);
      
      expect(finalBalance.sub(initialBalance)).to.be.gt(0);
    });
  });

  describe("Governance", function () {
    const tokenAmount = ethers.utils.parseEther("1000");

    it("Should update voting power correctly", async function () {
      await bluToken.transfer(addr1.address, tokenAmount);
      await bluToken.connect(addr1).stake(tokenAmount.div(2));
      await bluToken.updateVotingPower(addr1.address);

      expect(await bluToken.votingPower(addr1.address)).to.equal(tokenAmount);
    });

    it("Should determine voting eligibility correctly", async function () {
      // Transfer just below threshold
      const belowThreshold = ethers.utils.parseEther("999");
      await bluToken.transfer(addr1.address, belowThreshold);
      await bluToken.updateVotingPower(addr1.address);
      expect(await bluToken.canVote(addr1.address)).to.equal(false);

      // Transfer to reach threshold
      await bluToken.transfer(addr1.address, ethers.utils.parseEther("1"));
      await bluToken.updateVotingPower(addr1.address);
      expect(await bluToken.canVote(addr1.address)).to.equal(true);
    });
  });

  describe("Pausing", function () {
    it("Should pause and unpause", async function () {
      await bluToken.pause();
      await expect(
        bluToken.transfer(addr1.address, 100)
      ).to.be.revertedWith("Pausable: paused");

      await bluToken.unpause();
      await bluToken.transfer(addr1.address, 100);
      expect(await bluToken.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should not allow non-pausers to pause", async function () {
      const PAUSER_ROLE = await bluToken.PAUSER_ROLE();
      await expect(
        bluToken.connect(addr1).pause()
      ).to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${PAUSER_ROLE}`);
    });
  });
}); 