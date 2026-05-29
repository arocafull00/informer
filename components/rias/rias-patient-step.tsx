import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RiasPatient } from "@/lib/rias-scoring";

type RiasPatientStepProps = {
  patient: RiasPatient;
  onChange: (patient: RiasPatient) => void;
};

export function RiasPatientStep({ patient, onChange }: RiasPatientStepProps) {
  const update = (field: keyof RiasPatient, value: string) => {
    onChange({ ...patient, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="rias-patient-name" className="text-body-md text-on-surface">
          Apellidos y nombre
        </Label>
        <Input
          id="rias-patient-name"
          value={patient.name}
          onChange={(e) => update("name", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rias-patient-evaluation" className="text-body-md text-on-surface">
          Fecha de evaluación
        </Label>
        <Input
          id="rias-patient-evaluation"
          type="date"
          value={patient.evaluationDate}
          onChange={(e) => update("evaluationDate", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rias-patient-age" className="text-body-md text-on-surface">
          Edad cronológica (años)
        </Label>
        <Input
          id="rias-patient-age"
          inputMode="numeric"
          value={patient.chronologicalAge}
          onChange={(e) => update("chronologicalAge", e.target.value)}
          className="h-9 max-w-[8rem] border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
    </div>
  );
}
