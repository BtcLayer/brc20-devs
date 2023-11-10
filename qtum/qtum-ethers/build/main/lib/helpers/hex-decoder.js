"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const bitcoinjs = require('bitcoinjs-lib');
/**
 * Decode utxo hex.
 * @param {string} hex
 */
function decode(hex) {
    let tx = bitcoinjs.Transaction.fromHex(hex);
    tx.ins.forEach((input) => {
        if (input.witness.length > 0) {
            input.type = 'Segwit';
            input.witness = decodeWitness(input.witness);
            input.script = {
                hex: input.script.toString('hex')
            };
        }
        else {
            let decodedScript = bitcoinjs.script.toASM(input.script).split(" ");
            if (decodedScript.length === 2) {
                input.type = 'P2PKH';
                input.script = {
                    signature: decodedScript[0],
                    publicKey: decodedScript[1]
                };
            }
            else {
                input.type = 'Unkown';
                input.script = {
                    hex: decodedScript
                };
            }
        }
        input.hash = input.hash.toString('hex');
    });
    tx.outs.forEach((output) => {
        output.script = output.script;
    });
    tx.totalValue = sumOutputValue(tx);
    return tx;
}
exports.decode = decode;
;
/**
 * Sum value (satoshi) in all outputs
 * @param {Transaction} tx
 * @returns {number} satoshis
 */
function sumOutputValue(tx) {
    let totalValue = 0;
    if (tx && tx.outs && tx.outs.length > 0) {
        totalValue = tx.outs.map((out) => out.value).reduce(reducer);
    }
    return totalValue;
}
/**
 * convert witness hex array to object
 * @param {Array} witness
 * @return {signature: string, publicKey: string, hashType:number}
 */
function decodeWitness(witness) {
    const { signature: sigBuf, hashType } = bitcoinjs.script.signature.decode(witness[0]);
    const signature = sigBuf.toString('hex');
    const publicKey = witness[1].toString('hex');
    return { signature, publicKey, hashType };
}
function reducer(a, b) { return a + b; }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV4LWRlY29kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2hlbHBlcnMvaGV4LWRlY29kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRTNDOzs7R0FHRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxHQUFXO0lBQ2hDLElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTNDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7UUFDNUIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUIsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUE7WUFDckIsS0FBSyxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzVDLEtBQUssQ0FBQyxNQUFNLEdBQUc7Z0JBQ2IsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQzthQUNsQyxDQUFBO1NBQ0Y7YUFBTTtZQUNMLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbkUsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDOUIsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUE7Z0JBQ3BCLEtBQUssQ0FBQyxNQUFNLEdBQUc7b0JBQ2IsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUM1QixDQUFBO2FBQ0Y7aUJBQ0k7Z0JBQ0gsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUE7Z0JBQ3JCLEtBQUssQ0FBQyxNQUFNLEdBQUc7b0JBQ2IsR0FBRyxFQUFFLGFBQWE7aUJBQ25CLENBQUE7YUFDRjtTQUNGO1FBQ0QsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN6QyxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7UUFDOUIsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO0lBQy9CLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUE7SUFFbEMsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBcENELHdCQW9DQztBQUFBLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsU0FBUyxjQUFjLENBQUMsRUFBTztJQUM3QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdkMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ2xFO0lBQ0QsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxPQUFtQjtJQUN4QyxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDckYsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFBO0FBQzNDLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxDQUFNLEVBQUUsQ0FBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMifQ==