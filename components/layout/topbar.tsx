"use client";

import { useCurrentReportStore } from "@/store/use-current-report-store";
import type { TestType } from "@/lib/types";
import { cn } from "@/lib/utils";

const tests: { value: TestType; label: string }[] = [
  { value: "ADIR", label: "ADI-R" },
  { value: "ADOS2_ADULTO", label: "ADOS-2 Adulto" },
  { value: "ADOS2_NINO", label: "ADOS-2 Niño" },
];

export function Topbar() {
  const { currentTest, setCurrentTest } = useCurrentReportStore();

  return (
    <nav className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-margin-page">
      <div className="flex items-center gap-6">
        <span className="text-headline-lg font-black text-primary">Informer</span>
        <div className="hidden items-center gap-4 md:flex">
          {tests.map(({ value, label }) => {
            const isActive = currentTest === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCurrentTest(value)}
                className={cn(
                  "px-2 py-1 text-body-md transition-colors cursor-pointer",
                  isActive
                    ? "border-b-2 border-primary pb-1 font-bold text-primary"
                    : "font-medium text-on-surface-variant hover:bg-surface-container-high rounded"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
