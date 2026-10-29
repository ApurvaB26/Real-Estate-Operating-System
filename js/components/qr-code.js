/**
 * File: js/components/qr-code.js
 * Role: Small self-contained QR code generator (byte mode, error correction M, versions 1 to 4) that returns an svg string.
 * Dependencies: Loaded by index.html as script 64 of 80. Uses no other scripts. Its globals are used by js/features/site-portal.js.
 */

// Why in-house: the app has no build step and should work without a network, and a drawing number plus revision is short enough for version 4 (up to 62 bytes)
// Algorithm after the standard QR model 2 layout: data bits, Reed-Solomon codewords, interleaving, function patterns, zigzag placement, best of 8 masks
const QR_RAW_CODEWORDS = [0, 26, 44, 70, 100];

// Error correction M: [codewords per block, blocks] for each version
const QR_ECC_M = [null, [10, 1], [16, 1], [26, 1], [18, 2]];

function qrGfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function qrReedSolomonDivisor(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = qrGfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = qrGfMul(root, 0x02);
  }
  return result;
}

function qrReedSolomonRemainder(data, divisor) {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    divisor.forEach((coef, i) => { result[i] ^= qrGfMul(coef, factor); });
  }
  return result;
}

// Returns { size, modules } where modules[y][x] is true for a dark module
function qrEncode(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  let version = 0;
  for (let v = 1; v <= 4; v++) {
    const dataCapacity = QR_RAW_CODEWORDS[v] - QR_ECC_M[v][0] * QR_ECC_M[v][1];
    if (12 + bytes.length * 8 <= dataCapacity * 8) { version = v; break; }
  }
  if (!version) throw new Error("QR text is too long");
  const size = version * 4 + 17;
  const [eccLen, numBlocks] = QR_ECC_M[version];
  const dataCapacity = QR_RAW_CODEWORDS[version] - eccLen * numBlocks;

  // Data bits: mode 0100 (bytes), 8-bit length, the bytes, terminator, padding
  const bits = [];
  const push = (value, length) => { for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  push(0b0100, 4);
  push(bytes.length, 8);
  bytes.forEach((b) => push(b, 8));
  push(0, Math.min(4, dataCapacity * 8 - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < dataCapacity * 8; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));

  // Split into blocks, add Reed-Solomon codewords, interleave
  const raw = QR_RAW_CODEWORDS[version];
  const divisor = qrReedSolomonDivisor(eccLen);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  const blocks = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = qrReedSolomonRemainder(dat, divisor);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const codewords = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => { if (i !== shortLen - eccLen || j >= numShort) codewords.push(block[i]); });
  }

  // Function patterns
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));
  const setFunction = (x, y, dark) => { modules[y][x] = dark; isFunction[y][x] = true; };
  for (let i = 0; i < size; i++) { setFunction(6, i, i % 2 === 0); setFunction(i, 6, i % 2 === 0); }
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy, dist = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) setFunction(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  if (version > 1) {
    const center = size - 7;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setFunction(center + dx, center + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  const drawFormat = (mask) => {
    const formatData = (0b00 << 3) | mask; // error correction M is 00
    let rem = formatData;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const formatBits = ((formatData << 10) | rem) ^ 0x5412;
    const bit = (i) => ((formatBits >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) setFunction(8, i, bit(i));
    setFunction(8, 7, bit(6)); setFunction(8, 8, bit(7)); setFunction(7, 8, bit(8));
    for (let i = 9; i < 15; i++) setFunction(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, bit(i));
    setFunction(8, size - 8, true);
  };
  drawFormat(0);

  // Codewords go in a zigzag of two-module-wide columns, right to left, skipping the timing column
  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < codewords.length * 8) {
          modules[y][x] = ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) !== 0;
          bitIndex++;
        }
      }
    }
  }

  const maskFn = [
    (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  ];
  const applyMask = (mask) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!isFunction[y][x] && maskFn[mask](x, y)) modules[y][x] = !modules[y][x];
  };
  // Penalty: long runs, 2x2 blocks and dark/light balance; lower is easier to scan
  const penalty = () => {
    let score = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (let a = 0; a < size; a++) {
        let run = 1;
        for (let b = 1; b < size; b++) {
          const same = (pass ? modules[b][a] : modules[a][b]) === (pass ? modules[b - 1][a] : modules[a][b - 1]);
          if (same) { run++; if (run === 5) score += 3; else if (run > 5) score++; } else run = 1;
        }
      }
    }
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) if (modules[y][x] === modules[y][x + 1] && modules[y][x] === modules[y + 1][x] && modules[y][x] === modules[y + 1][x + 1]) score += 3;
    const dark = modules.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
    score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    return score;
  };
  let bestMask = 0, bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask); drawFormat(mask);
    const score = penalty();
    if (score < bestScore) { bestScore = score; bestMask = mask; }
    applyMask(mask);
  }
  applyMask(bestMask); drawFormat(bestMask);
  return { size, modules };
}

// svg string: dark modules on a white square with a 4-module quiet zone; pixelSize is the width and height in px
function qrSvg(text, pixelSize = 96, dark = "#2b1d17") {
  const { size, modules } = qrEncode(text);
  const quiet = 4, total = size + quiet * 2;
  let path = "";
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (modules[y][x]) path += `M${x + quiet},${y + quiet}h1v1h-1z`;
  return `<svg class="site-qr-image" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code ${escapeHtml(text)}"><rect width="${total}" height="${total}" fill="#ffffff"/><path d="${path}" fill="${dark}"/></svg>`;
}
