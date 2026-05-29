import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAdirScoreInput } from "@/lib/adir-scoring";

type AdirTotalRowProps = {
  id: string;
  label: string;
  value: number | null;
  computed?: boolean;
  optional?: boolean;
  onChange?: (value: number | null) => void;
};

export function AdirTotalRow({
  id,
  label,
  value,
  computed = false,
  optional = false,
  onChange,
}: AdirTotalRowProps) {
  const displayLabel = optional ? `${label} (opcional)` : label;

  if (computed) {
    return (
      <div className="grid grid-cols-[1fr_5rem] items-center gap-3">
        <Label htmlFor={id} className="text-body-md font-black text-on-surface">
          {displayLabel}
        </Label>
        <div
          id={id}
          className="flex h-9 items-center justify-end rounded-lg border border-outline-variant bg-surface-container px-2.5 text-body-md font-medium text-on-surface"
        >
          {value === null ? "—" : value}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_5rem] items-center gap-3">
      <Label htmlFor={id} className="text-body-md font-bold text-on-surface">
        {displayLabel}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange?.(parseAdirScoreInput(e.target.value))}
        className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
      />
    </div>
  );
}
