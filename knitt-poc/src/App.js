import logo from './logo.svg';
import './App.css';
import Loader from './Loader';
import { useState } from 'react';

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

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
// const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

// Create a Bitcoin Core client
const client = new bitcoinCore(config);

function App() {
const [mnemonics,setMnemonics]=useState('')
const [btcAmount,setBtcAmount]=useState('')
const [btcAddress,setBtcAddress]=useState('')
const [ethAddress,setEthAddress]=useState('')
const [btcBalance,setbtcBalance]=useState('')
const [ethBalance, setEthBalance]=useState('')
const [ethAmount, setEthAmount]=useState('')
const [txHash, setTxHash] = useState('');
const [loader, setLoader] = useState(false);



async function handleMnemonics(value){
setMnemonics(value);
  try {
    const btcAddr= getBtcAddressFromMnemonics(value);
    const ethAddr=getEthAddressFromMnemonics(value);
    const btcBalance=await getBtcBalance(btcAddr);
    const ethBalance= await getEthBalance(ethAddr);
    console.log("balance: ", btcBalance);
    setBtcAddress(btcAddr)
    setEthAddress(ethAddr)
    setbtcBalance(btcBalance)
    console.log("eth log:", ethBalance);
    setEthBalance(ethBalance)

  } catch (err) {
    console.log("Error: ", err);
  }
  // }
    }
  



async function getBtcBalance(address) {
  try {
    const balance = await client.getBalance();
    console.log(`Balance of ${address}: ${balance} BTC`);
    return balance
  } catch (error) {
    console.error('Error:', error.message || error);
    return null
  }
}
async function getEthBalance(address) {
  try {
  const balance=await provider.getBalance(address)
    
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
    await getBtcBalance();
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
          <textarea onChange={(e)=>handleMnemonics(e.target.value)} value={mnemonics} rows={6}  placeholder="Enter Mnemonics here" className='input-box-area' />
          <p>Btc Address: {btcAddress} </p>

          <p>Btc Balance: {btcBalance} </p>
          <label>Amount</label>

          <input onChange={(e)=>setBtcAmount(e.target.value)}  value={btcAmount} placeholder="Enter BTC amount" className='input-box'></input>
          <p>Eth Address: {ethAddress}</p>
          <p>wBTC Balance: {ethBalance && `${ethBalance.toString()} wBTC`}</p>

          <p>You will get: {btcAmount}</p>
          <button className="swap-button" onClick={createTransaction} disabled={loader}  style={{cursor: "pointer"}}>Swap</button>
          <p onClick={async () => {await navigator.clipboard.writeText(txHash); alert("Copied Tx Hash")}}>{txHash && `Transaction Hash: ${txHash}`}</p>
        </div>
      </div>
      {loader && <Loader />}
    </div>
  );
}

export default App;
