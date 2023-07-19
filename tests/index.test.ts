import { PNGImage } from "../src";
import { PNGChunk_bytes, PNGChunk_tEXt } from "../src/chunks";

test("create image", () => {
  const textChunk = new PNGChunk_tEXt("TestKeyword", "TestText");
  const image = new PNGImage([textChunk]);
  expect(image.getChunk(0)).toBe(textChunk);
});

test("getChunk, insertChunk, getChunkIndex", () => {
  const image = new PNGImage([]);
  const textChunk = new PNGChunk_tEXt("TestKeyword", "TestText");
  image.insertChunk(textChunk);
  expect(image.getChunk(0)).toBe(textChunk);
  expect(image.getChunkIndex("tEXt")).toBe(0);
});

test("toBytes, fromBytes", () => {
  const image = new PNGImage([
    new PNGChunk_bytes(
      "tEXt",
      new PNGChunk_tEXt("Author", "Project Nayuki").dataBytes()
    ),
    new PNGChunk_bytes(
      "tEXt",
      new PNGChunk_tEXt("Software", "Hex editor").dataBytes()
    ),
  ]);
  const bytes = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x15,
    0x74, 0x45, 0x58, 0x74, 0x41, 0x75, 0x74, 0x68, 0x6f, 0x72, 0x00, 0x50,
    0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74, 0x20, 0x4e, 0x61, 0x79, 0x75, 0x6b,
    0x69, 0xf8, 0x02, 0x8e, 0x64, 0x00, 0x00, 0x00, 0x13, 0x74, 0x45, 0x58,
    0x74, 0x53, 0x6f, 0x66, 0x74, 0x77, 0x61, 0x72, 0x65, 0x00, 0x48, 0x65,
    0x78, 0x20, 0x65, 0x64, 0x69, 0x74, 0x6f, 0x72, 0x6d, 0xe4, 0x0f, 0x34,
  ];
  expect(image.toBytes()).toStrictEqual(bytes);
  expect(PNGImage.fromBytes(bytes)).toStrictEqual(image);
});
