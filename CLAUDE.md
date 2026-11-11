# MLM 2027 - Prototipo navegable

Fuente de verdad: `docs/PROMPT_MAESTRO.md`. Referencia visual: `docs/referencia_visual_MLM2027.html`.

## Reglas obligatorias
- Entorno Windows: comandos de PowerShell (`Remove-Item`, `Copy-Item`, `$env:VAR=`), rutas `D:\Prototipo\Prototipo-MLM`.
- Prohibido usar emojis en código, interfaz, datos, commits y respuestas. Iconos solo de `lucide-react`.
- Nombres de código en español sin tildes; textos visibles con tildes correctas. Archivos en UTF-8.
- Trabajo por fases: no adelantar fases, no reescribir lo que funciona; al cerrar cada fase listar archivos, comandos, criterios cubiertos y revisión responsive.
- No inventar el Plan de Compensación: todo valor es ficticio, editable y rotulado DEMOSTRACIÓN.
- Sin integraciones reales, sin backend: datos en memoria (`src/datos/`) y stores de zustand. "Reiniciar demostración" restablece todo.
- TypeScript estricto, sin `any`, sin comentarios innecesarios, motores de cálculo como funciones puras.
- Responsive mobile-first en cada fase: sin scroll horizontal de página, táctiles de 44 px, revisar 375/768/1440 px.

## Stack
Vite + React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`), react-router-dom 7, zustand, lucide-react, recharts, react-zoom-pan-pinch, date-fns. Fuentes: Plus Jakarta Sans (interfaz) y JetBrains Mono (cifras y códigos).

## Estructura
`src/rutas` (rutas, guardas, navegación, registro de pantallas), `src/layouts` (público, afiliado, corporativo), `src/paginas` (publico, afiliado, corporativo, sesion), `src/componentes/ui`, `src/componentes/demo`, `src/store`, `src/datos`, `src/tipos`, `src/hooks`, `src/utilidades`. Fases siguientes agregan `src/motores`, `src/servicios`, `src/validaciones`, `src/componentes/redes|rangos|bonos|graficos`.

## Fases
1. Base del proyecto (completada)
2. Núcleo de dominio y datos (completada: datos DEMO, motores, servicios, /demo/datos)
3. Recorrido público y cliente/alumno (pantallas 01-04) (completada)
4. Back office del afiliado (05-13) (completada)
5. Corporativo I (14-19) (completada)
6. Corporativo II (20-25) (completada)
7. Demostración guiada y control de calidad (completada)
