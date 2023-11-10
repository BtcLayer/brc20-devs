// @ts-nocheck
const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("ethers")
const { QtumWallet } = require("../../build/main/lib/QtumWallet");
const { QtumProvider } = require("../../build/main/lib/QtumProvider");
const {
    QtumContractFactory,
} = require("../../build/main/lib/QtumContractFactory");
const { generateContractAddress, computeAddress } = require('../../build/main/lib/helpers/utils')

const QRC20_BYTECODE = "608060405267016345785d8a000060005534801561001c57600080fd5b5060008054338252600160205260409091205561064e8061003e6000396000f3006080604052600436106100a35763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306fdde0381146100a8578063095ea7b31461013257806318160ddd1461016a57806323b872dd14610191578063313ce567146101bb5780635a3b7e42146101e657806370a08231146101fb57806395d89b411461021c578063a9059cbb14610231578063dd62ed3e14610255575b600080fd5b3480156100b457600080fd5b506100bd61027c565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100f75781810151838201526020016100df565b50505050905090810190601f1680156101245780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561013e57600080fd5b50610156600160a060020a03600435166024356102b3565b604080519115158252519081900360200190f35b34801561017657600080fd5b5061017f61036c565b60408051918252519081900360200190f35b34801561019d57600080fd5b50610156600160a060020a0360043581169060243516604435610372565b3480156101c757600080fd5b506101d061049b565b6040805160ff9092168252519081900360200190f35b3480156101f257600080fd5b506100bd6104a0565b34801561020757600080fd5b5061017f600160a060020a03600435166104d7565b34801561022857600080fd5b506100bd6104e9565b34801561023d57600080fd5b50610156600160a060020a0360043516602435610520565b34801561026157600080fd5b5061017f600160a060020a03600435811690602435166105dd565b60408051808201909152600881527f5152432054455354000000000000000000000000000000000000000000000000602082015281565b600082600160a060020a03811615156102cb57600080fd5b8215806102f95750336000908152600260209081526040808320600160a060020a0388168452909152902054155b151561030457600080fd5b336000818152600260209081526040808320600160a060020a03891680855290835292819020879055805187815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060019392505050565b60005481565b600083600160a060020a038116151561038a57600080fd5b83600160a060020a03811615156103a057600080fd5b600160a060020a03861660009081526002602090815260408083203384529091529020546103ce90856105fa565b600160a060020a03871660008181526002602090815260408083203384528252808320949094559181526001909152205461040990856105fa565b600160a060020a038088166000908152600160205260408082209390935590871681522054610438908561060c565b600160a060020a0380871660008181526001602090815260409182902094909455805188815290519193928a16927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a350600195945050505050565b600881565b60408051808201909152600981527f546f6b656e20302e310000000000000000000000000000000000000000000000602082015281565b60016020526000908152604090205481565b60408051808201909152600381527f5154430000000000000000000000000000000000000000000000000000000000602082015281565b600082600160a060020a038116151561053857600080fd5b3360009081526001602052604090205461055290846105fa565b3360009081526001602052604080822092909255600160a060020a0386168152205461057e908461060c565b600160a060020a0385166000818152600160209081526040918290209390935580518681529051919233927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35060019392505050565b600260209081526000928352604080842090915290825290205481565b60008183101561060657fe5b50900390565b60008282018381101561061b57fe5b93925050505600a165627a7a723058205a85b8080447e6cd22c9bed1d6191938dd5fc3c5076a23629371c7cd6770576b0029"

const SIMPLEBANK_ABI = [
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "LogDepositMade",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "balance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "deposit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "depositsBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "enroll",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "withdrawAmount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "remainingBal",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

const SIMPLEBANK_BYTECODE = "608060405234801561001057600080fd5b50600280546001600160a01b031916331790556000805460ff1916905561028c8061003c6000396000f3fe6080604052600436106100555760003560e01c8063138fbe711461005a5780632e1a7d4d146100815780638da5cb5b146100ab578063b69ef8a8146100dc578063d0e30db0146100f1578063e65f2a7e146100f9575b600080fd5b34801561006657600080fd5b5061006f61010e565b60408051918252519081900360200190f35b34801561008d57600080fd5b5061006f600480360360208110156100a457600080fd5b5035610112565b3480156100b757600080fd5b506100c061017e565b604080516001600160a01b039092168252519081900360200190f35b3480156100e857600080fd5b5061006f61018d565b61006f6101a0565b34801561010557600080fd5b5061006f610204565b4790565b3360009081526001602052604081205482116101695733600081815260016020526040808220805486900390555184156108fc0291859190818181858888f19350505050158015610167573d6000803e3d6000fd5b505b50503360009081526001602052604090205490565b6002546001600160a01b031681565b3360009081526001602052604090205490565b336000818152600160209081526040808320805434908101909155815190815290519293927fa8126f7572bb1fdeae5b5aa9ec126438b91f658a07873f009d041ae690f3a193929181900390910190a2503360009081526001602052604090205490565b60008054600360ff9091161015610243576000805460ff198116600160ff928316810190921617825533825260205260409020678ac7230489e8000090555b50336000908152600160205260409020549056fea265627a7a723158205098a98dd8e3ed9f67c9b25ab91302536280403498af2496b001d2763e4ac3e464736f6c63430005110032"

const QRC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "standard",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    }
];

const provider = new QtumProvider("http://localhost:23890");

// hash160PubKey/address -> 0xcdf409a70058bfc54ada1ee3422f1ef28d0d267d
const signer = new QtumWallet(
    "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
    provider
);
const signerNoCache = new QtumWallet(
    "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
    provider,
    {
        disableConsumingUtxos: true,
    }
);
// hash160PubKey/address -> 0x30a41759e2fec594fbb90ea2b212c9ef8074e227
const signerNoQtum = new QtumWallet(
    "61fd08e21110d908cf8dc20bb243a96e2dc0d29169b4fec09594c39e4384125a",
    provider
);

describe("QtumWallet", function () {

    it("supports compressed private keys", async function() {
        const privateKeys = [
            {
                privateKey: 'L1je6aiLCNwPNeeGwgSBfDcobnokp64HzaUZGBV7dZQB1fmsCSBR',
                hex: '0x48B5B7cD428FD14023F50015D464786aB87bE806',
                compressed: true,
            },
            {
                privateKey: '5KJm4eP8sAwW6J29LpMpJsEPJJMWaNdfY12RFN4Vsyoj6qfKe64',
                hex: '0x48b5bB19A8Ed2b5a014cab6d9F886021C6Ef9065',
                compressed: false,
            },
        ];

        for (const { privateKey, hex, compressed } of privateKeys) {
            const qtumWallet = new QtumWallet(privateKey)
            expect(qtumWallet.address).to.equal(hex, "Got incorrect address from private key: " + privateKey);
        }
    })
    it("can send valid transactions to hash160 addresses", async function () {
        // sending to 0x7926223070547D2D15b2eF5e7383E541c338FfE9
        // note: no tx receipt here
        await signer.sendTransaction({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            data: "",
        });
    });
    it("creates identical signed transactions", async function() {
        const a = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });
        const b = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        expect(a.signedTransaction).to.equal(b.signedTransaction, "expected identical tx");
    });
    it("fails when explicitly specifying zero inputs", async function() {
        try {
            await signerNoCache.sendTransactionIdempotent({
                to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
                from: signer.address,
                gasLimit: "0x3d090",
                gasPrice: "0x190",
                value: "0xfffff",
                nonce: 1000,
                data: "",
                inputs: [],
            });
            throw new Error("Expected transaction creation to fail with no inputs specified");
        } catch (e) {
            // expected
        }
    });
    it("QtumWallet allows specifying/ignoring inputs", async function() {
        const a = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        const ignoredInputsSigner = new QtumWallet(
            "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
            provider,
            {
                disableConsumingUtxos: true,
                ignoreInputs: a.inputs,
            }
        );

        const b = await ignoredInputsSigner.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        const c = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
            inputs: b.inputs,
        });

        expect(a.signedTransaction).to.not.equal(c.signedTransaction, "created identical tx");
        expect(JSON.stringify(b.inputs)).to.equal(JSON.stringify(c.inputs), "expected identical inputs");
        expect(JSON.stringify(a.inputs)).to.not.equal(JSON.stringify(c.inputs), "got identical inputs");
    });
    it("allows specifying inputs as a signed transaction", async function() {
        const a = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        const ignoredInputsSigner = new QtumWallet(
            "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
            provider,
            {
                disableConsumingUtxos: true,
                ignoreInputs: a.inputs,
            }
        );

        const b = await ignoredInputsSigner.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        const c = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
            inputs: [b.signedTransaction],
        });

        expect(a.signedTransaction).to.not.equal(c.signedTransaction, "created identical tx");
        expect(JSON.stringify(b.inputs)).to.equal(JSON.stringify(c.inputs), "expected identical inputs");
        expect(JSON.stringify(a.inputs)).to.not.equal(JSON.stringify(c.inputs), "got identical inputs");
    });
    it("allows enforces hashes of inputs as nonce", async function() {
        const a = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        const nonceSigner = new QtumWallet(
            "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
            provider,
            {
                disableConsumingUtxos: true,
                nonce: a.nonce,
            }
        );

        const b = await nonceSigner.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            data: "",
        });

        const nonceSignerIgnoredInputs = new QtumWallet(
            "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
            provider,
            {
                disableConsumingUtxos: true,
                nonce: a.nonce,
                ignoreInputs: a.inputs,
            }
        );

        let success = true;
        try {
            await nonceSignerIgnoredInputs.sendTransactionIdempotent({
                to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
                from: signer.address,
                gasLimit: "0x3d090",
                gasPrice: "0x190",
                value: "0xfffff",
                data: "",
            });
        } catch (e) {
            expect(e.name).to.equal('IdempotencyError', "Got wrong error type");
            success = false;
        }

        success = true;
        try {
            const signerIgnoredInputs = new QtumWallet(
                "99dda7e1a59655c9e02de8592be3b914df7df320e72ce04ccf0427f9a366ec6e",
                provider,
                {
                    disableConsumingUtxos: true,
                    ignoreInputs: a.inputs,
                }
            );

            await signerIgnoredInputs.sendTransactionIdempotent({
                to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
                from: signer.address,
                gasLimit: "0x3d090",
                gasPrice: "0x190",
                value: "0xfffff",
                data: "",
                nonce: a.nonce,
            });
        } catch (e) {
            expect(e.name).to.equal('IdempotencyError', "Got wrong error type");
            success = false;
        }

        expect(success).to.equal(false, "expected error here");
    });
    it("can send valid transactions to hash160 addresses idempotently", async function () {
        // sending to 0x7926223070547D2D15b2eF5e7383E541c338FfE9
        // note: no tx receipt here
        const idempotent = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            nonce: 1000,
            data: "",
        });

        // craft a second transaction with the same inputs but with -1 value so its not identical
        const idempotentWithReusedInputs = await signerNoCache.sendTransactionIdempotent({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xffffe",
            nonce: 1000,
            data: "",
            inputs: idempotent.inputs,
        });

        expect(idempotent.signedTransaction).to.not.equal(idempotentWithReusedInputs.signedTransaction, "created identical tx");

        const idempotentTransactionReceipt = await idempotent.sendTransaction();
        await idempotentTransactionReceipt.wait(1);
        try {
            const txReceipt = await idempotentWithReusedInputs.sendTransaction();
            await txReceipt.wait(1);
            throw new Error("double spend");
        } catch (e) {
            expect(e).to.not.equal(undefined, "expected error");
        }

        try {
            const tx = await signerNoCache.sendTransaction({
                to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
                from: signer.address,
                gasLimit: "0x3d090",
                gasPrice: "0x190",
                value: "0xfffff",
                data: "",
                // inputs: idempotent.inputs,
                nonce: idempotent.nonce,
            });
            await tx.wait(1);
            throw new Error("expected IdempotencyError");
        } catch (e) {
            expect(e.name).to.equal('IdempotencyError', "Got wrong error type");
        }

        await signer.sendTransaction({
            to: "0x7926223070547D2D15b2eF5e7383E541c338FfE9",
            from: signer.address,
            gasLimit: "0x3d090",
            gasPrice: "0x190",
            value: "0xfffff",
            data: "",
            // fake nonce ignored by the idempotency functionality
            nonce: 10000,
        });

        // test sending duplicate signed tx
        const txResponse = await provider.sendTransaction(idempotent.signedTransaction);
    });
    it("can call getAddress method with a valid private key provided to the signer", async function () {
        const address = await signer.getAddress();
        expect(address).to.equal(signer.address)
    });
    it("can connect to SimpleBank and call a payable method", async function () {
        const simpleBank = new QtumContractFactory(SIMPLEBANK_ABI, SIMPLEBANK_BYTECODE, signer);
        const deployment = await simpleBank.deploy({
            gasLimit: "0x2dc6c0", gasPrice: "0x190"
        });
        expect(deployment.address).to.equal(`0x${generateContractAddress(deployment.deployTransaction.hash.split("0x")[1])}`)
        await deployment.deployed();
        const deposit = await deployment.deposit({
            gasLimit: "0x2dc6c0", gasPrice: "0x190", value: "0xfffff"
        });
        await deposit.wait()
    });
    it("can connect to QRC20 ", async function () {
        const qrc20 = new QtumContractFactory(QRC20_ABI, QRC20_BYTECODE, signer);
        const deployment = await qrc20.deploy({
            gasLimit: "0x2dc6c0", gasPrice: "0x190"
        });
        expect(deployment.address).to.equal(`0x${generateContractAddress(deployment.deployTransaction.hash.split("0x")[1])}`)
        const tx = await deployment.deployed();
        const qrc200 = new ethers.Contract(tx.address, QRC20_ABI, signer);
        const name = await qrc200.name({ gasPrice: "0x190" });
        console.log(name, tx.address)
        expect(name).to.equal("QRC TEST");
    });
    it("can transfer QRC20 ", async function () {
        const qrc20 = new QtumContractFactory(QRC20_ABI, QRC20_BYTECODE, signer);
        const deployment = await qrc20.deploy({
            gasLimit: "0x2dc6c0", gasPrice: "0x190"
        });
        expect(deployment.address).to.equal(`0x${generateContractAddress(deployment.deployTransaction.hash.split("0x")[1])}`)
        const tx = await deployment.deployed();
        const qrc200 = new ethers.Contract(tx.address, QRC20_ABI, signer);
        await qrc200.transfer("0x30a41759e2fec594fbb90ea2b212c9ef8074e227", 1, { gasPrice: "0x190" });
        // console.log(name, tx.address)
        // expect(name).to.equal("QRC TEST");
    });
})