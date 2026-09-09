import {
  RIAS_INDEX_LABELS,
  type RiasIndexKey,
  type RiasIndices,
  type RiasIntervals,
  type RiasPercentiles,
  type RiasTSums,
} from "@/lib/rias-scoring";

type RiasIndexResultRowProps = {
  indexKey: RiasIndexKey;
  tSums: RiasTSums;
  indices: RiasIndices;
  intervals: RiasIntervals;
  percentiles: RiasPercentiles;
};

function ResultValue({ value }: { value: string | number | null }) {
  if (value === null || value === "") {
    return <span className="text-outline">—</span>;
  }

  return <span className="font-semibold text-on-surface">{value}</span>;
}

export function RiasIndexResultRow({
  indexKey,
  tSums,
  indices,
  intervals,
  percentiles,
}: RiasIndexResultRowProps) {
  return (
    <tr className="border-t border-outline-variant align-middle">
      <th
        scope="row"
        className="px-4 py-3 text-left text-body-md font-medium text-on-surface"
      >
        {RIAS_INDEX_LABELS[indexKey]}
      </th>
      <td className="px-3 py-3 text-center text-body-md tabular-nums">
        <ResultValue value={tSums[indexKey]} />
      </td>
      <td className="px-3 py-3 text-center text-body-md tabular-nums">
        <ResultValue value={indices[indexKey]} />
      </td>
      <td className="px-3 py-3 text-center text-body-md tabular-nums">
        <ResultValue value={percentiles[indexKey]} />
      </td>
      <td className="px-4 py-3 text-center text-body-md tabular-nums">
        <ResultValue value={intervals[indexKey]} />
      </td>
    </tr>
  );
}
