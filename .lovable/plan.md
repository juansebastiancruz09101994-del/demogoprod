

## Corregir Escenarios 1, 2 y 3 del Modo Demo

### Problema 1: Escenario 1 omite Fuerza Laboral
El ultimo cambio elimino el nodo de Fuerza Laboral del Escenario 1, pero es necesario que el estudiante lo calcule: 915,600 hrs / 500 hrs = 1,831.2 trabajadores. La decision de poner 1,852 o 1,831 en el costo de MO es del estudiante.

### Problema 2: Escenario 2 no crea los nodos necesarios
El canvas del Escenario 2 esta limpio (solo tiene production_target), pero los pasos asumen que ya existen nodos como material_needs, labor_needs, workforce, hiring, cost_material, cost_labor y total_cost. Faltan los `click-suggestion` para crearlos.

---

### Escenario 1 - Pasos corregidos (16 pasos)

Se restaura el nodo workforce entre labor_needs y cost_labor:

| # | Tipo | Nodo | Variable | Valor | Mensaje |
|---|------|------|----------|-------|---------|
| 1 | fill-input | production_target | target | 210,000 | Unidades objetivo al 80% capacidad |
| 2 | click-suggestion | production_target | - | material_needs | Crear nodo Req. MP |
| 3 | fill-input | material_needs | rate | 3.90 | Tasa MP. Req = 819,000 uds |
| 4 | click-suggestion | production_target | - | labor_needs | Crear nodo Req. MO |
| 5 | fill-input | labor_needs | rate | 4.36 | Tasa MO. Req = 915,600 hrs |
| 6 | click-suggestion | material_needs | - | cost_material | Crear nodo Costo Material |
| 7 | fill-input | cost_material | price | 2.25 | Precio MP. Costo = $1,842,750 |
| 8 | click-suggestion | labor_needs | - | workforce | Crear nodo Fuerza Laboral |
| 9 | fill-input | workforce | hrs_per_worker | 500 | Hrs por trabajador |
| 10 | info | - | - | - | Resultado: 915,600/500 = 1,831.2 trabajadores necesarios. Pero tienes 1,852. Tu decides si despides o pagas a todos. |
| 11 | click-suggestion | workforce | - | cost_labor | Crear nodo Costo MO |
| 12 | fill-input | cost_labor | workers | 1852 | Trabajadores (1,852 o 1,831 segun tu decision) - tolerancia amplia |
| 13 | fill-input | cost_labor | wage | 2.30 | Salario/hora |
| 14 | fill-input | cost_labor | hours | 500 | Horas/trabajador |
| 15 | click-suggestion | cost_material | - | total_cost | Crear nodo Costo Total |
| 16 | fill-input | total_cost | fix_cost | 400,000 | Costos fijos |
| 17 | click-suggestion | total_cost | - | unit_cost | Crear nodo Costo Unitario |
| 18 | info | - | - | - | Completado. Costo Unitario aprox $20.71 |

Nota: La tolerancia del paso 12 (workers) sera amplia (ej. 0.02) para aceptar tanto 1852 como 1831.

### Escenario 2 - Pasos corregidos (con click-suggestion para crear nodos)

Como el canvas empieza limpio, cada nodo debe crearse via click-suggestion antes de llenarlo:

| # | Tipo | Nodo | Variable | Valor | Mensaje |
|---|------|------|----------|-------|---------|
| 1 | fill-input | production_target | target | 263,420 | Maxima capacidad |
| 2 | click-suggestion | production_target | - | material_needs | Crear Req. MP |
| 3 | fill-input | material_needs | rate | 3.90 | Tasa MP |
| 4 | click-suggestion | production_target | - | labor_needs | Crear Req. MO |
| 5 | fill-input | labor_needs | rate | 4.36 | Tasa MO. Req = 1,148,511 hrs |
| 6 | click-suggestion | labor_needs | - | workforce | Crear Fuerza Laboral |
| 7 | fill-input | workforce | hrs_per_worker | 500 | Hrs por trabajador |
| 8 | info | - | - | - | Necesitas 2,297 trabajadores pero solo tienes 1,852. Deficit enorme. |
| 9 | click-suggestion | workforce | - | hiring | Crear nodo Contratacion |
| 10 | fill-input | hiring | current | 1,852 | Fuerza laboral actual |
| 11 | info | - | - | - | Regla 2x: Nuevos = (2,297 - 1,852) x 2 = 891. Total = 2,743. |
| 12 | click-suggestion | workforce | - | cost_labor | Crear Costo MO |
| 13 | fill-input | cost_labor | workers | 2,743 | Total trabajadores con nuevos |
| 14 | fill-input | cost_labor | wage | 2.30 | Salario |
| 15 | fill-input | cost_labor | hours | 500 | Horas |
| 16 | click-suggestion | material_needs | - | cost_material | Crear Costo Material |
| 17 | fill-input | cost_material | price | 2.25 | Precio MP |
| 18 | click-suggestion | cost_material | - | total_cost | Crear Costo Total |
| 19 | fill-input | total_cost | fix_cost | 400,000 | Costos fijos |
| 20 | click-suggestion | total_cost | - | unit_cost | Crear Costo Unitario |
| 21 | info | - | - | - | Completado. Costo Unitario aprox $22.27 |

### Escenario 3 - Pasos corregidos (con click-suggestion para crear nodos)

Mismo patron: canvas limpio, crear nodos paso a paso:

| # | Tipo | Nodo | Variable | Valor | Mensaje |
|---|------|------|----------|-------|---------|
| 1 | fill-input | production_target | target | 180,000 | Produccion reducida |
| 2 | click-suggestion | production_target | - | material_needs | Crear Req. MP |
| 3 | fill-input | material_needs | rate | 3.90 | Tasa MP. Req = 702,000 uds |
| 4 | info | - | - | - | Dinamica de inventario: 400k a $2.25, faltan 302k a $2.8125 |
| 5 | click-suggestion | material_needs | - | cost_material | Crear Costo Material |
| 6 | fill-input | cost_material | units | 702,000 | Total MP necesaria |
| 7 | fill-input | cost_material | price | 2.4921 | Precio ponderado |
| 8 | info | - | - | - | Costo MP = $1,749,375 |
| 9 | click-suggestion | production_target | - | labor_needs | Crear Req. MO |
| 10 | fill-input | labor_needs | rate | 4.36 | Tasa MO |
| 11 | click-suggestion | labor_needs | - | workforce | Crear Fuerza Laboral |
| 12 | fill-input | workforce | hrs_per_worker | 500 | Hrs por trabajador |
| 13 | info | - | - | - | Solo necesitas 1,569.6 trabajadores pero pagas a los 1,852 completos (costo hundido) |
| 14 | click-suggestion | workforce | - | cost_labor | Crear Costo MO |
| 15 | fill-input | cost_labor | workers | 1,852 | Pagas a toda la plantilla |
| 16 | fill-input | cost_labor | wage | 2.30 | Salario |
| 17 | fill-input | cost_labor | hours | 500 | Horas. Costo MO = $2,129,800 |
| 18 | click-suggestion | cost_material | - | total_cost | Crear Costo Total |
| 19 | fill-input | total_cost | fix_cost | 400,000 | Costos fijos |
| 20 | click-suggestion | total_cost | - | unit_cost | Crear Costo Unitario |
| 21 | info | - | - | - | Completado. Costo Unitario aprox $23.77 |

---

### Cambios en modules.tsx

Revertir el cambio anterior: quitar `cost_labor` de las sugerencias de `labor_needs` (ya no se necesita, se va por workforce). Las sugerencias de labor_needs vuelven a ser solo `workforce` y `cost_labor` (mantener ambas para uso libre fuera del demo).

### Archivos a modificar
1. `src/components/SimulationMap/DemoMode/demoScenarios.ts` - reescribir los 3 escenarios completos
2. `src/components/SimulationMap/modules.tsx` - sin cambios (mantener cost_labor como opcion en labor_needs)

