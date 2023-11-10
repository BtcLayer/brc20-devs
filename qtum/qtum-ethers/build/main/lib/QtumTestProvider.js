"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QtumTestProvider = void 0;
const ethers_1 = require("ethers");
const QtumProvider_1 = require("./QtumProvider");
const QtumWallet_1 = require("./QtumWallet");
const utils_1 = require("./helpers/utils");
class QtumTestProvider extends QtumProvider_1.QtumProvider {
    constructor(options) {
        super(options ?
            ((options.url || "http://localhost:") + (options.port || 23889))
            : "http://localhost:23889");
        this.wallets = [];
        this._callHistory = [];
        options = options || {};
        if (!options.accounts || options.accounts.length === 0) {
            if (options.mnemonic) {
                this.wallets.push(QtumWallet_1.QtumWallet.fromMnemonic(options.mnemonic, options.hd_path || QtumWallet_1.QTUM_BIP44_PATH).connect(this));
                for (let j = 1; j < 5; j++) {
                    this.wallets.push(QtumWallet_1.QtumWallet.fromMnemonic(options.mnemonic, (options.hd_path || QtumWallet_1.QTUM_BIP44_PATH) + "/" + j).connect(this));
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
                this.wallets.push(new QtumWallet_1.QtumWallet(options.accounts[i].privateKey).connect(this));
            }
        }
    }
    prepareRequest(method, params) {
        switch (method) {
            case "sendTransaction":
                if (this._callHistory) {
                    if (params.hasOwnProperty("signedTransaction")) {
                        try {
                            const tx = utils_1.parseSignedTransaction(params.signedTransaction);
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
        return QtumWallet_1.QtumWallet.createRandom().connect(this);
    }
    clearCallHistory() {
        this._callHistory = [];
    }
    get callHistory() {
        return this._callHistory;
    }
}
exports.QtumTestProvider = QtumTestProvider;
function toRecordedCall(to, data) {
    return {
        address: to ? ethers_1.utils.getAddress(ethers_1.utils.hexlify(to)) : undefined,
        data: data ? ethers_1.utils.hexlify(data) : '0x'
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXR1bVRlc3RQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvUXR1bVRlc3RQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBdUM7QUFFdkMsaURBQThDO0FBQzlDLDZDQUEyRDtBQUMzRCwyQ0FBeUQ7QUF3Q3pELE1BQWEsZ0JBQWlCLFNBQVEsMkJBQVk7SUFLOUMsWUFDSSxPQUFzQztRQUV0QyxLQUFLLENBQ0QsT0FBTyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQztZQUM1RCxDQUFDLENBQUMsd0JBQXdCLENBQ3JDLENBQUM7UUFFRixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUV2QixPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDcEQsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDYix1QkFBVSxDQUFDLFlBQVksQ0FDbkIsT0FBTyxDQUFDLFFBQVEsRUFDaEIsT0FBTyxDQUFDLE9BQU8sSUFBSSw0QkFBZSxDQUNyQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FDbEIsQ0FBQztnQkFDRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDYix1QkFBVSxDQUFDLFlBQVksQ0FDbkIsT0FBTyxDQUFDLFFBQVEsRUFD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