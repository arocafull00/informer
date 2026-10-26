import assert from "node:assert/strict";
import test from "node:test";
import staicQuestions from "../data/staic.json" with { type: "json" };
import { buildStaicMarkdown, getStaicScoreSummary } from "./staic-scoring.ts";

test("invierte los ítems positivos de Ansiedad-Estado", () => {
  const summary = getStaicScoreSummary({
    "staic-01": 1,
    "staic-02": 1,
  });

  assert.equal(summary.estado.directScore, 4);
  assert.equal(summary.estado.complete, false);
  assert.equal(summary.rasgo.directScore, null);
});

test("puntúa Ansiedad-Rasgo de forma directa", () => {
  const summary = getStaicScoreSummary({
    "staic-21": 3,
    "staic-40": 2,
  });

  assert.equal(summary.estado.directScore, null);
  assert.equal(summary.rasgo.directScore, 5);
});

test("calcula las PD completas entre 20 y 60", () => {
  const allOnes = Object.fromEntries(
    staicQuestions.map((question) => [question.id, 1])
  );
  const summary = getStaicScoreSummary(allOnes);

  assert.equal(summary.estado.directScore, 40);
  assert.equal(summary.rasgo.directScore, 20);
  assert.equal(summary.estado.complete, true);
  assert.equal(summary.rasgo.complete, true);

  const allThrees = Object.fromEntries(
    staicQuestions.map((question) => [question.id, 3])
  );
  const maxSummary = getStaicScoreSummary(allThrees);

  assert.equal(maxSummary.estado.directScore, 40);
  assert.equal(maxSummary.rasgo.directScore, 60);
});

test("genera la tabla Markdown con las PD", () => {
  assert.equal(
    buildStaicMarkdown({ "staic-03": 3, "staic-22": 2 }),
    [
      "| | Ansiedad - estado | Ansiedad - rasgo |",
      "| --- | ---: | ---: |",
      "| PD | 3 | 2 |",
    ].join("\n")
  );
});
