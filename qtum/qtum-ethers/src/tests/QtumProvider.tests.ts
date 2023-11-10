// @ts-nocheck
const { QtumProvider } = require("../../build/main/lib/QtumProvider");

const provider = new QtumProvider("http://localhost:23890");

describe("QtumProvider", function () {
    it("can grab UTXOs for an address", async function () {
        await provider.getUtxos("0x7926223070547D2D15b2eF5e7383E541c338FfE9", "1.0");
    });
})