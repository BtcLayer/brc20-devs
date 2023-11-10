import { BN } from "bn.js"
export class BufferCursor {
  _buffer: Buffer;
  _position: number;
  constructor(buffer: Buffer) {
    this._buffer = buffer;
    this._position = 0;
  }

  get position(): number {
    return this._position;
  }

  get eof(): boolean {
    return this._position === this._buffer.length;
  }
  get buffer(): Buffer { return this._buffer; }


  readUInt8(): Buffer {
    return this._readStandard(this.readUInt8.name, 1);
  }

  readUInt16LE(): Buffer {
    return this._readStandard(this.readUInt16LE.name, 2);
  }

  readUInt16BE(): Buffer {
    return this._readStandard(this.readUInt16BE.name, 2);
  }

  readUInt32LE(): Buffer {
    return this._readStandard(this.readUInt32LE.name, 4);
  }

  readUInt32BE(): Buffer {
    return this._readStandard(this.readUInt32BE.name, 4);
  }

  readBytes(len: number): Buffer {
    if (len === 0) {
      return Buffer.alloc(0);
    } else if (len > 0) {
      if (this._position + len > this._buffer.length) throw new RangeError('Index out of range');
      let result = this._buffer.slice(this._position, this._position + len);
      this._position += len;
      return result;
    } else {
      if (this._position === this._buffer.length) throw new RangeError('Index out of range');
      let result = this._buffer.slice(this._position);
      this._position = this._buffer.length;
      return result;
    }
  }

  writeUInt8(val: number): void {
    this._writeStandard(this.writeUInt8.name, val, 1);
  }

  writeUInt16LE(val: number): void {
    this._writeStandard(this.writeUInt16LE.name, val, 2);
  }

  writeUInt16BE(val: number): void {
    this._writeStandard(this.writeUInt16BE.name, val, 2);
  }

  writeUInt32LE(val: number): void {
    this._writeStandard(this.writeUInt32LE.name, val, 4);
  }

  writeInt32LE(val: number): void {
    this._writeStandard(this.writeInt32LE.name, val, 4);
  }

  writeUInt32BE(val: number): void {
    this._writeStandard(this.writeUInt32BE.name, val, 4);
  }

  writeUInt64LE(value: any): void {
    if (!(value instanceof BN)) value = new BN(value);
    this.writeBytes(value.toArrayLike(Buffer, 'le', 8))
  }

  writeBytes(buffer: any) {
    if (buffer === undefined || buffer === null) {
      throw new Error("Attempt to write null/undefined buffer");
    }
    if (!buffer || !buffer.length) return;
    if (this._position + buffer.length > this._buffer.length)
      throw new RangeError('Index out of range');
    buffer.copy(this._buffer, this._position);
    this._position += buffer.length;
  }

  _readStandard(fn: string, len: number): Buffer {
    // @ts-ignore
    let result: Buffer = this._buffer[fn](this._position);
    this._position += len;
    return result;
  }

  _writeStandard(fn: string, val: number, len: number): void {
    if (val === undefined || val === null) {
      throw new Error("Attempt to write null/undefined value of length " + len);
    }
    // @ts-ignore
    this._buffer[fn](val, this._position);
    this._position += len;
  }
}
