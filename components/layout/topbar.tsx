"use client";

import { useCurrentReportStore } from "@/store/use-current-report-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TestType } from "@/lib/types";

export function Topbar() {
  const { currentTest, setCurrentTest } = useCurrentReportStore();

  return (
    <div className="border-b bg-background px-6 py-4">
      <Tabs
        value={currentTest}
        onValueChange={(value) => setCurrentTest(value as TestType)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ADIR">ADI-R</TabsTrigger>
          <TabsTrigger value="ADOS2">ADOS-2</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}