type DersResultRowProps = {
  label: string;
  score: number | null;
  complete: boolean;
  elevated: boolean;
};

function ResultValue({
  score,
  complete,
  elevated,
}: Pick<DersResultRowProps, "score" | "complete" | "elevated">) {
  if (!complete || score === null) {
    return <span className="text-outline">—</span>;
  }

  if (!elevated) {
    return <span className="font-semibold text-on-surface">{score}</span>;
  }

  return (
    <span className="inline-flex min-w-12 items-center justify-center rounded-md border border-primary px-2.5 py-1 text-body-lg font-bold tabular-nums text-primary">
      {score}
    </span>
  );
}

export function DersResultRow({
  label,
  score,
  complete,
  elevated,
}: DersResultRowProps) {
  return (
    <tr className="border-t border-outline-variant align-middle">
      <th
        scope="row"
        className="px-4 py-3 text-left text-body-md font-medium text-on-surface"
      >
        <span className="inline-flex items-center gap-2">
          {elevated ? (
            <span
              className="size-2 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
          ) : null}
          {label}
        </span>
      </th>
      <td className="px-4 py-3 text-center text-body-md tabular-nums">
        <ResultValue score={score} complete={complete} elevated={elevated} />
      </td>
    </tr>
  );
}
