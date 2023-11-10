# Qtum Ethers
A module for using Qtum through an Ethers compliant library to make it simpler to use Qtum

# TLDR for Ethereum developers

```js
import {Contract} from "ethers"
import {
    // import QtumProvider as Provider, replacement for ethers Provider
    QtumProvider as Provider,
    // import QtumWallet as Wallet, replacement for ethers Wallet
    QtumWallet as Wallet,
    // import QtumContractFactory as ContractFactory, replacement for ethers ContractFactory
    QtumContractFactory as ContractFactory,
    // Qtum has two bip44 derivation paths, wallets use different ones
    // this is optional, the default is SLIP_BIP44_PATH
    QTUM_BIP44_PATH, // Compatible with Qtum core wallet and electrum
    SLIP_BIP44_PATH,  // Compatible with 3rd party wallets
    // Qtum uses compressed public/private keys and you need to consider them when doing cryptography
    // these functions are replacements for ethers' ones
    // they have an extra optional parameter to determine whether to use compressed or uncompressed keys (see below)
    computeAddress,
    recoverAddress,
    // Qtum uses a different hash prefix for messages, use these ethers replacement functions
    hashMessage,
    messagePrefix
} from "qtum-ethers-wrapper";
// Qtum does not support nonces since it is a fork of Bitcoin
// there is an equivalent workaround feature built into this library
// it hashes the Bitcoin UTXO inputs and creates a 'nonce'
// you can get this nonce and use it to force usage of specific Bitcoin UTXO inputs
// (see documentation further below if idempotency is required)
const signer = new Wallet(
    privkey,
    provider,
    {
        // optional, will default to true in a future release
        filterDust: true,
        // optional, disable remembering which UTXOs we consume
        // so that we can avoid trying to spend them again while
        // new transactions are in the mempool trying to spend them.
        // having this enabled lets the library send multiple
        // transactions per block.
        disableConsumingUtxos: true,
        // optional, specify inputs to ignore when creating transactions
        // this list can be created from a serialized hex transaction via
        // QtumWallet#getIdempotentNonce.inputs
        ignoreInputs: [''],
        // list of inputs to force, throws if unable to use them (eg they are already spent)
        inputs: [''],
        // hash of inputs, throws if a transaction does not re-use the exact same inputs
        nonce: '',
    }
)
```

# Installation

Open a console and run 

```npm install qtum-ethers-wrapper```

# Example

```js
import {Contract} from "ethers"
import {
    QtumProvider as Provider,
    QtumWallet as Wallet,
    QtumContractFactory as ContractFactory,
    QTUM_BIP44_PATH, // Compatible with Qtum core wallet and electrum
    SLIP_BIP44_PATH  // Compatible with 3rd party wallets
} from "qtum-ethers-wrapper";
// point Qtum Provider at Janus node https://github.com/qtumproject/janus/
const mainnetProvider = new Provider("https://janus.qiswap.com/api/");
const testnetProvider = new Provider("https://testnet-janus.qiswap.com/api/");
// or deploy your own node locally with a regtest network
// see for a pre-built docker image https://hub.docker.com/r/qtump/janus
const regtestProvider = new Provider("http://localhost:23889");
// or register an account with qnode https://qnode.qtum.info

const provider = testnetProvider;
// create a wallet
const privkey = "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e"
const signer = new Wallet(
    privkey,
    provider,
    {
        // optional, will default to true in a future release
        filterDust: true,
        // optional, disable remembering which UTXOs we consume
        // so that we can avoid trying to spend them again while
        // new transactions are in the mempool trying to spend them.
        // having this enabled lets the library send multiple
        // transactions per block.
        disableConsumingUtxos: true,
        // optional, specify inputs to ignore when creating transactions
        // this list can be created from a serialized hex transaction via
        // QtumWallet#getIdempotentNonce.inputs
        ignoreInputs: [''],
        // list of inputs to force, throws if unable to use them (eg they are already spent)
        inputs: [''],
        // hash of inputs, throws if a transaction does not re-use the exact same inputs
        nonce: '',
    }
)
// or create a random account and get the mnemonic
// const signer = Wallet.createRandom(/*{ path = SLIP_BIP44_PATH }*/}).connect(provider);
// const {locale, path, phrase} = signer._mnemonic();
// QRC20 ABI
const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
// https://github.com/qtumproject/janus/blob/master/playground/pet-shop-tutorial/contracts/QRC20Token.sol
const BYTECODE = "0x60806040526100106008600a610141565b61001e90633b9aca00610154565b60005534801561002d57600080fd5b50600080543382526001602052604090912055610173565b634e487b7160e01b600052601160045260246000fd5b600181815b8085111561009657816000190482111561007c5761007c610045565b8085161561008957918102915b93841c9390800290610060565b509250929050565b6000826100ad5750600161013b565b816100ba5750600061013b565b81600181146100d057600281146100da576100f6565b600191505061013b565b60ff8411156100eb576100eb610045565b50506001821b61013b565b5060208310610133831016604e8410600b8410161715610119575081810a61013b565b610123838361005b565b806000190482111561013757610137610045565b0290505b92915050565b600061014d838361009e565b9392505050565b600081600019048311821515161561016e5761016e610045565b500290565b6106e0806101826000396000f3fe6080604052600436106100855760003560e01c806306fdde0314610094578063095ea7b3146100de57806318160ddd1461010e57806323b872dd14610132578063313ce567146101525780635a3b7e421461017957806370a08231146101ae57806395d89b41146101db578063a9059cbb1461020a578063dd62ed3e1461022a57600080fd5b3661008f57600080fd5b600080fd5b3480156100a057600080fd5b506100c860405180604001604052806008815260200167145490c8151154d560c21b81525081565b6040516100d5919061050a565b60405180910390f35b3480156100ea57600080fd5b506100fe6100f936600461057b565b610262565b60405190151581526020016100d5565b34801561011a57600080fd5b5061012460005481565b6040519081526020016100d5565b34801561013e57600080fd5b506100fe61014d3660046105a5565b610315565b34801561015e57600080fd5b50610167600881565b60405160ff90911681526020016100d5565b34801561018557600080fd5b506100c860405180604001604052806009815260200168546f6b656e20302e3160b81b81525081565b3480156101ba57600080fd5b506101246101c93660046105e1565b60016020526000908152604090205481565b3480156101e757600080fd5b506100c86040518060400160405280600381526020016251544360e81b81525081565b34801561021657600080fd5b506100fe61022536600461057b565b61042d565b34801561023657600080fd5b506101246102453660046105fc565b600260209081526000928352604080842090915290825290205481565b6000826001600160a01b03811661027857600080fd5b8215806102a657503360009081526002602090815260408083206001600160a01b0388168452909152902054155b6102af57600080fd5b3360008181526002602090815260408083206001600160a01b03891680855290835292819020879055518681529192917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a35060019392505050565b6000836001600160a01b03811661032b57600080fd5b836001600160a01b03811661033f57600080fd5b6001600160a01b038616600090815260026020908152604080832033845290915290205461036d90856104c8565b6001600160a01b0387166000818152600260209081526040808320338452825280832094909455918152600190915220546103a890856104c8565b6001600160a01b0380881660009081526001602052604080822093909355908716815220546103d790856104eb565b6001600160a01b03808716600081815260016020526040908190209390935591519088169060008051602061068b833981519152906104199088815260200190565b60405180910390a350600195945050505050565b6000826001600160a01b03811661044357600080fd5b3360009081526001602052604090205461045d90846104c8565b33600090815260016020526040808220929092556001600160a01b0386168152205461048990846104eb565b6001600160a01b03851660008181526001602052604090819020929092559051339060008051602061068b833981519152906103039087815260200190565b6000818310156104da576104da61062f565b6104e4828461065b565b9392505050565b6000806104f88385610672565b9050838110156104e4576104e461062f565b600060208083528351808285015260005b818110156105375785810183015185820160400152820161051b565b81811115610549576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b038116811461057657600080fd5b919050565b6000806040838503121561058e57600080fd5b6105978361055f565b946020939093013593505050565b6000806000606084860312156105ba57600080fd5b6105c38461055f565b92506105d16020850161055f565b9150604084013590509250925092565b6000602082840312156105f357600080fd5b6104e48261055f565b6000806040838503121561060f57600080fd5b6106188361055f565b91506106266020840161055f565b90509250929050565b634e487b7160e01b600052600160045260246000fd5b634e487b7160e01b600052601160045260246000fd5b60008282101561066d5761066d610645565b500390565b6000821982111561068557610685610645565b50019056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa264697066735822122002051c03b9e6486c5b21b4c14e6ea0627a710175b0142fc40ce30042333632a464736f6c634300080a0033"
// QtumContractFactory is required to be used instead of standard ethers ContractFactory due to how contract addresses are computed differently
const simpleStore = new ContractFactory(ABI, BYTECODE, signer);

// simpleStore deployment example, returns address
async function deployToken() {
    const deployment = await simpleStore.deploy({
        gasLimit: "0x7a120", // 500,000
        gasPrice: "0x190" // in WEI OR Satoshis
    });
    await deployment.deployed();
    return deployment.address
}
// connect to QRC20 token and interact with it 
async function transferToken(contractAddress, from, to, value) {
    const qrc20 = new Contract(contractAddress, QRC_ABI, signer)
    const name = await qrc20.transfer(from, to, value,
        {
            gasLimit: "0x62521", // 62521
            gasPrice: "0x5d21dba000", // in WEI OR Satoshis (0x190)
        }
    );
}

const contractAddress = await deployToken();
await transferToken(contractAddress, "0x...", "0x...", 1);

// sending QTUM
await signer.sendTransaction({
    to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
    from: signer.address,
    gasLimit: "0x3d090",
    gasPrice: "0x190",
    // in Satoshis
    value: "0xfffff",
    data: "",
});
```

# Signing/recovering messages

QTUM uses compressed public keys to generate addresses so you need to use our modified `recoverAddress` instead of `ethers.utils.recoverAddress`.

Uncompressed keys are supported as well, it uses the recovery parameter to identify if an uncompressed key was used.

Hash message also uses a different message prefix than Ethereum, it uses `\15QTUM Signed Message:\n`

# VRS Signature format

Ethereum serializes signautres as RSV while Bitcoin/Qtum uses VRS, this library supports both formats. The signatures are identical except for how they are serialized, they reference the same points on the elliptic curve.

```js
import {
    computeAddress,
    hashMessage,
    messagePrefix,
    recoverAddress,
    recoverAddressBtc,
} from "qtum-ethers-wrapper";

const message = "1234";
const digest = hashMessage(message);
const signedMessageRSV = await signer.signMessage(message);
const signedMessageVRS = await signer.signMessageBtc(message);
const recoveredRSV = recoverAddress(digest, signedMessageRSV);
const recoveredVRS = recoverAddressBtc(digest, signedMessageVRS);
if (recoveredRSV !== recoveredVRS) {
    throw new Error("Expected identical addresses");
}
```

# Idempotency

Idempotency in Bitcoin forks involves tying logic to specific UTXO inputs or re-sending the raw serialized transaction and re-crafting a new transaction if that one fails.

This can be done by specifying inputs to use and a special nonce.

The nonce is a hash of each UTXO input in the created transaction.

You will need to keep track of what inputs are attached to what transaction and you can continue sending the transaction

```js
const tx = await signer.sendTransaction({
    to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
    from: signer.address,
    gasLimit: "0x3d090",
    gasPrice: "0x190",
    // in Satoshis
    value: "0xfffff",
    data: "",
});
console.log("Generated hash of inputs:", tx.nonce);
console.log("Inputs of transaction:", JSON.stringify(tx.inputs));
console.log("bitcoinjs-lib decoded transaction:", tx.decoded);
console.log("raw serialized signed transaction:", tx.signedTransaction);
// save the signed transaction to your database
// you can re-send the signed transaction as many times as you want and it will always be idempotent
// send the transaction and get a transaction response
const transactionResponse = await tx.sendTransaction();

// re-send the raw signed transaction
const transactionResponse = await provider.sendTransaction(tx.signedTransaction);

// create a transaction while requiring specific inputs
const txWithoutInputRequirements = await signer.sendTransactionIdempotent({
    to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
    from: signer.address,
    gasLimit: "0x3d090",
    gasPrice: "0x190",
    // in Satoshis
    value: "0xfffff",
    data: "",
});
console.log("Created transaction that uses these inputs:", JSON.stringify(txWithoutInputRequirements.inputs));
console.log("Use this nonce to throw if the exact same inputs are not used:", txWithoutInputRequirements.nonce);
const txWithInputRequirement = await signer.sendTransactionIdempotent({
    to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
    from: signer.address,
    gasLimit: "0x3d090",
    gasPrice: "0x190",
    // in Satoshis
    value: "0xfffff",
    data: "",
    // you can specify inputs here or when creating an instance of QtumWallet
    inputs: txWithoutInputRequirements.inputs,
    // throw unless inputs match exactly
    nonce: txWithoutInputRequirements.nonce,
});
const txReceipt = await txWithInputRequirement.sendTransaction();
```

# Notes

- Issues

Qtum estimate gas function is not perfect so eth_estimateGas has a 20% buffer for gas limit

Janus doesn't return a transaction receipt for p2pkh tx's

This extension works with p2pk and p2pkh scripts only and asks Janus for p2pk and p2pkh scripts only
