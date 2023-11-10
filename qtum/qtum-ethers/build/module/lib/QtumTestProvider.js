import { utils } from 'ethers';
import { QtumProvider } from "./QtumProvider";
import { QtumWallet, QTUM_BIP44_PATH } from "./QtumWallet";
import { parseSignedTransaction } from "./helpers/utils";
export class QtumTestProvider extends QtumProvider {
    constructor(options) {
        super(options ?
            ((options.url || "http://localhost:") + (options.port || 23889))
            : "http://localhost:23889");
        this.wallets = [];
        this._callHistory = [];
        options = options || {};
        if (!options.accounts || options.accounts.length === 0) {
            if (options.mnemonic) {
                this.wallets.push(QtumWallet.fromMnemonic(options.mnemonic, options.hd_path || QTUM_BIP44_PATH).connect(this));
                for (let j = 1; j < 5; j++) {
                    this.wallets.push(QtumWallet.fromMnemonic(options.mnemonic, (options.hd_path || QTUM_BIP44_PATH) + "/" + j).connect(this));
                }
            }
            else {
                options.accounts = [
                    "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk",
                    "cRcG1jizfBzHxfwu68aMjhy78CpnzD9gJYZ5ggDbzfYD3EQfGUDZ",
                    "cV79qBoCSA2NDrJz8S3T7J8f3zgkGfg4ua4hRRXfhbnq5VhXkukT",
                    "cV93kaaV8hvNqZ711s2z9jVWLYEtwwsVpyFeEZCP6otiZgrCTiEW",
                    "cVPHpTvmv3UjQsZfsMRrW5RrGCyTSAZ3MWs1f8R1VeKJSYxy5uac",
                    "cTs5NqY4Ko9o6FESHGBDEG77qqz9me7cyYCoinHcWEiqMZgLC6XY"
                ].map(privateKey => ({ privateKey }));
            }
        }
        if (options.accounts && options.accounts.length !== 0) {
            for (let i = 0; i < options.accounts.length; i++) {
                // @ts-ignore
                this.wallets.push(new QtumWallet(options.accounts[i].privateKey).connect(this));
            }
        }
    }
    prepareRequest(method, params) {
        switch (method) {
            case "sendTransaction":
                if (this._callHistory) {
                    if (params.hasOwnProperty("signedTransaction")) {
                        try {
                            const tx = parseSignedTransaction(params.signedTransaction);
                            if (tx.to) {
                                // OP_CALL
                                this._callHistory.push(toRecordedCall(tx.to, '0x' + tx.data));
                            }
                        }
                        catch (e) {
                            // ignore
                            console.error("Failed to parse", params.signedTransaction, e);
                        }
                    }
                }
                break;
            case "call":
                if (this._callHistory) {
                    if (params.hasOwnProperty("transaction")) {
                        this._callHistory.push(toRecordedCall(params.transaction.to, params.transaction.data));
                    }
                }
                break;
        }
        if (method === "qtum_qetUTXOs") {
            return ["qtum_getUTXOs", params];
        }
        return super.prepareRequest(method, params);
    }
    getWallets() {
        return this.wallets;
    }
    createEmptyWallet() {
        return QtumWallet.createRandom().connect(this);
    }
    clearCallHistory() {
        this._callHistory = [];
    }
    get callHistory() {
        return this._callHistory;
    }
}
function toRecordedCall(to, data) {
    return {
        address: to ? utils.getAddress(utils.hexlify(to)) : undefined,
        data: data ? utils.hexlify(data) : '0x'
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXR1bVRlc3RQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvUXR1bVRlc3RQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFVLE1BQU0sUUFBUSxDQUFDO0FBRXZDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUMzRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQXdDekQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLFlBQVk7SUFLOUMsWUFDSSxPQUFzQztRQUV0QyxLQUFLLENBQ0QsT0FBTyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQztZQUM1RCxDQUFDLENBQUMsd0JBQXdCLENBQ3JDLENBQUM7UUFFRixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUV2QixPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDcEQsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDYixVQUFVLENBQUMsWUFBWSxDQUNuQixPQUFPLENBQUMsUUFBUSxFQUNoQixPQUFPLENBQUMsT0FBTyxJQUFJLGVBQWUsQ0FDckMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQ2xCLENBQUM7Z0JBQ0YsS0FBSyxJQUFJLENBQUMs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