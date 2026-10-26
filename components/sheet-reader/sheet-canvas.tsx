"use client";

import { useEffect, useRef } from "react";

export type SheetHighlight = { x: number; y: number; size: number; color: string };

type SheetCanvasProps = {
  source: HTMLCanvasElement;
  pxPerMm: number;
  region: { x: number; y: number; width: number; height: number };
  highlights?: SheetHighlight[];
  label: string;
  className?: string;
};

export function SheetCanvas({ source, pxPerMm, region, highlights = [], label, className }: SheetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = Math.round(region.width * pxPerMm);
    canvas.height = Math.round(region.height * pxPerMm);
    const context = canvas.getContext("2d")!;
    context.drawImage(
      source,
      region.x * pxPerMm,
      region.y * pxPerMm,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    context.lineWidth = Math.max(2, pxPerMm * 0.5);
    for (const { x, y, size, color } of highlights) {
      const half = (size / 2 + 0.8) * pxPerMm;
      context.strokeStyle = color;
      context.strokeRect((x - region.x) * pxPerMm - half, (y - region.y) * pxPerMm - half, half * 2, half * 2);
    }
  }, [source, pxPerMm, region, highlights]);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
