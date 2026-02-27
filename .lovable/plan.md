

## Mensajes pedagogicos + Boton "Anterior"

### 1. Reescribir mensajes en `demoScenarios.ts`

Todos los mensajes de los 3 escenarios se reescriben para NO dar el valor, sino guiar al estudiante a encontrarlo. Principios:
- Para `fill-input`: indicar QUE campo llenar y DONDE encontrar el dato (enunciado o panel de reporte), sin dar el numero
- Para `click-suggestion`: mantener igual (solo dicen donde hacer clic)
- Para `info`: mantener igual (son reflexiones post-calculo)

Ejemplos de cambios:

**Escenario 1:**
| Paso | Antes | Despues |
|------|-------|---------|
| 1 | "Escribe 210,000 en Unidades Objetivo. Operaremos al 80% de capacidad." | "Calcula las Unidades Objetivo. Segun el enunciado, operamos al 80% de la capacidad de planta. Consulta la capacidad en el panel de reporte." |
| 3 | "Introduce la Tasa de Uso de MP: 3.90..." | "Introduce la Tasa de Uso de MP. Puedes encontrarla en el panel de reporte del trimestre anterior." |
| 5 | "Introduce la Tasa MO: 4.36..." | "Introduce la Tasa de Mano de Obra. Consultala en el panel de reporte." |
| 7 | "Precio por Unidad de MP: $2.25..." | "Introduce el Precio por Unidad de MP. Revisalo en la seccion de inventario del panel de reporte." |
| 9 | "Introduce Hrs/Trabajador: 500." | "Introduce las Horas por Trabajador. Consultalo en la seccion de productividad del panel de reporte." |
| 12 | "Total Trabajadores: escribe 1,852..." | "Introduce el Total de Trabajadores. Puedes pagar a toda la plantilla o solo a los necesarios. Tu decides." |
| 13 | "Salario por Hora: $2.30." | "Introduce el Salario por Hora. Consultalo en el panel de reporte." |
| 14 | "Horas/Trabajador: 500..." | "Introduce las Horas por Trabajador (mismo dato de productividad del reporte)." |
| 16 | "Costos Fijos: $400,000." | "Introduce los Costos Fijos. Encuentralos en el panel de reporte." |

Mismo patron para Escenarios 2 y 3, adaptando el contexto de cada situacion.

### 2. Boton "Paso Anterior" en `DemoOverlay.tsx`

- Agregar icono `SkipBack` de lucide-react
- Boton visible cuando `currentStep > 0`
- Posicionado a la izquierda de "Saltar"

### 3. Funcion `prevStep` en `DemoContext.tsx`

- Nueva funcion: `if (currentStep > 0) setCurrentStep(currentStep - 1)`
- Exponerla en el contexto

### Archivos a modificar
1. `src/components/SimulationMap/DemoMode/demoScenarios.ts` - reescribir todos los mensajes de guia
2. `src/components/SimulationMap/DemoMode/DemoContext.tsx` - agregar `prevStep`
3. `src/components/SimulationMap/DemoMode/DemoOverlay.tsx` - agregar boton "Anterior"

