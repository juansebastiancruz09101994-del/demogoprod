

## Dos correcciones: Tolerancia en Escenario 3 + Auto-pan hacia nodo activo

### Problema 1: Escenario 3, paso 15 (workers)
El paso actual tiene `expectedValue: 1852` con `tolerance: 0.01`, lo que obliga al estudiante a poner 1,852. Pero como solo se necesitan ~1,569.6 trabajadores, el estudiante podria decidir despedir a los que sobran. Hay que ampliar la tolerancia para aceptar ambos valores (igual que en el Escenario 1).

**Solucion**: Cambiar `tolerance` de `0.01` a `0.10` y actualizar el mensaje para indicar que es decision del estudiante (1,852 o ~1,570).

### Problema 2: El canvas no se mueve hacia el nodo objetivo
A medida que se crean nodos, la cadena crece y el nodo que el demo pide tocar puede quedar fuera de la pantalla. El estudiante se pierde.

**Solucion**: Agregar un auto-pan suave que centre la vista en el nodo objetivo del paso actual cada vez que cambia el paso del demo. Se busca el nodo por `targetNodeType`, se calcula su posicion en pantalla, y si esta fuera del area visible (o parcialmente oculto), se anima el `pan` para centrarlo.

---

### Cambios tecnicos

**1. `demoScenarios.ts`** (linea 430-436)
- Cambiar paso 15 del Escenario 3:
  - `tolerance: 0.01` a `tolerance: 0.10`
  - Mensaje: "Total Trabajadores: 1,852 o ~1,570 (tu decides si despides a los que sobran o pagas a todos)."

**2. `SimulationMap.tsx`**
- Agregar un `useEffect` que observe `demo.currentStep` y `demo.currentScenario`:
  - Obtiene el paso actual con `demo.getCurrentStep()`
  - Si el paso tiene `targetNodeType`, busca el nodo correspondiente en `nodes`
  - Calcula la posicion del nodo en pantalla: `screenX = node.x * zoom + pan.x`
  - Si el nodo esta fuera del viewport (con margen), anima el `pan` para centrarlo
  - La animacion usa `requestAnimationFrame` con interpolacion suave (o un simple `setTimeout` con transicion CSS)
  - No cambia el zoom, solo el pan

Logica del auto-pan:
```text
useEffect:
  if !demo.isDemoActive: return
  step = demo.getCurrentStep()
  if !step || !step.targetNodeType: return
  targetNode = nodes.find(n => n.type === step.targetNodeType)
  if !targetNode: return

  // Posicion del nodo en pantalla
  screenX = targetNode.x * zoom + pan.x
  screenY = targetNode.y * zoom + pan.y
  nodeW = 320 * zoom
  nodeH = 200 * zoom

  // Centro del nodo en pantalla
  nodeCenterX = screenX + nodeW / 2
  nodeCenterY = screenY + nodeH / 2

  // Margen de seguridad (150px desde el borde)
  margin = 150
  inView = nodeCenterX > margin
         && nodeCenterX < window.innerWidth - margin
         && nodeCenterY > margin
         && nodeCenterY < window.innerHeight - margin

  if !inView:
    // Nuevo pan para centrar el nodo
    newPanX = window.innerWidth / 2 - (targetNode.x + 160) * zoom
    newPanY = window.innerHeight / 2 - (targetNode.y + 100) * zoom
    setPan({ x: newPanX, y: newPanY })
```

Para una transicion suave, se agrega `transition: transform 0.4s ease` al contenedor del canvas (el div con `transform: translate(pan) scale(zoom)`), y se activa temporalmente cuando el auto-pan se dispara.

### Archivos a modificar
1. `src/components/SimulationMap/DemoMode/demoScenarios.ts` - tolerancia del paso 15 en Escenario 3
2. `src/components/SimulationMap/SimulationMap.tsx` - useEffect para auto-pan hacia nodo objetivo

