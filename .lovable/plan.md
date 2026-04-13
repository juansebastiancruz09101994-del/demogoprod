

## Propagacion de valores entre nodos conectados

### Problema actual
Cuando un estudiante cambia un valor en un nodo padre, los nodos hijos no se actualizan. Esto ocurre porque:
1. El `Edge` solo almacena `{from, to}` — no guarda QUE variables estan conectadas
2. `handleNodeUpdate` solo actualiza el nodo editado, sin recorrer el grafo
3. El `varMap` de cada sugerencia solo se usa al momento de crear el nodo hijo, pero no se persiste

### Solucion

#### 1. Extender el tipo `Edge` para almacenar el mapeo de variables

```
interface Edge {
  from: string;
  to: string;
  varMap: Record<string, string>; // { childVar: parentVar }
}
```

Esto permite saber que, por ejemplo, el campo `target` del nodo hijo `material_needs` viene del campo `target` del nodo padre `production_target`.

#### 2. Funcion de propagacion en cascada

Al actualizar un nodo, recorrer todas las aristas salientes, copiar los valores mapeados al nodo hijo, re-ejecutar su `solve`, y continuar recursivamente con los hijos de ese hijo (BFS o DFS con proteccion anti-ciclos).

```text
Usuario cambia "target" en production_target
  → Edge dice: material_needs.target = production_target.target
    → Copiar valor, re-solve material_needs
      → Edge dice: cost_material.units = material_needs.total_mp
        → Copiar valor, re-solve cost_material
          → ... y asi sucesivamente
```

#### 3. Guardar varMap al crear aristas

Modificar `handleAddChild` para incluir el `varMap` en la arista. Para aristas creadas por anti-duplicado, inferir el varMap de la sugerencia que lo origino.

### Archivos a modificar

1. **`src/components/SimulationMap/types.ts`** — Agregar `varMap` al tipo `Edge`
2. **`src/components/SimulationMap/SimulationMap.tsx`** — Guardar varMap en aristas; implementar `propagateValues` recursivo en `handleNodeUpdate`; actualizar anti-duplicado para incluir varMap
3. **`src/components/SimulationMap/Node.tsx`** — Sin cambios (ya llama `onUpdate` correctamente)

### Consideraciones
- Proteccion anti-ciclos: usar un `Set<string>` de nodos ya visitados durante la propagacion
- La propagacion solo fluye en direccion `from → to` de cada arista
- El `solve` del nodo hijo se ejecuta con su `targetId` actual para recalcular el campo derivado

