"use client";

import { ReportTopbar } from "@/components/layout/report-topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { QuestionList } from "@/components/questions/question-list";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { CumanesResultsPanel } from "@/components/cumanes/cumanes-results-panel";
import { CumanesScoreForm } from "@/components/cumanes/cumanes-score-form";
import { CarasResultsPanel } from "@/components/caras-r/caras-results-panel";
import { CarasScoreForm } from "@/components/caras-r/caras-score-form";
import { StaiQuestionnaire } from "@/components/stai/stai-questionnaire";
import { StaiResultsPanel } from "@/components/stai/stai-results-panel";
import { useAutoSaveReport } from "@/lib/use-save-report";
import { useCurrentReportStore } from "@/store/use-current-report-store";

export default function Home() {
  useAutoSaveReport();
  const currentTest = useCurrentReportStore((state) => state.currentTest);
  const isCumanes = currentTest === "CUMANES";
  const isCaras = currentTest === "CARAS_R";
  const isStai = currentTest === "STAI";

  return (
    <div className="h-dvh w-full overflow-hidden bg-background">
      <main className="flex h-full min-h-0 w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ReportTopbar />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <section className="mx-auto flex min-w-0 flex-1 flex-col overflow-y-auto bg-background p-gutter-grid lg:max-w-[960px]">
              {isCumanes ? (
                <CumanesScoreForm />
              ) : isCaras ? (
                <CarasScoreForm />
              ) : isStai ? (
                <StaiQuestionnaire />
              ) : (
                <QuestionList />
              )}
            </section>
            <aside className="flex w-[45%] min-w-[360px] max-w-[720px] shrink-0 flex-col border-l border-outline-variant bg-surface">
              {isCumanes ? (
                <CumanesResultsPanel />
              ) : isCaras ? (
                <CarasResultsPanel />
              ) : isStai ? (
                <StaiResultsPanel />
              ) : (
                <MarkdownPreview />
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
