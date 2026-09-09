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

  if (elevated) {
    return <span className="font-bold text-on-surface">{score}</span>;
  }

  return <span className="font-semibold text-on-surface">{score}</span>;
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
        {label}
      </th>
      <td className="px-4 py-3 text-center text-body-md tabular-nums">
        <ResultValue score={score} complete={complete} elevated={elevated} />
      </td>
    </tr>
  );
}
