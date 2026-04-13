

## Punto de partida flexible: cualquier módulo como raíz

### Análisis del sistema actual

Actualmente el canvas siempre inicia con un nodo `production_target` hardcodeado como `DEFAULT_NODES`. Las sugerencias (botones "+") solo fluyen "hacia abajo":

```text
production_target
├── material_needs → inventory_val, cost_material → total_cost → unit_cost
├── labor_needs → workforce → hiring, cost_labor → total_cost
└── packaging → cost_packaging → total_cost
```

Cada módulo ya tiene funciones `solve` bidireccionales (puede resolver cualquier variable dados los demás). Lo que falta son **sugerencias inversas** y una **UI de selección de módulo inicial**.

### Análisis matemático de las fórmulas bidireccionales

Todas las fórmulas ya son invertibles:

| Módulo | Forward | Reverse |
|--------|---------|---------|
| `material_needs` | target × rate = total_mp | target = total_mp / rate |
| `labor_needs` | target × rate = total_hours | target = total_hours / rate |
| `workforce` | needed_hours / hrs_per_worker = workers | needed_hours = workers × hrs_per_worker |
| `cost_material` | units × price = cost | units = cost / price |
| `cost_labor` | workers × wage × hours = cost | workers = cost / (wage × hours) |
| `unit_cost` | total_cost / units = u_cost | total_cost = u_cost × units |

Esto significa que si un estudiante empieza por `cost_material` (sabe cuánto quiere gastar en MP), puede derivar cuántas unidades de MP necesita, y de ahí cuántas unidades producir. El grafo se construye en reversa pero las matemáticas funcionan igual.

### Cambios propuestos

#### 1. UI: Selector de módulo inicial (reemplaza el nodo root fijo)

En lugar de arrancar siempre con `production_target`, al iniciar un canvas vacío (o al resetear), mostrar un **picker de módulos** donde el estudiante elige desde dónde quiere empezar. Se mostrará como un panel flotante en el centro del canvas con los módulos agrupados por categoría.

**Módulos disponibles como punto de partida** (todos los existentes excepto `inventory_val` que es un nodo auxiliar):
- Plan de Producción
- Req. Materia Prima
- Req. Mano de Obra
- Costo Material
- Costo Mano de Obra
- Costo Total Prod.
- Costo Unitario

#### 2. Sugerencias bidireccionales en cada módulo

Agregar sugerencias "inversas" a cada módulo para que pueda derivar nodos tanto downstream como upstream:

- **`material_needs`**: agregar → `production_target` ("Definir Producción Objetivo", map: `{target: 'target'}`)
- **`labor_needs`**: agregar → `production_target` ("Definir Producción Objetivo", map: `{target: 'target'}`)
- **`cost_material`**: agregar → `material_needs` ("Calcular Req. MP", map: `{total_mp: 'units'}`)
- **`cost_labor`**: agregar → `labor_needs` ("Calcular Req. MO", map: `{}`) y → `workforce` ("Calcular Fuerza Laboral", map: `{workers_req: 'workers'}`)
- **`total_cost`**: agregar → `cost_material`, `cost_labor`, `cost_packaging` (crear nodos de costo individual)
- **`unit_cost`**: agregar → `total_cost` ("Desglosar Costo Total", map: `{total: 'total_cost'}`)

#### 3. Eliminar restricción `isInputNode` como condición exclusiva

Cualquier módulo puede ser nodo raíz. Se elimina `DEFAULT_NODES` como constante fija y se reemplaza por un estado que depende de la selección del usuario.

#### 4. Lógica anti-duplicados

Antes de crear un nodo vía sugerencia, verificar que no exista ya un nodo del mismo tipo en el canvas. Si ya existe, conectar una arista al existente en lugar de crear uno nuevo (evita duplicados de `production_target`, etc.).

### Archivos a modificar

1. **`src/components/SimulationMap/modules.tsx`** — Agregar sugerencias inversas a cada módulo; remover `isInputNode` de `production_target` (o hacerlo universal)
2. **`src/components/SimulationMap/SimulationMap.tsx`** — Reemplazar `DEFAULT_NODES` por un estado dinámico; agregar componente `ModulePicker`; lógica anti-duplicados en `handleAddChild`
3. **`src/components/SimulationMap/Node.tsx`** — Ajustar rendering para que cualquier nodo pueda ser "input" (sin candado de solve) si el usuario lo desea

### Nota sobre el Modo Demo

El modo demo seguirá funcionando igual ya que fuerza un flujo específico con pasos predefinidos. Los escenarios del demo no se modifican.

