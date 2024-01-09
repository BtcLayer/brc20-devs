// interact-local.js
const { ethers } = require("hardhat");

async function main() {
    
  const wBTCAddress = "0xB0f05d25e41FbC2b52013099ED9616f1206Ae21B"; // Replace with your actual deployed wBTC contract address
  const wBTCContract = await ethers.getContractAt(IERC20.sol, wBTCAddress);

  const balance = await wBTCContract.balanceOf("someAddress");

  console.log("Balance of someAddress:", balance.toString());
}

main();
