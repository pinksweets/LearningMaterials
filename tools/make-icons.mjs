/* ============================================================
   学習クエスト アイコン生成スクリプト（依存ゼロ）

   node:zlib の deflateSync と自作 CRC32 だけで PNG（8bit RGBA・
   非インタレース）を直接書き出す。外部ライブラリ（sharp や
   pngjs 等）は一切使わない。

   絵柄は 16×16 のピクセルアート「城」。学習クエストの世界観
   （ステージ攻略・ボス戦）に合わせ、ゴールド/アンバーの城壁に
   青のアクセント（窓）を効かせた。

   実行方法:
     node tools/make-icons.mjs

   生成物:
     icons/icon-192.png            192x192
     icons/icon-512.png            512x512
     icons/icon-512-maskable.png   512x512（中央60%セーフエリアに縮小配置）
     icons/apple-touch-icon.png    180x180（背景不透明）
============================================================ */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'icons');

/* ------------------------------------------------------------
   16x16 ピクセルアート「城」
   0=背景 1=金(ゴールド) 2=金(濃いアンバー・陰影) 3=アクセント(水色)
------------------------------------------------------------ */
const PIXELS = [
  '0003000000000000',
  '0003330000000000',
  '0003300000000000',
  '0002000000000000',
  '0101000000010100',
  '0111100000011110',
  '0111110101011110',
  '0111111111111110',
  '0111111111111110',
  '0133111111113310',
  '0111111221111110',
  '0111111001111110',
  '0111111001111110',
  '0111111001111110',
  '0111111001111110',
  '0111111001111110',
];

/* css/style.css の --bg / --accent 系に合わせた配色 */
const PALETTE = {
  '0': hexToRgba('#0f1226'), // --bg
  '1': hexToRgba('#ffb703'), // --accent（金）
  '2': hexToRgba('#f08c00'), // ボタン下側グラデーション色（濃い金）
  '3': hexToRgba('#8ecae6'), // --accent2（水色アクセント）
};
const BG_COLOR = PALETTE['0'];

function hexToRgba(hex) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return [r, g, b, 255];
}

/* ------------------------------------------------------------
   ピクセルアート → RGBA バッファ（nearest-neighbor 拡大）
------------------------------------------------------------ */
function renderRGBA(size, { maskable = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const inner = maskable ? Math.round(size * 0.6) : size;
  const offset = maskable ? Math.floor((size - inner) / 2) : 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color;
      const inArt = x >= offset && x < offset + inner && y >= offset && y < offset + inner;
      if (inArt) {
        const srcY = Math.min(15, Math.floor(((y - offset) * 16) / inner));
        const srcX = Math.min(15, Math.floor(((x - offset) * 16) / inner));
        color = PALETTE[PIXELS[srcY][srcX]];
      } else {
        color = BG_COLOR;
      }
      const idx = (y * size + x) * 4;
      buf[idx] = color[0];
      buf[idx + 1] = color[1];
      buf[idx + 2] = color[2];
      buf[idx + 3] = color[3];
    }
  }
  return buf;
}

/* ------------------------------------------------------------
   自作 CRC32（テーブル方式）
------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/* ------------------------------------------------------------
   PNG エンコード（8bit RGBA・非インタレース・フィルタなし）
------------------------------------------------------------ */
function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // フィルタタイプ: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idatData = deflateSync(raw);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idatData),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function writeIcon(name, size, opts) {
  const rgba = renderRGBA(size, opts);
  const png = encodePNG(size, size, rgba);
  const dest = path.join(ICONS_DIR, name);
  writeFileSync(dest, png);
  console.log(`generated: icons/${name} (${size}x${size}, ${png.length} bytes)`);
}

mkdirSync(ICONS_DIR, { recursive: true });

writeIcon('icon-192.png', 192);
writeIcon('icon-512.png', 512);
writeIcon('icon-512-maskable.png', 512, { maskable: true });
writeIcon('apple-touch-icon.png', 180); // 背景は不透明(alpha=255)で塗りつぶし済み
