import { ContractFactory, ContractInterface, BytesLike, Signer, Contract } from "ethers"
import { defineReadOnly, getStatic } from "ethers/lib/utils"
import { Provider } from "@ethersproject/abstract-provider";
import { getAddress } from "@ethersproject/address";
import { Logger } from "@ethersproject/logger";
import { ParamType } from "@ethersproject/abi";
import { generateContractAddress } from "./helpers/utils";

const version = "contracts/5.1.1";

const logger = new Logger(version);

async function resolveName(resolver: Signer | Provider, nameOrPromise: string | Promise<string>): Promise<string> {
    const name = await nameOrPromise;

    // If it is already an address, just use it (after adding checksum)
    try {
        return getAddress(name);
    } catch (error) { }

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
async function resolveAddresses(resolver: Signer | Provider, value: any, paramType: ParamType | Array<ParamType>): Promise<any> {
    if (Array.isArray(paramType)) {
        return await Promise.all(paramType.map((paramType, index) => {
            return resolveAddresses(
                resolver,
                ((Array.isArray(value)) ? value[index] : value[paramType.name]),
                paramType
            );
        }));
    }

    if (paramType.type === "address") {
        return await resolveName(resolver, value);
    }

    if (paramType.type === "tuple") {
        return await resolveAddresses(resolver, value, paramType.components);
    }

    if (paramType.baseType === "array") {
        if (!Array.isArray(value)) { return Promise.reject(new Error("invalid value for array")); }
        return await Promise.all(value.map((v) => resolveAddresses(resolver, v, paramType.arrayChildren)));
    }
    

    return value;
}
export class QtumContractFactory extends ContractFactory {
    constructor(contractInterface: ContractInterface, bytecode: BytesLike | { object: string }, signer?: Signer) {
        super(contractInterface, bytecode, signer);
    }
    async deploy(...args: Array<any>): Promise<Contract> {

        let overrides: any = {};

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
        const unsignedTx1 = this.getDeployTransaction(...params);

        // Send the deployment transaction
        const tx = await this.signer.sendTransaction(unsignedTx);
        const tx2 = await this.signer.sendTransaction(unsignedTx1);
        // @ts-ignore
        const address = `0x${generateContractAddress(tx.hash.split("0x")[1])}`;
        const address2 = `0X${generateContractAddress(tx2.hash.split("0x")[2])}`;
        // const address = getStatic<(tx: TransactionResponse) => string>(this.constructor, "getContractAddress")(tx);
        const contract = getStatic<(address: string, contractInterface: ContractInterface, signer?: Signer) => Contract>(this.constructor, "getContract")(address, this.interface, this.signer);
        const contract2 = getStatic<(address2: string, contractInterface: ContractInterface, signer?: Signer) => Contract>(this.constructor, "getContract")(address2, this.interface, this.signer);
        defineReadOnly(contract, "deployTransaction", tx);
        defineReadOnly(contract2, "deployTransaction2", tx2);
        return contract;
        return contract2;
    }
}