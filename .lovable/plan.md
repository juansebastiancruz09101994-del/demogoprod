## Toggle vertical tipo cápsula: Demo ↔ Estudio

Reemplazar los dos botones independientes (birrete + bombillo) por un único selector exclusivo con indicador deslizante.

### Mapeo semántico

- **Círculo superior — birrete** → Modo Demo (`demo.isDemoActive = true`).
- **Círculo inferior — bombillo** → Modo Estudio con apoyo estratégico (`demo.isDemoActive = false` + `guide.isGuideActive = true`).

Solo uno puede estar activo. Clic en birrete: entra al demo (toggle de workspace ya implementado) y apaga el guide. Clic en bombillo: sale del demo y enciende el guide. El badge "Modo Estudio / Modo Demo" en la parte superior queda redundante y se quita.

### Componente nuevo

`src/components/SimulationMap/ModeToggle.tsx` — cápsula vertical autocontenida.

Props:
```ts
{
  mode: 'demo' | 'study';
  onChange: (next: 'demo' | 'study') => void;
}
```

### Anatomía visual

```text
   ╭─────────╮
   │   ◉ 🎓  │  ← círculo activo (elevado, fondo azul oscuro)
   │  ─────  │  ← separador horizontal sutil
   │   ○ 💡  │  ← círculo inactivo (blanco, ícono gris azulado)
   ╰─────────╯
```

- **Cápsula contenedora**: `width: 56px`, `height: 120px`, `border-radius: 9999px`, fondo `#2563FF` (azul eléctrico), `box-shadow` externa suave (`0 8px 24px -8px rgba(37, 99, 255, 0.45)`).
- **Indicador deslizante** (`absolute`, animado con `transform: translateY`):
  - Círculo de `48px`, fondo `#FFFFFF`, sombra interna ligera para neumorfismo.
  - Posición top cuando `mode === 'demo'`, bottom cuando `mode === 'study'`.
  - Transición `cubic-bezier(0.4, 0, 0.2, 1)` ~ 280ms (iOS feel).
- **Iconos** (`GraduationCap`, `Lightbulb` de lucide-react, `size={20}`):
  - Activo: ícono dentro del círculo blanco, color `#1D4ED8`.
  - Inactivo: ícono sobre la cápsula azul, color `#FFFFFF` con opacidad `0.7`.
  - Wait — corrección según el spec del usuario: el activo tiene fondo azul oscuro con ícono blanco; el inactivo es círculo blanco con ícono gris azulado. Reescribir:
    - **Activo**: círculo elevado con fondo `linear-gradient(180deg, #2563FF, #1D4ED8)`, ícono blanco.
    - **Inactivo**: círculo blanco plano, ícono `#94A3B8`.
  - Esto se logra renderizando ambos slots con su estilo según `mode` (no un único pill que se mueve, sino dos círculos cuyo estado cambia + un sutil indicador deslizante detrás).

### Estructura DOM final

```tsx
<div className="capsule">                    // cápsula azul vertical
  <div className="slider" data-pos={mode}/>  // pastilla blanca animada que indica posición
  <button data-mode="demo">  <GraduationCap /> </button>
  <div className="divider" />                // línea horizontal sutil
  <button data-mode="study"> <Lightbulb />   </button>
</div>
```

El "slider" es un pseudo-fondo blanco `48x48` con `top` animado entre `4px` y `68px`. Los íconos se renderizan encima: cuando coinciden con el slider, se ven sobre fondo blanco con color azul oscuro; cuando no, se ven directamente sobre el azul de la cápsula con color blanco translúcido.

Espera — el spec del usuario dice activo = azul oscuro / ícono blanco, inactivo = blanco / gris. Invierto el slider: el slider es **azul oscuro** (`#1D4ED8`) y la cápsula es **azul medio** (`#2563FF`). El círculo del slot opuesto siempre se ve como un disco blanco fijo. Resultado:

- Slot activo: disco azul oscuro (slider) con ícono blanco encima.
- Slot inactivo: disco blanco fijo con ícono `#94A3B8` encima.
- Cápsula azul medio de fondo entre ambos.

Esto da el efecto deseado y mantiene la animación de deslizamiento.

### Integración en `SimulationMap.tsx`

- Eliminar los dos botones actuales (birrete y bombillo) en el bloque de controles inferior derecho (~líneas 745–770).
- Insertar `<ModeToggle mode={demo.isDemoActive ? 'demo' : 'study'} onChange={handleModeChange} />` en su lugar.
- `handleModeChange(next)`:
  - Si `next === 'demo'` y no estamos en demo → llamar `handleToggleDemoMode()` y `guide.setGuideActive(false)`.
  - Si `next === 'study'` y estamos en demo → llamar `handleToggleDemoMode()` y `guide.setGuideActive(true)`.
  - Si `next === 'study'` y ya estamos fuera del demo → `guide.setGuideActive(true)` (idempotente).
- Quitar el badge superior "Modo Estudio / Modo Demo" porque el toggle ya comunica el modo activo.

### Accesibilidad

- Cada botón con `aria-label` ("Modo Demo" / "Modo Estudio") y `aria-pressed`.
- `title` para tooltip en hover.
- Foco visible (ring azul claro).

### Lo que NO se toca

- Lógica del workspace toggle Demo/Estudio (ya implementada).
- `DemoContext`, `GuideContext`.
- Botones de feedback, exportar, reset, zoom, fit (siguen abajo, debajo del toggle).
