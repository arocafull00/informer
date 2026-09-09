"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { GroupMutationResult } from "@/store/use-report-history-store";

type GroupNameDialogProps = {
  open: boolean;
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => GroupMutationResult;
};

export function GroupNameDialog({
  open,
  initialName = "",
  onClose,
  onSubmit,
}: GroupNameDialogProps) {
  const inputId = useId();
  const errorId = useId();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const editing = Boolean(initialName);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = onSubmit(name);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Cambiar nombre del paciente" : "Nuevo paciente"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Escribe el nuevo nombre con el que quieres identificarlo."
                : "Añade un paciente para organizar sus tests."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor={inputId}
              className="block pb-2 text-body-md font-medium text-on-surface"
            >
              Nombre del paciente
            </label>
            <Input
              autoFocus
              id={inputId}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              placeholder="Por ejemplo, Pacientes pendientes"
              maxLength={80}
            />
            {error ? (
              <p id={errorId} role="alert" className="text-mono-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="interactive-press min-h-9 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="interactive-press min-h-9 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {editing ? "Guardar" : "Crear paciente"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
