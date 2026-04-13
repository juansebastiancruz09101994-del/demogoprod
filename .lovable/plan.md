

## GoProd overlay: altura variable, draggable, más compacto

### Problemas actuales
- Altura fija de 160px corta el texto y el scroll es mala UX
- Algunos bullets no se parsean bien (falta de `•` al inicio o texto truncado)
- Ancho demasiado grande (`max-w-xl`) y letra grande para un asistente secundario

### Cambios en `GuideOverlay.tsx`

**1. Altura variable** — Quitar `h-[160px]` y dejar que el contenedor crezca según el contenido. Agregar `max-h-[240px] overflow-y-auto` como safety net para mensajes extremadamente largos.

**2. Draggable** — Agregar estado local `position` (`{ x, y }`) con `useState`. En el header/icono de GoProd, poner un `onMouseDown` que inicie el drag. Usar `onMouseMove` y `onMouseUp` en `window` (via `useEffect`) para mover el contenedor. Cambiar de `fixed bottom-20 left-1/2 -translate-x-1/2` a `fixed` con `top/left` controlados por estado. Posición inicial: centrado abajo como ahora.

**3. Ancho y tipografía** — Volver a `max-w-md`. Reducir texto principal de `text-sm` → `text-xs`. Bullets de `text-xs` → `text-[11px]`. Padding de `p-4` → `p-3`.

**4. Cursor de drag** — Agregar `cursor-move` al header para indicar que es arrastrable.

### Archivos a modificar

1. **`src/components/SimulationMap/Guide/GuideOverlay.tsx`** — Todo lo anterior

