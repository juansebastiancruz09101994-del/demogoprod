// GoProd — Hints gerenciales conversacionales por módulo y variable
export const MODULE_HINTS: Record<string, Record<string, string>> = {
  production_target: {
    target: '¿Cuántas unidades planeas producir este trimestre? Revisa tu pronóstico de ventas y la capacidad de tu planta. Producir de más genera inventario costoso; producir de menos te deja sin stock y pierdes ventas.',
  },
  material_needs: {
    rate: '¿Cuántas unidades de MP necesitas por producto? El estándar son 4, pero si has invertido en I+D podrías estar más bajo. Revísalo en tu reporte, sección Producción. Ojo: fijar un ratio muy bajo sin respaldo en I+D genera escasez y obreros ociosos.',
    target: 'Este dato viene de tu Plan de Producción — ya está conectado.',
    total_mp: 'Se calcula automáticamente: Objetivo × Tasa de uso.',
  },
  labor_needs: {
    rate: '¿Cuántas horas necesita cada producto? El estándar son 4 hrs/ud. Encuéntralo en tu reporte, sección Producción. Recuerda: la inversión en I+D puede mejorar esta tasa con el tiempo.',
    target: 'Este dato viene de tu Plan de Producción — ya está conectado.',
    total_hours: 'Se calcula automáticamente: Objetivo × Tasa.',
  },
  workforce: {
    hrs_per_worker: 'Cada obrero trabaja 500 hrs por trimestre. Pero ojo: los nuevos solo rinden 250 hrs por la curva de aprendizaje. Mantener tu equipo estable es más barato que rotar.',
    needed_hours: 'Este dato viene de Req. Mano de Obra — ya está conectado.',
    workers_req: 'Se calcula automáticamente.',
  },
  hiring: {
    current: '¿Cuántos obreros tienes al cierre del periodo anterior? Lo encuentras en tu reporte, sección Mano de Obra. Tip: anticipar contrataciones 1-2 trimestres evita el ciclo costoso de contratación masiva.',
    required: 'Este dato viene de Fuerza Laboral — ya está conectado.',
    hires: 'Se calcula con la Regla 2x: los nuevos rinden la mitad, así que necesitas contratar el doble de la brecha.',
  },
  packaging: {
    ratio: '¿Cuántas unidades de empaque necesitas por producto terminado? Revísalo en los datos de tu simulación.',
    target_finished: 'Este dato viene de tu Plan de Producción — ya está conectado.',
    pack_units: 'Se calcula automáticamente.',
  },
  cost_material: {
    price: 'El precio promedio ponderado de MP lo encuentras en tu reporte, sección Inventario MP. Ojo: las compras de urgencia (+20% sobre precio base) contaminan tu estructura de costos futura.',
    units: 'Este dato viene de Req. Materia Prima — ya está conectado.',
    cost: 'Se calcula automáticamente: Unidades × Precio.',
  },
  cost_labor: {
    wage: 'El salario por hora lo encuentras en tu reporte. Un salario competitivo reduce renuncias (4-5% normal vs. masivas si pagas muy bajo) y previene huelgas que pueden paralizar hasta 6 semanas de producción.',
    hours: 'Horas base pagadas por trabajador (usualmente 500 hrs/trimestre).',
    workers: 'Este dato viene de Fuerza Laboral — ya está conectado.',
    cost: 'Se calcula automáticamente.',
  },
  cost_packaging: {
    price: 'El precio unitario de empaque lo encuentras en los datos de tu simulación.',
    units: 'Este dato viene del módulo de Empaque — ya está conectado.',
    cost: 'Se calcula automáticamente.',
  },
  total_cost: {
    mat_cost: 'Este dato viene de Costo Material — ya está conectado.',
    lab_cost: 'Este dato viene de Costo Mano de Obra — ya está conectado.',
    fix_cost: 'Los costos fijos dependen del tamaño de tu planta: <$3M → $250K, $3-6M → $400K, >$6M → $600K. Producir al 80% de capacidad encarece cada unidad un 25% en fijos vs. producir al 100%.',
    disc_cost: 'Los gastos discrecionales (bonos, beneficios) no son un gasto — son una inversión en moral. Mejoran productividad, reducen rotación y bajan el riesgo de huelgas. Su efecto no aparece como ingreso, pero sí como menor costo unitario.',
    total: 'Se calcula automáticamente como la suma de todos los costos.',
  },
  unit_cost: {
    total_cost_val: 'Este dato viene de Costo Total — ya está conectado.',
    units_produced: 'Unidades producidas en este periodo.',
    unit_cost_val: 'Se calcula automáticamente: Costo Total ÷ Unidades. Este es el número clave para fijar tu precio de venta y compararte contra la competencia.',
  },
  inventory_val: {
    init_qty: '¿Cuánta MP tenías al inicio del periodo? Revísalo en tu reporte, sección Inventario MP. Un exceso de inventario inmoviliza capital; muy poco te expone a compras de urgencia.',
    used_qty: 'Este dato viene de Req. Materia Prima — ya está conectado.',
    old_price: 'Precio del inventario existente (periodo anterior). Encuéntralo en tu reporte.',
    new_qty: 'Cantidad comprada este periodo.',
    new_price: 'Precio de compra de este periodo. Recuerda: las compras de urgencia cuestan un 20% más.',
    total_val: 'Se calcula con promedio ponderado.',
  },
};

// Hints estratégicos para cada sugerencia de siguiente cálculo
export const SUGGESTION_HINTS: Record<string, string> = {
  production_target: 'Define cuántas unidades producir. Alinea este número con tu pronóstico de ventas y capacidad de planta para evitar sobreproducción o quiebres de stock.',
  material_needs: 'Calcula cuánta materia prima necesitas. La tasa de uso depende de tu inversión en I+D — revisa tu reporte.',
  labor_needs: 'Estima las horas de producción. Una tasa alta de hrs/ud puede señalar que necesitas más inversión en eficiencia.',
  workforce: 'Dimensiona tu equipo. Recuerda: un nuevo obrero cuesta el doble en su primer trimestre por la curva de aprendizaje.',
  hiring: 'Planifica contrataciones con anticipación. La regla 2x existe porque los nuevos solo rinden 250 hrs de las 500.',
  packaging: 'Asegúrate de tener suficiente empaque. Sin empaque, tu producto terminado no puede venderse.',
  cost_material: 'Conocer tu costo de MP es clave para fijar precios. Las compras de urgencia (+20%) contaminan tu estructura de costos futura.',
  cost_labor: 'El costo laboral no es solo salarios: incluye el impacto de la rotación y la curva de aprendizaje de nuevos empleados.',
  cost_packaging: 'El empaque es un costo variable directo. Inclúyelo para tener tu costo total real.',
  total_cost: 'Suma todos tus costos para ver el panorama completo. Los costos fijos pesan más cuando produces por debajo de capacidad.',
  unit_cost: 'El costo unitario es tu brújula de pricing. Compáralo con el precio de mercado para evaluar tu margen.',
  inventory_val: 'Valora tu inventario con promedio ponderado. Un inventario alto inmoviliza capital; uno bajo te expone a urgencias.',
};

export const GENERIC_COMPLETION = '¡Listo! Ahora puedes profundizar tu análisis. ¿Hacia dónde quieres ir?';
