import { ContractFactory } from "ethers";
import { defineReadOnly, getStatic } from "ethers/lib/utils";
import { getAddress } from "@ethersproject/address";
import { Logger } from "@ethersproject/logger";
import { generateContractAddress } from "./helpers/utils";
const version = "contracts/5.1.1";
const logger = new Logger(version);
async function resolveName(resolver, nameOrPromise) {
    const name = await nameOrPromise;
    // If it is already an address, just use it (after adding checksum)
    try {
        return getAddress(name);
    }
    catch (error) { }
    if (!resolver) {
        logger.throwError("a provider or signer is needed to resolve ENS names", Logger.errors.UNSUPPORTED_OPERATION, {
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
export class QtumContractFactory extends ContractFactory {
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
        const address = `0x${generateContractAddress(tx.hash.split("0x")[1])}`;
        // const address = getStatic<(tx: TransactionResponse) => string>(this.constructor, "getContractAddress")(tx);
        const contract = getStatic(this.constructor, "getContract")(address, this.interface, this.signer);
        defineReadOnly(contract, "deployTransaction", tx);
        return contract;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXR1bUNvbnRyYWN0RmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvUXR1bUNvbnRyYWN0RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFrRCxNQUFNLFFBQVEsQ0FBQTtBQUN4RixPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRTVELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFL0MsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUQsTUFBTSxPQUFPLEdBQUcsaUJBQWlCLENBQUM7QUFFbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFbkMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxRQUEyQixFQUFFLGFBQXVDO0lBQzNGLE1BQU0sSUFBSSxHQUFHLE1BQU0sYUFBYSxDQUFDO0lBRWpDLG1FQUFtRTtJQUNuRSxJQUFJO1FBQ0EsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0I7SUFBQyxPQUFPLEtBQUssRUFBRSxHQUFHO0lBRW5CLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDWCxNQUFNLENBQUMsVUFBVSxDQUFDLHFEQUFxRCxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUU7WUFDMUcsU0FBUyxFQUFFLGFBQWE7U0FDM0IsQ0FBQyxDQUFDO0tBQ047SUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFakQsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1FBQ2pCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxpREFBaUQsRUFBRSxNQUFNLEVBQUUsSUFBSSxD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