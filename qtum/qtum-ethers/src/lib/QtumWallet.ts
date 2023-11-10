import {
    resolveProperties,
    Logger,
} from "ethers/lib/utils";
import { BigNumber } from "bignumber.js"
import { BigNumber as BigNumberEthers/*, providers*/ } from "ethers";
import {
    configureQtumAddressGeneration,
    checkTransactionType,
    serializeTransaction,
    SerializeOptions
} from './helpers/utils'
import { GLOBAL_VARS } from './helpers/global-vars'
import { InputNonces, IntermediateWallet, QtumTransactionRequest } from './helpers/IntermediateWallet'
import { decryptJsonWallet, decryptJsonWalletSync, ProgressCallback } from "@ethersproject/json-wallets";
import { HDNode, entropyToMnemonic } from "@ethersproject/hdnode";
import { arrayify, Bytes, concat, hexDataSlice } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/random";
import { keccak256 } from "@ethersproject/keccak256";
import { Wordlist } from "@ethersproject/wordlists";
import { Transaction, TxInput } from "bitcoinjs-lib";
import { QtumProvider } from "./QtumProvider";

const logger = new Logger("QtumWallet");
const forwardErrors = [
    Logger.errors.INSUFFICIENT_FUNDS
];

const minimumGasPriceInGwei = "0x9502f9000";
const minimumGasPriceInWei = "0x5d21dba000";

// Qtum core wallet and electrum use coin 88
export const QTUM_BIP44_PATH = "m/44'/88'/0'/0/0";
// Other wallets use coin 2301
// for more details, see: https://github.com/satoshilabs/slips/pull/196
export const SLIP_BIP44_PATH = "m/44'/2301'/0'/0/0";
export const defaultPath = SLIP_BIP44_PATH;
const minimumGasPrice = "0x9502f9000";

export interface QtumWalletOptions {
    // filter dust (inputs that cost more to spend than they are worth)
    filterDust: boolean,
    // by default, there is an internal 45 second cooldown on spending inputs
    // this allows sent transactions to be included in a block and show up in qtumd apis
    // as being spent inputs so that they won't be re-used
    disableConsumingUtxos: boolean,
    // list of input hashs + vout indexes to ignore when creating transactions
    ignoreInputs: Array<string>,
    // list of inputs from which to use (if not used)
    // adding this to individual transaction requests will override this value
    // specifying them here allows you to specify inputs with libraries that for example
    // interact directly with ethersjs and you are unable to modify the transaction request
    inputs: Array<string>,
    nonce: string,
}

export class IdempotencyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IdempotencyError';
    }
}

export class QtumWallet extends IntermediateWallet {

    private opts: QtumWalletOptions;
    private readonly qtumProvider?: QtumProvider;

    constructor(privateKey: any, provider?: any, opts?: QtumWalletOptions) {
        if (provider && provider.filterDust) {
            opts = provider;
            provider = undefined;
        }
        if (provider && !provider.getUtxos) {
            // throw new Error("QtumWallet provider requires getUtxos method: see QtumProvider")
        }
        super(privateKey, provider);
        this.qtumProvider = provider;
        this.opts = opts || {} as QtumWalletOptions;
    }

    protected async serializeTransaction(utxos: Array<any>, neededAmount: string, tx: QtumTransactionRequest, transactionType: number, opts?: SerializeOptions): Promise<string> {
        return await serializeTransaction(
            utxos,
            // @ts-ignore
            (amount) => this.provider.getUtxos(tx.from, amount),
            neededAmount,
            tx,
            transactionType,
            this.privateKey,
            this.compressedPublicKey,
            opts,
        );
    }

    getIdempotentNonce(serializedHexTransaction: string): InputNonces {
        const transaction = Transaction.fromHex(serializedHexTransaction);
        const inputs = transaction.ins.slice();
        inputs.sort((a: TxInput, b: TxInput) => a.hash.compare(b.hash));

        return {
            nonce: keccak256(
                inputs.reduce(
                    (accumulator: string, currentValue: TxInput) => accumulator + currentValue.hash.toString('hex') + String(currentValue.index).padStart(8, '0'),
                    "0x",
                )
            ),
            inputs: inputs.reduce(
                (accumulator: Array<string>, currentValue: TxInput) => {
                    let hash = currentValue.hash.toString('hex');
                    if (hash.indexOf("0x") !== 0) {
                        hash = "0x" + hash;
                    }
                    accumulator.push(hash + String(currentValue.index).padStart(8, '0'));
                    return accumulator;
                },
                [],
            ),
            decoded: transaction,
        };
    }

    /**
     * Override to build a raw QTUM transaction signing UTXO's
     */
    async signTransaction(transaction: QtumTransactionRequest): Promise<string> {
        let gasBugFixed = true;
        if (!this.provider) {
          throw new Error("No provider set, cannot sign transaction");
        }
        // @ts-ignore
        if (this.provider.isClientVersionGreaterThanEqualTo) {
            // @ts-ignore
            gasBugFixed = await this.provider.isClientVersionGreaterThanEqualTo(0, 2, 0);
        } else {
            throw new Error("Must use QtumProvider");
        }

        const augustFirst2022 = 1659330000000;
        const mayThirtith2022 = 1653886800000;
        const now = new Date().getTime();
        const requireFixedJanus = now > augustFirst2022;
        const message = "You are using an outdated version of Janus that has a bug that qtum-ethers-wrapper works around, " +
            "please upgrade your Janus instance and if you have hardcoded gas price in your dapp to update it to " +
            minimumGasPriceInWei + " - if you use eth_gasPrice then nothing else should be required other than updating Janus. " +
            "this message will become an error August 1st 2022 when using Janus instances lower than version 0.2.0";
        if (!gasBugFixed) {
            if (requireFixedJanus) {
                throw new Error(message);
            } else if (now > mayThirtith2022) {
                logger.warn(message);
            }
        }
        if (!transaction.gasPrice) {
            let gasPrice = minimumGasPriceInWei;
            if (!gasBugFixed) {
                gasPrice = minimumGasPriceInGwei;
            }
            // 40 satoshi in WEI
            // 40 => 40000000000
            // transaction.gasPrice = "0x9502f9000";
            // 40 => 400000000000
            // transaction.gasPrice = "0x5d21dba000";
            transaction.gasPrice = gasPrice;
        } else if (gasBugFixed) {
            if (requireFixedJanus) {
                // no work arounds after aug 1st 2022, worst case: this just means increased gas prices (10x) and shouldn't cause any other issues
                if (transaction.gasPrice  === minimumGasPriceInGwei) {
                    // hardcoded 400 gwei gas price
                    // adjust it to be the proper amount and log an error
                    transaction.gasPrice = minimumGasPriceInWei;
                }
            }
        }

        const inSatoshi = BigNumberEthers.from(transaction.gasPrice).lt(BigNumberEthers.from('100000'));
        if (!inSatoshi && BigNumberEthers.from(transaction.gasPrice).lt(BigNumberEthers.from(minimumGasPrice))) {
            throw new Error(
                "Gas price is too low (" + transaction.gasPrice + " - " + BigNumberEthers.from(transaction.gasPrice).toString() +
                "), it needs to be greater than " + minimumGasPrice +
                " (" + BigNumberEthers.from(minimumGasPrice).toString() + ") wei"
            );
        }

        const gasPriceExponent = inSatoshi ? 'e-0' : (gasBugFixed ? 'e-10' : 'e-9');
        // convert gasPrice into satoshi
        let gasPrice = new BigNumber(BigNumberEthers.from(transaction.gasPrice).toString() + gasPriceExponent);
        transaction.gasPrice = gasPrice.toNumber();

        const tx = await resolveProperties(transaction);

        // Refactored to check TX type (call, create, p2pkh, deploy error) and calculate needed amount
        const { transactionType, neededAmount } = checkTransactionType(tx);

        // Check if the transactionType matches the DEPLOY_ERROR, throw error else continue
        if (transactionType === GLOBAL_VARS.DEPLOY_ERROR) {
            return logger.throwError(
                "You cannot send QTUM while deploying a contract. Try deploying again without a value.",
                Logger.errors.NOT_IMPLEMENTED,
                {
                    error: "You cannot send QTUM while deploying a contract. Try deploying again without a value.",
                }
            );
        }

        let utxos = [];
        try {
            utxos = await this.getUtxos(tx.from, neededAmount, ["p2pk", "p2pkh"]);
        } catch (error: any) {
            if (forwardErrors.indexOf(error.code) >= 0) {
                throw error;
            }
            return logger.throwError(
                "Needed amount of UTXO's exceed the total you own.",
                Logger.errors.INSUFFICIENT_FUNDS,
                {
                    error: error,
                }
            );
        }

        const serializedTransaction = await this.serializeTransaction(utxos, neededAmount, tx, transactionType, this.opts as SerializeOptions);

        const nonce = (this.opts.nonce || transaction.nonce);
        if (nonce) {
            const nonceString = nonce + '';
            if (nonceString.length === 66 && nonceString.startsWith('0x')) {
                const inputNonces = this.getIdempotentNonce(serializedTransaction);
                if (inputNonces.nonce !== nonce) {
                    throw new IdempotencyError("Idempotency error, mismatching inputs, got: " + inputNonces.nonce + " requested: " + nonce);
                }
            }
        }

        return serializedTransaction;
    }

    async getUtxos(from?: string, neededAmount?: number, types: string[] = ["p2pk", "p2pkh"]): Promise<any[]> {
        const params = [from, neededAmount, ...types];
        if (!this.qtumProvider) {
            throw new Error("No provider defined");
        }

        const result = await this.do("qtum_qetUTXOs", params);
        if (result) {
            if (result instanceof Array) {
                return result as any[];
            } else {
                return [result];
            }
        }

        return [];
    }

    private do(payload: any, params: any[]): Promise<unknown> {
        // @ts-ignore
        if (this.provider.prepareRequest) {
            // @ts-ignore
            const args = this.provider.prepareRequest(payload,  params);

            if (args) {
                payload = {
                    method: args[0],
                    params: args[1],
                };
                params = args[1];
            }
        }

        // @ts-ignore
        if (this.provider?.request) {
            // @ts-ignore
            return this.provider.request(payload, {params});
        }

        const next = (method: string): Promise<unknown> => {
            return new Promise((resolve, reject) => {
                // @ts-ignore
                this.provider[method](
                    {
                        method: payload.method,
                        params: payload.params,
                    },
                    undefined,
                    (err: Error, result: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    },
                );
            });
        }

        // @ts-ignore
        if (this.provider?.handleRequest) {
            return next('handleRequest');
        // @ts-ignore
        } else if (this.provider?.sendAsync) {
            return next('sendAsync');
        }

        return Promise.reject(new Error("Unsupported provider"));
    }

    getPrivateKey(): Buffer {
        return Buffer.from(this.privateKey);
    }

    getPrivateKeyString(): string {
        return this.privateKey
    }

    getPublicKey(): Buffer {
        return Buffer.from(this.publicKey);
    }

    getPublicKeyString(): string {
        return this.publicKey;
    }

    getAddressBuffer(): Buffer {
        return Buffer.from(this.getAddressString());
    }

    getAddressString(): string {
        return (this.address || '').toLowerCase();
    }

    getChecksumAddressString(): string {
        return this.address;
    }

    static fromPrivateKey(privateKey: string): QtumWallet {
        return new QtumWallet(privateKey);
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
        return QtumWallet.fromMnemonic(mnemonic, options.path, options.locale);
    }

    static fromEncryptedJson(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<IntermediateWallet> {
        return decryptJsonWallet(json, password, progressCallback).then((account) => {
            return new QtumWallet(account);
        });
    }

    static fromEncryptedJsonSync(json: string, password: Bytes | string): IntermediateWallet {
        return new QtumWallet(decryptJsonWalletSync(json, password));
    }

    /**
     * Create a QtumWallet from a BIP44 mnemonic
     * @param mnemonic
     * @param path QTUM uses two different derivation paths and recommends SLIP_BIP44_PATH for external wallets, core wallets use QTUM_BIP44_PATH
     * @param wordlist
     * @returns
     */
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): IntermediateWallet {
        if (!path) { path = defaultPath; }
        const hdnode = HDNode.fromMnemonic(mnemonic, "", wordlist).derivePath(path)
        return new QtumWallet(configureQtumAddressGeneration(hdnode));
    }
}
