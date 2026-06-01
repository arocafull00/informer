import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAdirScoreInput } from "@/lib/adir-scoring";

type AdirScoreInputRowProps = {
  id: string;
  label: ReactNode;
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
    <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-start gap-3">
      <Label htmlFor={id} className="break-words text-body-md text-on-surface-variant">
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
