

## GoProd: Asistente gerencial con insights estratégicos

### Cambios principales

**1. Branding y UI del overlay (`GuideOverlay.tsx`)**
- Renombrar "Asistente" → "GoProd"
- Agregar botón X para cerrar (llama `toggleGuide()`)

**2. Reescritura completa de `guideHints.ts`** — tono conversacional + insights gerenciales

El copy actual es técnico y obvio ("este valor se propaga desde...", "también necesitas completar X"). El nuevo copy será conversacional (GoProd habla como un asesor gerencial) y aportará valor real con insights del documento.

Ejemplos del cambio:

| Módulo / Variable | Actual | Nuevo |
|---|---|---|
| `material_needs.rate` | "Busca la Tasa de Uso de MP en el panel de reporte" | "¿Cuántas unidades de MP necesitas por producto? El estándar son 4, pero si has invertido en I+D podrías estar más bajo. Revisa tu reporte en la sección Producción. Ojo: fijar un ratio muy bajo sin respaldo en I+D genera escasez y obreros ociosos." |
| `material_needs.target` | "Este valor se propaga desde el nodo de Plan de Producción." | "Este dato viene de tu Plan de Producción — ya está conectado." |
| `labor_needs.rate` | "Busca la Tasa de Mano de Obra..." | "¿Cuántas horas necesita cada producto? El estándar son 4 hrs/ud. Encuéntralo en tu reporte, sección Producción. Recuerda: la inversión en I+D puede mejorar esta tasa con el tiempo." |
| `workforce.hrs_per_worker` | "Busca las Horas por Trabajador..." | "Cada obrero trabaja 500 hrs por trimestre. Pero ojo: los nuevos solo rinden 250 hrs por la curva de aprendizaje. Mantener tu equipo estable es más barato que rotar." |
| `hiring.current` | "Busca la Fuerza Laboral Actual..." | "¿Cuántos obreros tienes al cierre del periodo anterior? Lo encuentras en tu reporte, sección Mano de Obra. Tip: anticipar contrataciones 1-2 trimestres evita el ciclo costoso de contratación masiva." |
| `cost_labor.wage` | "Busca el Salario por Hora..." | "El salario por hora lo encuentras en tu reporte. Un salario competitivo reduce renuncias (4-5% normal vs. masivas si pagas muy bajo) y previene huelgas que pueden paralizar hasta 6 semanas de producción." |
| `total_cost.fix_cost` | "Busca los Costos Fijos..." | "Los costos fijos dependen del tamaño de tu planta: <$3M → $250K, $3-6M → $400K, >$6M → $600K. Producir al 80% de capacidad encarece cada unidad un 25% en fijos vs. producir al 100%." |
| `total_cost.disc_cost` | "Busca los Gastos Discrecionales..." | "Los gastos discrecionales (bonos, beneficios) no son un gasto — son una inversión en moral. Mejoran productividad, reducen rotación y bajan el riesgo de huelgas. Su efecto no aparece como ingreso, pero sí como menor costo unitario." |

**3. Mensajes de completado con insights (`SUGGESTION_HINTS`)**

En vez de solo decir qué dato necesitará, GoProd dará contexto estratégico:

| Sugerencia | Actual | Nuevo |
|---|---|---|
| `workforce` | "Necesitarás las Horas por Trabajador (~500 hrs/trimestre)." | "Dimensiona tu equipo. Recuerda: un nuevo obrero cuesta el doble en su primer trimestre por la curva de aprendizaje." |
| `cost_material` | "Necesitarás el Precio Promedio Ponderado de MP." | "Conocer tu costo de MP es clave para fijar precios. Las compras de urgencia (+20%) contaminan tu estructura de costos futura." |
| `hiring` | "Necesitarás la Fuerza Laboral Actual." | "Planifica contrataciones con anticipación. La regla 2x existe porque los nuevos solo rinden 250 hrs de las 500." |

**4. Eliminar la redundancia de "También necesitas completar X, Y"** (`GuideContext.tsx`)

Cuando hay múltiples campos vacíos, en vez de listar los nombres (que el estudiante ya ve), GoProd dará el insight del primer campo vacío y un mensaje genérico tipo "Completa los campos marcados en azul para obtener tu resultado."

**5. `GENERIC_COMPLETION` más conversacional**

Actual: "¡Cálculo completo! ¿Qué quieres calcular ahora?"
Nuevo: "¡Listo! Ahora puedes profundizar tu análisis. ¿Hacia dónde quieres ir?"

### Archivos a modificar

1. **`src/components/SimulationMap/Guide/GuideOverlay.tsx`** — Renombrar a "GoProd", agregar botón X
2. **`src/components/SimulationMap/Guide/guideHints.ts`** — Reescritura completa: tono conversacional, insights gerenciales del documento, eliminar "se propaga"
3. **`src/components/SimulationMap/Guide/GuideContext.tsx`** — Cambiar el mensaje de "También necesitas completar: X, Y" por "Completa los campos marcados en azul para obtener tu resultado."

