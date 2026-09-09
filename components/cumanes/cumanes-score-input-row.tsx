"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  cumanesNorms,
  directScoreLimits,
  formatCumanesDirectScoreLimitsLabel,
  isCumanesDirectScoreInRange,
} from "@/lib/cumanes-scoring";
import type { TestCode } from "@/lib/cumanes-types";

type CumanesScoreInputRowProps = {
  code: TestCode;
  value: number | undefined;
  onValidChange: (value: number) => void;
  onClear: () => void;
  disabled?: boolean;
  showTopBorder?: boolean;
};

export function CumanesScoreInputRow({
  code,
  value,
  onValidChange,
  onClear,
  disabled = false,
  showTopBorder = false,
}: CumanesScoreInputRowProps) {
  const [draft, setDraft] = useState(
    () => (value !== undefined ? String(value) : "")
  );
  const [error, setError] = useState<"invalid" | "out-of-range" | null>(null);
  const limitsLabel = formatCumanesDirectScoreLimitsLabel(code);
  const errorId = `cumanes-score-error-${code}`;

  const handleChange = (raw: string) => {
    setDraft(raw);

    if (raw === "") {
      setError(null);
      onClear();
      return;
    }

    const parsed = Number(raw);
    if (!Number.isInteger(parsed)) {
      setError("invalid");
      onClear();
      return;
    }

    if (!isCumanesDirectScoreInRange(code, parsed)) {
      setError("out-of-range");
      onClear();
      return;
    }

    setError(null);
    onValidChange(parsed);
  };

  return (
    <div
      className={`grid min-h-16 grid-cols-[minmax(0,1fr)_minmax(7rem,11rem)] items-start gap-4 px-4 py-3 ${
        showTopBorder ? "border-t border-outline-variant" : ""
      }`}
    >
      <label htmlFor={`cumanes-score-${code}`} className="min-w-0 pt-2">
        <span className="block text-body-md font-medium text-on-surface">
          {cumanesNorms.tests[code].name}
        </span>
        <span className="mt-0.5 block text-mono-sm font-medium text-primary">
          {code}
        </span>
      </label>
      <div className="pt-1">
        <Input
          id={`cumanes-score-${code}`}
          type="number"
          inputMode="numeric"
          min={directScoreLimits[code].min ?? undefined}
          max={directScoreLimits[code].max ?? undefined}
          step={1}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          disabled={disabled}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          aria-label={`Puntuación directa de ${cumanesNorms.tests[code].name}`}
          className="h-10 border-outline-variant bg-surface-container-lowest text-right text-body-lg tabular-nums text-on-surface"
        />
        {error ? (
          <p
            id={errorId}
            className="mt-1 text-right text-label-sm leading-snug text-error"
          >
            {error === "out-of-range" ? (
              <>
                Fuera de rango
                <br />
                {limitsLabel}
              </>
            ) : (
              "Valor no válido"
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
