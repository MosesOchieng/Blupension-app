const emailService = require("../utils/emailService");

async function testEmailService() {
  console.log("Starting email service tests...\n");

  // Test 1: Send verification code
  console.log("Test 1: Sending verification code...");
  const verificationCode = emailService.generateVerificationCode();
  const verificationResult = await emailService.sendVerificationCode(
    "mosesochiengopiyo@gmail.com",
    verificationCode,
  );
  console.log("Verification code result:", verificationResult);
  console.log("Verification code:", verificationCode);
  console.log("\n");

  // Test 2: Send account details
  console.log("Test 2: Sending account details...");
  const accountDetails = {
    email: "mosesochiengopiyo@gmail.com",
    accountId: "ACC-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
  };
  const accountDetailsResult = await emailService.sendAccountDetails(
    "mosesochiengopiyo@gmail.com",
    accountDetails,
  );
  console.log("Account details result:", accountDetailsResult);
  console.log("\n");

  // Test 3: Send password reset code
  console.log("Test 3: Sending password reset code...");
  const resetCode = emailService.generateVerificationCode();
  const resetResult = await emailService.sendPasswordResetCode(
    "mosesochiengopiyo@gmail.com",
    resetCode,
  );
  console.log("Password reset result:", resetResult);
  console.log("Reset code:", resetCode);
  console.log("\n");

  console.log("Email service tests completed!");
}

// Run the tests
testEmailService().catch(console.error);
