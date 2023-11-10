import { QtumProvider } from "./QtumProvider";

export class QtumFunctionProvider extends QtumProvider {

    readonly fn: Function

    constructor(
        fn: Function,
    ) {
        super();
        this.fn = fn;
    }

    async send(method: string, params: Array<any>): Promise<any> {
        // We can expand this in the future to any call, but for now these
        // are the biggest wins and do not require any serializing parameters.
        const cache = ([ "eth_chainId", "eth_blockNumber" ].indexOf(method) >= 0);
        if (cache && await this._cache[method]) {
            return this._cache[method];
        }

        // @ts-ignore
        const result = await this.fn(method, params);

        // Cache the fetch, but clear it on the next event loop
        if (cache) {
            this._cache[method] = result;
            setTimeout(() => {
                // @ts-ignore
                this._cache[method] = null;
            }, 0);
        }

        return result;
    }
}
