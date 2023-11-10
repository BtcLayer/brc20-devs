import { HDNode } from '@ethersproject/hdnode';
import { configureQtumAddressGeneration } from './helpers/utils';
import { QtumWallet } from './QtumWallet';

export class QtumHDKey {
    private readonly _hdkey: HDNode;

    static fromMasterSeed(seedBuffer: Buffer): QtumHDKey {
        const hdnode = configureQtumAddressGeneration(HDNode.fromSeed("0x" + seedBuffer.toString('hex')));
        return new QtumHDKey(hdnode);
    }

    static fromExtendedKey(base58Key: string): QtumHDKey {
        const hdnode = configureQtumAddressGeneration(HDNode.fromExtendedKey("0x" + base58Key));
        return new QtumHDKey(hdnode);
    }

    constructor(hdkey: HDNode) {
        this._hdkey = hdkey;
        configureQtumAddressGeneration(hdkey);
    }

    privateExtendedKey(): Buffer {
        if (!this._hdkey.privateKey) {
            throw new Error('This is a public key only wallet');
        }
        return Buffer.from(this._hdkey.extendedKey);
    }

    publicExtendedKey(): Buffer {
        return Buffer.from(this._hdkey.neuter().extendedKey);
    }

    derivePath(path: string): QtumHDKey {
        return new QtumHDKey(
            configureQtumAddressGeneration(HDNode.fromExtendedKey(this._hdkey.extendedKey).derivePath(path))
        );
    }

    deriveChild(index: number): QtumHDKey {
        return new QtumHDKey(
            // @ts-ignore
            configureQtumAddressGeneration(HDNode.fromExtendedKey(this._hdkey.extendedKey)._derive(index))
        );
    }

    getWallet(): QtumWallet {
        return new QtumWallet(configureQtumAddressGeneration(HDNode.fromExtendedKey(this._hdkey.extendedKey)));
    }
}