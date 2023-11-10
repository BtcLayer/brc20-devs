/// <reference types="node" />
import { SerializeOptions } from './helpers/utils';
import { InputNonces, IntermediateWallet, QtumTransactionRequest } from './helpers/IntermediateWallet';
import { ProgressCallback } from "@ethersproject/json-wallets";
import { Bytes } from "@ethersproject/bytes";
import { Wordlist } from "@ethersproject/wordlists";
export declare const QTUM_BIP44_PATH = "m/44'/88'/0'/0/0";
export declare const SLIP_BIP44_PATH = "m/44'/2301'/0'/0/0";
export declare const defaultPath = "m/44'/2301'/0'/0/0";
export interface QtumWalletOptions {
    filterDust: boolean;
    disableConsumingUtxos: boolean;
    ignoreInputs: Array<string>;
    inputs: Array<string>;
    nonce: string;
}
export declare class IdempotencyError extends Error {
    constructor(message: string);
}
export declare class QtumWallet extends IntermediateWallet {
    private opts;
    private readonly qtumProvider?;
    constructor(privateKey: any, provider?: any, opts?: QtumWalletOptions);
    protected serializeTransaction(utxos: Array<any>, neededAmount: string, tx: QtumTransactionRequest, transactionType: number, opts?: SerializeOptions): Promise<string>;
    getIdempotentNonce(serializedHexTransaction: string): InputNonces;
    /**
     * Override to build a raw QTUM transaction signing UTXO's
     */
    signTransaction(transaction: QtumTransactionRequest): Promise<string>;
    getUtxos(from?: string, neededAmount?: number, types?: string[]): Promise<any[]>;
    private do;
    getPrivateKey(): Buffer;
    getPrivateKeyString(): string;
    getPublicKey(): Buffer;
    getPublicKeyString(): string;
    getAddressBuffer(): Buffer;
    getAddressString(): string;
    getChecksumAddressString(): string;
    static fromPrivateKey(privateKey: string): QtumWallet;
    /**
     *  Static methods to create Wallet instances.
     */
    static createRandom(options?: any): IntermediateWallet;
    static fromEncryptedJson(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<IntermediateWallet>;
    static fromEncryptedJsonSync(json: string, password: Bytes | string): IntermediateWallet;
    /**
     * Create a QtumWallet from a BIP44 mnemonic
     * @param mnemonic
     * @param path QTUM uses two different derivation paths and recommends SLIP_BIP44_PATH for external wallets, core wallets use QTUM_BIP44_PATH
     * @param wordlist
     * @returns
     */
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): IntermediateWallet;
}
