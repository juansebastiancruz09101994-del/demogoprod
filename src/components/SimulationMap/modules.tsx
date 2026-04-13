import { 
  Package, DollarSign, Users, Activity, Layers, 
  PlayCircle, TrendingUp 
} from 'lucide-react';
import { ModuleDefinition } from './types';

export const MODULES: Record<string, ModuleDefinition> = {
  production_target: {
    id: 'production_target',
    category: 'Start',
    title: 'Plan de Producción',
    color: 'bg-emerald-500',
    icon: <PlayCircle className="w-5 h-5" />,
    description: 'Establece tus objetivos de producción.',
    baseFormula: 'Ingresa tus unidades objetivo manualmente.',
    variables: [
      { 
        id: 'target', 
        label: 'Unidades Objetivo', 
        unit: 'uds',
        insight: 'Define este volumen según tu capacidad de planta actual y pronóstico de ventas. Si produces más de lo que vendes, incurrirás en costos de almacenamiento. Si produces menos, perderás ventas potenciales (demanda insatisfecha).'
      },
    ],
    solve: () => 0,
    suggestions: [
      { id: 'material_needs', label: 'Calcular Materia Prima', map: { target: 'target' } },
      { id: 'labor_needs', label: 'Calcular Horas Mano de Obra', map: { target: 'target' } },
      { id: 'packaging', label: 'Calcular Empaque', map: { target_finished: 'target' } },
      { id: 'cost_material', label: 'Calcular Costo Material', map: {} },
      { id: 'total_cost', label: 'Calcular Costo Total', map: {} },
    ]
  },
  material_needs: {
    id: 'material_needs',
    category: 'Production',
    title: 'Req. Materia Prima',
    color: 'bg-blue-500',
    icon: <Package className="w-5 h-5" />,
    description: 'Materiales necesarios para el objetivo.',
    baseFormula: 'Total MP = Objetivo × Tasa Uso',
    formulas: {
      total_mp: 'Total MP = Objetivo × Tasa',
      target: 'Objetivo = Total MP / Tasa',
      rate: 'Tasa = Total MP / Objetivo'
    },
    formulaVisual: {
      total_mp: [
        { type: 'var', id: 'target' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'rate' },
      ],
      target: [
        { type: 'var', id: 'total_mp' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'rate' },
      ],
      rate: [
        { type: 'var', id: 'total_mp' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'target' },
      ],
    },
    variables: [
      { 
        id: 'total_mp', 
        label: 'Total MP Necesaria', 
        unit: 'uds',
        insight: 'Material requerido para producción. ¡CUIDADO! Si este valor supera tu inventario inicial de MP, el sistema generará automáticamente una "Compra de Urgencia" con un sobrecosto significativo.'
      },
      { 
        id: 'target', 
        label: 'Producción Objetivo', 
        unit: 'uds',
        insight: 'Unidades físicas que planeas manufacturar.'
      },
      { 
        id: 'rate', 
        label: 'Tasa de Uso', 
        unit: 'MP/ud',
        insight: 'Unidades de material por producto (ej: 3.87). Invertir en "Tecnología Industrial" puede reducir esta tasa en periodos futuros, ahorrando costos.'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'total_mp') return v.target * v.rate;
      if (tid === 'target') return v.rate ? v.total_mp / v.rate : null;
      if (tid === 'rate') return v.target ? v.total_mp / v.target : null;
      return 0;
    },
    suggestions: [
      { id: 'inventory_val', label: 'Ver Valor Inventario', map: { used_qty: 'total_mp' } },
      { id: 'cost_material', label: 'Calcular Costo Material', map: { units: 'total_mp' } },
      { id: 'production_target', label: 'Definir Producción Objetivo', map: { target: 'target' } },
    ]
  },
  labor_needs: {
    id: 'labor_needs',
    category: 'Production',
    title: 'Req. Mano de Obra',
    color: 'bg-indigo-500',
    icon: <Activity className="w-5 h-5" />,
    description: 'Total horas-hombre necesarias.',
    baseFormula: 'Horas = Objetivo × Hrs/Ud',
    formulas: {
      total_hours: 'Total Horas = Objetivo × Tasa',
      target: 'Objetivo = Total Horas / Tasa',
      rate: 'Tasa = Total Horas / Objetivo'
    },
    formulaVisual: {
      total_hours: [
        { type: 'var', id: 'target' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'rate' },
      ],
      target: [
        { type: 'var', id: 'total_hours' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'rate' },
      ],
      rate: [
        { type: 'var', id: 'total_hours' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'target' },
      ],
    },
    variables: [
      { 
        id: 'total_hours', 
        label: 'Total Horas Necesarias', 
        unit: 'hrs',
        insight: 'Capacidad requerida. Si tus obreros actuales no cubren estas horas, deberás contratar o pagar horas extra (que son más costosas y tienen límite).'
      },
      { 
        id: 'target', 
        label: 'Producción Objetivo', 
        unit: 'uds',
        insight: 'Meta de producción para este periodo.'
      },
      { 
        id: 'rate', 
        label: 'Tasa Mano de Obra', 
        unit: 'hrs/ud',
        insight: 'Horas requeridas para ensamblar una unidad (ej: 3.95). La eficiencia puede mejorar con entrenamiento o inversión en tecnología.'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'total_hours') return v.target * v.rate;
      if (tid === 'target') return v.rate ? v.total_hours / v.rate : null;
      if (tid === 'rate') return v.target ? v.total_hours / v.target : null;
      return 0;
    },
    suggestions: [
      { id: 'workforce', label: 'Calcular Fuerza Laboral', map: { needed_hours: 'total_hours' } },
      { id: 'cost_labor', label: 'Calcular Costo Mano de Obra', map: {} },
      { id: 'production_target', label: 'Definir Producción Objetivo', map: { target: 'target' } },
    ]
  },
  workforce: {
    id: 'workforce',
    category: 'HR',
    title: 'Tamaño Fuerza Laboral',
    color: 'bg-purple-500',
    icon: <Users className="w-5 h-5" />,
    description: 'Trabajadores necesarios.',
    baseFormula: 'Trabajadores = Horas / HrsPorTrab',
    formulas: {
      workers_req: 'Trabajadores = Horas / HrsPorTrab',
      needed_hours: 'Horas = Trabajadores × HrsPorTrab',
      hrs_per_worker: 'HrsPorTrab = Horas / Trabajadores'
    },
    formulaVisual: {
      workers_req: [
        { type: 'var', id: 'needed_hours' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'hrs_per_worker' },
      ],
      needed_hours: [
        { type: 'var', id: 'workers_req' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'hrs_per_worker' },
      ],
      hrs_per_worker: [
        { type: 'var', id: 'needed_hours' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'workers_req' },
      ],
    },
    variables: [
      { 
        id: 'workers_req', 
        label: 'Trabajadores Requeridos', 
        unit: 'pers',
        insight: 'Cantidad de obreros a tiempo completo necesarios. Si reduces este número drásticamente respecto al periodo anterior, incurrirás en costos de despido.'
      },
      { 
        id: 'needed_hours', 
        label: 'Total Horas Necesarias', 
        unit: 'hrs',
        insight: 'Carga de trabajo total calculada.'
      },
      { 
        id: 'hrs_per_worker', 
        label: 'Hrs/Trabajador', 
        unit: 'hrs',
        insight: 'Capacidad estándar por persona (usualmente 500 horas/trimestre). Considera el ausentismo si la simulación lo incluye.'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'workers_req') return v.hrs_per_worker ? v.needed_hours / v.hrs_per_worker : null;
      if (tid === 'needed_hours') return v.workers_req * v.hrs_per_worker;
      if (tid === 'hrs_per_worker') return v.workers_req ? v.needed_hours / v.workers_req : null;
      return 0;
    },
    suggestions: [
      { id: 'hiring', label: 'Decisión de Contratación', map: { required: 'workers_req' } },
      { id: 'cost_labor', label: 'Calcular Costo Mano de Obra', map: { workers: 'workers_req' } },
    ]
  },
  hiring: {
    id: 'hiring',
    category: 'HR',
    title: 'Contratación (Regla 2x)',
    color: 'bg-pink-500',
    icon: <Users className="w-5 h-5" />,
    description: 'Nuevos a 50% eficiencia.',
    baseFormula: 'Nuevos = (Req - Actual) × 2',
    formulas: {
      hires: 'Nuevos = (Req - Actual) × 2',
      required: 'Req = (Nuevos / 2) + Actual',
      current: 'Actual = Req - (Nuevos / 2)'
    },
    formulaVisual: {
      hires: [
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'required' },
          { type: 'op', symbol: '−' },
          { type: 'var', id: 'current' },
        ]},
        { type: 'op', symbol: '× 2' },
      ],
      required: [
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'hires' },
          { type: 'op', symbol: '÷ 2' },
        ]},
        { type: 'op', symbol: '+' },
        { type: 'var', id: 'current' },
      ],
      current: [
        { type: 'var', id: 'required' },
        { type: 'op', symbol: '−' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'hires' },
          { type: 'op', symbol: '÷ 2' },
        ]},
      ],
    },
    variables: [
      { 
        id: 'hires', 
        label: 'Nuevas Contrataciones', 
        unit: 'pers',
        insight: 'REGLA CRÍTICA: Los trabajadores nuevos tienen una eficiencia del 50% en su primer periodo. Debes contratar el DOBLE del déficit para cubrir las horas.'
      },
      { 
        id: 'required', 
        label: 'Trabajadores Requeridos', 
        unit: 'pers',
        insight: 'Total de cabezas necesarias para operar la planta.'
      },
      { 
        id: 'current', 
        label: 'Fuerza Laboral Actual', 
        unit: 'pers',
        insight: 'Trabajadores disponibles al inicio del periodo (antes de contrataciones/despidos).'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'hires') return Math.max(0, (v.required - v.current) * 2);
      if (tid === 'required') return (v.hires / 2) + v.current;
      if (tid === 'current') return v.required - (v.hires / 2);
      return 0;
    },
    suggestions: []
  },
  packaging: {
    id: 'packaging',
    category: 'Production',
    title: 'Empaque',
    color: 'bg-orange-500',
    icon: <Layers className="w-5 h-5" />,
    description: 'Unidades de empaque necesarias.',
    baseFormula: 'Uds Empaque = Objetivo × Ratio',
    formulas: {
      pack_units: 'Uds Empaque = Objetivo × Ratio',
      target_finished: 'Objetivo = Uds Empaque / Ratio',
      ratio: 'Ratio = Uds Empaque / Objetivo'
    },
    formulaVisual: {
      pack_units: [
        { type: 'var', id: 'target_finished' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'ratio' },
      ],
      target_finished: [
        { type: 'var', id: 'pack_units' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'ratio' },
      ],
      ratio: [
        { type: 'var', id: 'pack_units' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'target_finished' },
      ],
    },
    variables: [
      { 
        id: 'pack_units', 
        label: 'Unidades de Empaque', 
        unit: 'uds',
        insight: 'El empaque es obligatorio para vender. Si no tienes suficientes empaques, el producto se queda como "Semielaborado" y no genera ingresos.'
      },
      { 
        id: 'target_finished', 
        label: 'Productos Terminados', 
        unit: 'uds',
        insight: 'Producción objetivo de unidades terminadas.'
      },
      { 
        id: 'ratio', 
        label: 'Ratio Equiv.', 
        unit: 'ratio',
        insight: 'Factor de conversión. Indica cuántos empaques se necesitan por unidad (o viceversa, dependiendo de la configuración de la simulación).'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'pack_units') return v.target_finished * v.ratio;
      return 0;
    },
    suggestions: [
      { id: 'cost_packaging', label: 'Costo de Empaque', map: { units: 'pack_units' } },
    ]
  },
  cost_material: {
    id: 'cost_material',
    category: 'Finance',
    title: 'Costo Material',
    color: 'bg-teal-600',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Costo total de materias primas.',
    baseFormula: 'Costo = Unidades × Precio',
    formulas: {
      cost: 'Costo = Unidades × Precio',
      units: 'Unidades = Costo / Precio',
      price: 'Precio = Costo / Unidades'
    },
    formulaVisual: {
      cost: [
        { type: 'var', id: 'units' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'price' },
      ],
      units: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'price' },
      ],
      price: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'units' },
      ],
    },
    variables: [
      { 
        id: 'cost', 
        label: 'Costo Total Mat.', 
        unit: '$',
        insight: 'Valor monetario de la materia prima consumida. Este costo va al "Costo de Ventas" en el Estado de Resultados.'
      },
      { 
        id: 'units', 
        label: 'Total Unidades MP', 
        unit: 'uds',
        insight: 'Consumo físico de materiales.'
      },
      { 
        id: 'price', 
        label: 'Precio Por Unidad', 
        unit: '$',
        insight: 'Precio promedio ponderado de tu inventario. Si compraste de urgencia, este precio será más alto.'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'cost') return v.units * v.price;
      if (tid === 'units') return v.price ? v.cost / v.price : null;
      if (tid === 'price') return v.units ? v.cost / v.units : null;
      return 0;
    },
    suggestions: [
      { id: 'total_cost', label: 'Añadir al Costo Total', map: { mat_cost: 'cost' } },
      { id: 'material_needs', label: 'Calcular Req. MP', map: { total_mp: 'units' } },
    ]
  },
  cost_labor: {
    id: 'cost_labor',
    category: 'Finance',
    title: 'Costo Mano de Obra',
    color: 'bg-teal-600',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Costo total de fuerza laboral.',
    baseFormula: 'Costo = Trab × Salario × Hrs',
    formulas: {
      cost: 'Costo = Trab × Salario × Hrs',
      workers: 'Trab = Costo / (Salario × Hrs)',
      wage: 'Salario = Costo / (Trab × Hrs)',
      hours: 'Hrs = Costo / (Trab × Salario)'
    },
    formulaVisual: {
      cost: [
        { type: 'var', id: 'workers' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'wage' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'hours' },
      ],
      workers: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'wage' },
          { type: 'op', symbol: '×' },
          { type: 'var', id: 'hours' },
        ]},
      ],
      wage: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'workers' },
          { type: 'op', symbol: '×' },
          { type: 'var', id: 'hours' },
        ]},
      ],
      hours: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'workers' },
          { type: 'op', symbol: '×' },
          { type: 'var', id: 'wage' },
        ]},
      ],
    },
    variables: [
      { 
        id: 'cost', 
        label: 'Costo Total MO', 
        unit: '$',
        insight: 'Gasto en nómina operativa. No olvides sumar costos de contratación o despido si aplican este periodo.'
      },
      { 
        id: 'workers', 
        label: 'Total Trabajadores', 
        unit: 'pers',
        insight: 'Plantilla total pagada.'
      },
      { 
        id: 'wage', 
        label: 'Salario por Hora', 
        unit: '$/hr',
        insight: 'Nivel salarial. Si pagas por debajo del promedio de la industria, tus trabajadores podrían irse a la competencia o hacer huelga.'
      },
      { 
        id: 'hours', 
        label: 'Horas/Trabajador', 
        unit: 'hrs',
        insight: 'Horas base pagadas.'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'cost') return v.workers * v.wage * v.hours;
      if (tid === 'workers') return (v.wage * v.hours) ? v.cost / (v.wage * v.hours) : null;
      if (tid === 'wage') return (v.workers * v.hours) ? v.cost / (v.workers * v.hours) : null;
      if (tid === 'hours') return (v.workers * v.wage) ? v.cost / (v.workers * v.wage) : null;
      return 0;
    },
    suggestions: [
      { id: 'total_cost', label: 'Añadir al Costo Total', map: { lab_cost: 'cost' } },
      { id: 'labor_needs', label: 'Calcular Req. MO', map: {} },
      { id: 'workforce', label: 'Calcular Fuerza Laboral', map: { workers_req: 'workers' } },
    ]
  },
  cost_packaging: {
    id: 'cost_packaging',
    category: 'Finance',
    title: 'Costo de Empaque',
    color: 'bg-teal-600',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Costo total de empaque.',
    baseFormula: 'Costo = Unidades × Precio',
    formulas: {
      cost: 'Costo = Unidades × Precio',
      units: 'Unidades = Costo / Precio',
      price: 'Precio = Costo / Unidades'
    },
    formulaVisual: {
      cost: [
        { type: 'var', id: 'units' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'price' },
      ],
      units: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'price' },
      ],
      price: [
        { type: 'var', id: 'cost' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'units' },
      ],
    },
    variables: [
      { 
        id: 'cost', 
        label: 'Costo Empaque', 
        unit: '$',
        insight: 'Costo variable asociado al volumen de producción.'
      },
      { 
        id: 'units', 
        label: 'Unidades Empaque', 
        unit: 'uds',
        insight: 'Total de empaques consumidos.'
      },
      { 
        id: 'price', 
        label: 'Precio Por Unidad', 
        unit: '$',
        insight: 'Costo de adquisición del empaque. Revisa si hay descuentos por volumen.'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'cost') return v.units * v.price;
      if (tid === 'units') return v.price ? v.cost / v.price : null;
      if (tid === 'price') return v.units ? v.cost / v.units : null;
      return 0;
    },
    suggestions: [
      { id: 'total_cost', label: 'Añadir al Costo Total', map: { disc_cost: 'cost' } },
    ]
  },
  total_cost: {
    id: 'total_cost',
    category: 'Finance',
    title: 'Costo Total Prod.',
    color: 'bg-slate-700',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Suma de todos los componentes.',
    baseFormula: 'Total = Mat + Lab + Fijos + Otros',
    formulas: {
      total: 'Total = Mat + Lab + Fijos + Otros',
      mat_cost: 'Mat = Total - (Lab + Fijos + Otros)',
      lab_cost: 'Lab = Total - (Mat + Fijos + Otros)',
      fix_cost: 'Fijos = Total - (Mat + Lab + Otros)',
      disc_cost: 'Otros = Total - (Mat + Lab + Fijos)'
    },
    formulaVisual: {
      total: [
        { type: 'var', id: 'mat_cost' },
        { type: 'op', symbol: '+' },
        { type: 'var', id: 'lab_cost' },
        { type: 'op', symbol: '+' },
        { type: 'var', id: 'fix_cost' },
        { type: 'op', symbol: '+' },
        { type: 'var', id: 'disc_cost' },
      ],
      mat_cost: [
        { type: 'var', id: 'total' },
        { type: 'op', symbol: '−' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'lab_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'fix_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'disc_cost' },
        ]},
      ],
      lab_cost: [
        { type: 'var', id: 'total' },
        { type: 'op', symbol: '−' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'mat_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'fix_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'disc_cost' },
        ]},
      ],
      fix_cost: [
        { type: 'var', id: 'total' },
        { type: 'op', symbol: '−' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'mat_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'lab_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'disc_cost' },
        ]},
      ],
      disc_cost: [
        { type: 'var', id: 'total' },
        { type: 'op', symbol: '−' },
        { type: 'group', label: '', steps: [
          { type: 'var', id: 'mat_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'lab_cost' },
          { type: 'op', symbol: '+' },
          { type: 'var', id: 'fix_cost' },
        ]},
      ],
    },
    variables: [
      { 
        id: 'total', 
        label: 'Costo Total', 
        unit: '$',
        insight: 'Costo total de manufactura. Úsalo para calcular tu costo unitario y fijar precios.'
      },
      { 
        id: 'mat_cost', 
        label: 'Costo Material', 
        unit: '$',
        insight: 'Suma de costos de materia prima.'
      },
      { 
        id: 'lab_cost', 
        label: 'Costo Mano Obra', 
        unit: '$',
        insight: 'Suma de salarios y beneficios.'
      },
      { 
        id: 'fix_cost', 
        label: 'Costos Fijos', 
        unit: '$',
        insight: 'Gastos de planta y depreciación. Son inevitables a corto plazo, independientemente del volumen de producción.'
      },
      { 
        id: 'disc_cost', 
        label: 'Otros/Empaque', 
        unit: '$',
        insight: 'Costos variables adicionales como empaque o regalías.'
      },
    ],
    solve: (v, tid) => {
      const mat = v.mat_cost || 0;
      const lab = v.lab_cost || 0;
      const fix = v.fix_cost || 0;
      const disc = v.disc_cost || 0;
      
      if (tid === 'total') return mat + lab + fix + disc;
      if (v.total === undefined || v.total === 0) return null;
      
      if (tid === 'mat_cost') return v.total - (lab + fix + disc);
      if (tid === 'lab_cost') return v.total - (mat + fix + disc);
      if (tid === 'fix_cost') return v.total - (mat + lab + disc);
      if (tid === 'disc_cost') return v.total - (mat + lab + fix);
      return 0;
    },
    suggestions: [
      { id: 'unit_cost', label: 'Calcular Costo Unitario', map: { total_cost: 'total' } },
      { id: 'cost_material', label: 'Desglosar Costo Material', map: { cost: 'mat_cost' } },
      { id: 'cost_labor', label: 'Desglosar Costo MO', map: { cost: 'lab_cost' } },
      { id: 'cost_packaging', label: 'Desglosar Costo Empaque', map: { cost: 'disc_cost' } },
    ]
  },
  unit_cost: {
    id: 'unit_cost',
    category: 'Finance',
    title: 'Costo Unitario',
    color: 'bg-red-600',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Costo final por unidad producida.',
    baseFormula: 'Costo Unit = Total / Unidades',
    formulas: {
      u_cost: 'Costo Unit = Total / Unidades',
      total_cost: 'Total = Costo Unit × Unidades',
      units: 'Unidades = Total / Costo Unit'
    },
    formulaVisual: {
      u_cost: [
        { type: 'var', id: 'total_cost' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'units' },
      ],
      total_cost: [
        { type: 'var', id: 'u_cost' },
        { type: 'op', symbol: '×' },
        { type: 'var', id: 'units' },
      ],
      units: [
        { type: 'var', id: 'total_cost' },
        { type: 'op', symbol: '÷' },
        { type: 'var', id: 'u_cost' },
      ],
    },
    variables: [
      { 
        id: 'u_cost', 
        label: 'Costo Unitario', 
        unit: '$/ud',
        insight: 'Métrica clave de eficiencia. Si tu costo unitario sube, revisa si es por ineficiencia laboral (muchos novatos) o alza en materiales.'
      },
      { 
        id: 'total_cost', 
        label: 'Costo Total', 
        unit: '$',
        insight: 'Costo de producción total del periodo.'
      },
      { 
        id: 'units', 
        label: 'Unidades Producidas', 
        unit: 'uds',
        insight: 'Volumen real fabricado (puede ser menor al objetivo si faltó material o mano de obra).'
      },
    ],
    solve: (v, tid) => {
      if (tid === 'u_cost') return v.units ? v.total_cost / v.units : null;
      if (tid === 'total_cost') return v.u_cost * v.units;
      if (tid === 'units') return v.u_cost ? v.total_cost / v.u_cost : null;
      return 0;
    },
    suggestions: [
      { id: 'total_cost', label: 'Desglosar Costo Total', map: { total: 'total_cost' } },
    ]
  },
  inventory_val: {
    id: 'inventory_val',
    category: 'Inventory',
    title: 'Valor de Inventario',
    color: 'bg-cyan-600',
    icon: <Package className="w-5 h-5" />,
    description: 'Valoración PEPS / Promedio.',
    baseFormula: 'Valor = (Rem * P_Viejo) + (Nuevo * P_Nuevo)',
    formulaVisual: {
      total_val: [
        { type: 'group', label: 'Remanente', steps: [
          { type: 'group', label: '', steps: [
            { type: 'var', id: 'init_qty' },
            { type: 'op', symbol: '−' },
            { type: 'var', id: 'used_qty' },
          ]},
          { type: 'op', symbol: '×' },
          { type: 'var', id: 'old_price' },
        ]},
        { type: 'op', symbol: '+' },
        { type: 'group', label: 'Compras', steps: [
          { type: 'var', id: 'new_qty' },
          { type: 'op', symbol: '×' },
          { type: 'var', id: 'new_price' },
        ]},
      ],
    },
    variables: [
      { 
        id: 'total_val', 
        label: 'Valor Total', 
        unit: '$',
        insight: 'Capital inmovilizado en bodega. Un valor muy alto afecta tu flujo de caja.'
      },
      { 
        id: 'init_qty', 
        label: 'Cant. Inicial', 
        unit: 'uds',
        insight: 'Stock al inicio del trimestre.'
      },
      { 
        id: 'used_qty', 
        label: 'Cant. Usada', 
        unit: 'uds',
        insight: 'Consumo durante el trimestre.'
      },
      { 
        id: 'old_price', 
        label: 'Precio Viejo', 
        unit: '$',
        insight: 'Costo histórico del inventario antiguo (si usas PEPS/FIFO, este sale primero).'
      },
      { 
        id: 'new_qty', 
        label: 'Cant. Comprada', 
        unit: 'uds',
        insight: 'Reposición de stock.'
      },
      { 
        id: 'new_price', 
        label: 'Precio Nuevo', 
        unit: '$',
        insight: 'Costo actual de mercado.'
      },
    ],
    solve: (v, tid) => {
      const rem = Math.max(0, v.init_qty - v.used_qty);
      if (tid === 'total_val') return (rem * v.old_price) + (v.new_qty * v.new_price);
      return 0;
    },
    suggestions: []
  }
};
