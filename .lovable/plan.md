## Homogeneizar controles + recuperar badge de modo

### 1. Homogeneizar iconos secundarios

Aplicar mismo lenguaje visual a los botones del bloque inferior derecho (`SimulationMap.tsx`, ~líneas 776–810): feedback, exportar PDF, reset, fit-view, zoom in, zoom out.

Estilo unificado:
- Tamaño contenedor: `40×40 px`, `border-radius: 14px` (cuadrado redondeado coherente con la cápsula).
- Fondo: `#FFFFFF`, `box-shadow: 0 2px 6px -2px rgba(15,23,42,0.18)`, sin borde duro.
- Ícono lucide tamaño `18`, `strokeWidth: 2.2`, color base `#64748B` (slate-500).
- Estado de reposo: `opacity: 0.45`.
- Hover: `opacity: 1`, color del ícono cambia a `#2563FF` (azul principal).
- Transición: `transition: opacity 200ms, color 200ms`.
- El botón de papelera mantiene hover en rojo (`#EF4444`) en lugar de azul.
- El zoom queda agrupado en una mini-cápsula vertical con el mismo radio y sombra; los dos íconos siguen el mismo patrón de opacidad/hover.
- Eliminar el indicador "100%" actual, o moverlo como pequeño label gris debajo del grupo de zoom con la misma opacidad reducida.

Spacing del contenedor: `flex flex-col items-center gap-3` para que toggle, botones y zoom queden alineados verticalmente con el mismo gap.

### 2. Badge superior de modo

Volver a poner el badge centrado en la parte superior, pero ahora:

- Estructura: cápsula horizontal `pl-4 pr-2 py-1.5 rounded-full` con fondo `bg-white/80 backdrop-blur-md`, sombra suave.
- Contenido: punto de color (azul `#2563FF` para Demo, slate `#94A3B8` para Estudio) + texto `Modo Demo` / `Modo Estudio` en `text-xs font-semibold uppercase tracking-wider`.
- Botón **X** a la derecha (lucide `X` size 14) en círculo suave que cierra el badge.
- Opacidad por defecto: `0.5`. Hover sobre toda la cápsula: `opacity: 1`. Transición 200 ms.
- Estado dismissed: nuevo `useState<boolean>(false)` `badgeDismissed`. Al cerrar, se oculta. Cuando `demo.isDemoActive` cambie, `badgeDismissed` se reinicia a `false` (`useEffect` dependiente de `demo.isDemoActive`) para que el usuario vea claramente el cambio cada vez que alterna de modo.

Posicionamiento: `absolute top-4 left-1/2 -translate-x-1/2 z-50`, igual que antes, con `pointer-events-auto` para permitir clic en la X.

### Archivos a modificar

- `src/components/SimulationMap/SimulationMap.tsx`
  - Reescribir el bloque de botones inferior derecho con el nuevo estilo unificado.
  - Reinsertar badge superior con estado `badgeDismissed` y botón de cerrar.

### Lo que NO se toca

- Componente `ModeToggle.tsx` (queda igual, ya tiene la estética definitiva).
- Lógica de modos, demo, guide, workspaces.
- Funcionalidad de cada botón (feedback, exportar, reset, zoom, fit).
