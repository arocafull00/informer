import React from "react";
import { useCurrentFrame } from "remotion";
import { brand, easeInOut, easeOut, fonts, ip } from "./lib";
import { BRAND_Y, T } from "./timeline";

// Personal brand close, using the portfolio "marca" tokens and fonts. Everything sits in the centre column.
export const BrandClose: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = ip(
    frame,
    [T.signStart, T.signStart + 30],
    [0, 100],
    easeInOut,
  );
  const line = (start: number) => ({
    opacity: ip(frame, [start, start + 14], [0, 1], easeOut),
    translate: `0px ${ip(frame, [start, start + 22], [26, 0], easeOut)}px`,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1920,
        top: BRAND_Y - 540,
        height: 1080,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: brand.text,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 560,
        }}
      >
        <div
          style={{
            fontFamily: fonts.sign,
            fontSize: 90,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            clipPath: `inset(-20% ${100 - reveal}% -20% -5%)`,
            paddingRight: 12,
          }}
        >
          Adrián Rocafull
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 70,
            lineHeight: 1.04,
            letterSpacing: "-0.015em",
            marginTop: 18,
          }}
        >
          <div style={line(T.headStart)}>Software a medida</div>
          <div style={{ ...line(T.headStart + 7), color: brand.blueLight }}>
            para tu negocio
          </div>
        </div>
        <div
          style={{
            ...line(T.domainStart),
            fontFamily: fonts.mono,
            fontSize: 26,
            letterSpacing: "0.12em",
            color: brand.muted,
            marginTop: 40,
          }}
        >
          ADRIANROCAFULLDEV.ES
        </div>
      </div>
    </div>
  );
};
