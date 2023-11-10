/// <reference types="node" />
import { HDNode } from '@ethersproject/hdnode';
import { QtumWallet } from './QtumWallet';
export declare class QtumHDKey {
    private readonly _hdkey;
    static fromMasterSeed(seedBuffer: Buffer): QtumHDKey;
    static fromExtendedKey(base58Key: string): QtumHDKey;
    constructor(hdkey: HDNode);
    privateExtendedKey(): Buffer;
    publicExtendedKey(): Buffer;
    derivePath(path: string): QtumHDKey;
    deriveChild(index: number): QtumHDKey;
    getWallet(): QtumWallet;
}
