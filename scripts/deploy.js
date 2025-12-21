const hre = require("hardhat");

async function main() {
  console.log("Deploying BluToken...");

  const BluToken = await hre.ethers.getContractFactory("BluToken");
  const bluToken = await BluToken.deploy();
  await bluToken.deployed();

  console.log("BluToken deployed to:", bluToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 