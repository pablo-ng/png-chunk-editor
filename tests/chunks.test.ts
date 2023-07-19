import { PNGChunk_bytes, PNGChunk_tEXt } from "../src/chunks";

test("Chunk invalid type", () => {
  expect(() => new PNGChunk_bytes("any", [])).toThrowError("Invalid type");
  expect(() => new PNGChunk_bytes("abcda", [])).toThrowError("Invalid type");
  expect(() => new PNGChunk_bytes("a.aa", [])).toThrowError(
    "Invalid character"
  );
  expect(() => new PNGChunk_bytes("a1aa", [])).toThrowError(
    "Invalid character"
  );
});

test("Chunk into failure", () => {
  const chunk = new PNGChunk_bytes("aaaa", []);
  expect(() => chunk.into(PNGChunk_tEXt)).toThrowError(
    "Invalid type aaaa != tEXt."
  );
});

test("Chunk into", () => {
  const chunk = new PNGChunk_bytes(
    "tEXt",
    [
      0x41, 0x75, 0x74, 0x68, 0x6f, 0x72, 0x00, 0x50, 0x72, 0x6f, 0x6a, 0x65,
      0x63, 0x74, 0x20, 0x4e, 0x61, 0x79, 0x75, 0x6b, 0x69,
    ]
  );
  expect(chunk.into(PNGChunk_tEXt)).toStrictEqual(
    new PNGChunk_tEXt("Author", "Project Nayuki")
  );
});

// TODO see https://www.nayuki.io/page/png-file-chunk-inspector for more tests
