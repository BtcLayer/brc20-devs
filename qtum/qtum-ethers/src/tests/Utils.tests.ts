// const { keccak256 } = require("ethers/lib/utils");

// @ts-nocheck
const { expect } = require("chai");
const { QtumWallet } = require("../../build/main/lib/QtumWallet");
const { QtumProvider } = require("../../build/main/lib/QtumProvider");
const {
    recoverAddress,
    recoverAddressBtc,
    hashMessage,
    verifyMessage,
    verifyMessageBtc,
    verifyTypedData,
    verifyTypedDataBtc,
    splitSignatureRSV,
    splitSignatureVRS,
    swapSignatureRS,
} = require("../../build/main/lib/helpers/utils");
const { _TypedDataEncoder } = require("@ethersproject/hash");
const provider = new QtumProvider("http://localhost:23890");
const { arrayify } = require("@ethersproject/bytes");
const { keccak256 } = require("ethers/lib/utils");

// hash160PubKey/address -> 0xcdf409a70058bfc54ada1ee3422f1ef28d0d267d
const compressedSigner = new QtumWallet(
    "L1je6aiLCNwPNeeGwgSBfDcobnokp64HzaUZGBV7dZQB1fmsCSBR",
    provider
);

const uncompressedSigner = new QtumWallet(
    "5KJm4eP8sAwW6J29LpMpJsEPJJMWaNdfY12RFN4Vsyoj6qfKe64",
    provider
);

describe("Utils", function () {
    // compressed private keys are the default
    // therefore, uncompressed private keys require specifying that the key is uncompressed
    // you can do that by passing in the address or 'false'

    describe("Encoding Decoding Signatures", function() {
        let signers = [{
            name: "Uncompressed Private Key",
            signer: uncompressedSigner,
        }, {
            name: "Compressed Private Key",
            signer: compressedSigner,
        }];

        const chainId = 8889;

        const domain = {
            name: 'MyToken',
            version: '1',
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
            chainId,
        };

        const EIP712Domain = [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'verifyingContract', type: 'address' },
            { name: 'chainId', type: 'uint256' },
        ];

        const permit = {
            owner: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
            spender: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
            value: 3000,
            nonce: 0,
            deadline: 50000000000,
        };

        const Permit = [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ];

        const msgParams = {
            types: {
                /*
                EIP712Domain,
                */
                Permit,
            },
            primaryType: 'Permit',
            domain,
            message: permit,
        };

        for (let i = 0; i < signers.length; i++) {
            describe(signers[i].name, function() {
                it("recoverAddress", async function () {
                    const message = "1234";
                    const digest = hashMessage(message);
                    const address = await signers[i].signer.getAddress();
                    const signedMessage = await signers[i].signer.signMessage(message);
                    const recovered = recoverAddress(digest, signedMessage);
                    expect(recovered).to.equal(address, "Recovered wrong address")
                });

                describe("RSV - (Ethereum Signature Format)", function() {
                    it("splitSignatureRSV", async function() {
                        const signatureWithoutPrefix = (await signers[i].signer.signMessage("test")).toString('hex');
                        const signature = "0x" + signatureWithoutPrefix

                        const r = "0x" + signatureWithoutPrefix.substring(0, 64);
                        const s = "0x" + signatureWithoutPrefix.substring(64, 128);
                        const v = parseInt(signatureWithoutPrefix.substring(128, 130), 16);

                        const split = splitSignatureRSV(arrayify(signature));
                        expect(split.r).to.equal(r, "R value incorrect");
                        expect(split.s).to.equal(s, "S value incorrect");
                        expect(split.v).to.equal(v, "V value incorrect");
                    });
                    it("signMessage", async function() {
                        const message = "test";
                        const signature = await signers[i].signer.signMessage(message);
                        const recovered = verifyMessage(message, signature);
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                    it("_signTypedData", async function() {
                        const signature = await signers[i].signer._signTypedData(msgParams.domain, msgParams.types, msgParams.message);
                        const recovered = verifyTypedData(msgParams.domain, msgParams.types, msgParams.message, splitSignatureRSV(signature));
                        expect(recovered).to.equal(verifyTypedData(msgParams.domain, msgParams.types, msgParams.message, signature), "verifyTypedData should work without splitSignatureRSV");
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                })

                describe("VRS - (Qtum Signature Format)", function() {
                    it("splitSignatureVRS", async function() {
                        const signatureBtcWithoutPrefix = (await signers[i].signer.signMessageBtc("test")).toString('hex');
                        const signatureBtc = "0x" + signatureBtcWithoutPrefix;

                        const vBtc = parseInt(signatureBtcWithoutPrefix.substring(0, 2), 16);
                        const rBtc = "0x" + signatureBtcWithoutPrefix.substring(2, 66);
                        const sBtc = "0x" + signatureBtcWithoutPrefix.substring(66, 130);

                        const split = splitSignatureVRS(arrayify(signatureBtc));
                        expect(split.r).to.equal(rBtc, "R value incorrect");
                        expect(split.s).to.equal(sBtc, "S value incorrect");
                        expect(split.v).to.equal(vBtc, "V value incorrect");
                    });
                    it("signMessageBtc", async function() {
                        const message = "test";
                        const signature = await signers[i].signer.signMessageBtc(message);
                        const recovered = verifyMessageBtc(message, signature);
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                    it("_signTypedDataBtc", async function() {
                        const signature = await signers[i].signer._signTypedDataBtc(msgParams.domain, msgParams.types, msgParams.message);
                        const recovered = verifyTypedDataBtc(msgParams.domain, msgParams.types, msgParams.message, splitSignatureVRS(signature));
                        expect(recovered).to.equal(verifyTypedDataBtc(msgParams.domain, msgParams.types, msgParams.message, signature), "verifyTypedDataBtc should work without splitSignatureVRS");
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                });
            });
        }
    })

})
