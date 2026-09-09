"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { isCarasDirectScoreInRange } from "@/lib/caras-r-scoring";

type CarasInputCode = "A" | "E";

const LABELS: Record<CarasInputCode, { title: string; description: string }> = {
  A: {
    title: "Aciertos",
    description: "Número total de respuestas correctas",
  },
  E: {
    title: "Errores",
    description: "Número total de respuestas incorrectas",
  },
};

type CarasScoreInputRowProps = {
  code: CarasInputCode;
  value: number | undefined;
  onValidChange: (value: number) => void;
  onClear: () => void;
  disabled?: boolean;
  showTopBorder?: boolean;
};

export function CarasScoreInputRow({
  code,
  value,
  onValidChange,
  onClear,
  disabled = false,
  showTopBorder = false,
}: CarasScoreInputRowProps) {
  const [draft, setDraft] = useState(() =>
    value !== undefined ? String(value) : ""
  );
  const [error, setError] = useState<"invalid" | "out-of-range" | null>(null);
  const errorId = `caras-score-error-${code}`;
  const label = LABELS[code];

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
    if (!isCarasDirectScoreInRange(parsed)) {
      setError("out-of-range");
      onClear();
      return;
    }

    setError(null);
    onValidChange(parsed);
  };

  return (
    <div
      className={`grid min-h-20 grid-cols-[minmax(0,1fr)_minmax(7rem,11rem)] items-start gap-4 px-4 py-3 ${
        showTopBorder ? "border-t border-outline-variant" : ""
      }`}
    >
      <label htmlFor={`caras-score-${code}`} className="min-w-0 pt-2">
        <span className="block text-body-md font-medium text-on-surface">
          {label.title}
        </span>
        <span className="mt-0.5 block text-body-md text-on-surface-variant">
          {label.description}
        </span>
      </label>
      <div className="pt-1">
        <Input
          id={`caras-score-${code}`}
          type="number"
          inputMode="numeric"
          min={0}
          max={60}
          step={1}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          disabled={disabled}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          aria-label={`Puntuación directa de ${label.title.toLowerCase()}`}
          className="h-10 border-outline-variant bg-surface-container-lowest text-right text-body-lg tabular-nums text-on-surface"
        />
        {error ? (
          <p
            id={errorId}
            className="mt-1 text-right text-label-sm leading-snug text-error"
          >
            {error === "out-of-range"
              ? "Introduce un entero de 0 a 60"
              : "Valor no válido"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
