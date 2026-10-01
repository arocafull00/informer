import assert from "node:assert/strict";
import test from "node:test";
import norms from "../data/proesc-norms.json" with { type: "json" };
import {
  PROESC_COURSES,
  PROESC_TESTS,
  buildProescMarkdown,
  getProescResult,
  getProescSummary,
  parseProescPdfInput,
} from "./proesc-scoring.ts";

test("todos los baremos cubren las puntuaciones válidas sin huecos", () => {
  assert.equal(PROESC_COURSES.length, 8);
  for (const { value } of PROESC_COURSES) {
    const course = value as keyof typeof norms;
    for (const { key, max } of PROESC_TESTS) {
      for (let score = 0; score <= max; score++) {
        assert.ok(getProescResult(course, key, score), `${course}/${key}/${score}`);
      }
      assert.equal(getProescResult(course, key, max + 1), null);
    }
    for (let score = 0; score <= 168; score++) {
      assert.ok(getProescResult(course, "total_bateria", score), `${course}/total/${score}`);
    }
  }
});

test("suma provisional y clasifica el total solo con diez puntuaciones", () => {
  const partial = getProescSummary("3_primaria", { dictado_silabas: 21 });
  assert.equal(partial.total, 21);
  assert.equal(partial.rows[0].result, "si");
  assert.equal(partial.totalResult, null);
  assert.equal(partial.complete, false);

  const allMax = Object.fromEntries(PROESC_TESTS.map(({ key, max }) => [key, max]));
  const complete = getProescSummary("3_primaria", allMax);
  assert.equal(complete.total, 168);
  assert.equal(complete.totalResult, "nivel_alto");
  assert.equal(complete.complete, true);
  assert.match(buildProescMarkdown("3_primaria", allMax), /\| Total batería \| 168 \|.*X \|/);
});

test("rechaza puntuaciones fuera de su máximo y respeta el curso", () => {
  const invalid = getProescSummary("3_primaria", { dictado_silabas: 26 });
  assert.equal(invalid.answeredCount, 0);
  assert.equal(invalid.rows[0].score, null);
  assert.equal(getProescResult("3_primaria", "total_bateria", 90), "dudas");
  assert.equal(getProescResult("4_primaria", "total_bateria", 90), "si");
});

test("el PDF exige curso y diez PD válidas y nunca acepta un total enviado", () => {
  const answers = Object.fromEntries(PROESC_TESTS.map(({ key, max }) => [key, max]));
  assert.equal(parseProescPdfInput({ course: "", answers }), null);
  assert.equal(parseProescPdfInput({ course: "3_primaria", answers: { ...answers, dictado_silabas: undefined } }), null);
  assert.equal(parseProescPdfInput({ course: "3_primaria", answers: { ...answers, dictado_silabas: 26 } }), null);
  assert.equal(parseProescPdfInput({ course: "3_primaria", answers: { ...answers, escritura_cuento: 2.5 } }), null);
  const parsed = parseProescPdfInput({ patientName: "  Ana  ", course: "3_primaria", answers, total: 0, resultado: "si" });
  assert.equal(parsed?.patientName, "Ana");
  assert.equal(getProescSummary(parsed?.course ?? "", parsed?.answers ?? {}).total, 168);
});
