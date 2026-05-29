import { AdirSubjectSexPicker } from "./adir-subject-sex-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdirSubject, AdirSubjectSex } from "@/lib/adir-scoring";

type AdirSubjectStepProps = {
  subject: AdirSubject;
  onChange: (subject: AdirSubject) => void;
};

export function AdirSubjectStep({ subject, onChange }: AdirSubjectStepProps) {
  const update = (field: keyof AdirSubject, value: string) => {
    onChange({ ...subject, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="adir-subject-name" className="text-body-md text-on-surface">
          Nombre
        </Label>
        <Input
          id="adir-subject-name"
          value={subject.nameOrId}
          onChange={(e) => update("nameOrId", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adir-subject-birth" className="text-body-md text-on-surface">
          Fecha de nacimiento
        </Label>
        <Input
          id="adir-subject-birth"
          type="date"
          value={subject.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adir-subject-age" className="text-body-md text-on-surface">
          Edad cronológica
        </Label>
        <Input
          id="adir-subject-age"
          value={subject.chronologicalAge}
          onChange={(e) => update("chronologicalAge", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-body-md text-on-surface">Sexo</p>
        <AdirSubjectSexPicker
          value={subject.sex}
          onChange={(sex: AdirSubjectSex) => update("sex", sex)}
        />
      </div>
    </div>
  );
}
