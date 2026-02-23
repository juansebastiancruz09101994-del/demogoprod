
## Canvas por Escenario en Modo Demo

### Problema
Actualmente, al pasar de un escenario a otro, los nodos y conexiones del escenario anterior permanecen en el canvas. El estudiante necesita ver un canvas limpio al empezar cada escenario, pero poder volver a ver sus calculos previos si regresa a un escenario anterior. El reporte del panel izquierdo nunca debe borrarse.

### Solucion
Guardar los nodos y edges de cada escenario en un mapa independiente (`scenarioCanvases`). Al cambiar de escenario, se guarda el estado actual y se carga el del nuevo escenario (o uno limpio si es la primera vez).

### Cambios

**1. `src/components/SimulationMap/DemoMode/DemoContext.tsx`**
- Agregar estado `scenarioCanvases`: un `Record<number, { nodes: NodeData[], edges: Edge[] }>` que almacena el canvas de cada escenario
- Exponer funciones `saveCanvas(scenarioId, nodes, edges)` y `getCanvas(scenarioId)` en el contexto
- Al llamar `selectScenario(id)`, emitir un callback para que SimulationMap guarde el canvas actual antes de cambiar

**2. `src/components/SimulationMap/SimulationMap.tsx`**
- Cuando `demo.currentScenario` cambia (y es >= 1):
  - Guardar los nodos/edges actuales en el canvas del escenario anterior
  - Cargar los nodos/edges del nuevo escenario, o resetear a `DEFAULT_NODES` si no existe aun
  - Resetear pan y zoom al centro
- No tocar `reportData` en ningun momento al cambiar escenarios
- Al salir del modo demo, restaurar el canvas del ultimo escenario activo (o dejar el actual)

### Detalle tecnico

En `DemoContext.tsx` se agrega:

```text
scenarioCanvases: Record<number, { nodes: NodeData[], edges: Edge[] }>
saveScenarioCanvas(id, nodes, edges)  // guarda snapshot
loadScenarioCanvas(id) -> { nodes, edges } | null  // recupera snapshot
```

En `SimulationMap.tsx`, se usa un `useEffect` que detecta cambios en `demo.currentScenario`:

```text
useEffect:
  if demo is not active or scenario < 1: return
  // Guardar canvas del escenario previo (usando ref para saber cual era)
  demo.saveScenarioCanvas(prevScenario, nodes, edges)
  // Cargar canvas del nuevo escenario
  const saved = demo.loadScenarioCanvas(currentScenario)
  if saved: setNodes(saved.nodes), setEdges(saved.edges)
  else: setNodes(DEFAULT_NODES), setEdges([])
  // Resetear vista
  setPan(centro), setZoom(1)
```

Se usa un `useRef` para trackear el escenario previo y evitar loops.

### Archivos modificados (2)
- `src/components/SimulationMap/DemoMode/DemoContext.tsx` - agregar scenarioCanvases y funciones save/load
- `src/components/SimulationMap/SimulationMap.tsx` - logica de swap de canvas al cambiar escenario
