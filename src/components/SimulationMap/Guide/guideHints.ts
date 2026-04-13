// Maps moduleType → variableId → hint message for the guide assistant
export const MODULE_HINTS: Record<string, Record<string, string>> = {
  production_target: {
    target: 'Define las unidades que planeas producir este periodo. Consulta tu pronóstico de ventas y capacidad de planta en el panel de reporte.',
  },
  material_needs: {
    rate: 'Busca la "Tasa de Uso de MP" en el panel de reporte, sección Producción.',
    target: 'Este valor se propaga desde el nodo de Plan de Producción.',
    total_mp: 'Se calcula automáticamente a partir de Objetivo × Tasa.',
  },
  labor_needs: {
    rate: 'Busca la "Tasa de Mano de Obra" (hrs/ud) en el panel de reporte, sección Producción.',
    target: 'Este valor se propaga desde el nodo de Plan de Producción.',
    total_hours: 'Se calcula automáticamente a partir de Objetivo × Tasa.',
  },
  workforce: {
    hrs_per_worker: 'Busca las "Horas por Trabajador" en el panel de reporte, sección Mano de Obra (usualmente ~500 hrs/trimestre).',
    needed_hours: 'Este valor se propaga desde Req. Mano de Obra.',
    workers_req: 'Se calcula automáticamente.',
  },
  hiring: {
    current: 'Busca la "Fuerza Laboral Actual" en el panel de reporte, sección Mano de Obra (Trabajadores al cierre del periodo anterior).',
    required: 'Este valor se propaga desde Tamaño Fuerza Laboral.',
    hires: 'Se calcula con la Regla 2x: (Requeridos − Actuales) × 2.',
  },
  packaging: {
    ratio: 'Busca el "Ratio de Empaque" en el panel de reporte o en los datos de tu simulación.',
    target_finished: 'Este valor se propaga desde el Plan de Producción.',
    pack_units: 'Se calcula automáticamente.',
  },
  cost_material: {
    price: 'Busca el precio promedio ponderado de MP en el panel de reporte, sección Inventario MP.',
    units: 'Este valor se propaga desde Req. Materia Prima (Total MP).',
    cost: 'Se calcula automáticamente: Unidades × Precio.',
  },
  cost_labor: {
    wage: 'Busca el "Salario por Hora" en el panel de reporte, sección Mano de Obra.',
    hours: 'Horas base pagadas por trabajador (usualmente ~500 hrs).',
    workers: 'Este valor se propaga desde Fuerza Laboral.',
    cost: 'Se calcula automáticamente.',
  },
  cost_packaging: {
    price: 'Busca el precio unitario de empaque en los datos de tu simulación.',
    units: 'Este valor se propaga desde el módulo de Empaque.',
    cost: 'Se calcula automáticamente.',
  },
  total_cost: {
    mat_cost: 'Este valor se propaga desde Costo Material.',
    lab_cost: 'Este valor se propaga desde Costo Mano de Obra.',
    fix_cost: 'Busca los "Costos Fijos" en el panel de reporte, sección Costos.',
    disc_cost: 'Busca los "Gastos Discrecionales" en el panel de reporte (publicidad, I+D, etc.).',
    total: 'Se calcula automáticamente como la suma de todos los costos.',
  },
  unit_cost: {
    total_cost_val: 'Este valor se propaga desde Costo Total de Producción.',
    units_produced: 'Unidades producidas en este periodo.',
    unit_cost_val: 'Se calcula automáticamente: Costo Total ÷ Unidades.',
  },
  inventory_val: {
    init_qty: 'Busca el "Inventario Inicial de MP" en el panel de reporte.',
    used_qty: 'Este valor se propaga desde Req. Materia Prima.',
    old_price: 'Precio del inventario existente (periodo anterior).',
    new_qty: 'Cantidad comprada este periodo.',
    new_price: 'Precio de compra de este periodo.',
    total_val: 'Se calcula con promedio ponderado.',
  },
};

// Hints for each suggestion module — what data the student will need
export const SUGGESTION_HINTS: Record<string, string> = {
  material_needs: 'Necesitarás la Tasa de Uso de MP (panel de reporte, sección Producción).',
  labor_needs: 'Necesitarás la Tasa de Mano de Obra en hrs/ud (panel de reporte, sección Producción).',
  workforce: 'Necesitarás las Horas por Trabajador (~500 hrs/trimestre, sección Mano de Obra).',
  hiring: 'Necesitarás la Fuerza Laboral Actual (trabajadores al cierre del periodo anterior).',
  packaging: 'Necesitarás el Ratio de Empaque (uds empaque por ud terminada).',
  cost_material: 'Necesitarás el Precio Promedio Ponderado de MP (sección Inventario MP).',
  cost_labor: 'Necesitarás el Salario por Hora (sección Mano de Obra).',
  cost_packaging: 'Necesitarás el Precio Unitario de Empaque.',
  total_cost: 'Necesitarás Costos Fijos y Gastos Discrecionales (sección Costos).',
  unit_cost: 'Necesitarás el Costo Total y las Unidades Producidas.',
  inventory_val: 'Necesitarás Inventario Inicial, Precio Anterior y Datos de Compra.',
};

export const GENERIC_COMPLETION = '¡Cálculo completo! ¿Qué quieres calcular ahora?';
