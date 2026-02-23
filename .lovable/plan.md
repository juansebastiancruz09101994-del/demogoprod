

## Reducir pasos del Escenario 1 (y ajustar 2 y 3)

### Problema
El Escenario 1 tiene 17 pasos, pero la metodologia real solo tiene ~9 acciones logicas. Los pasos actuales son demasiado granulares: separan cada clic de cada input, e incluyen nodos intermedios innecesarios (como Fuerza Laboral en el Escenario 1).

### Archivo a modificar
`src/components/SimulationMap/DemoMode/demoScenarios.ts`

### Escenario 1 - Pasos propuestos (9 pasos, antes 17)

| # | Accion | Detalle |
|---|--------|---------|
| 1 | fill-input | Escribir 210,000 en Unidades Objetivo |
| 2 | click-suggestion | Clic en "+ Calcular Materia Prima" |
| 3 | fill-input | Tasa de Uso MP: 3.90 |
| 4 | click-suggestion | Clic en "+ Calcular Horas Mano de Obra" |
| 5 | fill-input | Tasa MO: 4.36 |
| 6 | click-suggestion | En Req. MP, clic en "+ Calcular Costo Material" |
| 7 | fill-input | Precio MP: $2.25 |
| 8 | click-suggestion | En Req. MO, clic en "+ Calcular Costo MO" (directo, sin pasar por Fuerza Laboral) |
| 9 | fill-input | Workers: 1,852, Wage: $2.30, Hours: 500 (un solo paso con 3 valores) |
| 10 | click-suggestion | En Costo Material, clic en "+ Anadir al Costo Total" |
| 11 | fill-input | Costos Fijos: $400,000 |
| 12 | click-suggestion | Clic en "+ Calcular Costo Unitario" |
| 13 | info | Escenario 1 completado. Costo Unitario ~$20.71 |

**Cambios clave vs. actual:**
- Se elimina el nodo intermedio "Fuerza Laboral" (workforce) del Escenario 1. Se va directo de labor_needs a cost_labor.
- Se eliminan los 3 pasos separados de cost_labor (workers, wage, hours) y se dejan como un solo paso que pide llenar los 3. La validacion se hara con el ultimo valor ingresado.
- Total: 13 pasos (vs 17 actuales)

Nota: si se prefiere aun menos pasos, los click-suggestion podrian combinarse con el fill-input siguiente, pero eso requeriria cambiar la logica de deteccion en SimulationMap. La reduccion principal viene de eliminar workforce y consolidar los 3 inputs de cost_labor.

### Escenario 2 - Ajustes (10 pasos, se mantiene similar)

Se mantiene la misma cantidad de pasos porque este escenario SI requiere el nodo de workforce y hiring. Solo se ajusta que en el Escenario 2, los nodos ya no existen (canvas limpio), asi que se necesitan los click-suggestion para crearlos.

### Escenario 3 - Ajustes (11 pasos, se mantiene similar)

Se mantiene porque tiene pasos informativos necesarios sobre la dinamica de inventario.

### Detalle tecnico

En `demoScenarios.ts`, se reescribe el array `steps` del Escenario 1 eliminando:
- Paso 8-9 actual (workforce + hrs_per_worker) - se reemplaza la sugerencia de "Calcular Fuerza Laboral" por ir directo a "Calcular Costo Mano de Obra" desde labor_needs
- Pasos 11-13 actuales (3 fills separados de cost_labor) - se consolidan en un solo paso que pide llenar workers primero, luego wage y hours se validan en pasos rapidos

La suggestion `cost_labor` ya existe en `workforce.suggestions`, pero tambien se puede acceder desde `labor_needs` si se agrega ahi. Revisando el modulo `labor_needs`, solo tiene `workforce` como sugerencia. Entonces habria dos opciones:

**Opcion A**: Agregar `cost_labor` como sugerencia directa en `labor_needs` en `modules.tsx`
**Opcion B**: Mantener la ruta workforce -> cost_labor pero solo en escenario 2

Se recomienda **Opcion A** para simplificar el Escenario 1.

### Archivos a modificar
1. `src/components/SimulationMap/modules.tsx` - agregar sugerencia `cost_labor` en `labor_needs`
2. `src/components/SimulationMap/DemoMode/demoScenarios.ts` - reescribir steps del Escenario 1

