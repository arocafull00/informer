"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useCurrentReportStore } from "@/store/use-current-report-store";
import type { TestType } from "@/lib/types";
import { TopbarNavItem } from "@/components/layout/topbar-nav-item";

const tests: { value: TestType; label: string }[] = [
  { value: "ADIR", label: "ADI-R" },
  { value: "ADOS2_ADULTO", label: "ADOS-2 Adulto" },
  { value: "ADOS2_NINO", label: "ADOS-2 Niño" },
];

export function TopbarNav() {
  const { currentTest, setCurrentTest } = useCurrentReportStore();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<TestType, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });

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
  );
}
