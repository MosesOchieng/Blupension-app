import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PensionFund, PensionFund__factory } from "../typechain-types";

describe("PensionFund", () => {
  let pensionFund: PensionFund;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  const minimumInvestment = ethers.utils.parseEther("0.1"); // 0.1 ETH

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    
    const PensionFundFactory = await ethers.getContractFactory("PensionFund");
    pensionFund = await PensionFundFactory.deploy(minimumInvestment);
    await pensionFund.deployed();
  });

  describe("Investment", () => {
    it("should allow investment with valid amount and percentage", async () => {
      const amount = ethers.utils.parseEther("1");
      const stablecoinPercentage = 60;

      await expect(
        pensionFund.connect(user1).invest(stablecoinPercentage, { value: amount })
      )
        .to.emit(pensionFund, "InvestmentCreated")
        .withArgs(user1.address, amount, stablecoinPercentage);

      const investment = await pensionFund.investments(user1.address);
      expect(investment.amount).to.equal(amount);
      expect(investment.stablecoinPercentage).to.equal(stablecoinPercentage);
      expect(investment.growingAssetsPercentage).to.equal(100 - stablecoinPercentage);
    });

    it("should reject investment below minimum", async () => {
      const amount = ethers.utils.parseEther("0.05");
      await expect(
        pensionFund.connect(user1).invest(60, { value: amount })
      ).to.be.revertedWith("Investment too low");
    });

    it("should reject invalid percentage", async () => {
      const amount = ethers.utils.parseEther("1");
      await expect(
        pensionFund.connect(user1).invest(101, { value: amount })
      ).to.be.revertedWith("Invalid percentage");
    });
  });

  describe("Withdrawal", () => {
    beforeEach(async () => {
      // Setup initial investment
      await pensionFund.connect(user1).invest(60, {
        value: ethers.utils.parseEther("1"),
      });
    });

    it("should allow full withdrawal", async () => {
      const investment = await pensionFund.investments(user1.address);
      const initialBalance = await user1.getBalance();

      const tx = await pensionFund.connect(user1).withdraw(investment.amount);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await user1.getBalance();
      expect(finalBalance).to.equal(
        initialBalance.add(investment.amount).sub(gasCost)
      );

      const remainingInvestment = await pensionFund.investments(user1.address);
      expect(remainingInvestment.amount).to.equal(0);
    });

    it("should allow partial withdrawal", async () => {
      const investment = await pensionFund.investments(user1.address);
      const withdrawAmount = investment.amount.div(2);

      await pensionFund.connect(user1).withdraw(withdrawAmount);

      const remainingInvestment = await pensionFund.investments(user1.address);
      expect(remainingInvestment.amount).to.equal(investment.amount.sub(withdrawAmount));
    });

    it("should reject withdrawal without investment", async () => {
      await expect(
        pensionFund.connect(user2).withdraw(ethers.utils.parseEther("1"))
      ).to.be.revertedWith("No investment found");
    });

    it("should reject withdrawal exceeding investment", async () => {
      const investment = await pensionFund.investments(user1.address);
      await expect(
        pensionFund.connect(user1).withdraw(investment.amount.add(1))
      ).to.be.revertedWith("Insufficient funds");
    });
  });

  describe("Portfolio Management", () => {
    it("should maintain correct pool balances", async () => {
      const amount = ethers.utils.parseEther("1");
      const stablecoinPercentage = 60;

      await pensionFund.connect(user1).invest(stablecoinPercentage, { value: amount });

      const stablecoinAmount = amount.mul(stablecoinPercentage).div(100);
      const growingAmount = amount.sub(stablecoinAmount);

      expect(await pensionFund.stablecoinPool()).to.equal(stablecoinAmount);
      expect(await pensionFund.growingAssetsPool()).to.equal(growingAmount);
    });

    it("should update pools correctly after withdrawal", async () => {
      const amount = ethers.utils.parseEther("1");
      const stablecoinPercentage = 60;

      await pensionFund.connect(user1).invest(stablecoinPercentage, { value: amount });
      const withdrawAmount = amount.div(2);

      await pensionFund.connect(user1).withdraw(withdrawAmount);

      const expectedStablecoin = amount.mul(stablecoinPercentage).div(100).div(2);
      const expectedGrowing = amount.sub(amount.mul(stablecoinPercentage).div(100)).div(2);

      expect(await pensionFund.stablecoinPool()).to.equal(expectedStablecoin);
      expect(await pensionFund.growingAssetsPool()).to.equal(expectedGrowing);
    });
  });
}); 