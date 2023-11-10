// @ts-nocheck
import { getAddress } from "@ethersproject/address";
import { Provider, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { ExternallyOwnedAccount, Signer, TypedDataDomain, TypedDataField, TypedDataSigner } from "@ethersproject/abstract-signer";
import { arrayify, Bytes, BytesLike, concat, hexDataSlice, isHexString, joinSignature, SignatureLike, splitSignature } from "@ethersproject/bytes";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { toUtf8Bytes } from "@ethersproject/strings";
import { defaultPath, HDNode, entropyToMnemonic, Mnemonic } from "@ethersproject/hdnode";
import { keccak256 } from "@ethersproject/keccak256";
import { Deferrable, defineReadOnly, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { randomBytes } from "@ethersproject/random";
import { recoverPublicKey, SigningKey } from "@ethersproject/signing-key";
import { decryptJsonWallet, decryptJsonWalletSync, encryptKeystore, ProgressCallback } from "@ethersproject/json-wallets";
import {
    serialize,
    UnsignedTransaction,
    AccessListish,
    computeAddress as computeEthereumAddress,
} from "@ethersproject/transactions";
import { Wordlist } from "@ethersproject/wordlists";
import { computeAddress, computeAddressFromPublicKey, hashMessage, encodeCompactVRS, encodeSignatureRSV, encodeSignatureType } from "./utils"
import { Logger } from "@ethersproject/logger";
import secp256k1 from "secp256k1";
import wif from 'wif';
import { Transaction } from "bitcoinjs-lib";
import { BigNumberish } from "ethers";
import { TypedDataUtils } from '@metamask/eth-sig-util';
export const version = "wallet/5.1.0";
const logger = new Logger(version);

const allowedTransactionKeys: Array<string> = [
    "accessList", "chainId", "data", "from", "gasLimit", "gasPrice", "nonce", "to", "type", "value", "inputs"
];

type Constructor<T> = { new (): T }

function isAccount(value: any): value is ExternallyOwnedAccount {
    return (value != null && isHexString(value.privateKey, 32) && value.address != null);
}

function hasMnemonic(value: any): value is { mnemonic: Mnemonic } {
    const mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}

/**
 * Idempotency in Bitcoin forks requires spending the same Bitcoin inputs
 * As long as one of the inputs has already been spent, then the request will fail
 * This also means that sending multiple transactions in the same block requires
 * that you specify which inputs to avoid for subsequent transactions so that
 * you are not trying to double-spend the same inputs as the blockchain will
 * reject one of the requests and you won't necessarily know which one will
 * get rejected
 * (this is how you would overwrite a transaction in the mempool - by increasing the fee)
 */
export interface IdempotentRequest {
    // The nonce is the keccak hash of the sorted spent inputs
    nonce: string,
    // The list of inputs (txid OR hash) that are to be spent by this transaction
    // (t)
    // including this is optional for idempotency
    // as when specifying the nonce, the transaction will throw
    // if different inputs are used
    inputs: Array<string>,
    // The TransactionRequest with the updated nonce
    transaction: QtumTransactionRequest,
    signedTransaction: string,
    // Send the transaction after storing the nonce somewhere for later requests
    sendTransaction: () => Promise<TransactionResponse>,
}

export interface InputNonces {
    nonce: string,
    inputs: Array<string>,
    decoded: Transaction,
}

export interface Idempotent {
    getIdempotentNonce(signedTransaction: string): InputNonces,
    sendTransactionIdempotent(transaction: Deferrable<QtumTransactionRequest>): Promise<IdempotentRequest>,
}

export type QtumTransactionRequest = TransactionRequest & {
    inputs?: Array<string>;
}

// Created this class due to address being read only and unwriteable from derived classes.
export abstract class IntermediateWallet extends Signer implements ExternallyOwnedAccount, TypedDataSigner, Idempotent {

    readonly address: string;
    readonly provider: Provider;
    readonly compressed: boolean;

    // Wrapping the _signingKey and _mnemonic in a getter function prevents
    // leaking the private key in console.log; still, be careful! :)
    readonly _signingKey: () => SigningKey;
    readonly _mnemonic: () => Mnemonic;

    constructor(privateKey: BytesLike | ExternallyOwnedAccount | SigningKey, provider?: Provider) {
        super();

        let compressed = true;

        if (isAccount(privateKey)) {
            const signingKey = new SigningKey(privateKey.privateKey);
            defineReadOnly(this, "_signingKey", () => signingKey);
            defineReadOnly(this, "address", computeAddress(this.publicKey, true));

            if (getAddress(this.address) !== getAddress(privateKey.qtumAddress || privateKey.address)) {
                if (getAddress(computeEthereumAddress(this.publicKey)) === getAddress(privateKey.qtumAddress || privateKey.address)) {
                    logger.throwArgumentError("privateKey/address mismatch: Your address is being generated the ethereum way, please use QTUM address generation scheme", "privateKey", "[REDACTED]");
                } else {
                    logger.throwArgumentError("privateKey/address mismatch", "privateKey", "[REDACTED]");
                }
            }

            if (hasMnemonic(privateKey)) {
                const srcMnemonic = privateKey.mnemonic;
                defineReadOnly(this, "_mnemonic", () => (
                    {
                        phrase: srcMnemonic.phrase,
                        path: srcMnemonic.path || defaultPath,
                        locale: srcMnemonic.locale || "en"
                    }
                ));
                const mnemonic = this.mnemonic;
                const node = HDNode.fromMnemonic(mnemonic.phrase, null, mnemonic.locale).derivePath(mnemonic.path);
                if (computeAddress(node.privateKey, true) !== this.address) {
                    logger.throwArgumentError("mnemonic/address mismatch", "privateKey", "[REDACTED]");
                }
            } else {
                defineReadOnly(this, "_mnemonic", (): Mnemonic => null);
            }


        } else {
            if (SigningKey.isSigningKey(privateKey)) {
                /* istanbul ignore if */
                if (privateKey.curve !== "secp256k1") {
                    logger.throwArgumentError("unsupported curve; must be secp256k1", "privateKey", "[REDACTED]");
                }
                defineReadOnly(this, "_signingKey", () => (<SigningKey>privateKey));

            } else {
                // A lot of common tools do not prefix private keys with a 0x (see: #1166)
                if (typeof(privateKey) === "string") {
                    if (privateKey.match(/^[0-9a-f]*$/i) && privateKey.length === 64) {
                        privateKey = "0x" + privateKey;
                    }
                }

                try {
                    if (!privateKey.startsWith("0x")) {
                        let decodedKey = wif.decode(privateKey);
                        compressed = decodedKey.compressed;
                        privateKey = '0x' + decodedKey.privateKey.toString("hex");
                    }
                } catch (e) {
                    // not WIF format
                }

                const signingKey = new SigningKey(privateKey);
                defineReadOnly(this, "_signingKey", () => signingKey);
            }

            defineReadOnly(this, "_mnemonic", (): Mnemonic => null);
            defineReadOnly(this, "address", computeAddressFromPublicKey(compressed ? this.compressedPublicKey : this.publicKey));
            this.compressed = compressed;
        }

        /* istanbul ignore if */
        if (provider && !Provider.isProvider(provider)) {
            logger.throwArgumentError("invalid provider", "provider", provider);
        }

        defineReadOnly(this, "provider", provider || null);
    }

    get mnemonic(): Mnemonic { return this._mnemonic(); }
    get privateKey(): string { return this._signingKey().privateKey; }
    get publicKey(): string { return this._signingKey().publicKey; }
    get compressedPublicKey(): string { return this._signingKey().compressedPublicKey; }

    getAddress(): Promise<string> {
        return Promise.resolve(this.address);
    }

    connect<T extends typeof IntermediateWallet>(provider: Provider): InstanceType<T> {
        return new this.__proto__.constructor(this, provider);
    }

    checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
        for (const key in transaction) {
            if (allowedTransactionKeys.indexOf(key) === -1) {
                logger.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }

        const tx = shallowCopy(transaction);

        if (tx.from == null) {
            tx.from = this.getAddress();
        } else {
            // Make sure any provided address matches this signer
            tx.from = Promise.all([
                Promise.resolve(tx.from),
                this.getAddress()
            ]).then((result) => {
                if (result[0].toLowerCase() !== result[1].toLowerCase()) {
                    logger.throwArgumentError("from address mismatch", "transaction", transaction);
                }
                return result[0];
            });
        }

        return tx;
    }

    signTransaction(transaction: QtumTransactionRequest): Promise<string> {
        return resolveProperties(transaction).then((tx) => {
            if (tx.from != null) {
                if (getAddress(tx.from) !== this.address) {
                    logger.throwArgumentError("transaction from address mismatch", "transaction.from", transaction.from);
                }
                delete tx.from;
            }

            const signature = this._signingKey().signDigest(keccak256(serialize(<UnsignedTransaction>tx)));
            return serialize(<UnsignedTransaction>tx, signature);
        });
    }

    signMessage(message: Bytes | string): Promise<string> {
        const digest = hashMessage(message);
        return this.signHash(arrayify(digest));
    }

    signMessageBtc(message: Bytes | string): Promise<string> {
        const digest = hashMessage(message);
        return this.signHashBtc(arrayify(digest));
    }

    signHash(message: Bytes | string): Promise<string> {
        return this._signHash(message, encodeSignatureRSV);
    }

    signHashBtc(message: Bytes | string): Promise<string> {
        return this._signHash(message, encodeCompactVRS);
    }

    private async _signHash(message: Bytes | string, encoder: encodeSignatureType): Promise<string> {
        if (typeof(message) === "string") {
            if (message.startsWith("0x")) {
                message = arrayify(message)
            } else {
                message = toUtf8Bytes(message);
            }
        }
        const sigObj = secp256k1.ecdsaSign(message, Buffer.from(this.privateKey.slice(2), "hex"));
        return encoder(
            sigObj.signature,
            sigObj.recid,
            this.compressed,
        );
    }

    _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this._signTypedDataWith(domain, types, value, encodeSignatureRSV);
    }

    _signTypedDataBtc(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
        return this._signTypedDataWith(domain, types, value, encodeCompactVRS);
    }

    private async _signTypedDataWith(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, encoder: encodeSignatureType): Promise<string> {
        // Populate any ENS names
        const populated = await _TypedDataEncoder.resolveNames(domain, types, value, (name: string) => {
            if (this.provider == null) {
                logger.throwError("cannot resolve ENS names without a provider", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "resolveName",
                    value: name
                });
            }
            return this.provider.resolveName(name);
        });

        return await this._signHash(_TypedDataEncoder.hash(populated.domain, types, populated.value), encoder);
    }

    abstract getIdempotentNonce(signedTransaction: string): InputNonces;

    sendTransactionIdempotent(transaction: Deferrable<QtumTransactionRequest>): Promise<IdempotentRequest> {
        this._checkProvider("sendTransaction");
        return this.populateTransaction(transaction).then((tx) => {
            return this.signTransaction(tx).then((signedTx) => {
                const nonce = this.getIdempotentNonce(signedTx);
                tx.nonce = nonce.nonce;
                // @ts-ignore 
                tx.inputs = nonce.inputs;
                return {
                    nonce: nonce.nonce,
                    inputs: nonce.inputs,
                    transaction: tx,
                    signedTransaction: signedTx,
                    sendTransaction: () => this.provider.sendTransaction(signedTx),
                };
            });
        });
    }

    encrypt(password: Bytes | string, options?: any, progressCallback?: ProgressCallback): Promise<string> {
        if (typeof(options) === "function" && !progressCallback) {
            progressCallback = options;
            options = {};
        }

        if (progressCallback && typeof(progressCallback) !== "function") {
            throw new Error("invalid callback");
        }

        if (!options) { options = {}; }

        return encryptKeystore(this, password, options, progressCallback);
    }


    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): IntermediateWallet {
        let entropy: Uint8Array = randomBytes(16);

        if (!options) { options = { }; }

        if (options.extraEntropy) {
            entropy = arrayify(hexDataSlice(keccak256(concat([ entropy, options.extraEntropy ])), 0, 16));
        }

        const mnemonic = entropyToMnemonic(entropy, options.locale);
        return IntermediateWallet.fromMnemonic(mnemonic, options.path, options.locale);
    }

    static fromEncryptedJson(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<IntermediateWallet> {
        return decryptJsonWallet(json, password, progressCallback).then((account) => {
            return new IntermediateWallet(account);
        });
    }

    static fromEncryptedJsonSync(json: string, password: Bytes | string): IntermediateWallet {
        return new IntermediateWallet(decryptJsonWalletSync(json, password));
    }

    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): IntermediateWallet {
        if (!path) { path = defaultPath; }
        return new IntermediateWallet(HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path));
    }
}
