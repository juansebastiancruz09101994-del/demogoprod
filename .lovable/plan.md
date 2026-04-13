

## Asistente guía para el modo real (no-demo)

### Concepto

Un asistente ligero que observa el estado del canvas en tiempo real y genera pistas dinámicas. A diferencia del modo demo (pasos fijos), este asistente se adapta a lo que el estudiante decida hacer.

**Lógica central**: En cualquier momento, el asistente identifica el "nodo activo" (el más reciente o seleccionado) y determina qué necesita atención:
1. Si tiene campos vacíos (valor = 0) → pulso azul en esos campos + mensaje indicando dónde encontrar el dato
2. Si todos los campos están llenos → pulso verde en las sugerencias disponibles + mensaje tipo "¿Qué quieres calcular ahora?"
3. Si no hay nodos → no se muestra nada

### Representacion visual

```text
Estado A: Nodo con campos vacíos
┌──────────────────────────────┐
│  Req. Materia Prima          │
├──────────────────────────────┤
│  Producción Objetivo  815000 │  ← ya tiene valor (propagado)
│           ×                  │
│  ● Tasa de Uso         [ 0 ]│  ← pulso azul aquí
│          ═══                 │
│  🔒 Total MP            [ 0]│
└──────────────────────────────┘

  ┌─ 💡 Asistente ──────────────────────┐
  │ Busca la "Tasa de Uso de MP" en el  │
  │ panel de reporte (sección Producción)│
  │                          [Entendido] │
  └──────────────────────────────────────┘

Estado B: Nodo completo
┌──────────────────────────────┐
│  Req. Materia Prima          │
│  ...todos los campos llenos  │
│  ● Calcular Costo Material   │  ← pulso verde
│  ● Ver Valor Inventario      │  ← pulso verde
└──────────────────────────────┘

  ┌─ 💡 Asistente ──────────────────────┐
  │ ¡Bien! Ahora puedes expandir tu     │
  │ análisis. ¿Qué quieres calcular?    │
  │                          [Entendido] │
  └──────────────────────────────────────┘
```

### Arquitectura

1. **`GuideContext.tsx`** — Nuevo contexto (separado del DemoContext) con:
   - `isGuideActive: boolean` — toggle on/off
   - `activeNodeId: string | null` — nodo que el asistente observa (= `selectedNodeId`)
   - `guideMessage: string | null` — mensaje actual
   - `highlightFields: string[]` — IDs de variables vacías a pulsar en azul
   - `highlightSuggestions: boolean` — si pulsar las sugerencias en verde
   - Función `computeGuidance(node, reportData)` que analiza el nodo y genera las pistas

2. **`guideHints.ts`** — Mapa de hints por variable de cada módulo, indicando dónde encontrar el dato en el reporte. Ejemplo:
   ```typescript
   {
     material_needs: {
       rate: "Busca la 'Tasa de Uso de MP' en el panel de reporte, sección Producción.",
       target: "Este valor viene del nodo padre (Plan de Producción).",
     },
     labor_needs: {
       rate: "Busca la 'Tasa de Mano de Obra' en el panel de reporte.",
     },
     // ...
   }
   ```

3. **`GuideOverlay.tsx`** — Banner flotante (similar al DemoOverlay pero más sutil), en la parte inferior. Muestra el mensaje actual y un botón "Entendido"/"Siguiente". Se puede ocultar/minimizar.

4. **Modificaciones en `Node.tsx` / `FormulaLayout.tsx`** — Reutilizar el componente `GuidePulse` existente:
   - Si `isGuideActive` y el nodo es el activo, campos vacíos reciben pulso azul
   - Sugerencias reciben pulso verde cuando todos los campos están llenos
   - Esto reutiliza la misma prop `demoHighlight` pero con una fuente diferente

5. **Modificaciones en `SimulationMap.tsx`**:
   - Wrappear con `GuideProvider`
   - Calcular la guía cada vez que cambie `selectedNodeId` o `nodes`
   - Pasar highlights al componente `Node` (reutilizando `demoHighlight` o una nueva prop `guideHighlight`)
   - Botón toggle en la barra de controles para activar/desactivar el asistente

### Interaccion con el modo demo

- Cuando el modo demo está activo, el asistente guía se desactiva automáticamente (el demo tiene prioridad)
- Son mutuamente excluyentes

### Archivos a crear/modificar

1. **Crear** `src/components/SimulationMap/Guide/GuideContext.tsx` — contexto y lógica
2. **Crear** `src/components/SimulationMap/Guide/guideHints.ts` — hints por módulo/variable
3. **Crear** `src/components/SimulationMap/Guide/GuideOverlay.tsx` — banner flotante
4. **Crear** `src/components/SimulationMap/Guide/index.ts` — exports
5. **Modificar** `src/components/SimulationMap/Node.tsx` — aceptar `guideHighlight` prop
6. **Modificar** `src/components/SimulationMap/FormulaLayout.tsx` — renderizar pulsos azules/verdes del guide
7. **Modificar** `src/components/SimulationMap/SimulationMap.tsx` — integrar GuideProvider, calcular highlights, agregar toggle

### Detalles técnicos

- `computeGuidance` prioriza: primero campos propagados pero vacíos, luego campos manuales vacíos, luego sugerencias
- El hint del primer campo vacío se muestra como mensaje; si hay varios vacíos, se mencionan todos
- El asistente se activa por defecto para nuevos usuarios y se puede desactivar con un toggle (icono de bombilla en la barra inferior)
- Estado persistido en `localStorage` (`goprod_guide_active`)

