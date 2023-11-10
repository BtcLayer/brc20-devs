// @ts-nocheck
const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("ethers")
const { QtumWallet } = require("../../build/main/lib/QtumWallet");
const { QtumProvider } = require("../../build/main/lib/QtumProvider");
const {
    QtumContractFactory,
} = require("../../build/main/lib/QtumContractFactory");
const { generateContractAddress } = require('../../build/main/lib/helpers/utils')
const BYTECODE = "608060405234801561001057600080fd5b506040516020806100f2833981016040525160005560bf806100336000396000f30060806040526004361060485763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166360fe47b18114604d5780636d4ce63c146064575b600080fd5b348015605857600080fd5b5060626004356088565b005b348015606f57600080fd5b506076608d565b60408051918252519081900360200190f35b600055565b600054905600a165627a7a7230582049a087087e1fc6da0b68ca259d45a2e369efcbb50e93f9b7fa3e198de6402b810029"
const ABI = [{ "inputs": [], "name": "get", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "x", "type": "uint256" }], "name": "set", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
const provider = new QtumProvider("http://localhost:23890");

// hash160PubKey/address -> 0xcdf409a70058bfc54ada1ee3422f1ef28d0d267d
const signer = new QtumWallet(
    "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
    provider
);
// hash160PubKey/address -> 0x30a41759e2fec594fbb90ea2b212c9ef8074e227
const signerNoQtum = new QtumWallet(
    "61fd08e21110d908cf8dc20bb243a96e2dc0d29169b4fec09594c39e4384125a",
    provider
);

describe("QtumContractFactory", function () {
    it("should deploy correctly given the deployer has enough QTUM to cover gas", async function () {
        const simpleStore = new QtumContractFactory(ABI, BYTECODE, signer);
        const deployment = await simpleStore.deploy({
            gasLimit: "0x2dc6c0", gasPrice: "0x190"
        });
        expect(deployment.address).to.equal(`0x${generateContractAddress(deployment.deployTransaction.hash.split("0x")[1])}`)
        await deployment.deployed();
        const getVal = await deployment.get({
            gasLimit: "0x2dc6c0", gasPrice: "0x190"
        });
        expect(BigNumber.from(getVal).toNumber()).to.equal(BigNumber.from("0x00").toNumber());
        const setVal = await deployment.set(1001, {
            gasLimit: "0x2dc6c0", gasPrice: "0x190"
        });
        await setVal.wait()
        expect(BigNumber.from(getVal).toNumber()).to.equal(BigNumber.from("0x00").toNumber());
    });
    it("can be connected to a QtumWallet signer.", async function () {
        const simpleStore = new QtumContractFactory(ABI, BYTECODE);
        const connectedSimpleStore = simpleStore.connect(signer);
        if (!!connectedSimpleStore.signer) {
            const deployment = await connectedSimpleStore.deploy({
                gasLimit: "0x2dc6c0",
                gasPrice: "0x190",
            });
            expect(!!deployment.address, "true");
            await deployment.deployed();
            const getVal = await deployment.get({
                gasLimit: "0x2dc6c0", gasPrice: "0x190"
            });
            expect(BigNumber.from(getVal).toNumber()).to.equal(BigNumber.from("0x00").toNumber());
        }
    });
    it("should reject if the deployer tries sending a value", async function () {
        const simpleStore = new QtumContractFactory(ABI, BYTECODE, signer);
        try {
            await simpleStore.deploy({
                gasLimit: "0x2dc6c0", gasPrice: "0x190", value: "0xffffff"
            });
        } catch (err) {
            expect(err.reason).to.equal("You cannot send QTUM while deploying a contract. Try deploying again without a value.")
        }
    });
    it("should fail as the deployer has no UTXOs to spend", async function () {
        const simpleStore = new QtumContractFactory(ABI, BYTECODE, signerNoQtum);
        try {
            await simpleStore.deploy({
                gasLimit: "0x2dc6c0", gasPrice: "0x190"
            });
        } catch (err) {
            expect(err.reason).to.equal("Needed amount of UTXO's exceed the total you own.")
        }
    });
})
