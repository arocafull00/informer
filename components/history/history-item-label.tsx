"use client";

import { useEffect, useRef, useState } from "react";

interface HistoryItemLabelProps {
  label: string;
  editing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onSave: (value: string) => void;
}

export function HistoryItemLabel({
  label,
  editing,
  onStartEdit,
  onStopEdit,
  onSave,
}: HistoryItemLabelProps) {
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    setValue(label);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [editing, label]);

  if (!editing) {
    return (
      <span className="truncate text-body-md" onDoubleClick={onStartEdit}>
        {label}
      </span>
    );
  }

  const commit = () => {
    onSave(value);
    onStopEdit();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
        }
        if (e.key === "Escape") {
          onStopEdit();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      className="min-w-0 flex-1 rounded border border-outline-variant bg-surface-container-lowest px-1.5 py-0.5 text-body-md text-on-surface outline-none focus:border-primary"
    />
  );
}
