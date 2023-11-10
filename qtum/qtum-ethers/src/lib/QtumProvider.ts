import { providers } from "ethers";
import { parseSignedTransaction } from "./helpers/utils";
import { Network, Networkish } from "@ethersproject/networks";
import { Logger } from "@ethersproject/logger";
const logger = new Logger("qtum-ethers");
import { getStatic } from "@ethersproject/properties";
import type {
  JSONRPCResponsePayload
} from "ethereum-protocol";

export interface ClientVersion {
    name: string,
    version?: string,
    major?: number,
    minor?: number,
    patch?: number,
    system?: string,
}

interface EIP1993RequestArguments {
    readonly method: string;
    readonly params?: any[];
}

type Constructor = new (...args: any[]) => {};
type Callback = (err : Error | undefined | null, result?: JSONRPCResponsePayload) => void;

export class QtumProvider extends QtumProviderMixin(providers.JsonRpcProvider) {};
export class QtumJsonRpcProvider extends QtumProviderMixin(providers.JsonRpcProvider) {};
export class QtumWebSocketProvider extends QtumProviderMixin(providers.WebSocketProvider) {};

function timer(timeout: number): Promise<any> {
    return new Promise(function(resolve) {
        setTimeout(resolve, timeout);
    });
}

interface HandleRequest {
    handleRequest(payload: EIP1993RequestArguments, next: any, end: any): void;
}

class ProviderSubprovider extends providers.BaseProvider {
    providerSubprovider: HandleRequest;
    _eventLoopCache: Record<string, Promise<any>>;
    get _cache(): Record<string, Promise<any> | null> {
        if (this._eventLoopCache == null) {
            this._eventLoopCache = { };
        }
        return this._eventLoopCache;
    }

    constructor(providerSubprovider: HandleRequest, network?: Networkish) {
        if (!providerSubprovider) {
            throw new Error("Provider cannot be empty");
        }

        let networkOrReady: Networkish | Promise<Network> | undefined = network;

        // The network is unknown, query the JSON-RPC for it
        if (networkOrReady == null) {
            networkOrReady = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.detectNetwork().then((network) => {
                        resolve(network);
                    }, (error) => {
                        reject(error);
                    });
                }, 0);
            });
        }

        super(networkOrReady);

        this._eventLoopCache = {};
        this.providerSubprovider = providerSubprovider;
    }

    send(method: string, params: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.providerSubprovider.handleRequest({
                method,
                params,
            }, undefined, (err: Error, response: any) => {
                if (err) {
                reject(err);
                } else {
                resolve(response);
                }
            })
        });
    }

    detectNetwork(): Promise<Network> {
        if (!this._cache["detectNetwork"]) {
            this._cache["detectNetwork"] = this._uncachedDetectNetwork();

            // Clear this cache at the beginning of the next event loop
            setTimeout(() => {
                this._cache["detectNetwork"] = null;
            }, 0);
        }
        return this._cache["detectNetwork"];
    }

    async _uncachedDetectNetwork(): Promise<Network> {
        await timer(0);

        let chainId = null;
        try {
            chainId = await this.send("eth_chainId", [ ]);
        } catch (error) {
        try {
            chainId = await this.send("net_version", [ ]);
        } catch (error) { }
        }

        if (chainId != null) {
            const getNetwork = getStatic<(network: Networkish) => Network>(this.constructor, "getNetwork");
            try {
                return getNetwork(BigNumber.from(chainId).toNumber());
            } catch (error) {
                return logger.throwError("could not detect network", Logger.errors.NETWORK_ERROR, {
                chainId: chainId,
                event: "invalidNetwork",
                serverError: error
                });
            }
        }

        return logger.throwError("could not detect network", Logger.errors.NETWORK_ERROR, {
            event: "noNetwork"
        });
    }
}

export class QtumProviderSubprovider extends QtumProviderMixin(ProviderSubprovider) {};

function QtumProviderMixin<TBase extends Constructor>(Base: TBase) {
    return class QtumProviderMixin extends Base {
        // EIP-1193 deprecated api support
        sendAsync(payload: EIP1993RequestArguments, cb: Callback) {
            // @ts-ignore
            this.send(
                payload.method,
                payload.params || []
            ).then((result: any) => {
                cb(null, result);
            }).catch((err: Error) => {
                cb(err);
            })
        }

        handleRequest(payload: EIP1993RequestArguments, _: Callback, end: Callback) {
            this.sendAsync(payload, end);
        }

        // EIP-1193
        request(payload: EIP1993RequestArguments): Promise<unknown> {
            // @ts-ignore
            return this.send(payload.method, payload.params || []);
        }

        /**
         * Override for QTUM parsing of transaction
         * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/base-provider.ts
         */
        async sendTransaction(
            signedTransaction: string | Promise<string>
        ): Promise<providers.TransactionResponse> {
            // @ts-ignore
            await this.getNetwork();
            const signedTx = await Promise.resolve(signedTransaction);
            const hexTx = `0x${signedTx}`;
            // Parse the signed transaction here
            const tx = parseSignedTransaction(signedTx);
            try {
                // @ts-ignore
                const hash = await this.perform("sendTransaction", {
                    signedTransaction: hexTx,
                });
                // Note: need to destructure return result here.
                // @ts-ignore
                return this._wrapTransaction(tx, hash);
            } catch (error: any) {
                error.transaction = tx;
                error.transactionHash = tx.hash;
                throw error;
            }
        }

        async isClientVersionGreaterThanEqualTo(major: number, minor: number, patch: number): Promise<boolean> {
            const ver = await this.getClientVersion();
            return compareVersion(ver, major, minor, patch) >= 0;
        }

        async getClientVersion(): Promise<ClientVersion> {
            // @ts-ignore
            await this.getNetwork();
            // @ts-ignore
            const version = await this.perform("web3_clientVersion", []);
            if (version === "QTUM ETHTestRPC/ethereum-js") {
                // 0.1.4, versions after this with a proper version string is 0.2.0
                // this version contains a bug we have to work around
                return {
                    name: "Janus",
                    version: "0.1.4",
                    major: 0,
                    minor: 1,
                    patch: 4,
                    system: "linux-amd64",
                };
            } else {
                const versionInfo = version.split("/");
                if (versionInfo.length >= 4) {
                const semver = parseVersion(versionInfo[1]);
                return {
                    name: versionInfo[0],
                    version: versionInfo[1],
                    major: semver[0] || 0,
                    minor: semver[1] || 0,
                    patch: semver[2] || 0,
                    system: versionInfo[2],
                };
                }
            }
            return {
                name: version,
            };
        }

        /**
         * Function to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        async getUtxos(from: string, neededAmount?: number) {
            // @ts-ignore
            await this.getNetwork();
            const params = !!neededAmount ? [from, neededAmount, "p2pk", "p2pkh"] : [from, "p2pk", "p2pkh"];
            // @ts-ignore
            return await this.perform("qtum_qetUTXOs", params);
        }

        /**
         * Override to handle grabbing UTXO's from janus
         * prepareRequest in https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts
         */
        prepareRequest(method: any, params: any): [string, Array<any>] {
            if (method === "qtum_qetUTXOs") {
                return ["qtum_getUTXOs", params];
            } else if (method === "web3_clientVersion") {
                return ["web3_clientVersion", params];
            }
            // @ts-ignore
            return super.prepareRequest(method, params);
        }
    };
}

function parseVersion(version: string): Array<number> {
    const semver = version.split("-")[0];
    return semver.replace(/a-zA-Z\./g, "").split(".").map(i => parseInt(i) || 0);
}

export function compareVersion(version: ClientVersion, major: number, minor: number, patch: number): number {
    return recursivelyCompareVersion(
        [
            version.major || 0,
            version.minor || 0,
            version.patch || 0
        ],
        [
            major,
            minor,
            patch
        ]
    );
}

function recursivelyCompareVersion(version: Array<number>, compareTo: Array<number>): number {
    if (version.length === 0) {
        return 0;
    }

    if (version[0] === compareTo[0]) {
        return recursivelyCompareVersion(version.slice(1), compareTo.slice(1));
    } else if (version[0] < compareTo[0]) {
        return -1;
    } else {
        return 1;
    }
}
