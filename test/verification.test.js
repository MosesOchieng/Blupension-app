const { expect } = require("chai");
const request = require("supertest");
const { Sequelize } = require("sequelize");
const { app } = require("../server");
const User = require("../models/User");
const TempUser = require("../models/TempUser");

describe("Verification Process", () => {
  let tempUserId;
  let verificationCode;
  let sequelize;

  before(async () => {
    // Create a new database connection for this test suite
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    // Initialize models with the new connection
    User.init(sequelize);
    TempUser.init(sequelize);

    // Sync database
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Create a temporary user for testing
    const tempUser = await TempUser.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      phone: "254745092523",
      accountName: "BLU-1234-ABCD",
      verification_code: "123456",
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    });

    tempUserId = tempUser.id;
    verificationCode = tempUser.verification_code;
  });

  afterEach(async () => {
    // Clean up after each test
    await TempUser.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  after(async () => {
    // Close the test-specific database connection
    await sequelize.close();
  });

  describe("POST /api/auth/verify-code", () => {
    it("should successfully verify a valid code", async () => {
      const response = await request(app)
        .post("/api/auth/verify-code")
        .send({
          emailCode: verificationCode,
          userId: tempUserId,
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.include("Account verified successfully");
      expect(response.body).to.have.property("walletAddress");

      // Check if permanent user was created
      const user = await User.findOne({
        where: { email: "john.doe@example.com" },
      });
      expect(user).to.not.be.null;
      expect(user.firstName).to.equal("John");
      expect(user.lastName).to.equal("Doe");
      expect(user.email).to.equal("john.doe@example.com");
      expect(user.phone).to.equal("254745092523");
      expect(user.isVerified).to.be.true;
      expect(user.walletAddress).to.equal(response.body.walletAddress);

      // Check if temp user was deleted
      const tempUser = await TempUser.findByPk(tempUserId);
      expect(tempUser).to.be.null;
    });

    it("should not verify with invalid code", async () => {
      const response = await request(app)
        .post("/api/auth/verify-code")
        .send({
          emailCode: "000000",
          userId: tempUserId,
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Invalid verification code");

      // Check if temp user still exists
      const tempUser = await TempUser.findByPk(tempUserId);
      expect(tempUser).to.not.be.null;

      // Check if permanent user was not created
      const user = await User.findOne({
        where: { email: "john.doe@example.com" },
      });
      expect(user).to.be.null;
    });

    it("should not verify with expired code", async () => {
      // Update temp user with expired code
      await TempUser.update(
        {
          expires_at: new Date(Date.now() - 1000), // 1 second ago
        },
        { where: { id: tempUserId } }
      );

      const response = await request(app)
        .post("/api/auth/verify-code")
        .send({
          emailCode: verificationCode,
          userId: tempUserId,
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Invalid verification code");

      // Check if temp user still exists
      const tempUser = await TempUser.findByPk(tempUserId);
      expect(tempUser).to.not.be.null;

      // Check if permanent user was not created
      const user = await User.findOne({
        where: { email: "john.doe@example.com" },
      });
      expect(user).to.be.null;
    });

    it("should not verify with non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/verify-code")
        .send({
          emailCode: verificationCode,
          userId: "non-existent-id",
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Invalid verification code");

      // Check if temp user still exists
      const tempUser = await TempUser.findByPk(tempUserId);
      expect(tempUser).to.not.be.null;

      // Check if permanent user was not created
      const user = await User.findOne({
        where: { email: "john.doe@example.com" },
      });
      expect(user).to.be.null;
    });

    it("should require both emailCode and userId", async () => {
      const response = await request(app)
        .post("/api/auth/verify-code")
        .send({
          emailCode: verificationCode,
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Invalid verification code");

      // Check if temp user still exists
      const tempUser = await TempUser.findByPk(tempUserId);
      expect(tempUser).to.not.be.null;

      // Check if permanent user was not created
      const user = await User.findOne({
        where: { email: "john.doe@example.com" },
      });
      expect(user).to.be.null;
    });
  });
});
