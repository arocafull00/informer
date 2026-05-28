"use client";

import Image from "next/image";
import { TopbarNav } from "@/components/layout/topbar-nav";

export function Topbar() {
  return (
    <nav className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-outline-variant bg-surface px-margin-page">
      <Image
        src="/icon-bg.png"
        alt="Informer"
        width={40}
        height={40}
        className="h-10 w-10 rounded-xl"
        priority
      />
      <TopbarNav />
    </nav>
  );
}
