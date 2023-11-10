"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasByteCode = exports.isStandard = void 0;
const isStandard = (data) => typeof data.evm === 'object' &&
    data.evm !== null &&
    typeof data.evm.bytecode === 'object' &&
    data.evm.bytecode !== null;
exports.isStandard = isStandard;
function hasByteCode(bytecode) {
    if (typeof bytecode === 'object') {
        return Object.entries(bytecode.object).length !== 0;
    }
    return Object.entries(bytecode).length !== 0;
}
exports.hasByteCode = hasByteCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJhY3RKU09OLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9Db250cmFjdEpTT04udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBWU8sTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFrQixFQUFnQyxFQUFFLENBQzNFLE9BQVEsSUFBWSxDQUFDLEdBQUcsS0FBSyxRQUFRO0lBQ3BDLElBQVksQ0FBQyxHQUFHLEtBQUssSUFBSTtJQUMxQixPQUFRLElBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVE7SUFDN0MsSUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDO0FBSjNCLFFBQUEsVUFBVSxjQUlpQjtBQUV4QyxTQUFnQixXQUFXLENBQUMsUUFBZ0M7SUFDeEQsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDaEMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0tBQ3JEO0lBQ0QsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUxELGtDQUtDIn0=