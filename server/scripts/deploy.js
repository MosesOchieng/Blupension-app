const { ethers } = require("hardhat");

async function main() {
  // Deploy the contract
  const BlupensionToken = await ethers.getContractFactory("BlupensionToken");
  const token = await BlupensionToken.deploy();
  await token.deployed();

  console.log("BlupensionToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 