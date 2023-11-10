"use strict";
// const { keccak256 } = require("ethers/lib/utils");
// @ts-nocheck
const { expect } = require("chai");
const { QtumWallet } = require("../../build/main/lib/QtumWallet");
const { QtumProvider } = require("../../build/main/lib/QtumProvider");
const { recoverAddress, recoverAddressBtc, hashMessage, verifyMessage, verifyMessageBtc, verifyTypedData, verifyTypedDataBtc, splitSignatureRSV, splitSignatureVRS, swapSignatureRS, } = require("../../build/main/lib/helpers/utils");
const { _TypedDataEncoder } = require("@ethersproject/hash");
const provider = new QtumProvider("http://localhost:23890");
const { arrayify } = require("@ethersproject/bytes");
const { keccak256 } = require("ethers/lib/utils");
// hash160PubKey/address -> 0xcdf409a70058bfc54ada1ee3422f1ef28d0d267d
const compressedSigner = new QtumWallet("L1je6aiLCNwPNeeGwgSBfDcobnokp64HzaUZGBV7dZQB1fmsCSBR", provider);
const uncompressedSigner = new QtumWallet("5KJm4eP8sAwW6J29LpMpJsEPJJMWaNdfY12RFN4Vsyoj6qfKe64", provider);
describe("Utils", function () {
    // compressed private keys are the default
    // therefore, uncompressed private keys require specifying that the key is uncompressed
    // you can do that by passing in the address or 'false'
    describe("Encoding Decoding Signatures", function () {
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
            describe(signers[i].name, function () {
                it("recoverAddress", async function () {
                    const message = "1234";
                    const digest = hashMessage(message);
                    const address = await signers[i].signer.getAddress();
                    const signedMessage = await signers[i].signer.signMessage(message);
                    const recovered = recoverAddress(digest, signedMessage);
                    expect(recovered).to.equal(address, "Recovered wrong address");
                });
                describe("RSV - (Ethereum Signature Format)", function () {
                    it("splitSignatureRSV", async function () {
                        const signatureWithoutPrefix = (await signers[i].signer.signMessage("test")).toString('hex');
                        const signature = "0x" + signatureWithoutPrefix;
                        const r = "0x" + signatureWithoutPrefix.substring(0, 64);
                        const s = "0x" + signatureWithoutPrefix.substring(64, 128);
                        const v = parseInt(signatureWithoutPrefix.substring(128, 130), 16);
                        const split = splitSignatureRSV(arrayify(signature));
                        expect(split.r).to.equal(r, "R value incorrect");
                        expect(split.s).to.equal(s, "S value incorrect");
                        expect(split.v).to.equal(v, "V value incorrect");
                    });
                    it("signMessage", async function () {
                        const message = "test";
                        const signature = await signers[i].signer.signMessage(message);
                        const recovered = verifyMessage(message, signature);
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                    it("_signTypedData", async function () {
                        const signature = await signers[i].signer._signTypedData(msgParams.domain, msgParams.types, msgParams.message);
                        const recovered = verifyTypedData(msgParams.domain, msgParams.types, msgParams.message, splitSignatureRSV(signature));
                        expect(recovered).to.equal(verifyTypedData(msgParams.domain, msgParams.types, msgParams.message, signature), "verifyTypedData should work without splitSignatureRSV");
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                });
                describe("VRS - (Qtum Signature Format)", function () {
                    it("splitSignatureVRS", async function () {
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
                    it("signMessageBtc", async function () {
                        const message = "test";
                        const signature = await signers[i].signer.signMessageBtc(message);
                        const recovered = verifyMessageBtc(message, signature);
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                    it("_signTypedDataBtc", async function () {
                        const signature = await signers[i].signer._signTypedDataBtc(msgParams.domain, msgParams.types, msgParams.message);
                        const recovered = verifyTypedDataBtc(msgParams.domain, msgParams.types, msgParams.message, splitSignatureVRS(signature));
                        expect(recovered).to.equal(verifyTypedDataBtc(msgParams.domain, msgParams.types, msgParams.message, signature), "verifyTypedDataBtc should work without splitSignatureVRS");
                        expect(recovered).to.equal(signers[i].signer.address, "Recovered wrong address");
                    });
                });
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbHMudGVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdGVzdHMvVXRpbHMudGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFEQUFxRDtBQUVyRCxjQUFjO0FBQ2QsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDbEUsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBQ3RFLE1BQU0sRUFDRixjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLFdBQVcsRUFDWCxhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixlQUFlLEdBQ2xCLEdBQUcsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxFQUFFLGlCQUFpQixFQUFFLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDN0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDckQsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRWxELHNFQUFzRTtBQUN0RSxNQUFNLGdCQUFnQixHQUFHLElBQUksVUFBVSxDQUNuQyxzREFBc0QsRUFDdEQsUUFBUSxDQUNYLENBQUM7QUFFRixNQUFNLGtCQUFrQixHQUFHLElBQUksVUFBVSxDQUNyQyxxREFBcUQsRUFDckQsUUFBUSxDQUNYLENBQUM7QUFFRixRQUFRLENBQUMsT0FBTyxFQUFFO0lBQ2QsMENBQTBDO0lBQzFD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