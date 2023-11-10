/// <reference types="node" />
import { HDNode } from "@ethersproject/hdnode";
declare const bigi: any;
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { Signature, SignatureLike } from "@ethersproject/bytes";
import { Transaction } from "@ethersproject/transactions";
import { BigNumberish } from "ethers";
import { Bytes, BytesLike } from "ethers/lib/utils";
import { QtumTransactionRequest } from './IntermediateWallet';
export interface SerializeOptions {
    filterDust: boolean;
    disableConsumingUtxos: boolean;
    ignoreInputs: Array<string>;
    inputs: Array<string>;
}
export interface ListUTXOs {
    address: string;
    txid: string;
    vout: number;
    amount: string;
    safe: boolean;
    spendable: boolean;
    solvable: boolean;
    label: string;
    type: string;
    confirmations: number;
    scriptPubKey: string;
    redeemScript: string;
}
export interface TxVinWithNullScriptSig {
    txid: Buffer;
    hash: Buffer;
    vout: number;
    sequence: number;
    script: Buffer;
    scriptSig: null;
}
export interface TxVinWithoutNullScriptSig {
    txid: Buffer;
    hash: Buffer;
    vout: number;
    sequence: number;
    script: Buffer;
    scriptSig: Buffer;
}
export interface CloneTxVin {
    txid: Buffer;
    hash: Buffer;
    vout: number;
    sequence: number;
    script: Buffer;
    scriptSig: null;
}
export interface TxVout {
    script: Buffer;
    value: number;
}
export interface CloneTx {
    version: number;
    locktime: number;
    vins: Array<TxVinWithNullScriptSig | TxVinWithoutNullScriptSig>;
    vouts: Array<TxVout>;
}
export interface Tx {
    version: number;
    locktime: number;
    vins: Array<TxVinWithNullScriptSig | TxVinWithoutNullScriptSig>;
    vouts: Array<TxVout>;
}
export interface CheckTransactionType {
    transactionType: number;
    neededAmount: any;
}
export declare function calcTxBytes(vins: Array<TxVinWithoutNullScriptSig | TxVinWithNullScriptSig>, vouts: Array<TxVout>): number;
export declare function txToBuffer(tx: any): Buffer;
export declare function signp2pkh(tx: any, vindex: number, privKey: string): Promise<Buffer>;
export declare function signp2pkhWith(tx: any, vindex: number, signer: Function): Promise<Buffer>;
export declare function p2pkScriptSig(sig: any): Buffer;
export declare function p2pkScript(pubKey: Buffer): Buffer;
export declare function p2pkhScriptSig(sig: any, pubkey: any): Buffer;
export declare function p2pkhScript(hash160PubKey: Buffer): Buffer;
export declare function contractTxScript(contractAddress: string, gasLimit: number, gasPrice: number, encodedData: string): Buffer;
export declare function generateContractAddress(txid: string): string;
export declare function addVins(outputs: Array<any>, spendableUtxos: Array<ListUTXOs>, neededAmount: string, needChange: boolean, gasPriceString: string, hash160PubKey: string, publicKey: string): Promise<Array<any>>;
export declare function getMinNonDustValue(input: ListUTXOs, feePerByte: BigNumberish): number;
export declare function parseSignedTransaction(transaction: string): Transaction;
export declare function computeAddress(key: BytesLike | string, compressed?: boolean): string;
export declare function computeAddressFromPublicKey(publicKey: string): string;
export declare function configureQtumAddressGeneration(hdnode: HDNode): HDNode;
export declare function checkTransactionType(tx: TransactionRequest): CheckTransactionType;
export declare function serializeTransaction(utxos: Array<any>, fetchUtxos: Function, neededAmount: string, tx: QtumTransactionRequest, transactionType: number, privateKey: string, publicKey: string, opts?: SerializeOptions): Promise<string>;
export declare function serializeTransactionWith(utxos: Array<any>, fetchUtxos: Function, neededAmount: string, tx: QtumTransactionRequest, transactionType: number, signer: Function, publicKey: string, opts?: SerializeOptions): Promise<string>;
/**
 * Reverses UTXO hash to get the transaction id for a UTXO
 * @param hash UTXO hash
 * @returns transaction id
 */
export declare function getTxIdFromHash(hash: string): string;
export declare function reverseBuffer(buffer: Buffer): Buffer;
export declare const messagePrefix = "\u0015Qtum Signed Message:\n";
export declare function hashMessage(message: Bytes | string): string;
export declare function verifyMessage(message: Bytes | string, signature: SignatureLike): string;
export declare function verifyMessageBtc(message: Bytes | string, signature: SignatureLike): string;
export declare function verifyHash(message: Bytes | string, signature: SignatureLike): string;
export declare function verifyHashBtc(message: Bytes | string, signature: SignatureLike): string;
export declare function recoverPublicKey(digest: BytesLike, signature: SignatureLike, vrs?: boolean): string;
export declare function recoverAddress(digest: BytesLike, signature: SignatureLike): string;
export declare function recoverAddressBtc(digest: BytesLike, signature: SignatureLike): string;
export declare function verifyTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, signature: SignatureLike): string;
export declare function verifyTypedDataBtc(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, signature: SignatureLike): string;
/**
 * Converts a `Buffer` into a `0x`-prefixed hex `String`.
 * @param buf `Buffer` object to convert
 */
export declare const bufferToHex: (buf: Buffer) => string;
/**
 * Converts a {@link Buffer} to a {@link bigint}
 */
export declare function bufferToBigInt(buf: Buffer): typeof bigi;
/**
 * Converts a `Buffer` to a `Number`.
 * @param buf `Buffer` object to convert
 * @throws If the input number exceeds 53 bits.
 */
export declare const bufferToInt: (buf: Buffer) => number;
export declare function splitSignatureRSV(buf: SignatureLike): Signature;
export declare function splitSignatureVRS(buf: SignatureLike): Signature;
export declare type encodeSignatureType = (signature: Uint8Array, recovery: number, compressed: boolean) => Buffer;
export declare function encodeSignatureRSV(signature: Uint8Array, recovery: number, compressed: boolean): Buffer;
export declare function encodeCompactVRS(signature: Uint8Array, recovery: number, compressed: boolean): Buffer;
export {};
