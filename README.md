# Informer

Herramienta web para profesionales clínicos que codifican entrevistas y observaciones de evaluación del espectro autista. Permite registrar puntuaciones ítem a ítem y generar automáticamente un informe en texto listo para copiar o guardar.

## Instrumentos soportados

| Instrumento | Descripción |
|-------------|-------------|
| **ADI-R** | Entrevista Diagnóstica para el Autismo — Autismo-Revisado |
| **ADOS-2 Adulto** | Módulo de observación para adolescentes y adultos |
| **ADOS-2 Niño** | Módulo de observación para niños |

Los bancos de preguntas y respuestas codificadas están en `data/` (`adir.json`, `ados2-adulto.json`, `ados2-nino.json`).

## Funcionalidades

- **Codificación interactiva** — Formulario por secciones con selector de puntuación para cada ítem.
- **Vista previa en tiempo real** — El informe en Markdown se actualiza al asignar puntuaciones.
- **Resumen ADOS-2** — Cálculo de puntuaciones por dominios (comunicación, interacción social recíproca, imaginación y comportamientos repetitivos/restrictivos).
- **Copiar informe** — Exportación del texto generado al portapapeles.
- **Histórico local** — Guardar, restaurar, renombrar y eliminar informes. Los datos persisten en el navegador.

## Interfaz

La aplicación tiene tres paneles:

1. **Barra lateral** — Histórico de informes guardados y acceso a «Nuevo Informe».
2. **Panel central** — Listado de ítems del instrumento activo, agrupados por sección.
3. **Panel derecho** — Vista previa del informe, copia y guardado.

El selector de instrumento (ADI-R / ADOS-2 Adulto / ADOS-2 Niño) está en la barra superior.

## Stack técnico

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs) — estado global y persistencia local
- [react-markdown](https://github.com/remarkjs/react-markdown) — renderizado de la vista previa

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # compilación de producción
npm run start   # servidor de producción
npm run lint    # ESLint
```

## Estructura del proyecto

```
app/              Rutas y layout
components/       UI (preguntas, informe, histórico, ADOS-2)
data/             Bancos de ítems y respuestas codificadas
lib/              Generación de Markdown, puntuación ADOS-2, tipos
store/            Estado del informe actual e histórico (Zustand)
```
