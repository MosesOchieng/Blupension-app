const { expect } = require("chai");
const request = require("supertest");
const { app, sequelize } = require("../server");
const { User, TempUser } = require("../models");
const bcrypt = require("bcryptjs");

describe("Registration Process", () => {
  beforeEach(async () => {
    // Sync database before each test
    await sequelize.sync({ force: true });
  });

  after(async () => {
    // Close database connection after all tests
    await sequelize.close();
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "254745092523",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("message");
      expect(response.body.message).to.include("Registration successful");
      expect(response.body).to.have.property("userId");

      // Check if temp user was created
      const tempUser = await TempUser.findOne({
        where: { email: userData.email },
      });
      expect(tempUser).to.not.be.null;
      expect(tempUser.firstName).to.equal(userData.firstName);
      expect(tempUser.lastName).to.equal(userData.lastName);
      expect(tempUser.email).to.equal(userData.email);
      expect(tempUser.phone).to.equal(userData.phone);
      expect(tempUser.verification_code).to.be.a("string");
      expect(tempUser.expires_at).to.be.a("date");
    });

    it("should not register user with existing email", async () => {
      // First registration
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "254745092523",
      };

      await request(app).post("/api/auth/register").send(userData);

      // Second registration with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Email already registered");
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/api/auth/register").send({});

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("errors");
      expect(response.body.errors).to.be.an("array");
      expect(response.body.errors.length).to.be.greaterThan(0);
    });

    it("should validate password length", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "123", // Too short
        phone: "254745092523",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("errors");
      expect(response.body.errors).to.be.an("array");
      expect(response.body.errors[0].msg).to.include(
        "Password must be at least 6 characters long",
      );
    });

    it("should validate phone number format", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "invalid-phone", // Invalid format
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("errors");
      expect(response.body.errors).to.be.an("array");
      expect(response.body.errors[0].msg).to.include(
        "Please enter a valid phone number",
      );
    });
  });
});
