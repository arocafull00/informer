import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isCarasAgeCompatible } from "@/lib/caras-r-scoring";
import {
  CARAS_AGES,
  CARAS_COURSES,
  type CarasAge,
  type CarasCourse,
  type CarasIdentification,
} from "@/lib/caras-r-types";

type CarasIdentificationFieldsProps = {
  idPrefix: string;
  patientName: string;
  identification: CarasIdentification;
  onPatientNameChange: (name: string) => void;
  onIdentificationChange: (identification: CarasIdentification) => void;
  disabled?: boolean;
};

export function CarasIdentificationFields({
  idPrefix,
  patientName,
  identification,
  onPatientNameChange,
  onIdentificationChange,
  disabled = false,
}: CarasIdentificationFieldsProps) {
  const mismatch =
    identification.age !== null &&
    Boolean(identification.course) &&
    !isCarasAgeCompatible(
      identification.course as CarasCourse,
      identification.age
    );
  const mismatchId = `${idPrefix}-age-course-error`;
  const selectClassName =
    "h-9 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 text-body-md text-on-surface outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-error";

  const update = <Field extends keyof CarasIdentification>(
    field: Field,
    value: CarasIdentification[Field]
  ) => {
    onIdentificationChange({ ...identification, [field]: value });
  };

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

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-age`}>Edad</Label>
        <select
          id={`${idPrefix}-age`}
          value={identification.age ?? ""}
          disabled={disabled}
          onChange={(event) =>
            update(
              "age",
              event.target.value
                ? (Number(event.target.value) as CarasAge)
                : null
            )
          }
          aria-invalid={mismatch}
          aria-describedby={mismatch ? mismatchId : undefined}
          className={selectClassName}
        >
          <option value="">Sin indicar</option>
          {CARAS_AGES.map((age) => (
            <option key={age} value={age}>
              {age} años
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-course`}>Curso del baremo</Label>
        <select
          id={`${idPrefix}-course`}
          value={identification.course}
          disabled={disabled}
          onChange={(event) =>
            update("course", event.target.value as CarasCourse | "")
          }
          aria-invalid={mismatch}
          aria-describedby={mismatch ? mismatchId : undefined}
          className={selectClassName}
        >
          <option value="">Sin indicar</option>
          {CARAS_COURSES.map((course) => (
            <option key={course.value} value={course.value}>
              {course.label} · {course.ageLabel}
            </option>
          ))}
        </select>
      </div>

      {mismatch ? (
        <p
          id={mismatchId}
          className="text-body-md text-error sm:col-span-2"
          role="alert"
        >
          La edad indicada no corresponde al intervalo del curso seleccionado.
        </p>
      ) : null}
    </div>
  );
}
