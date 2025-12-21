const hre = require("hardhat");

async function main() {
  console.log("Deploying Blu Token...");

  const BluToken = await hre.ethers.getContractFactory("BluToken");
  const bluToken = await BluToken.deploy();
  await bluToken.deployed();

  console.log("Blu Token deployed to:", bluToken.address);
  console.log("Transaction hash:", bluToken.deployTransaction.hash);

  // Wait for a few block confirmations
  await bluToken.deployTransaction.wait(5);
  console.log("Confirmed 5 blocks");

  // Verify the contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: bluToken.address,
      constructorArguments: [],
    });
    console.log("Contract verified on Etherscan");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 