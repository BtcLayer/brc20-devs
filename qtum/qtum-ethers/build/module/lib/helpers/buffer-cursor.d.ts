/// <reference types="node" />
export declare class BufferCursor {
    _buffer: Buffer;
    _position: number;
    constructor(buffer: Buffer);
    get position(): number;
    get eof(): boolean;
    get buffer(): Buffer;
    readUInt8(): Buffer;
    readUInt16LE(): Buffer;
    readUInt16BE(): Buffer;
    readUInt32LE(): Buffer;
    readUInt32BE(): Buffer;
    readBytes(len: number): Buffer;
    writeUInt8(val: number): void;
    writeUInt16LE(val: number): void;
    writeUInt16BE(val: number): void;
    writeUInt32LE(val: number): void;
    writeInt32LE(val: number): void;
    writeUInt32BE(val: number): void;
    writeUInt64LE(value: any): void;
    writeBytes(buffer: any): void;
    _readStandard(fn: string, len: number): Buffer;
    _writeStandard(fn: string, val: number, len: number): void;
}
