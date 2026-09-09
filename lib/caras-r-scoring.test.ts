import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCarasMarkdown,
  carasNorms,
  getCarasPercentile,
  getCarasScoreSummary,
  isCarasDirectScoreInRange,
} from "./caras-r-scoring.ts";
import {
  CARAS_COURSES,
  type CarasScoreCode,
} from "./caras-r-types.ts";

test("calcula el caso acordado para 2.º EPO", () => {
  const result = getCarasScoreSummary(
    { age: 7, course: "2_EPO" },
    { A: 41, E: 2 }
  );

  assert.equal(result.netScore, 39);
  assert.equal(result.ici, 91);
  assert.deepEqual(
    result.rows.map(({ percentile }) => percentile),
    [99, 80, 99, 55]
  );
});

test("el curso desambigua el baremo cuando la edad es 7", () => {
  const firstCourse = getCarasScoreSummary(
    { age: 7, course: "1_EPO" },
    { A: 41, E: 2 }
  );
  const secondCourse = getCarasScoreSummary(
    { age: 7, course: "2_EPO" },
    { A: 41, E: 2 }
  );

  assert.equal(firstCourse.normStatus, "matched");
  assert.equal(secondCourse.normStatus, "matched");
  assert.equal(firstCourse.rows[3].percentile, 60);
  assert.equal(secondCourse.rows[3].percentile, 55);
});

test("respeta los límites corregidos de los baremos proporcionados", () => {
  assert.equal(
    getCarasPercentile({ age: 6, course: "1_EPO" }, "E", 1),
    60
  );
  assert.equal(
    getCarasPercentile({ age: 8, course: "2_EPO" }, "ICI", 65),
    15
  );
  assert.equal(
    getCarasPercentile({ age: 8, course: "2_EPO" }, "ICI", 70),
    15
  );
});

test("no emite percentiles con edad y curso incompatibles", () => {
  const result = getCarasScoreSummary(
    { age: 6, course: "2_EPO" },
    { A: 20, E: 3 }
  );

  assert.equal(result.normStatus, "age-course-mismatch");
  assert.ok(result.rows.every(({ percentile }) => percentile === null));
});

test("deja ICI sin calcular cuando no hay respuestas", () => {
  const result = getCarasScoreSummary(
    { age: 7, course: "1_EPO" },
    { A: 0, E: 0 }
  );

  assert.equal(result.netScore, 0);
  assert.equal(result.ici, null);
  assert.equal(result.rows[3].percentile, null);
});

test("valida puntuaciones enteras entre 0 y 60", () => {
  assert.equal(isCarasDirectScoreInRange(0), true);
  assert.equal(isCarasDirectScoreInRange(60), true);
  assert.equal(isCarasDirectScoreInRange(-1), false);
  assert.equal(isCarasDirectScoreInRange(61), false);
  assert.equal(isCarasDirectScoreInRange(2.5), false);
});

test("genera la tabla Markdown exacta", () => {
  const markdown = buildCarasMarkdown(
    { age: 7, course: "2_EPO" },
    { A: 41, E: 2 }
  );

  assert.equal(
    markdown,
    [
      "| PDPC | PD | PC |",
      "| --- | ---: | ---: |",
      "| ACIERTOS | 41 | 99 |",
      "| ERRORES | 2 | 80 |",
      "| NETOS | 39 | 99 |",
      "| ÍNDICE CONTROL IMPULSIVIDAD | 91 | 55 |",
    ].join("\n")
  );
});

test("carga todos los cursos del archivo completo y documenta su único hueco", () => {
  const domains: Record<CarasScoreCode, [number, number]> = {
    A: [0, 60],
    E: [0, 60],
    A_E: [-60, 60],
    ICI: [-100, 100],
  };
  const gaps: Array<[string, CarasScoreCode, number]> = [];

  for (const { value: course } of CARAS_COURSES) {
    for (const [code, [min, max]] of Object.entries(domains) as Array<
      [CarasScoreCode, [number, number]]
    >) {
      for (let score = min; score <= max; score += 1) {
        const matched = carasNorms[course][code].some(
          (interval) => score >= interval.min && score <= interval.max
        );
        if (!matched) gaps.push([course, code, score]);
      }
    }
  }

  assert.deepEqual(gaps, [["1_ESO", "ICI", 93]]);
  assert.equal(CARAS_COURSES.length, 11);
});

test("señala en Markdown una puntuación sin correspondencia normativa", () => {
  const markdown = buildCarasMarkdown(
    { age: 12, course: "1_ESO" },
    { A: 58, E: 2 }
  );

  assert.match(markdown, /\| ÍNDICE CONTROL IMPULSIVIDAD \| 93 \| Sin correspondencia \|/);
});
