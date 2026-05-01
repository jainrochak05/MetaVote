const hre = require("hardhat");

async function main() {
  const MetaVote = await hre.ethers.getContractFactory("MetaVote");
  const metaVote = await MetaVote.deploy();

  await metaVote.waitForDeployment();

  console.log("MetaVote deployed to:", await metaVote.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
