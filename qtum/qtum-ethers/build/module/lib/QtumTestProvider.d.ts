import { Wallet } from 'ethers';
import { QtumProvider } from "./QtumProvider";
export interface RecordedCall {
    readonly address: string | undefined;
    readonly data: string;
}
export interface IProviderOptions {
    account_keys_path?: string;
    accounts?: object[];
    allowUnlimitedContractSize?: boolean;
    blockTime?: number;
    db_path?: string;
    debug?: boolean;
    default_balance_ether?: number;
    fork?: string | object;
    fork_block_number?: string | number;
    forkCacheSize?: number;
    gasLimit?: string | number;
    gasPrice?: string;
    hardfork?: "byzantium" | "constantinople" | "petersburg" | "istanbul" | "muirGlacier";
    hd_path?: string;
    locked?: boolean;
    logger?: {
        log(msg: string): void;
    };
    mnemonic?: string;
    network_id?: number;
    networkId?: number;
    url?: string;
    port?: number;
    seed?: any;
    time?: Date;
    total_accounts?: number;
    unlocked_accounts?: string[];
    verbose?: boolean;
    vmErrorsOnRPCResponse?: boolean;
    ws?: boolean;
}
export declare class QtumTestProvider extends QtumProvider {
    private wallets;
    private _callHistory;
    constructor(options?: IProviderOptions | undefined);
    prepareRequest(method: any, params: any): [string, Array<any>];
    getWallets(): Wallet[];
    createEmptyWallet(): Wallet;
    clearCallHistory(): void;
    get callHistory(): RecordedCall[];
}
