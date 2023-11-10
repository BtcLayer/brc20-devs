import { HDNode } from '@ethersproject/hdnode';
import { configureQtumAddressGeneration } from './helpers/utils';
import { QtumWallet } from './QtumWallet';
export class QtumHDKey {
    constructor(hdkey) {
        this._hdkey = hdkey;
        configureQtumAddressGeneration(hdkey);
    }
    static fromMasterSeed(seedBuffer) {
        const hdnode = configureQtumAddressGeneration(HDNode.fromSeed("0x" + seedBuffer.toString('hex')));
        return new QtumHDKey(hdnode);
    }
    static fromExtendedKey(base58Key) {
        const hdnode = configureQtumAddressGeneration(HDNode.fromExtendedKey("0x" + base58Key));
        return new QtumHDKey(hdnode);
    }
    privateExtendedKey() {
        if (!this._hdkey.privateKey) {
            throw new Error('This is a public key only wallet');
        }
        return Buffer.from(this._hdkey.extendedKey);
    }
    publicExtendedKey() {
        return Buffer.from(this._hdkey.neuter().extendedKey);
    }
    derivePath(path) {
        return new QtumHDKey(configureQtumAddressGeneration(HDNode.fromExtendedKey(this._hdkey.extendedKey).derivePath(path)));
    }
    deriveChild(index) {
        return new QtumHDKey(
        // @ts-ignore
        configureQtumAddressGeneration(HDNode.fromExtendedKey(this._hdkey.extendedKey)._derive(index)));
    }
    getWallet() {
        return new QtumWallet(configureQtumAddressGeneration(HDNode.fromExtendedKey(this._hdkey.extendedKey)));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXR1bUhES2V5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9RdHVtSERLZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFMUMsTUFBTSxPQUFPLFNBQVM7SUFhbEIsWUFBWSxLQUFhO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFiRCxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQWtCO1FBQ3BDLE1BQU0sTUFBTSxHQUFHLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLE9BQU8sSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBaUI7UUFDcEMsTUFBTSxNQUFNLEdBQUcsOEJBQThCLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN4RixPQUFPLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFPRCxrQkFBa0I7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ3ZEO1FBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELGlCQUFpQjtRQUNiLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxVQUFVLENBQUMsSUFBWTtRQUNuQixPQUFPLElBQUksU0FBUyxDQUNoQiw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ25HLENBQUM7SUFDTixDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQWE7UUFDckIsT0FBTyxJQUFJLFNBQVM7UUFDaEIsYUFBYTtRQUNiLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDakcsQ0FBQztJQUNOLENBQUM7SUFFRCxTQUFTO1FBQ0wsT0FBTyxJQUFJLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNHLENBQUM7Q0FDSiJ9