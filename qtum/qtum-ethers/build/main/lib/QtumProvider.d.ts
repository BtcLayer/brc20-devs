import { providers } from "ethers";
import { Network, Networkish } from "@ethersproject/networks";
import type { JSONRPCResponsePayload } from "ethereum-protocol";
export interface ClientVersion {
    name: string;
    version?: string;
    major?: number;
    minor?: number;
    patch?: number;
    system?: string;
}
interface EIP1993RequestArguments {
    readonly method: string;
    readonly params?: any[];
}
declare type Callback = (err: Error | undefined | null, result?: JSONRPCResponsePayload) => void;
declare const QtumProvider_base: {
    new (...args: any[]): {
        sendAsync(payload: EIP1993RequestArguments, cb: Callback): void;
        handleRequest(payload: EIP1993RequestArguments, _: Callback, end: Callback): void;
        request(payload: EIP1993RequestArguments): Promise<unknown>;
        /**
         * Override for QTUM parsing of transaction
         * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
         */
        sendTransaction(signedTransaction: string | Promise<string>): Promise<providers.TransactionResponse>;
        isClientVersionGreaterThanEqualTo(major: number, minor: number, patch: number): Promise<boolean>;
        getClientVersion(): Promise<ClientVersion>;
        /**
         * Function to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        getUtxos(from: string, neededAmount?: number | undefined): Promise<any>;
        /**
         * Override to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        prepareRequest(method: any, params: any): [string, any[]];
    };
} & typeof providers.JsonRpcProvider;
export declare class QtumProvider extends QtumProvider_base {
}
declare const QtumJsonRpcProvider_base: {
    new (...args: any[]): {
        sendAsync(payload: EIP1993RequestArguments, cb: Callback): void;
        handleRequest(payload: EIP1993RequestArguments, _: Callback, end: Callback): void;
        request(payload: EIP1993RequestArguments): Promise<unknown>;
        /**
         * Override for QTUM parsing of transaction
         * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
         */
        sendTransaction(signedTransaction: string | Promise<string>): Promise<providers.TransactionResponse>;
        isClientVersionGreaterThanEqualTo(major: number, minor: number, patch: number): Promise<boolean>;
        getClientVersion(): Promise<ClientVersion>;
        /**
         * Function to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        getUtxos(from: string, neededAmount?: number | undefined): Promise<any>;
        /**
         * Override to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        prepareRequest(method: any, params: any): [string, any[]];
    };
} & typeof providers.JsonRpcProvider;
export declare class QtumJsonRpcProvider extends QtumJsonRpcProvider_base {
}
declare const QtumWebSocketProvider_base: {
    new (...args: any[]): {
        sendAsync(payload: EIP1993RequestArguments, cb: Callback): void;
        handleRequest(payload: EIP1993RequestArguments, _: Callback, end: Callback): void;
        request(payload: EIP1993RequestArguments): Promise<unknown>;
        /**
         * Override for QTUM parsing of transaction
         * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
         */
        sendTransaction(signedTransaction: string | Promise<string>): Promise<providers.TransactionResponse>;
        isClientVersionGreaterThanEqualTo(major: number, minor: number, patch: number): Promise<boolean>;
        getClientVersion(): Promise<ClientVersion>;
        /**
         * Function to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        getUtxos(from: string, neededAmount?: number | undefined): Promise<any>;
        /**
         * Override to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        prepareRequest(method: any, params: any): [string, any[]];
    };
} & typeof providers.WebSocketProvider;
export declare class QtumWebSocketProvider extends QtumWebSocketProvider_base {
}
interface HandleRequest {
    handleRequest(payload: EIP1993RequestArguments, next: any, end: any): void;
}
declare class ProviderSubprovider extends providers.BaseProvider {
    providerSubprovider: HandleRequest;
    _eventLoopCache: Record<string, Promise<any>>;
    get _cache(): Record<string, Promise<any> | null>;
    constructor(providerSubprovider: HandleRequest, network?: Networkish);
    send(method: string, params: Array<any>): Promise<any>;
    detectNetwork(): Promise<Network>;
    _uncachedDetectNetwork(): Promise<Network>;
}
declare const QtumProviderSubprovider_base: {
    new (...args: any[]): {
        sendAsync(payload: EIP1993RequestArguments, cb: Callback): void;
        handleRequest(payload: EIP1993RequestArguments, _: Callback, end: Callback): void;
        request(payload: EIP1993RequestArguments): Promise<unknown>;
        /**
         * Override for QTUM parsing of transaction
         * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
         */
        sendTransaction(signedTransaction: string | Promise<string>): Promise<providers.TransactionResponse>;
        isClientVersionGreaterThanEqualTo(major: number, minor: number, patch: number): Promise<boolean>;
        getClientVersion(): Promise<ClientVersion>;
        /**
         * Function to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        getUtxos(from: string, neededAmount?: number | undefined): Promise<any>;
        /**
         * Override to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        prepareRequest(method: any, params: any): [string, any[]];
    };
} & typeof ProviderSubprovider;
export declare class QtumProviderSubprovider extends QtumProviderSubprovider_base {
}
export declare function compareVersion(version: ClientVersion, major: number, minor: number, patch: number): number;
export {};
