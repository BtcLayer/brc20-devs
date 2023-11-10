"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployContract = void 0;
const QtumContractFactory_1 = require("./QtumContractFactory");
const ContractJSON_1 = require("./ContractJSON");
// @ts-ignore
async function deployContract(wallet, factoryOrContractJson, args = [], overrideOptions = {}) {
    if ('abi' in factoryOrContractJson) {
        return deployFromJson(wallet, factoryOrContractJson, args, overrideOptions);
    }
    else {
        const Factory = factoryOrContractJson;
        const contractFactory = new Factory(wallet);
        const contract = await contractFactory.deploy(...args, overrideOptions);
        await contract.deployed();
        return contract;
    }
}
exports.deployContract = deployContract;
// @ts-ignore
async function deployFromJson(wallet, contractJson, args, overrideOptions) {
    const bytecode = ContractJSON_1.isStandard(contractJson) ? contractJson.evm.bytecode : contractJson.bytecode;
    if (!ContractJSON_1.hasByteCode(bytecode)) {
        throw new Error('Cannot deploy contract with empty bytecode');
    }
    const factory = new QtumContractFactory_1.QtumContractFactory(contractJson.abi, bytecode, wallet);
    const contract = await factory.deploy(...args, Object.assign({}, overrideOptions));
    await contract.deployed();
    return contract;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95Q29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RlcGxveUNvbnRyYWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtEQUErRTtBQUMvRSxpREFBeUQ7QUFDekQsYUFBYTtBQUNOLEtBQUssVUFBVSxjQUFjLENBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsZUFBZSxHQUFHLEVBQUU7SUFDL0YsSUFBSSxLQUFLLElBQUkscUJBQXFCLEVBQUU7UUFDaEMsT0FBTyxjQUFjLENBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztLQUMvRTtTQUNJO1FBQ0QsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUM7UUFDdEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLE9BQU8sUUFBUSxDQUFDO0tBQ25CO0FBQ0wsQ0FBQztBQVhELHdDQVdDO0FBQ0QsYUFBYTtBQUNiLEtBQUssVUFBVSxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsZUFBZTtJQUNyRSxNQUFNLFFBQVEsR0FBRyx5QkFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztJQUM5RixJQUFJLENBQUMsMEJBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7S0FDakU7SUFDRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHlDQUFlLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxvQkFDdEMsZUFBZSxFQUNwQixDQUFDO0lBQ0gsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUIsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQyJ9