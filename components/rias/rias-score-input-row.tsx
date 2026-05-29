import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseRiasScoreInput } from "@/lib/rias-scoring";

type RiasScoreInputRowProps = {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function RiasScoreInputRow({
  id,
  label,
  value,
  onChange,
}: RiasScoreInputRowProps) {
  return (
    <div className="grid grid-cols-[1fr_5rem] items-center gap-3">
      <Label htmlFor={id} className="text-body-md text-on-surface">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={value === null ? "" : String(value)}
        onChange={(e) => onChange(parseRiasScoreInput(e.target.value))}
        className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
      />
    </div>
  );
}
