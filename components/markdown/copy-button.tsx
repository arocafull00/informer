"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  showLabel?: boolean;
}

export function CopyButton({ text, className, showLabel = true }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1 rounded p-2 text-primary transition-colors hover:bg-surface-container active:scale-[0.98]",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="size-5" />
          {showLabel && <span className="text-label-md hidden xl:inline">Copiado</span>}
        </>
      ) : (
        <>
          <Copy className="size-5" />
          {showLabel && <span className="text-label-md hidden xl:inline">Copiar</span>}
        </>
      )}
    </button>
  );
}
