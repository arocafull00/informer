"use client";

import { ReportTopbar } from "@/components/layout/report-topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { QuestionList } from "@/components/questions/question-list";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { useAutoSaveReport } from "@/lib/use-save-report";

export default function Home() {
  useAutoSaveReport();

  return (
    <div className="h-dvh w-full overflow-hidden bg-background">
      <main className="flex h-full min-h-0 w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ReportTopbar />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <section className="mx-auto flex min-w-0 flex-1 flex-col overflow-y-auto bg-background p-gutter-grid lg:max-w-[960px]">
              <QuestionList />
            </section>
            <aside className="flex w-[45%] min-w-[360px] max-w-[720px] shrink-0 flex-col border-l border-outline-variant bg-surface">
              <MarkdownPreview />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
