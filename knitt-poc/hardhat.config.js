require("@nomicfoundation/hardhat-toolbox");


const Private_Key = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

module.exports = {
  solidity: "0.8.17",
  networks: {
  	zklocal: {
  		url: `http://localhost:8545`,
  		accounts: [`0x${Private_Key}`],
      
      
  	},
}
};