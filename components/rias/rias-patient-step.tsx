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
        <p className="text-body-md text-on-surface">Edad cronológica</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rias-patient-age-years" className="text-label-md text-on-surface-variant">
              Años
            </Label>
            <Input
              id="rias-patient-age-years"
              inputMode="numeric"
              value={patient.chronologicalAge}
              onChange={(e) => update("chronologicalAge", e.target.value)}
              className="h-9 w-20 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rias-patient-age-months" className="text-label-md text-on-surface-variant">
              Meses (opcional)
            </Label>
            <Input
              id="rias-patient-age-months"
              inputMode="numeric"
              value={patient.chronologicalAgeMonths}
              onChange={(e) => update("chronologicalAgeMonths", e.target.value)}
              className="h-9 w-20 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
