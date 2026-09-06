import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CUMANES_AGES,
  type Age,
  type CumanesIdentification,
} from "@/lib/cumanes-types";

type CumanesIdentificationFieldsProps = {
  idPrefix: string;
  patientName: string;
  patientSex: string;
  identification: CumanesIdentification;
  onPatientNameChange: (name: string) => void;
  onPatientSexChange: (sex: string) => void;
  onIdentificationChange: (identification: CumanesIdentification) => void;
  disabled?: boolean;
};

export function CumanesIdentificationFields({
  idPrefix,
  patientName,
  patientSex,
  identification,
  onPatientNameChange,
  onPatientSexChange,
  onIdentificationChange,
  disabled = false,
}: CumanesIdentificationFieldsProps) {
  const update = <Field extends keyof CumanesIdentification>(
    field: Field,
    value: CumanesIdentification[Field]
  ) => {
    onIdentificationChange({ ...identification, [field]: value });
  };

  const inputClassName =
    "h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface";
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
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-examiner-name`}>Nombre del examinador</Label>
        <Input
          id={`${idPrefix}-examiner-name`}
          value={identification.examinerName}
          disabled={disabled}
          onChange={(event) => update("examinerName", event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-center`}>Centro</Label>
        <Input
          id={`${idPrefix}-center`}
          value={identification.center}
          disabled={disabled}
          onChange={(event) => update("center", event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-course`}>Curso</Label>
        <Input
          id={`${idPrefix}-course`}
          value={identification.course}
          disabled={disabled}
          onChange={(event) => update("course", event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-sex`}>Sexo</Label>
        <select
          id={`${idPrefix}-sex`}
          value={patientSex}
          disabled={disabled}
          onChange={(event) => onPatientSexChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">Sin indicar</option>
          <option value="varon">Varón</option>
          <option value="mujer">Mujer</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-evaluation-date`}>
          Fecha de evaluación
        </Label>
        <Input
          id={`${idPrefix}-evaluation-date`}
          type="date"
          value={identification.evaluationDate}
          disabled={disabled}
          onChange={(event) => update("evaluationDate", event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-birth-date`}>Fecha de nacimiento</Label>
        <Input
          id={`${idPrefix}-birth-date`}
          type="date"
          value={identification.birthDate}
          disabled={disabled}
          onChange={(event) => update("birthDate", event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2 sm:max-w-48">
        <Label htmlFor={`${idPrefix}-age`}>Edad para el baremo</Label>
        <select
          id={`${idPrefix}-age`}
          value={identification.age ?? ""}
          disabled={disabled}
          onChange={(event) =>
            update(
              "age",
              event.target.value ? (Number(event.target.value) as Age) : null
            )
          }
          className={selectClassName}
        >
          <option value="">Sin indicar</option>
          {CUMANES_AGES.map((age) => (
            <option key={age} value={age}>
              {age} años
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
