import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TopbarNavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TopbarNavItem = forwardRef<HTMLButtonElement, TopbarNavItemProps>(
  function TopbarNavItem({ label, isActive, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "interactive-press relative cursor-pointer rounded px-2 py-1 pb-1.5 text-body-md transition-colors duration-150 ease-out-strong",
          isActive
            ? "font-bold text-primary"
            : "font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-primary/80"
        )}
      >
        {label}
      </button>
    );
  }
);
