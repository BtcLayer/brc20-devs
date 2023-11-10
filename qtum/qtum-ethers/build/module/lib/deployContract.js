import { QtumContractFactory as ContractFactory } from './QtumContractFactory';
import { isStandard, hasByteCode } from './ContractJSON';
// @ts-ignore
export async function deployContract(wallet, factoryOrContractJson, args = [], overrideOptions = {}) {
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
// @ts-ignore
async function deployFromJson(wallet, contractJson, args, overrideOptions) {
    const bytecode = isStandard(contractJson) ? contractJson.evm.bytecode : contractJson.bytecode;
    if (!hasByteCode(bytecode)) {
        throw new Error('Cannot deploy contract with empty bytecode');
    }
    const factory = new ContractFactory(contractJson.abi, bytecode, wallet);
    const contract = await factory.deploy(...args, {
        ...overrideOptions
    });
    await contract.deployed();
    return contract;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95Q29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RlcGxveUNvbnRyYWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pELGFBQWE7QUFDYixNQUFNLENBQUMsS0FBSyxVQUFVLGNBQWMsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxlQUFlLEdBQUcsRUFBRTtJQUMvRixJQUFJLEtBQUssSUFBSSxxQkFBcUIsRUFBRTtRQUNoQyxPQUFPLGNBQWMsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0tBQy9FO1NBQ0k7UUFDRCxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQztRQUN0QyxNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDeEUsTUFBTSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUIsT0FBTyxRQUFRLENBQUM7S0FDbkI7QUFDTCxDQUFDO0FBQ0QsYUFBYTtBQUNiLEtBQUssVUFBVSxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsZUFBZTtJQUNyRSxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDO0lBQzlGLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0tBQ2pFO0lBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFO1FBQzNDLEdBQUcsZUFBZTtLQUNyQixDQUFDLENBQUM7SUFDSCxNQUFNLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMxQixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDIn0=