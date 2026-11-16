import React from "react";
import {
  AbsoluteFill,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { BrandClose } from "./BrandClose";
import { brand, easeInOut, easeOut, fonts, ip } from "./lib";
import { BRAND_Y, DARK_Y } from "./timeline";

const ink = "#0b1c30",
  muted = "#5c6268",
  paper = "#f5f2eb",
  primary = "#26445d";
// One shared world and camera: case → authentic input → generated text → time result → brand.
const KEY_T = [0, 96, 132, 168, 230, 260, 316, 348, 444, 478, 600];
const KEY_X = [960, 960, 760, 760, 760, 1450, 1450, 3000, 3000, 960, 960];
const KEY_Y = [
  540,
  540,
  1580,
  1580,
  1580,
  1500,
  1500,
  1580,
  1580,
  BRAND_Y,
  BRAND_Y,
];
const KEY_Z = [1, 1, 1.6, 1.6, 1.6, 2.3, 2.3, 1, 1, 1.4, 1.4];
const camera = (f: number, v: number[]) =>
  interpolate(f, KEY_T, v, {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const CaseOpening: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Interactive.Div
      name="Caso de la clínica 21 Días"
      style={{
        position: "absolute",
        left: 260,
        top: 196,
        width: 1400,
        color: ink,
        fontFamily: fonts.ui,
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.18em",
          color: muted,
        }}
      >
        AUTOMATIZACIÓN A MEDIDA
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 500,
          letterSpacing: "-0.045em",
          marginTop: 22,
        }}
      >
        Clínica <span style={{ fontWeight: 750 }}>21 Días</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 32,
          marginTop: 28,
          opacity: ip(f, [2, 20], [0, 1], easeOut),
          translate: `0 ${ip(f, [2, 25], [30, 0], easeOut)}px`,
        }}
      >
        <span style={{ fontSize: 44, color: muted }}>Más de</span>
        <span
          style={{
            fontSize: 238,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "-0.085em",
          }}
        >
          20
        </span>
        <span
          style={{ fontSize: 94, fontWeight: 450, letterSpacing: "-0.05em" }}
        >
          horas
        </span>
      </div>
      <div style={{ fontSize: 47, letterSpacing: "-0.035em", marginTop: 27 }}>
        preparando informes.
      </div>
    </Interactive.Div>
  );
};

const Hours: React.FC = () => {
  const f = useCurrentFrame(),
    travel = ip(f, [100, 348], [0, 1]),
    contract = ip(f, [324, 362], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: 260 + 2040 * travel,
        top: 810 + 1050 * travel,
        width: 1400,
        height: 85,
        fontFamily: fonts.ui,
        opacity: ip(f, [100, 124, 316, 340], [1, 0, 0, 1]),
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8 * (1 - contract),
          width: 1400 - contract * 1330,
          height: 32,
        }}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: i === 0 ? 1 : 1 - contract,
              minWidth: 0,
              background: primary,
              opacity:
                (i < 1 ? 1 : 1 - contract) *
                (0.24 + 0.76 * ip(f, [i * 2, i * 2 + 8], [0, 1], easeOut)),
              borderRadius: 3,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: 1400,
          fontSize: 22,
          color: muted,
          marginTop: 16,
          opacity: ip(f, [315, 345], [1, 0]),
        }}
      >
        <span>TIEMPO DE PREPARACIÓN</span>
        <span>20 h +</span>
      </div>
    </div>
  );
};

const Product: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Interactive.Div
      name="Informer · selección y texto del informe"
      style={{
        position: "absolute",
        left: 160,
        top: 1240,
        width: 1600,
        height: 1000,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #c3c7cd",
        boxShadow: "0 18px 60px #0b1c3010",
      }}
    >
      <Img
        src={staticFile("informer-ui.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <Img
        src={staticFile("informer-ui-after.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: f >= 211 ? 1 : 0,
        }}
      />
      {f >= 169 && f < 240 ? (
        <div
          style={{
            position: "absolute",
            left: ip(f, [169, 198], [830, 376]),
            top: ip(f, [169, 198], [525, 255]),
            width: 26,
            height: 34,
            scale: ip(f, [205, 211, 217], [1, 0.9, 1]),
          }}
        >
          <svg viewBox="0 0 26 34" width="26" height="34">
            <path
              d="M2 2 L2 27 L9 21 L14 32 L19 30 L14 19 L24 18 Z"
              fill="#0b1c30"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}
    </Interactive.Div>
  );
};

const Result: React.FC = () => (
  <Interactive.Div
    name="Resultado de 21 Días · apenas una hora"
    style={{
      position: "absolute",
      left: 2300,
      top: 1288,
      width: 1400,
      color: ink,
      fontFamily: fonts.ui,
    }}
  >
    <div
      style={{
        fontSize: 28,
        letterSpacing: "0.13em",
        fontWeight: 600,
        color: muted,
      }}
    >
      CLÍNICA 21 DÍAS · CON INFORMER
    </div>
    <div style={{ fontSize: 62, letterSpacing: "-0.045em", marginTop: 29 }}>
      Ahora, apenas
    </div>
    <div
      style={{
        display: "flex",
        gap: 34,
        alignItems: "baseline",
        marginTop: 10,
      }}
    >
      <span
        style={{
          fontSize: 260,
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: "-0.075em",
          color: primary,
        }}
      >
        1
      </span>
      <span style={{ fontSize: 150, letterSpacing: "-0.06em" }}>hora.</span>
    </div>
    <div style={{ fontSize: 38, color: muted, marginTop: 32 }}>
      Tras automatizar la preparación de informes.
    </div>
  </Interactive.Div>
);

const Context: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Interactive.Div
      name="Contexto de la demostración"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        opacity: ip(
          f,
          [125, 138, 230, 240, 250, 260, 310, 322],
          [0, 1, 1, 0, 0, 1, 1, 0],
        ),
        fontFamily: fonts.ui,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 100,
          top: f < 245 ? 64 : 850,
          display: "flex",
          gap: 20,
          alignItems: "center",
          padding: "20px 28px",
          background: paper,
          border: "1px solid #d8d5cf",
          borderRadius: 12,
        }}
      >
        <Img
          src={staticFile("informer-logo.png")}
          style={{ width: 50, height: 50, borderRadius: 9 }}
        />
        <div>
          <div style={{ fontSize: 23, fontWeight: 650, color: primary }}>
            Informer
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 550,
              color: ink,
              letterSpacing: "-0.035em",
            }}
          >
            {f < 245 ? "Puntúas el test." : "El texto se genera."}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 50,
          fontSize: 22,
          color: muted,
          background: paper,
          padding: "12px 18px",
          borderRadius: 6,
        }}
      >
        Interfaz real · Datos de demostración
      </div>
    </Interactive.Div>
  );
};

export const Stage: React.FC = () => {
  const f = useCurrentFrame(),
    x = camera(f, KEY_X),
    y = camera(f, KEY_Y),
    z = camera(f, KEY_Z);
  return (
    <AbsoluteFill style={{ background: paper, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 5000,
          height: 5500,
          transform: `translate(${960 - x * z}px, ${540 - y * z}px) scale(${z})`,
          transformOrigin: "0 0",
        }}
      >
        <CaseOpening />
        <Hours />
        <Product />
        <Result />
        <div
          style={{
            position: "absolute",
            left: -3000,
            top: DARK_Y,
            width: 10000,
            height: 3500,
            background: brand.bg,
          }}
        />
        <BrandClose />
      </div>
      <Context />
      <Audio src={staticFile("music.wav")} volume={0.75} />
    </AbsoluteFill>
  );
};
