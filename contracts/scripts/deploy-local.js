const hre = require("hardhat");

async function main() {
  console.log("Deploying Blu Token to local network...");

  const BluToken = await hre.ethers.getContractFactory("BluToken");
  const bluToken = await BluToken.deploy();
  await bluToken.waitForDeployment();

  const address = await bluToken.getAddress();
  console.log("Blu Token deployed to:", address);

  // Get the contract owner
  const [owner] = await hre.ethers.getSigners();
  console.log("Contract owner:", owner.address);

  // Log token distribution
  const totalSupply = await bluToken.totalSupply();
  const ownerBalance = await bluToken.balanceOf(owner.address);
  
  console.log("\nToken Distribution:");
  console.log("Total Supply:", totalSupply.toString());
  console.log("Owner Balance:", ownerBalance.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 