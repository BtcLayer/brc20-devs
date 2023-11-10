const bitcoinjs = require('bitcoinjs-lib');
/**
 * Decode utxo hex.
 * @param {string} hex
 */
export function decode(hex) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV4LWRlY29kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2hlbHBlcnMvaGV4LWRlY29kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRTNDOzs7R0FHRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQUMsR0FBVztJQUNoQyxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUzQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO1FBQzVCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO1lBQ3JCLEtBQUssQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUM1QyxLQUFLLENBQUMsTUFBTSxHQUFHO2dCQUNiLEdBQUcsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7YUFDbEMsQ0FBQTtTQUNGO2FBQU07WUFDTCxJQUFJLGFBQWEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ25FLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLEtBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO2dCQUNwQixLQUFLLENBQUMsTUFBTSxHQUFHO29CQUNiLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUMzQixTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztpQkFDNUIsQ0FBQTthQUNGO2lCQUNJO2dCQUNILEtBQUssQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO2dCQUNyQixLQUFLLENBQUMsTUFBTSxHQUFHO29CQUNiLEdBQUcsRUFBRSxhQUFhO2lCQUNuQixDQUFBO2FBQ0Y7U0FDRjtRQUNELEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFO1FBQzlCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQTtJQUMvQixDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRWxDLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUFBLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsU0FBUyxjQUFjLENBQUMsRUFBTztJQUM3QixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdkMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ2xFO0lBQ0QsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxPQUFtQjtJQUN4QyxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDckYsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFBO0FBQzNDLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxDQUFNLEVBQUUsQ0FBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMifQ==