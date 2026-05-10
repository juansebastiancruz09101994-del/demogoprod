## Convertir Demo ↔ Estudio en un toggle real con dos espacios separados

### Problema raíz

- Al entrar al demo no se cambia el canvas, así que visualmente "no pasa nada".
- Al salir del demo, los nodos del demo (cargados por `selectScenario(1)` y el efecto en líneas 75–101) se quedan en pantalla, porque `exitDemo()` solo apaga flags pero no restaura el canvas previo del estudiante.
- No hay separación entre el "espacio de trabajo de estudio" y el "espacio de trabajo de demo".

### Solución: dos workspaces independientes

Mantener **dos snapshots** dentro de `SimulationMap.tsx` (en `useRef` para no provocar renders extra):

- `studyWorkspaceRef` → `{ nodes, edges, reportData, pan, zoom, showModulePicker }`
- `demoWorkspaceRef` → mismo shape

Cuando el usuario alterne, se guarda el workspace actual y se carga el otro. Si el otro nunca ha existido, se inicializa en blanco (módulo picker para estudio; canvas vacío + selección de escenarios para demo).

### Cambios concretos

1. **`src/components/SimulationMap/SimulationMap.tsx`**

   - Añadir `studyWorkspaceRef` y `demoWorkspaceRef` (`useRef<Workspace | null>`).
   - Reescribir `handleToggleDemoMode`:
     - Si **no** está en demo:
       1. Guardar workspace actual en `studyWorkspaceRef`.
       2. Si hay `demoWorkspaceRef.current`, restaurarlo (nodes, edges, report, pan, zoom).
       3. Si no, dejar canvas limpio (`setNodes([])`, `setEdges([])`, `setShowModulePicker(false)`) para que el demo arranque desde cero como espera su flujo.
       4. Llamar `demo.startDemo()`.
     - Si **sí** está en demo:
       1. Guardar workspace actual en `demoWorkspaceRef`.
       2. Llamar `demo.exitDemo()`.
       3. Restaurar `studyWorkspaceRef` (o, si está vacío, mostrar `ModulePicker`).

   - Ajustar el `useEffect` de líneas 75–101 (carga de canvas por escenario) para que **solo actúe cuando `demo.isDemoActive` sea `true`**, así no dispara nada al salir del demo.

   - Ajustar el `useEffect` de líneas 119–125 (auto-selección de escenario al cargar reporte) para que **no auto-seleccione escenario** si el usuario apenas entró al demo con un reporte preexistente del modo estudio. Solo auto-seleccionar si `reportData` se cargó *después* de entrar al demo. Se logra guardando una bandera `reportWasLoadedAtDemoStartRef` en el momento de entrar al demo.

   - Persistir nodes/edges/report en `localStorage` solo cuando **no** estemos en modo demo, para que el estudio no quede contaminado con datos del demo (los efectos actuales en líneas 102–116 escriben siempre).

2. **Indicador visual claro de modo activo**

   - Añadir un pequeño badge fijo arriba (top-center o top-left del canvas) que diga:
     - "Modo Estudio" (color slate/blue tenue) cuando `!demo.isDemoActive`.
     - "Modo Demo" (color del acento del demo) cuando `demo.isDemoActive`.
   - Así el toggle se ve y se siente real aunque ambos canvases tengan contenido.

3. **Botón del bombillo (apoyo estratégico)**

   - Sin cambios funcionales. Solo asegurar que esté oculto/deshabilitado durante el demo (ya lo está implícitamente porque el `GuideOverlay` no se renderiza con demo activo).

### Lo que NO se toca

- Lógica de cálculo de módulos, fórmulas, conexiones.
- Flujo interno del demo (escenarios, pasos, auto-pan, feedback final).
- `DemoContext` (la API `startDemo` / `exitDemo` se conserva tal cual).

### Resultado esperado

- Clic en birrete con datos de estudio cargados → se guarda tu canvas de estudio, el canvas se limpia y entras al flujo demo. Badge cambia a "Modo Demo".
- Clic en birrete estando en demo → se guarda el canvas del demo, vuelve tu canvas de estudio intacto. Badge cambia a "Modo Estudio".
- Puedes alternar las veces que quieras sin perder el trabajo de ninguno de los dos lados.
