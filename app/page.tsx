"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { QuestionList } from "@/components/questions/question-list";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <ScrollArea className="flex-1 p-6">
          <QuestionList className="max-w-3xl" />
        </ScrollArea>
      </main>
      <aside className="w-[400px] border-l bg-background p-4">
        <MarkdownPreview />
      </aside>
    </div>
  );
}