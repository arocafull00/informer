"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteGroupDialogProps = {
  groupName: string | null;
  reportCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteGroupDialog({
  groupName,
  reportCount,
  onClose,
  onConfirm,
}: DeleteGroupDialogProps) {
  return (
    <Dialog
      open={groupName !== null}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
    >
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar paciente</DialogTitle>
          <DialogDescription>
            Se eliminará «{groupName}».
            {reportCount > 0
              ? ` Sus ${reportCount === 1 ? "informe se moverá" : `${reportCount} informes se moverán`} a «Sin paciente».`
              : " El paciente no tiene informes."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="interactive-press min-h-9 rounded-lg bg-surface-container px-3 py-2 text-label-md text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="interactive-press min-h-9 rounded-lg bg-destructive px-4 py-2 text-label-md text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
          >
            Eliminar paciente
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
