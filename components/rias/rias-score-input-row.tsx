import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseRiasScoreInput } from "@/lib/rias-scoring";

type RiasScoreInputRowProps = {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  autoAdvance?: boolean;
};

export function RiasScoreInputRow({
  id,
  label,
  value,
  onChange,
  autoAdvance = false,
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
        data-rias-auto-advance={autoAdvance || undefined}
        value={value === null ? "" : String(value)}
        onChange={(e) => {
          const input = e.currentTarget;
          onChange(parseRiasScoreInput(input.value));
          if (!autoAdvance || !/^\d{2}$/.test(input.value)) return;
          const inputs = Array.from(
            document.querySelectorAll<HTMLInputElement>(
              "input[data-rias-auto-advance]"
            )
          );
          const next = inputs[inputs.indexOf(input) + 1];
          if (next) {
            next.focus();
            next.select();
          }
        }}
        className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
      />
    </div>
  );
}
