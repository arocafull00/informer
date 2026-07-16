import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ados2Subject, Ados2SubjectSex } from "@/lib/ados2-pdf/types";
import { Ados2SubjectSexPicker } from "./ados2-subject-sex-picker";

type Ados2SubjectFieldsProps = {
  subject: Ados2Subject;
  onChange: (subject: Ados2Subject) => void;
};

export function Ados2SubjectFields({ subject, onChange }: Ados2SubjectFieldsProps) {
  const update = (field: keyof Ados2Subject, value: string) => {
    onChange({ ...subject, [field]: value });
  };

  return (
    <div className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="space-y-1.5">
        <Label htmlFor="ados2-subject-name" className="text-body-md text-on-surface">
          Nombre
        </Label>
        <Input
          id="ados2-subject-name"
          value={subject.identification}
          onChange={(e) => update("identification", e.target.value)}
          className="h-9 border-outline-variant bg-surface-container-lowest text-body-md text-on-surface"
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-body-md text-on-surface">Sexo</p>
        <Ados2SubjectSexPicker
          value={subject.sex}
          onChange={(sex: Ados2SubjectSex) => update("sex", sex)}
        />
      </div>
    </div>
  );
}
