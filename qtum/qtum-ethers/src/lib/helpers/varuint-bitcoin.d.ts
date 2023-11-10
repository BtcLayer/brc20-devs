declare module "varuint-bitcoin" {
    function encode(number: number): Buffer
    function encodingLength(number: number): number

}