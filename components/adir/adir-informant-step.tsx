import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdirInformant } from "@/lib/adir-scoring";

type AdirInformantStepProps = {
  informant: AdirInformant;
  onChange: (informant: AdirInformant) => void;
};

export function AdirInformantStep({
  informant,
  onChange,
}: AdirInformantStepProps) {
  const update = (field: keyof AdirInformant, value: string) => {
    onChange({ ...informant, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="adir-informant-name" className="text-body-md text-on-surface">
          Nombre
        </Label>
        <Input
          id="adir-informant-name"
          value={informant.name}
          onChange={(e) => update("name", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="adir-informant-relationship"
          className="text-body-md text-on-surface"
        >
          Relación con el sujeto
        </Label>
        <Input
          id="adir-informant-relationship"
          value={informant.relationshipToSubject}
          onChange={(e) => update("relationshipToSubject", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
    </div>
  );
}
