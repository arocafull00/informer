"use client";

import { useRef, useState } from "react";

import { PdfCoordinateMarker } from "@/components/pdf/pdf-coordinate-marker";
import type { PdfCoordinateEntry } from "@/lib/pdf/export-fields";
import {
  imageDimensionsMatchPageSize,
  pdfToScreen,
  screenToPdf,
  type PdfPoint,
} from "@/lib/pdf/coordinates";
import { cn } from "@/lib/utils";

type PdfCoordinatePickerProps = {
  imageSrc: string;
  pageSize: { width: number; height: number };
  entries: PdfCoordinateEntry[];
  pendingRectStart: PdfPoint | null;
  zoom: number;
  onDimensionsMatchChange: (matched: boolean) => void;
  onClick: (point: PdfPoint) => void;
  onHover: (point: PdfPoint | null) => void;
};

export function PdfCoordinatePicker({
  imageSrc,
  pageSize,
  entries,
  pendingRectStart,
  zoom,
  onDimensionsMatchChange,
  onClick,
  onHover,
}: PdfCoordinatePickerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgReady, setImgReady] = useState(false);

  const handleImageLoad = () => {
    const img = imgRef.current;
    if (!img) return;

    const matched = imageDimensionsMatchPageSize(
      img,
      pageSize.width,
      pageSize.height,
    );
    onDimensionsMatchChange(matched);
    setImgReady(true);
  };

  const handlePointer = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return null;
    return screenToPdf(clientX, clientY, img, pageSize.height);
  };

  const pendingMarker =
    imgReady && pendingRectStart && imgRef.current ? (
      <div
        className="pointer-events-none absolute size-2 rounded-full border-2 border-red-500 bg-white"
        style={{
          left:
            pdfToScreen(pendingRectStart, imgRef.current, pageSize.height).x - 4,
          top:
            pdfToScreen(pendingRectStart, imgRef.current, pageSize.height).y - 4,
        }}
      />
    ) : null;

  return (
    <div
      className="relative inline-block origin-top-left"
      style={{ transform: `scale(${zoom})` }}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt=""
        draggable={false}
        className="block max-w-none select-none"
        width={pageSize.width}
        height={pageSize.height}
        onLoad={handleImageLoad}
        onClick={(event) => {
          const point = handlePointer(event.clientX, event.clientY);
          if (!point) return;
          onClick(point);
        }}
        onMouseMove={(event) => {
          const point = handlePointer(event.clientX, event.clientY);
          onHover(point);
        }}
        onMouseLeave={() => onHover(null)}
      />
      {imgReady && imgRef.current ? (
        <>
          {entries.map((entry) => (
            <PdfCoordinateMarker
              key={entry.id}
              entry={entry}
              img={imgRef.current}
              pageHeight={pageSize.height}
            />
          ))}
          {pendingMarker}
        </>
      ) : null}
    </div>
  );
}

export function PdfCoordinateHoverReadout({
  point,
  className,
}: {
  point: PdfPoint | null;
  className?: string;
}) {
  if (!point) {
    return (
      <p className={cn("font-mono text-sm text-muted-foreground", className)}>
        Mueve el ratón sobre el PDF
      </p>
    );
  }

  return (
    <p className={cn("font-mono text-sm text-foreground", className)}>
      x: {point.x}, y: {point.y}
    </p>
  );
}
