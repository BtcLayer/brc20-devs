"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QtumFunctionProvider = void 0;
const QtumProvider_1 = require("./QtumProvider");
class QtumFunctionProvider extends QtumProvider_1.QtumProvider {
    constructor(fn) {
        super();
        this.fn = fn;
    }
    async send(method, params) {
        // We can expand this in the future to any call, but for now these
        // are the biggest wins and do not require any serializing parameters.
        const cache = (["eth_chainId", "eth_blockNumber"].indexOf(method) >= 0);
        if (cache && this._cache[method]) {
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
exports.QtumFunctionProvider = QtumFunctionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXR1bUZ1bmN0aW9uUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL1F0dW1GdW5jdGlvblByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUE4QztBQUU5QyxNQUFhLG9CQUFxQixTQUFRLDJCQUFZO0lBSWxELFlBQ0ksRUFBWTtRQUVaLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBYyxFQUFFLE1BQWtCO1FBQ3pDLGtFQUFrRTtRQUNsRSxzRUFBc0U7UUFDdEUsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM5QjtRQUVELGFBQWE7UUFDYixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLHVEQUF1RDtRQUN2RCxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osYUFBYTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDVDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQWpDRCxvREFpQ0MifQ==