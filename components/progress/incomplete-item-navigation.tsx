"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IncompleteItemNavigationProps = {
  canNavigate: boolean;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  className?: string;
};

export function IncompleteItemNavigation({
  canNavigate,
  onNavigatePrevious,
  onNavigateNext,
  className,
}: IncompleteItemNavigationProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label="Navegación entre ítems pendientes"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={!canNavigate}
        onClick={onNavigatePrevious}
        aria-label="Ir al ítem pendiente anterior"
        className="text-on-surface-variant"
      >
        <ChevronUp aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={!canNavigate}
        onClick={onNavigateNext}
        aria-label="Ir al ítem pendiente siguiente"
        className="text-on-surface-variant"
      >
        <ChevronDown aria-hidden="true" />
      </Button>
    </div>
  );
}
