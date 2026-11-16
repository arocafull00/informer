# Guía: hacer un vídeo de motion graphics para otra aplicación

Esta guía explica cómo repetir el vídeo de GasApp con otra aplicación, en otro ordenador, usando Claude Code, Remotion y las skills de motion graphics. Este mismo proyecto (`marketing/video`) sirve de plantilla.

---

## 1. Preparar el ordenador

Instala esto una sola vez:

| Herramienta | Versión | Cómo instalarla |
|---|---|---|
| Node.js | 20.19+, 22.13+ o 24+ | https://nodejs.org (LTS) |
| Git | cualquiera reciente | https://git-scm.com |
| FFmpeg | cualquiera reciente | Windows: `winget install --id Gyan.FFmpeg -e` · macOS: `brew install ffmpeg` · Linux: `sudo apt install ffmpeg` |
| Claude Code | app de escritorio o CLI | https://claude.com/claude-code |

Después de instalar FFmpeg, **cierra y vuelve a abrir la terminal** para que encuentre `ffmpeg`. Compruébalo:

```bash
node -v
```

```bash
ffmpeg -version
```

No hace falta instalar Chrome: Remotion descarga su propio navegador la primera vez que renderiza.

> **Windows: rutas largas.** Remotion falla con `spawn ... chrome-headless-shell.exe ENOENT` o `... ffmpeg.exe ENOENT` si el proyecto está en una ruta muy larga (más de unos 260 caracteres hasta los binarios de `node_modules`). Trabaja siempre en rutas cortas, por ejemplo `C:\Users\<tú>\Documents\code\<app>\marketing\video`. Si Claude Code arranca en una carpeta temporal de sesión, pídele que mueva la sesión al repositorio de tu app antes de empezar.

---

## 2. Instalar las skills

Las skills se instalan a nivel de usuario (`~/.claude/skills`), así que sirven para cualquier proyecto. En una terminal:

```bash
npx -y skills@latest add remotion-dev/skills -g -a claude-code -s '*' -y --copy
```

```bash
npx -y skills@latest add liamrjohnston/remotion-motion-graphics-skill -g -a claude-code -s '*' -y --copy
```

Comprueba que están:

```bash
npx -y skills@latest ls -g
```

Deberías ver:

- **Oficiales de Remotion (13):** `remotion-best-practices`, `remotion-create`, `remotion-markup`, `remotion-interactivity`, `remotion-captions`, `remotion-render`, `remotion-studio`, `remotion-maps`, `remotion-multimedia`, `remotion-saas`, `remotion-docs`, `remotion-upgrade`, `remotion-license`.
- **Motion graphics (4):** `motion-graphics`, `cinematic-camera`, `terminal-inserts`, `article-highlights`.

Reinicia Claude Code (o abre una sesión nueva) para que las cargue.

**Alternativa sin internet:** copia la carpeta `~/.claude/skills` de este ordenador (en Windows, `C:\Users\<tú>\.claude\skills`) a la misma ruta del otro. Así te llevas también tus skills propias, como `commit-y-push`.

---

## 3. Llevarte la plantilla

En el otro ordenador:

```bash
git clone https://github.com/arocafull00/gas-app.git
```

Copia `gas-app/marketing/video` dentro del repositorio de la nueva app, en `marketing/video`, e instala dependencias allí:

```bash
npm install
```

Abre la vista previa para comprobar que todo funciona:

```bash
npx remotion studio
```

### Qué hay en la plantilla

| Archivo | Qué hace | Qué cambiar para otra app |
|---|---|---|
| `src/timeline.ts` | Todos los tiempos (en fotogramas a 30 fps) y posiciones del "mundo" | Duración de cada escena y tamaño/posición de las secciones de la app |
| `src/Stage.tsx` | Cámara única (fotogramas clave `KEY_T/X/Y/Z`), orden de capas, música | Fotogramas clave de la cámara |
| `src/Spreadsheet.tsx` | Hoja de cálculo del gancho | Sustituir por la herramienta "antigua" que reemplaza la nueva app (Excel, papeles, correo, WhatsApp…) |
| `src/Documents.tsx` | Documentos que se acumulan, se desordenan y se convierten en la app | Nombres y contenido reales de los documentos que sustituye |
| `src/GasAppEditor.tsx` | Recreación fiel de la interfaz de GasApp | **Reescribir** con la interfaz de la nueva app (colores, textos y datos reales) |
| `src/ContextText.tsx` | Textos de contexto por escena | Textos nuevos |
| `src/BrandClose.tsx` | Cierre con tu marca (firma, "Software a medida para tu negocio", dominio) | Normalmente nada |
| `src/lib.ts` | Fuentes y colores (de la app y de tu marca) | Colores/fuente de la nueva app |
| `scripts/make-music.mjs` | Genera la música original sincronizada | Acordes y tiempos si cambias la estructura |
| `public/` | Logo, captura de referencia, `music.wav` | Logo y capturas de la nueva app |

---

## 4. Reunir el material de la nueva app

Cuanto más real sea el material, mejor sale el vídeo (la skill `motion-graphics` rechaza interfaces o datos inventados). Ten a mano:

1. **El repositorio de la app** en el mismo ordenador. Claude lee de ahí los colores (`globals.css` o similar), los textos de la interfaz, los nombres de las secciones y los **datos de demostración** (seed/demo).
2. **Logo** en SVG o PNG con fondo transparente.
3. **1–3 capturas reales** de las pantallas clave (o la app funcionando en local para que Claude las capture).
4. **Lo que la app sustituye:** los documentos, hojas de cálculo o herramientas reales que usa el cliente hoy (nombres de archivo, pestañas, columnas).
5. **Qué hace la app de verdad y qué no.** En GasApp el cálculo hidráulico estaba pendiente, así que el vídeo enseña las comprobaciones reales en lugar de inventar resultados.
6. **Tu marca:** ya está en `BrandClose.tsx` (tokens de la plantilla "marca" del portfolio: fondo `#06070a`, Instrument Serif, firma Mrs Saint Delafield, dominio adrianrocafulldev.es).

---

## 5. Escribir el guion

La estructura que funcionó: **20 segundos en 4 bloques**, con una sola idea por bloque.

| Bloque | Tiempo | Función | Ejemplo GasApp |
|---|---|---|---|
| Gancho | 0–4 s | Pregunta o situación que el cliente reconoce | «¿Cuánto tiempo pierdes preparando presupuestos de instalaciones de gas?» |
| Problema | 4–8 s | Un dolor concreto, mostrado con causa → efecto | Cambia una cifra y todos los documentos quedan desactualizados |
| Solución | 8–15 s | La app y 2–3 cosas que hace de verdad | Datos → croquis automático → comprobaciones |
| CTA | 15–20 s | Tu marca y la oferta | «Software a medida para tu negocio» |

Plantilla para rellenar (una fila por bloque):

```text
### 0-4 s | Gancho
Locución: «…»
Visual: …                        (qué se ve y qué se mueve)
Texto en pantalla: eyebrow · título · subtítulo   (contexto, no repetir la locución)

### 4-8 s | Problema
Locución: «…»
Visual: …                        (una acción que CAUSA el problema: se cambia un dato, llega un correo…)
Texto en pantalla: …

### 8-15 s | Solución
Locución: «…»
Visual: los elementos del problema se transforman en la app; la cámara recorre 2-3 secciones reales
Texto en pantalla: 01 · … / 02 · … / 03 · …

### 15-20 s | CTA
Locución: «…»
Visual: la app desaparece y aparece la marca
Texto en pantalla: «Software a medida para tu negocio»
```

Consejos:

- **Una acción causa cada cambio.** No basta con que aparezcan cosas: un dato cambia y por eso los documentos se desordenan; los documentos vuelan y por eso aparece la app.
- **Textos de contexto, no subtítulos.** Explican qué se ve («El croquis se dibuja solo»), no repiten la locución. Máximo unas 6 palabras de título.
- **Nada inventado.** Ni cifras, ni funciones, ni pantallas que la app no tiene.
- **Lectura:** cada texto necesita al menos ~1,3 s en pantalla.

---

## 6. Pedírselo a Claude

Abre Claude Code **en el repositorio de la nueva app** y pega un mensaje como este (rellena lo que está entre `<>`):

```text
Quiero un vídeo de motion graphics de 20 s en 16:9 para la aplicación <nombre>, usando las skills
remotion-best-practices, motion-graphics y cinematic-camera.

Parte de la plantilla que está en marketing/video (copiada del proyecto gas-app): mantén la cámara
única, el cierre de marca (BrandClose), los textos de contexto en placas y la música generada por
scripts/make-music.mjs. Reescribe la interfaz con la de esta app, sacando colores, textos y datos de
demo del código del repositorio.

Guion:
<pega aquí el guion del paso 5>

Requisitos:
- Sin iconos. Sin subtítulos de la locución; sí textos de contexto que expliquen qué es la app.
- <Opcional> Todo el contenido clave centrado para que funcione también recortado a 9:16.
- Fondo: <claro cálido / oscuro limpio / cuadrícula clara / cuadrícula oscura>.
- No inventes funciones ni cifras: si algo no existe en la app, dímelo.
- Música original sincronizada con el montaje.
- Haz la revisión con un crítico independiente hasta que pase (todas las notas >= 8).
- Al terminar, renderiza solo out/<Nombre>_16x9.mp4.
```

Lo que hará Claude, siguiendo las skills:

1. Preguntar lo que falte (formato, fondo, datos).
2. Estudiar el código de la app y escribir el brief en `.promptible/` (`research-brief.md`, `reference-observations.md`).
3. Ejecutar la puerta de la skill (`promptible-gate.mjs research → init → inspect`) hasta `BUILD AUTHORIZED`.
4. Construir las escenas, renderizar y revisar fotogramas.
5. Lanzar un subagente crítico independiente y corregir hasta que apruebe.

> La puerta automática de `motion-graphics` solo admite vídeos de **2 a 15 s**. Para 20 s, el paso `candidate/qa` del script falla por duración; en GasApp se hizo la revisión con el crítico independiente igualmente. Si quieres pasar la puerta completa, haz el vídeo de 15 s.

---

## 7. Comandos útiles

Ejecútalos desde `marketing/video`.

Vista previa interactiva:

```bash
npx remotion studio
```

Render final (cambia el id si renombras la composición en `src/Root.tsx`):

```bash
npx remotion render GasAppPromo out/MiApp_16x9.mp4
```

Un fotograma suelto para revisar (por ejemplo, el 372):

```bash
npx remotion still GasAppPromo out/frame.png --frame=372
```

Regenerar la música:

```bash
node scripts/make-music.mjs
```

Hoja de contacto con varios fotogramas para revisar de un vistazo:

```bash
ffmpeg -i out/MiApp_16x9.mp4 -vf "select='eq(n\,20)+eq(n\,160)+eq(n\,300)+eq(n\,450)',scale=480:-1,tile=2x2" -frames:v 1 -fps_mode vfr out/contact.jpg
```

Medir el volumen de la música (objetivo aproximado: −16 LUFS, con margen para la locución):

```bash
ffmpeg -i public/music.wav -af ebur128 -f null -
```

---

## 8. Guardarlo en el repositorio de la app

Si la app es Next.js (como GasApp), excluye la carpeta del vídeo para que no rompa el build ni el despliegue:

- `tsconfig.json`: `"exclude": ["node_modules", "marketing"]`
- Config del linter (por ejemplo `.oxlintrc.json` o ESLint): ignorar `marketing/**`

La plantilla ya trae su `.gitignore`: ignora `node_modules`, `review` y `.promptible`, y solo sube de `out/` el MP4 final. Si cambias el nombre del MP4, actualiza la línea `!out/GasApp_16x9.mp4`.

Luego `/commit-y-push` desde Claude Code (con la skill copiada en el paso 2).

---

## 9. Problemas conocidos y soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| `spawn ...chrome-headless-shell.exe ENOENT` o `...ffmpeg.exe ENOENT` | Ruta demasiado larga en Windows | Mover el proyecto a una ruta corta |
| `ffmpeg: command not found` justo después de instalarlo | La terminal no ha recargado el PATH | Abrir una terminal nueva |
| El servidor `next dev` de la app se para al arrancar con un aviso de actualización | Next.js 16.4 muestra un aviso de seguridad | Volver a lanzarlo; plantéate actualizar Next.js |
| El recorte 9:16 corta paneles | Zoom de cámara demasiado alto | Con paneles de ~550 px de ancho, zoom máximo ≈ 1,05 en `KEY_Z` |
| Animaciones que no se renderizan | Uso de `transition`/`animation` CSS | En Remotion todo se anima con `useCurrentFrame()`, `interpolate()` y `spring()` |
| La puerta de `motion-graphics` rechaza la duración | Solo admite 2–15 s | Vídeo de 15 s, o revisión solo con el crítico independiente |

---

## 10. Licencia

Remotion es gratuito para particulares y equipos de hasta 3 personas. Para empresas más grandes necesita licencia: la skill `remotion-license` tiene los detalles. La música de `scripts/make-music.mjs` es original y generada por código, así que no tiene derechos de terceros.
