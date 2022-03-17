const hre = require("hardhat");
const fs = require('fs');

async function main() {
  await new Promise((resolve, _) => setTimeout(() => { resolve() }, 1000))
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log("nftMarketplace deployed to:", nftMarketplace.address);

  fs.writeFileSync('./config.ts', `
  export const marketplaceAddress = "${nftMarketplace.address}"
  `)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
