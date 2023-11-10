declare module "bitcoinjs-lib/src/script_number" {
    function encode(_number: number): Buffer
    function decode(buffer: Buffer): number
}