export type Point = { x: number; y: number };
export type Matrix3 = [number, number, number, number, number, number, number, number, number];

function normalization(points: Point[]): Matrix3 {
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const meanDistance =
    points.reduce((sum, p) => sum + Math.hypot(p.x - cx, p.y - cy), 0) / points.length;
  const s = Math.SQRT2 / (meanDistance || 1);
  return [s, 0, -s * cx, 0, s, -s * cy, 0, 0, 1];
}

function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const out = new Array(9).fill(0) as Matrix3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      for (let k = 0; k < 3; k++) out[row * 3 + col] += a[row * 3 + k] * b[k * 3 + col];
    }
  }
  return out;
}

function invertSimilarity([s, , tx, , , ty]: Matrix3): Matrix3 {
  return [1 / s, 0, -tx / s, 0, 1 / s, -ty / s, 0, 0, 1];
}

function solve(matrix: number[][], vector: number[]): number[] {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) throw new Error("Degenerate point configuration");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col] / a[col][col];
      for (let k = col; k <= n; k++) a[row][k] -= factor * a[col][k];
    }
  }
  return a.map((row, i) => row[n] / row[i]);
}

export function applyHomography(h: Matrix3, { x, y }: Point): Point {
  const w = h[6] * x + h[7] * y + h[8];
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w };
}

export function fitAffine(source: Point[], target: Point[]): Matrix3 {
  const ata = Array.from({ length: 3 }, () => new Array(3).fill(0));
  const atu = new Array(3).fill(0);
  const atv = new Array(3).fill(0);
  source.forEach(({ x, y }, index) => {
    const row = [x, y, 1];
    for (let i = 0; i < 3; i++) {
      atu[i] += row[i] * target[index].x;
      atv[i] += row[i] * target[index].y;
      for (let j = 0; j < 3; j++) ata[i][j] += row[i] * row[j];
    }
  });
  const [a, b, c] = solve(ata, atu);
  const [d, e, f] = solve(ata, atv);
  return [a, b, c, d, e, f, 0, 0, 1];
}

export function fitHomography(source: Point[], target: Point[]): Matrix3 {
  if (source.length < 4 || source.length !== target.length) {
    throw new Error("A homography needs at least 4 point pairs");
  }
  const ts = normalization(source);
  const tt = normalization(target);
  const ata = Array.from({ length: 8 }, () => new Array(8).fill(0));
  const atb = new Array(8).fill(0);

  source.forEach((rawSource, index) => {
    const { x, y } = applyHomography(ts, rawSource);
    const { x: u, y: v } = applyHomography(tt, target[index]);
    const rows: [number[], number][] = [
      [[x, y, 1, 0, 0, 0, -u * x, -u * y], u],
      [[0, 0, 0, x, y, 1, -v * x, -v * y], v],
    ];
    for (const [row, rhs] of rows) {
      for (let i = 0; i < 8; i++) {
        atb[i] += row[i] * rhs;
        for (let j = 0; j < 8; j++) ata[i][j] += row[i] * row[j];
      }
    }
  });

  const h = solve(ata, atb);
  const normalized: Matrix3 = [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
  const result = multiply(invertSimilarity(tt), multiply(normalized, ts));
  return result.map((value) => value / result[8]) as Matrix3;
}
