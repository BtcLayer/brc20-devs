import logo from './logo.svg';
import './App.css';
import Loader from './Loader';
import { useState, useEffect } from 'react';

const bitcoinCore = require('bitcoin-core');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
// const request = require('request-promise');
const ethers = require('ethers');


// Configuration for connecting to your Bitcoin Core node
const config = {
  host: '127.0.0.01:7000/http://127.0.0.1',
  port: 18443,
  username: 'user',
  password: '123',
  network: 'regtest',
  timeout: 30000, 
};

const wbtcContract = require("../artifacts/contracts/wBTC.sol/WBTC.json");
const BSC_CONTRACT_ADDRESS="0xc6e7DF5E7b4f2A278906862b61205850344D4e7d"
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

const WBtc = new ethers.Contract(BSC_CONTRACT_ADDRESS, wbtcContract.abi, signer);

// Create a Bitcoin Core client
const client = new bitcoinCore(config);

function App() {
const [mnemonics,setMnemonics]=useState('')
const [btcAmount,setBtcAmount]=useState('')
const [btcAddress,setBtcAddress]=useState('')
const [ethAddress,setEthAddress]=useState('')
const [btcBalance,setbtcBalance]=useState('')
const [ethBalance, setWbtcBalance]=useState('')
const [ethAmount, setEthAmount]=useState('')
const [txHash, setTxHash] = useState('');
const [zktxHash,setZkTxHash]=useState('');
const [loader, setLoader] = useState(false);



async function handleMnemonics(value){
  try {
    const btcAddr= getBtcAddressFromMnemonics(value);
    const ethAddr=getEthAddressFromMnemonics(value);
    const btcBalance=await getBtcBalance(btcAddr);
    console.log("eth balance: ", ethAddr);
    const wbtcBalance= await getWBtcBalance(ethAddr);
    console.log("balance: ", btcBalance);
    console.log("eth balance:", wbtcBalance);
    setBtcAddress(btcAddr)
    setEthAddress(ethAddr)
    setbtcBalance(btcBalance)
    setWbtcBalance(wbtcBalance)
  } catch (err) {
    console.log("Error: ", err);
  }
  // }
    }


    useEffect(() => {
      const id = setInterval(() => {
        if(!mnemonics) clearInterval(id);
        handleMnemonics(mnemonics);
      }, 3000)
      return () => clearInterval(id)
    }, [mnemonics])


async function getBtcBalance(address) {
  
  try {
    const balance = await client.getBalance();
    // console.log("hello world ===",address,`${address}`)
    console.log(`Balance of ${address}: ${balance} BTC`);
    return balance
  } catch (error) {
    console.error('Error:', error.message || error);
    return null
  }
}
async function getWBtcBalance(address) {
  try {
  const balance=await WBtc.getBalance(address)
    
    return balance
  } catch (error) {
    console.error('Error:', error.message || error);
    return null
  }
}


// Function to derive a Bitcoin address from a mnemonic
function getBtcAddressFromMnemonics(mnemonic) {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);
  const hdNode = bitcoin.bip32.fromSeed(seedBuffer, bitcoin.networks.regtest);
  const key = hdNode.derivePath("m/0/0"); // Derive the first key
  return bitcoin.payments.p2wpkh({ pubkey: key.publicKey, network: bitcoin.networks.regtest }).address;
}

// Function to derive an Ethereum address from a mnemonic
function getEthAddressFromMnemonics(mnemonic) {
  const wallet=ethers.Wallet.fromPhrase(mnemonic)
  return wallet.address;
}


// Create a simple transaction
async function createTransaction() {
  try {
    
    if(!btcAmount) {
      alert("Amount is empty!");
      return;
    }
    
    setLoader(true);

    // Unlock the wallet for the sender address (only needed if wallet is encrypted)
    await client.walletPassphrase('Srikar', 60);

    // Send bitcoins from sender to recipient
    const recipientAddress = "bcrt1q8s30xzk44wczms6s5smm2aqvnqqqkc8ye504zt";
    const transactionId = await client.sendToAddress(recipientAddress, btcAmount);

    setTxHash(transactionId);
    console.log(`Transaction sent. Transaction ID: ${transactionId}`);
    await getBtcBalance(recipientAddress);
    const zktx=await WBtc.mintWrapped(ethAddress,btcAmount,{ gasPrice: ethers.parseUnits('6','gwei').toString(),
    gasLimit: 177302})
    zktx.wait();
    console.log(`Zk Tx Hash : ${zktx.hash}`)
    setZkTxHash(zktx.hash)
    const balancewBtc = await getWBtcBalance(ethAddress);
    setWbtcBalance(balancewBtc);

    await handleMnemonics(mnemonics);
    setLoader(false)
  } catch (error) {
    console.error('Error:', error.message || error);
    alert(error.message)
    setLoader(false)
  }
}



  return (
    <div className="App">
      <div className="App-header">
        <div className='form-container'>
          <label>Mnemonics</label>
          <textarea onChange={async (e)=>{
            setMnemonics(e.target.value);
            await handleMnemonics(e.target.value)
          }} value={mnemonics} rows={6}  placeholder="Enter Mnemonics here" className='input-box-area' />
          <p>Btc Address: {btcAddress} </p>

          <p>Btc Balance: {btcBalance} </p>
          <label>Amount</label>

          <input onChange={(e)=>setBtcAmount(e.target.value)}  value={btcAmount} placeholder="Enter BTC amount" className='input-box'></input>
          <p>Eth Address: {ethAddress}</p>
          <p>wBTC Balance: {ethBalance && `${ethBalance.toString()} wBTC`}</p>

          <p>You will get: {btcAmount}</p>
          <button className="swap-button" onClick={createTransaction} disabled={loader}  style={{cursor: "pointer"}}>Swap</button>
          <p onClick={async () => {await navigator.clipboard.writeText(txHash); alert("Copied Tx Hash")}}>{txHash && `Transaction Hash: ${txHash}`}</p>
          <p onClick={async () => {await navigator.clipboard.writeText(zktxHash); alert("Copied Tx Hash")}}>{zktxHash && `Zk Transaction Hash: ${zktxHash}`}</p>
        </div>
      </div>
      {loader && <Loader />}  
    </div>
  );
}

export default App;
