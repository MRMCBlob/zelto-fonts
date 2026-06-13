/**
 * Dependency-free WOFF2 → Unicode coverage extractor.
 *
 * WOFF2 stores its SFNT tables in a single Brotli-compressed block (Node's
 * zlib can decompress Brotli natively). We decode just enough of the table
 * directory to locate the `cmap` table, then read its Unicode subtables to
 * list every code point the font actually contains. Used at build time so the
 * site can show a font's real glyph set without any client-side guessing.
 */
import { brotliDecompressSync } from "node:zlib";

// WOFF2 known-table-tag index → tag (only `cmap` matters here).
const KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm",
  "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern",
  "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC",
  "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar",
  "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty",
  "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat",
  "Gloc", "Feat", "Sill",
];

const MAX_CP = 0xffff; // full BMP — includes Private Use Area (logo glyphs) and ligatures

function readBase128(buf: Buffer, p: number): [number, number] {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const b = buf[p++];
    value = value * 128 + (b & 0x7f);
    if ((b & 0x80) === 0) return [value, p];
  }
  throw new Error("invalid UIntBase128");
}

/** Returns sorted Unicode code points (<= MAX_CP) present in the WOFF2 font. */
export function extractCodepoints(woff2: Buffer): number[] {
  if (woff2.readUInt32BE(0) !== 0x774f4632) throw new Error("not a WOFF2 file");
  const numTables = woff2.readUInt16BE(12);
  const totalCompressedSize = woff2.readUInt32BE(20);

  let p = 48; // end of WOFF2 header
  const tables: { tag: string; length: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = woff2[p++];
    const tagIndex = flags & 0x3f;
    const transformVersion = (flags >> 6) & 0x3;
    let tag: string;
    if (tagIndex === 0x3f) {
      tag = woff2.toString("latin1", p, p + 4);
      p += 4;
    } else {
      tag = KNOWN_TAGS[tagIndex];
    }
    let origLength: number;
    [origLength, p] = readBase128(woff2, p);

    // A transformLength is present when the table carries a transform.
    const transformed =
      tag === "glyf" || tag === "loca" ? transformVersion !== 3 : transformVersion !== 0;
    let storedLength = origLength;
    if (transformed) {
      [storedLength, p] = readBase128(woff2, p);
    }
    tables.push({ tag, length: storedLength });
  }

  const compressed = woff2.subarray(p, p + totalCompressedSize);
  const data = brotliDecompressSync(compressed);

  // Tables sit back-to-back (no padding) in the decompressed stream.
  let offset = 0;
  let cmap: Buffer | null = null;
  for (const t of tables) {
    if (t.tag === "cmap") {
      cmap = data.subarray(offset, offset + t.length);
      break;
    }
    offset += t.length;
  }
  if (!cmap) throw new Error("no cmap table");

  return parseCmap(cmap);
}

function parseCmap(cmap: Buffer): number[] {
  const codepoints = new Set<number>();
  const numSubtables = cmap.readUInt16BE(2);
  for (let i = 0; i < numSubtables; i++) {
    const rec = 4 + i * 8;
    const platformID = cmap.readUInt16BE(rec);
    const encodingID = cmap.readUInt16BE(rec + 2);
    const subOffset = cmap.readUInt32BE(rec + 4);
    // Unicode subtables only: platform 0 (Unicode) or platform 3 enc 1/10 (Windows BMP/UCS-4).
    const isUnicode = platformID === 0 || (platformID === 3 && (encodingID === 1 || encodingID === 10));
    if (!isUnicode) continue;
    const format = cmap.readUInt16BE(subOffset);
    if (format === 4) parseFormat4(cmap, subOffset, codepoints);
    else if (format === 12) parseFormat12(cmap, subOffset, codepoints);
  }
  return [...codepoints].sort((a, b) => a - b);
}

function parseFormat4(cmap: Buffer, o: number, out: Set<number>) {
  const segX2 = cmap.readUInt16BE(o + 6);
  const segCount = segX2 / 2;
  const endO = o + 14;
  const startO = endO + segX2 + 2;
  const deltaO = startO + segX2;
  const rangeO = deltaO + segX2;
  for (let s = 0; s < segCount; s++) {
    const end = cmap.readUInt16BE(endO + s * 2);
    const start = cmap.readUInt16BE(startO + s * 2);
    const delta = cmap.readUInt16BE(deltaO + s * 2);
    const rangeOffset = cmap.readUInt16BE(rangeO + s * 2);
    if (start === 0xffff) continue;
    for (let c = start; c <= end && c !== 0xffff; c++) {
      let gid: number;
      if (rangeOffset === 0) {
        gid = (c + delta) & 0xffff;
      } else {
        const gidIndex = rangeO + s * 2 + rangeOffset + (c - start) * 2;
        if (gidIndex + 1 >= cmap.length) continue;
        gid = cmap.readUInt16BE(gidIndex);
        if (gid !== 0) gid = (gid + delta) & 0xffff;
      }
      if (gid !== 0 && c <= MAX_CP) out.add(c);
    }
  }
}

function parseFormat12(cmap: Buffer, o: number, out: Set<number>) {
  const nGroups = cmap.readUInt32BE(o + 12);
  for (let g = 0; g < nGroups; g++) {
    const rec = o + 16 + g * 12;
    const start = cmap.readUInt32BE(rec);
    const end = cmap.readUInt32BE(rec + 4);
    if (start > MAX_CP) continue;
    const hi = Math.min(end, MAX_CP);
    for (let c = start; c <= hi; c++) out.add(c);
  }
}
