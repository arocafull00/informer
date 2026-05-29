import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAdirScoreInput } from "@/lib/adir-scoring";

type AdirScoreInputRowProps = {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function AdirScoreInputRow({
  id,
  label,
  value,
  onChange,
}: AdirScoreInputRowProps) {
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
        onChange={(e) => onChange(parseAdirScoreInput(e.target.value))}
        className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
      />
    </div>
  );
}
