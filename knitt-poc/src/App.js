import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

const bitcoinCore = require('bitcoin-core');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
// const request = require('request-promise');
const ethers = require('ethers');


// Configuration for connecting to your Bitcoin Core node
const config = {
  host: 'localhost',
  port: 18443, // Adjust the port if necessary
  username: 'user',
  password: '123',
  network: 'regtest',
  timeout: 30000, // Timeout in milliseconds
};

// Create a Bitcoin Core client
const client = new bitcoinCore(config);

function App() {
const [mnemonics,setMnemonics]=useState('')
const [btcAmount,setBtcAmount]=useState(5)
const [btcAddress,setBtcAddress]=useState('')
const [ethAddress,setEthAddress]=useState('')
const [btcBalance,setbtcBalance]=useState('')



async function handleMnemonics(value){
setMnemonics(value);

// if(isvalidMnemoinc(value)){

  try {
    const btcAddr= getBtcAddressFromMnemonics(value);
    const ethAddr=getEthAddressFromMnemonics(value);
    const btcBalance=await getBtcBalance(btcAddr)
    console.log("balance: ", btcBalance);
    setBtcAddress(btcAddr)
    setEthAddress(ethAddr)
    setbtcBalance(btcBalance)
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
          <p>Eth Balance: 100ETH </p>

          <p>You will get 2.0 wBTC</p>
          <button className="swap-button">Swap</button>
        </div>
      </div>
    </div>
  );
}

export default App;
