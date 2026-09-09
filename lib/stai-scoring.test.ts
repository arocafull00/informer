import assert from "node:assert/strict";
import test from "node:test";
import staiQuestions from "../data/stai.json" with { type: "json" };
import { buildStaiMarkdown, getStaiScoreSummary } from "./stai-scoring.ts";

const identification = { ageGroup: "adultos" as const };

test("actualiza la PD desde la primera respuesta sin anticipar el percentil", () => {
  const summary = getStaiScoreSummary(identification, "varon", {
    "stai-01": 0,
  });

  assert.equal(summary.estado.directScore, 3);
  assert.equal(summary.estado.percentile, null);
  assert.equal(summary.estado.complete, false);
  assert.equal(summary.rasgo.directScore, null);
});

test("mantiene independientes los acumulados de Estado y Rasgo", () => {
  const summary = getStaiScoreSummary(identification, "mujer", {
    "stai-03": 2,
    "stai-21": 1,
  });

  assert.equal(summary.estado.directScore, 2);
  assert.equal(summary.rasgo.directScore, 2);
  assert.equal(summary.estado.percentile, null);
  assert.equal(summary.rasgo.percentile, null);
});

test("calcula los percentiles cuando cada escala está completa", () => {
  const answers = Object.fromEntries(
    staiQuestions.map((question) => [question.id, 0])
  );
  const summary = getStaiScoreSummary(identification, "varon", answers);

  assert.equal(summary.estado.directScore, 30);
  assert.equal(summary.rasgo.directScore, 21);
  assert.equal(summary.estado.complete, true);
  assert.equal(summary.rasgo.complete, true);
  assert.notEqual(summary.estado.percentile, null);
  assert.notEqual(summary.rasgo.percentile, null);
});

test("refleja el acumulado parcial en la tabla Markdown", () => {
  const markdown = buildStaiMarkdown(identification, "varon", {
    "stai-01": 0,
  });

  assert.match(markdown, /\| PD \| 3 \| — \|/);
  assert.match(markdown, /\| Pc \| — \| — \|/);
});
