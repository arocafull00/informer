# Informer · Clínica 21 Días

Vídeo de 20 segundos, 1920 × 1080, 30 fps. Fondo claro cálido, una sola cámara y cierre de marca de Adrián Rocafull.

## Mensaje

Dato aportado por Adrián: en la clínica 21 Días, preparar informes llevaba más de 20 horas; tras automatizar el proceso, ahora pueden hacerlo en apenas 1 hora. El vídeo no añade una unidad por informe, paciente o lote, ni afirma resultados clínicos.

- 0–4 s: clínica, más de 20 horas y medida de tiempo.
- 4–8 s: interfaz real de Informer y selección de una puntuación.
- 8–11 s: texto del informe actualizado como consecuencia real de la selección.
- 11–15 s: apenas 1 hora y contracción de la medida de tiempo.
- 15–20 s: firma, oferta y dominio.

La interfaz se ha capturado de la app local, usando su seed de demostración y casos anónimos. No hay datos de pacientes reales. Música original generada por código, sin locución.

## Vista previa y exportación

Desde esta carpeta:

```sh
npm install
npm run dev -- --port=3103
npx remotion render InformerPromo out/Informer_16x9.mp4
```

La composición principal está en `src/Stage.tsx`; el cierre, en `src/BrandClose.tsx`. La cámara y las barras de tiempo son programáticas; los grupos principales aparecen con nombre en Studio. Las capturas son imágenes y su contenido se modifica desde la app, no como capas de texto en Studio.

Para recapturar con datos de demostración: iniciar la app en el puerto 3102 y ejecutar `node scripts/capture-informer.mjs`. Para regenerar la música: `node scripts/make-music.mjs`.

## Revisión

TypeScript y ESLint del proyecto de vídeo; TypeScript de la app; inspección visual de los destinos de cámara y transiciones; crítica visual independiente sobre el montaje completo. La puerta automática de motion-graphics admite hasta 15 segundos, por lo que verifica el bloque principal de 15 segundos; el cierre de 5 segundos y la película completa se revisan también por el crítico independiente, siguiendo la excepción documentada en la guía de GasApp. La evidencia local está en `.promptible/` y `review/`, excluidas de Git.
