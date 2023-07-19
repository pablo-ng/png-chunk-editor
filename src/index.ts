import { chunksFromBytes, type PNGChunk } from "./chunks";
import { PNG_SIG, validateSignature } from "./utils";

export class PNGImage {
  chunks: PNGChunk[];

  constructor(chunks: PNGChunk[]) {
    this.chunks = chunks;
  }

  insertChunk(chunk: PNGChunk, index?: number): void {
    if (index === undefined) {
      this.chunks.push(chunk);
    } else {
      this.chunks.splice(index, 0, chunk);
    }
  }

  getChunk(index: number): PNGChunk {
    return this.chunks[index];
  }

  getChunkIndex(type: string): number | undefined {
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].typeStr === type) {
        return i;
      }
    }
  }

  toBytes(): number[] {
    return [...PNG_SIG, ...this.chunks.flatMap((chunk) => chunk.toBytes())];
  }

  static fromBytes(bytes: number[]): PNGImage {
    // validate signature
    if (!validateSignature(bytes.slice(0, 8))) {
      throw Error("Invalid PNG signature.");
    }

    // read chunks
    const chunks = Array.from(chunksFromBytes(bytes));

    return new PNGImage(chunks);
  }
}
