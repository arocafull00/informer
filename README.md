# Informer

Herramienta de escritorio para profesionales clínicos que administran evaluaciones del espectro autista y de inteligencia. Permite puntuar ítems, redactar el informe narrativo al mismo tiempo y rellenar los PDFs oficiales de resultados.

Está pensada para sesiones largas en mesa: elegir instrumento, codificar, previsualizar, guardar y volver a un informe anterior sin cambiar de herramienta.

## Instrumentos

| Instrumento | Qué hace |
|-------------|----------|
| **ADI-R** | Codificación de la entrevista diagnóstica. Genera el informe en Markdown y, con un asistente de resultados (sujeto, informante, algoritmo, dominios y totales), descarga el PDF de resultados. |
| **ADOS-2 Adulto** | Observación para adolescentes y adultos. Informe narrativo, resumen de dominios (comunicación, interacción social recíproca, imaginación, comportamientos repetitivos) y PDF de puntuaciones. |
| **ADOS-2 Niño** | Observación infantil. Mismo flujo: ítems, informe, resumen de dominios y PDF. |
| **CUMANES** | Registro de datos identificativos y puntuaciones directas con conversión en vivo a puntuaciones de transformación, decatipos, suma T, puntuación típica IDN y percentil por edad. La conversión IDN se mantiene en `data/cumanes-idn-norms-7-11.json`. |
| **RIAS** | No es un informe de ítems. Un asistente recoge datos del paciente, puntuaciones directas, T, índices, intervalos y percentiles, y genera el PDF de perfil. |

Los bancos de ítems ADI-R y ADOS-2 y el baremo editable de CUMANES están en `data/`.

## Flujo de trabajo

1. **Nuevo informe** — Se elige el instrumento y se pueden añadir el nombre del paciente y el sexo. CUMANES permite completar además sus datos identificativos; todos son opcionales.
2. **Codificación** — ADI-R y ADOS-2 usan ítems por secciones; CUMANES recoge las puntuaciones directas de sus 13 pruebas.
3. **Vista previa** — El Markdown se actualiza al puntuar ADI-R/ADOS-2. En CUMANES se muestran la transformación y el decatipo en vivo.
4. **Resultados en PDF** — Desde la vista previa se abre el asistente del instrumento y se descarga el formulario rellenado. RIAS se lanza aparte desde la barra lateral.
5. **Histórico** — Los informes se guardan solos en el navegador (Zustand persist). Se pueden restaurar, renombrar y eliminar.

La interfaz tiene tres paneles: histórico a la izquierda, ítems en el centro, vista previa a la derecha.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Zustand (informe actual e histórico local)
- react-markdown (vista previa)
- pdf-lib (relleno de plantillas PDF en rutas `/api/*-pdf`)

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
npm run lint
```

## Estructura

```
app/              Rutas, layout y APIs de PDF
components/       UI (preguntas, informe, histórico, ADI-R, ADOS-2, CUMANES, RIAS)
data/             Bancos de ítems, baremos y coordenadas de campos PDF
lib/              Markdown, puntuación, relleno de PDFs, tipos
store/            Informe actual, histórico y borradores de asistentes
```
