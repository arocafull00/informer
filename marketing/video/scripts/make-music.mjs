// Original synthesized music bed for the GasApp promo (royalty-free, generated here).
// 120 BPM, 20 s, synced to the edit:
//   0–8 s  tension: minor pad, clock ticks that speed up at the 4 s edit, riser into 8 s
//   8 s    impact as the documents become GasApp
//   8–15 s release: major progression, soft four-on-the-floor, 16th-note plucks
//   15–20 s brand: open Cadd9 pad + three bell notes on signature / headline / domain, fade out
// Usage: node scripts/make-music.mjs  → public/music.wav
import fs from "node:fs";
import path from "node:path";

const SR = 44100;
const DUR = 20;
const N = SR * DUR;
const dry = [new Float32Array(N), new Float32Array(N)];
const send = [new Float32Array(N), new Float32Array(N)]; // reverb bus

const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

function add(buf, i, v, pan) {
  if (i < 0 || i >= N) return;
  const l = Math.cos((pan + 1) * Math.PI / 4);
  const r = Math.sin((pan + 1) * Math.PI / 4);
  buf[0][i] += v * l;
  buf[1][i] += v * r;
}

/** Generic voice: fn(t, k) returns sample for local time t; env handles attack/release. */
function voice(t0, dur, fn, { amp = 0.2, attack = 0.01, release = 0.2, pan = 0, wet = 0.3 } = {}) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor((dur + release) * SR);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    let env = Math.min(1, t / attack);
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / release);
    const v = fn(t) * env * amp;
    add(dry, start + n, v * (1 - wet * 0.5), pan);
    add(send, start + n, v * wet, pan);
  }
}

const softSaw = (f, t) => {
  let s = 0;
  for (let k = 1; k <= 7; k++) s += Math.sin(2 * Math.PI * f * k * t) * 0.62 ** k / k;
  return s;
};

function pad(t0, dur, notes, amp = 0.05) {
  notes.forEach((m, i) => {
    for (const d of [-0.0018, 0, 0.0021]) {
      voice(t0, dur, (t) => softSaw(hz(m) * (1 + d), t), { amp, attack: 0.7, release: 0.9, pan: (i % 2 ? 0.35 : -0.35) + d * 80, wet: 0.55 });
    }
  });
}

function pluck(t0, m, amp = 0.09, pan = 0) {
  const f = hz(m);
  voice(t0, 0.32, (t) => {
    let s = 0;
    for (let k = 1; k <= 5; k++) s += Math.sin(2 * Math.PI * f * k * t) / (k * k);
    return s * Math.exp(-t * 7);
  }, { amp, attack: 0.003, release: 0.15, pan, wet: 0.35 });
}

function bell(t0, m, amp = 0.12, pan = 0) {
  const f = hz(m);
  voice(t0, 2.6, (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 3) + 0.12 * Math.sin(2 * Math.PI * f * 3.98 * t) * Math.exp(-t * 5)) * Math.exp(-t * 1.3),
    { amp, attack: 0.004, release: 0.6, pan, wet: 0.6 });
}

function bass(t0, dur, m, amp = 0.16) {
  const f = hz(m);
  voice(t0, dur, (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * (0.55 + 0.45 * Math.exp(-t * 3)),
    { amp, attack: 0.012, release: 0.12, pan: 0, wet: 0.05 });
}

function kick(t0, amp = 0.32) {
  let phase = 0;
  voice(t0, 0.4, (t) => {
    const f = 45 + 75 * Math.exp(-t * 28);
    phase += (2 * Math.PI * f) / SR;
    return Math.sin(phase) * Math.exp(-t * 9);
  }, { amp, attack: 0.001, release: 0.05, wet: 0.03 });
}

function tick(t0, amp = 0.05, pan = 0.25) {
  let prev = 0;
  voice(t0, 0.05, (t) => {
    const n = rnd();
    const hp = n - prev; // crude high-pass
    prev = n;
    return hp * Math.exp(-t * 70);
  }, { amp, attack: 0.0005, release: 0.02, pan, wet: 0.15 });
}

function riser(t0, t1, amp = 0.09) {
  let lp = 0;
  voice(t0, t1 - t0, (t) => {
    const p = t / (t1 - t0);
    const a = 0.02 + 0.25 * p * p;
    lp += a * (rnd() - lp);
    return lp * p * p;
  }, { amp, attack: 0.05, release: 0.01, wet: 0.4 });
}

function impact(t0) {
  let phase = 0;
  voice(t0, 1.6, (t) => {
    const f = 34 + 46 * Math.exp(-t * 9);
    phase += (2 * Math.PI * f) / SR;
    return Math.sin(phase) * Math.exp(-t * 2.4);
  }, { amp: 0.36, attack: 0.002, release: 0.2, wet: 0.2 });
  let lp = 0;
  voice(t0, 0.9, (t) => { lp += 0.08 * (rnd() - lp); return lp * Math.exp(-t * 5); }, { amp: 0.25, attack: 0.002, release: 0.1, wet: 0.6 });
}

const BEAT = 0.5;
const CH = {
  Am: [57, 60, 64, 69], F: [53, 57, 60, 65], E: [52, 56, 59, 64],
  C: [60, 64, 67, 72], G: [55, 59, 62, 67], Cadd9: [60, 64, 67, 74],
};
const ROOT = { Am: 45, F: 41, E: 40, C: 36, G: 43 };

// 0–8 s · tension
[["Am", 0], ["Am", 2], ["F", 4], ["E", 6]].forEach(([c, t]) => {
  pad(t, 2, CH[c], 0.035);
  bass(t, 1.9, ROOT[c], 0.12);
  // sparse 8th-note arpeggio
  [0, 1, 2, 1].forEach((k, i) => pluck(t + i * BEAT, CH[c][k] + 12, 0.055, i % 2 ? 0.3 : -0.3));
});
// clock: quarter notes 0–4 s, eighths 4–8 s (after the edit), getting louder
for (let b = 0; b < 8; b++) tick(b * BEAT, 0.035 + b * 0.002, b % 2 ? 0.3 : -0.3);
for (let e = 0; e < 16; e++) tick(4 + e * BEAT / 2, 0.045 + e * 0.003, e % 2 ? 0.35 : -0.35);
riser(6.2, 8.0);
impact(8.0);

// 8–15 s · release
[["C", 8], ["G", 10], ["Am", 12], ["F", 14]].forEach(([c, t]) => {
  const len = t === 14 ? 1 : 2;
  pad(t, len, CH[c], 0.04);
  for (let b = 0; b < len / BEAT; b++) bass(t + b * BEAT, BEAT * 0.9, ROOT[c], 0.13);
  const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
  for (let s = 0; s < (len / BEAT) * 4; s++) pluck(t + s * BEAT / 4, CH[c][pattern[s % 8]] + 12, s % 4 === 0 ? 0.07 : 0.045, (s % 2 ? 0.4 : -0.4));
});
for (let b = 0; b < 14; b++) kick(8 + b * BEAT, b === 0 ? 0 : 0.26);
for (let b = 0; b < 14; b++) tick(8 + b * BEAT + BEAT / 2, 0.04, 0.2);

// 15–20 s · brand
pad(15, 4.2, CH.Cadd9, 0.045);
bass(15, 3.5, 36, 0.12);
bell(15.6, 79, 0.10, -0.2); // G5 · signature
bell(16.33, 76, 0.09, 0.2); // E5 · headline
bell(17.0, 72, 0.09, 0); // C5 · domain

// Schroeder reverb on the send bus
function reverb(x) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.buf[c.i] = x[n] + y * 0.8;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    out[n] = s / 4;
  }
  for (const d of [225, 556]) {
    const buf = new Float32Array(d);
    let i = 0;
    for (let n = 0; n < N; n++) {
      const b = buf[i];
      const y = -out[n] + b;
      buf[i] = out[n] + b * 0.5;
      i = (i + 1) % d;
      out[n] = y;
    }
  }
  return out;
}
const wetL = reverb(send[0]);
const wetR = reverb(send[1]);

// Mix, fades, soft clip, normalise to -3 dBFS
const mix = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fade = Math.min(1, t / 0.15) * (t > 18.4 ? Math.max(0, (DUR - t) / 1.6) : 1);
  for (const c of [0, 1]) {
    const v = Math.tanh(((c ? dry[1][n] + wetR[n] * 0.9 : dry[0][n] + wetL[n] * 0.9)) * 1.4) * fade;
    mix[c][n] = v;
    peak = Math.max(peak, Math.abs(v));
  }
}
const gain = 0.708 / peak;
const data = Buffer.alloc(44 + N * 4);
data.write("RIFF", 0); data.writeUInt32LE(36 + N * 4, 4); data.write("WAVE", 8);
data.write("fmt ", 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write("data", 36); data.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[0][n] * gain)) * 32767), 44 + n * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[1][n] * gain)) * 32767), 46 + n * 4);
}
const out = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "public", "music.wav");
fs.writeFileSync(out, data);
console.log(`wrote ${out} (peak gain ${gain.toFixed(2)})`);
