"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QtumContractFactory = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const address_1 = require("@ethersproject/address");
const logger_1 = require("@ethersproject/logger");
const utils_2 = require("./helpers/utils");
const version = "contracts/5.1.1";
const logger = new logger_1.Logger(version);
async function resolveName(resolver, nameOrPromise) {
    const name = await nameOrPromise;
    // If it is already an address, just use it (after adding checksum)
    try {
        return address_1.getAddress(name);
    }
    catch (error) { }
    if (!resolver) {
        logger.throwError("a provider or signer is needed to resolve ENS names", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "resolveName"
        });
    }
    const address = await resolver.resolveName(name);
    if (address == null) {
        logger.throwArgumentError("resolver or addr is not configured for ENS name", "name", name);
    }
    return address;
}
// Recursively replaces ENS names with promises to resolve the name and resolves all properties
async function resolveAddresses(resolver, value, paramType) {
    if (Array.isArray(paramType)) {
        return await Promise.all(paramType.map((paramType, index) => {
            return resolveAddresses(resolver, ((Array.isArray(value)) ? value[index] : value[paramType.name]), paramType);
        }));
    }
    if (paramType.type === "address") {
        return await resolveName(resolver, value);
    }
    if (paramType.type === "tuple") {
        return await resolveAddresses(resolver, value, paramType.components);
    }
    if (paramType.baseType === "array") {
        if (!Array.isArray(value)) {
            return Promise.reject(new Error("invalid value for array"));
        }
        return await Promise.all(value.map((v) => resolveAddresses(resolver, v, paramType.arrayChildren)));
    }
    return value;
}
class QtumContractFactory extends ethers_1.ContractFactory {
    constructor(contractInterface, bytecode, signer) {
        super(contractInterface, bytecode, signer);
    }
    async deploy(...args) {
        let overrides = {};
        // If 1 extra parameter was passed in, it contains overrides
        if (args.length === this.interface.deploy.inputs.length + 1) {
            overrides = args.pop();
        }
        // Make sure the call matches the constructor signature
        logger.checkArgumentCount(args.length, this.interface.deploy.inputs.length, " in Contract constructor");
        // Resolve ENS names and promises in the arguments
        const params = await resolveAddresses(this.signer, args, this.interface.deploy.inputs);
        params.push(overrides);
        // Get the deployment transaction (with optional overrides)
        const unsignedTx = this.getDeployTransaction(...params);
        // Send the deployment transaction
        const tx = await this.signer.sendTransaction(unsignedTx);
        // @ts-ignore
        const address = `0x${utils_2.generateContractAddress(tx.hash.split("0x")[1])}`;
        // const address = getStatic<(tx: TransactionResponse) => string>(this.constructor, "getContractAddress")(tx);
        const contract = utils_1.getStatic(this.constructor, "getContract")(address, this.interface, this.signer);
        utils_1.defineReadOnly(contract, "deployTransaction", tx);
        return contract;
    }
}
exports.QtumContractFactory = QtumContractFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXR1bUNvbnRyYWN0RmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvUXR1bUNvbnRyYWN0RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBd0Y7QUFDeEYsNENBQTREO0FBRTVELG9EQUFvRDtBQUNwRCxrREFBK0M7QUFFL0MsMkNBQTBEO0FBRTFELE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDO0FBRWxDLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRW5DLEtBQUssVUFBVSxXQUFXLENBQUMsUUFBMkIsRUFBRSxhQUF1QztJQUMzRixNQUFNLElBQUksR0FBRyxNQUFNLGFBQWEsQ0FBQztJQUVqQyxtRUFBbUU7SUFDbkUsSUFBSTtRQUNBLE9BQU8sb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjtJQUFDLE9BQU8sS0FBSyxFQUFFLEdBQUc7SUFFbkIsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNYLE1BQU0sQ0FBQyxVQUFVLENBQUMscURBQXFELEVBQUUsZUFBTSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRTtZQUMxRyxTQUFTLEVBQUUsYUFBYTtTQUMzQixDQUFDLENBQUM7S0FDTjtJQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVqRCxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7UUFDakIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGlEQUFpRCxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM5RjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFFRCwrRkFBK0Y7QUFDL0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLFFBQTJCLEVBQUUsS0FBVSxFQUFFLFNBQXVDO0lBQzVHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFB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