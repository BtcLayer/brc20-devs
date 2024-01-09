const { Web3 } = require("web3");

// Loading the contract ABI and Bytecode
// (the results of a previous compilation step)
const fs = require("fs");
const { abi, bytecode } = JSON.parse(fs.readFileSync("./artifacts/contracts/wBTC.sol/WBTC.json"));

async function main() {
  // Configuring the connection to an Ethereum node
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `http://localhost:8545`,
    ),
  );
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    '0x' + 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  );
  web3.eth.accounts.wallet.add(signer);

  // Using the signing account to deploy the contract
  const contract = new web3.eth.Contract(abi);
  contract.options.data = bytecode;
  const deployTx = contract.deploy();
  const deployedContract = await deployTx
    .send({
      from: signer.address,
      gas: await deployTx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining deployment transaction ...`);
    });
  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`);

}
main();