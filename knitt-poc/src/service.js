const {
  ethers
} = require("ethers");
// const streakcontract = require("../artifacts/contracts/BridgeStreak.sol/BridgeStreak.json");


// const bsccontract = require("../artifacts/contracts/BridgeBsc.sol/BridgeBsc.json");

// console.log("module: ", ethers);

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
// const BridgeBsc = new ethers.Contract(BSC_CONTRACT_ADDRESS, bsccontract.abi, bscsigner);


// const streakprovider = new ethers.JsonRpcProvider(STREAK_API_URL);
// streakprovider.pollingInterval=100
// const streaksigner = new ethers.Wallet(STREAK_PRIVATE_KEY, streakprovider);
// const BridgeStreak = new ethers.Contract(STREAK_CONTRACT_ADDRESS, streakcontract.abi, streaksigner);

async function main() {
//     BridgeStreak.on("Locked", async (from,to,amount) => {
//          const tx=await BridgeBsc.mintWrapped(from,to,amount,{ gasPrice: ethers.parseUnits('6','gwei').toString(),
//          gasLimit: 177302});
//          tx.wait();
//         console.log(`${ from } locked ${amount.toString()} on STREAK Chain`);
//     });
//     BridgeBsc.on("BurnWrappedStreak", async(from, to,amount) => {
//         const tx= await BridgeStreak.unlock(to,{value:amount,  gasPrice: ethers.parseUnits('6','gwei').toString(),
//         gasLimit: 177302});
//         tx.wait()
//        console.log(`${from} Unlocked ${amount} on ${to} address on STREAK Chain`);
//    });
     
//    BridgeStreak.on("Unlocked", (to,amount,data) => {
//     console.log("Transaction hash on unlocking streak : ", data.log.transactionHash)
// });
// BridgeBsc.on("MintWrappedStreak", (from,to, amount,data) => {
//     console.log("Transaction hash on minting wrapped token : ", data.log.transactionHash)
// });

console.log(await signer.provider.getBalance(signer.address)
)
}
main();