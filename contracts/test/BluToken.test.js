const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BluToken", function () {
  let BluToken;
  let bluToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    BluToken = await ethers.getContractFactory("BluToken");
    bluToken = await BluToken.deploy();
    await bluToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bluToken.hasRole(await bluToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await bluToken.balanceOf(owner.address);
      expect(await bluToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Token Distribution", function () {
    it("Should have correct initial distribution", async function () {
      const totalSupply = await bluToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("1000000000")); // 1 billion tokens
    });
  });

  describe("Staking", function () {
    const amount = ethers.utils.parseEther("1000");

    beforeEach(async function () {
      await bluToken.transfer(addr1.address, amount);
    });

    it("Should allow users to stake tokens", async function () {
      await bluToken.connect(addr1).stake(amount);
      expect(await bluToken.stakedBalance(addr1.address)).to.equal(amount);
    });

    it("Should not allow unstaking before period ends", async function () {
      await bluToken.connect(addr1).stake(amount);
      await expect(bluToken.connect(addr1).unstake(amount)).to.be.revertedWith(
        "Staking period not completed"
      );
    });

    it("Should calculate rewards correctly", async function () {
      await bluToken.connect(addr1).stake(amount);
      const rewards = await bluToken.calculateRewards(addr1.address, 365 * 24 * 60 * 60); // 1 year
      expect(rewards).to.be.gt(0);
    });
  });

  describe("Governance", function () {
    it("Should update voting power correctly", async function () {
      await bluToken.updateVotingPower(addr1.address);
      expect(await bluToken.votingPower(addr1.address)).to.equal(0);
    });

    it("Should check voting eligibility correctly", async function () {
      expect(await bluToken.canVote(addr1.address)).to.equal(false);
    });
  });

  describe("Pausing", function () {
    it("Should allow pausing by admin", async function () {
      await bluToken.pause();
      expect(await bluToken.paused()).to.equal(true);
    });

    it("Should not allow transfers when paused", async function () {
      await bluToken.pause();
      await expect(
        bluToken.transfer(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });
  });
}); 