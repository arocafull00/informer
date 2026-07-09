"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdirGenerateResultsDialog } from "@/components/adir/adir-generate-results-dialog";
import { Ados2ScoreSummaryDialog } from "@/components/ados2/ados2-score-summary-dialog";
import { RiasGenerateResultsDialog } from "@/components/rias/rias-generate-results-dialog";
import { TopbarNavItem } from "@/components/layout/topbar-nav-item";
import { isAdos2Test } from "@/lib/ados2-labels";
import { buildAdos2ScoreSummary } from "@/lib/ados2-scoring";
import { testData, testLabels } from "@/lib/test-data";
import type { TestType } from "@/lib/types";
import {
  selectCurrentAnswers,
  useCurrentReportStore,
} from "@/store/use-current-report-store";

const tests: { value: TestType; label: string }[] = [
  { value: "ADIR", label: "ADI-R" },
  { value: "ADOS2_ADULTO", label: "ADOS-2 Adulto" },
  { value: "ADOS2_NINO", label: "ADOS-2 Niño" },
];

const actionButtonClassName =
  "interactive-press cursor-pointer rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-label-md text-on-surface hover:bg-surface-container-high";

export function TopbarNav() {
  const currentTest = useCurrentReportStore((s) => s.currentTest);
  const setCurrentTest = useCurrentReportStore((s) => s.setCurrentTest);
  const answers = useCurrentReportStore(selectCurrentAnswers);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<TestType, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [adirResultsDialogOpen, setAdirResultsDialogOpen] = useState(false);
  const [riasResultsDialogOpen, setRiasResultsDialogOpen] = useState(false);

  const isAdos2 = isAdos2Test(currentTest);

  const scoreSummary = useMemo(() => {
    if (!isAdos2) return null;
    return buildAdos2ScoreSummary(
      currentTest,
      testData[currentTest],
      answers
    );
  }, [isAdos2, currentTest, answers]);

  const handleScoreClick = () => {
    if (!scoreSummary) return;
    setScoreDialogOpen(true);
  };

  const updateIndicator = useCallback(() => {
    const list = listRef.current;
    const active = itemRefs.current[currentTest];
    if (!list || !active) {
      return;
    }

    setIndicator({
      x: active.offsetLeft,
      width: active.offsetWidth,
    });
  }, [currentTest]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <div className="relative flex flex-1 items-center">
      <div
        ref={listRef}
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 md:flex"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary transition-[transform,width] duration-200 ease-out-strong motion-reduce:transition-none"
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.x}px)`,
          }}
        />
        {tests.map(({ value, label }) => (
          <TopbarNavItem
            key={value}
            ref={(node) => {
              itemRefs.current[value] = node;
            }}
            label={label}
            isActive={currentTest === value}
            onClick={() => setCurrentTest(value)}
          />
        ))}
      </div>
      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setRiasResultsDialogOpen(true)}
          className={actionButtonClassName}
        >
          Generar RIAS
        </button>
        <button
          type="button"
          onClick={() => setAdirResultsDialogOpen(true)}
          className={actionButtonClassName}
        >
          Generar ADI-R
        </button>
        <button
          type="button"
          onClick={handleScoreClick}
          className={actionButtonClassName}
        >
          Puntuación ADOS-2
        </button>
      </div>
      <AdirGenerateResultsDialog
        open={adirResultsDialogOpen}
        onClose={() => setAdirResultsDialogOpen(false)}
      />
      <RiasGenerateResultsDialog
        open={riasResultsDialogOpen}
        onClose={() => setRiasResultsDialogOpen(false)}
      />
      {scoreSummary && (
        <Ados2ScoreSummaryDialog
          open={scoreDialogOpen}
          test={currentTest}
          testLabel={testLabels[currentTest]}
          summary={scoreSummary}
          onClose={() => setScoreDialogOpen(false)}
        />
      )}
    </div>
  );
}
