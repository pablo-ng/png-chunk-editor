# png-chunk-editor

NPM package to read and edit chunks contained in a PNG file. Currently only tEXt chunks are supported, but development is ongoing.

## Installation

- `npm install png-chunk-editor`

## Usage

Basic usage:

```js
import fs from "fs";
import { PNGImage } from "png-chunk-editor";
import { PNGChunk_tEXt } from "png-chunk-editor/chunks";

// load PNG image from fs
const buffer = fs.readFileSync("image.png");
const image = PNGImage.fromBytes([...buffer]);

// read chunks
console.log(image.chunks);

// insert chunk
image.insertChunk(new PNGChunk_tEXt("Keyword", "Text"), 1);

// edit chunk
const textChunk = image.getChunk(image.getChunkIndex("tEXt")!) as PNGChunk_tEXt;
textChunk.text = "New Text";

// save image back to fs
const bytes = image.toBytes();
fs.writeFileSync("image-edited.png", Buffer.from(bytes));
```

Create PNG chunk from data bytes:

```js
import { PNGChunk_tEXt, PNGChunk_bytes } from "png-chunk-editor/chunks";

const chunk = new PNGChunk_bytes(
  "tEXt",
  [
    0x44, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x00,
    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64,
  ]
);
const textChunk = chunk.into(PNGChunk_tEXt);
console.log(`Keyword: ${textChunk.keyword}, Text: ${textChunk.text}`);
```

Create PNG chunk from bytes:

```js
import { PNGChunk_tEXt, PNGChunk_bytes } from "png-chunk-editor/chunks";

const chunk = PNGChunk_bytes.fromBytes([
  0x00, 0x00, 0x00, 0x17, 0x74, 0x45, 0x58, 0x74, 0x44, 0x65, 0x73, 0x63, 0x72,
  0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20,
  0x57, 0x6f, 0x72, 0x6c, 0x64, 0xab, 0x61, 0xb0, 0xfd,
]);
const textChunk = chunk.into(PNGChunk_tEXt);
console.log(`Keyword: ${textChunk.keyword}, Text: ${textChunk.text}`);
```
