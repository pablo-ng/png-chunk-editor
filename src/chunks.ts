import {
  bytesToInteger,
  bytesToString,
  crc32,
  integerToBytes,
  stringToBytes,
} from "./utils";

export function* chunksFromBytes(
  _bytes: number[],
  noVerifyCrc?: boolean
): Generator<PNGChunk_bytes> {
  // skip signature
  let bytes = _bytes.slice(8);

  // read chunks
  while (bytes.length >= 12) {
    const chunk = PNGChunk_bytes.fromBytes(bytes, noVerifyCrc);
    yield chunk;
    bytes = bytes.slice(chunk.sizeTotal());
  }
}

export abstract class PNGChunk {
  abstract size(): number;
  abstract dataBytes(): number[];

  readonly typeStr: string;
  readonly typeBytes: number[];

  constructor(type: string) {
    // check type length
    if (type.length !== 4) {
      throw Error(`Invalid type "${type}". Must be 4 characters.`);
    }

    // check that type contains only valid chunk type characters
    const typeBytes = stringToBytes(type);
    for (let i = 0; i < typeBytes.length; i++) {
      const code = typeBytes[i];
      if (!((code > 64 && code < 91) || (code > 96 && code < 123))) {
        throw Error(`Invalid character in type "${type}" at position ${i}.`);
      }
    }

    this.typeStr = type;
    this.typeBytes = typeBytes;
  }

  crc(): number {
    return crc32([...this.typeBytes, ...this.dataBytes()]);
  }

  sizeTotal(): number {
    return this.size() + 12;
  }

  toBytes(): number[] {
    return [
      ...integerToBytes(this.size(), 4),
      ...this.typeBytes,
      ...this.dataBytes(),
      ...integerToBytes(this.crc(), 4),
    ];
  }

  into<T>(into: { typeStr: string; fromDataBytes: (data: number[]) => T }): T {
    if (this.typeStr !== into.typeStr) {
      throw Error(`Invalid type ${this.typeStr} != ${into.typeStr}.`);
    }
    return into.fromDataBytes(this.dataBytes());
  }
}

export class PNGChunk_bytes extends PNGChunk {
  data: number[];

  constructor(type: string, data: number[]) {
    super(type);
    this.data = data;
  }

  dataBytes(): number[] {
    return this.data;
  }

  size(): number {
    return this.data.length;
  }

  static fromBytes(bytes: number[], noVerifyCrc?: boolean): PNGChunk_bytes {
    let i = 0;

    // read size (treat negative size like 0)
    const size = Math.max(bytesToInteger(bytes.slice(i, i + 4)), 0);
    i += 4;

    // read type
    const type = bytes.slice(i, i + 4);
    const typeStr = bytesToString(type);
    i += 4;

    // read data
    const data = bytes.slice(i, i + size);
    i += size;

    // verify CRC
    if (noVerifyCrc !== true) {
      const crc = bytesToInteger(bytes.slice(i, i + 4)) >>> 0;
      i += 4;
      if (crc !== crc32([...type, ...data])) {
        throw Error(`invalid CRC in chunk ${typeStr}`);
      }
    }

    return new PNGChunk_bytes(typeStr, data);
  }
}

export class PNGChunk_tEXt extends PNGChunk {
  static typeStr = "tEXt";
  keyword: string;
  text: string;

  constructor(keyword: string, text: string) {
    super(PNGChunk_tEXt.typeStr);
    this.keyword = keyword;
    this.text = text;
  }

  dataBytes(): number[] {
    // TODO check encoding / valid characters
    const data = [
      ...stringToBytes(this.keyword),
      0 & 0xff,
      ...stringToBytes(this.text),
    ];
    return data;
  }

  size(): number {
    return this.keyword.length + this.text.length + 1;
  }

  static fromDataBytes(data: number[]): PNGChunk_tEXt {
    // find separator byte
    const separatorIndex = data.findIndex((byte) => byte === 0);
    if (separatorIndex === undefined) {
      throw Error("Could not find separator byte.");
    }

    // read keyword and text
    const keyword = bytesToString(data.slice(0, separatorIndex));
    const text = bytesToString(data.slice(separatorIndex + 1, data.length));

    return new PNGChunk_tEXt(keyword, text);
  }
}
