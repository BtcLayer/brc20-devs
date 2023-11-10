/// <reference types="node" />
import { BN } from "bn.js";
import { QtumWallet } from "./QtumWallet";
export interface Address {
    equals(address: Address): boolean;
    isZero(): boolean;
    isPrecompileOrSystemAddress(): boolean;
    toString(): string;
    toBuffer(): Buffer;
}
export interface TxData {
    nonce: typeof BN;
    gasLimit: typeof BN;
    gasPrice: typeof BN;
    to?: Address;
    value: typeof BN;
    data: Buffer;
    v: typeof BN;
    r: typeof BN;
    s: typeof BN;
    type: any;
}
export declare class QtumTransaction {
    private tx?;
    readonly nonce: typeof BN;
    readonly gasLimit: typeof BN;
    readonly gasPrice: typeof BN;
    readonly to?: Address;
    readonly value: typeof BN;
    readonly data: Buffer;
    readonly v?: typeof BN;
    readonly r?: typeof BN;
    readonly s?: typeof BN;
    constructor(txData: TxData);
    static fromTxData(txData: TxData): QtumTransaction;
    sign(privateKey: QtumWallet): Promise<QtumTransaction>;
    serialize(): Buffer;
}
