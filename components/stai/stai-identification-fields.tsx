import { Ados2SubjectSexPicker } from "@/components/ados2/ados2-subject-sex-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ados2SubjectSex } from "@/lib/ados2-pdf/types";
import {
  STAI_AGE_GROUP_OPTIONS,
  type StaiAgeGroup,
  type StaiIdentification,
} from "@/lib/stai-types";

type StaiIdentificationFieldsProps = {
  idPrefix: string;
  patientName: string;
  patientSex: string;
  identification: StaiIdentification;
  onPatientNameChange: (name: string) => void;
  onPatientSexChange: (sex: string) => void;
  onIdentificationChange: (identification: StaiIdentification) => void;
  disabled?: boolean;
};

export function StaiIdentificationFields({
  idPrefix,
  patientName,
  patientSex,
  identification,
  onPatientNameChange,
  onPatientSexChange,
  onIdentificationChange,
  disabled = false,
}: StaiIdentificationFieldsProps) {
  const selectClassName =
    "h-9 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 text-body-md text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-patient-name`}>Nombre del paciente</Label>
        <Input
          id={`${idPrefix}-patient-name`}
          value={patientName}
          disabled={disabled}
          onChange={(event) => onPatientNameChange(event.target.value)}
          placeholder="Nombre y apellidos"
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label>Sexo</Label>
        <Ados2SubjectSexPicker
          value={patientSex as Ados2SubjectSex}
          onChange={onPatientSexChange}
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-age-group`}>Grupo del baremo</Label>
        <select
          id={`${idPrefix}-age-group`}
          value={identification.ageGroup}
          disabled={disabled}
          onChange={(event) =>
            onIdentificationChange({
              ...identification,
              ageGroup: event.target.value as StaiAgeGroup | "",
            })
          }
          className={selectClassName}
        >
          <option value="">Sin indicar</option>
          {STAI_AGE_GROUP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
