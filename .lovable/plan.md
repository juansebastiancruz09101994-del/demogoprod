

## Nodos con layout visual de ecuación

### Idea en términos simples

En vez de mostrar los campos como una lista plana, el nodo se convierte en una **ecuación visual**:

```text
┌─────────────────────────────┐
│  Req. Mano de Obra          │
├─────────────────────────────┤
│                             │
│  Producción Objetivo   uds  │
│  ┌─────────────────┐       │
│  │          215000  │       │
│  └─────────────────┘       │
│           ×                 │
│  Tasa Mano de Obra  hrs/ud  │
│  ┌─────────────────┐       │
│  │            4.36  │       │
│  └─────────────────┘       │
│          ═══                │
│  Total Horas        hrs     │
│  ┌─────────────────┐       │
│  │  🔒     937400  │ verde │
│  └─────────────────┘       │
│                             │
│  SUGERENCIAS ...            │
└─────────────────────────────┘
```

- Los **operandos** (inputs manuales) van arriba, separados por el **símbolo de la operación** (×, +, −, ÷)
- El **resultado** (variable bloqueada) va abajo, después de una línea `=`, con fondo verde
- Si el estudiante cambia el candado a otra variable, esa variable baja y las demás suben — el layout se reorganiza automáticamente

### Estructura de datos: `formulaVisual`

Cada módulo define, para cada posible `targetId`, el orden visual de los operandos y los operadores entre ellos:

```typescript
type FormulaStep =
  | { type: 'var'; id: string }
  | { type: 'op'; symbol: '×' | '+' | '−' | '÷' }
  | { type: 'group'; label: string; steps: FormulaStep[] }  // para paréntesis

// En ModuleDefinition:
formulaVisual?: Record<string, FormulaStep[]>;
```

Ejemplo para `material_needs`:
```typescript
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
}
```

Ejemplo para `total_cost` (suma):
```typescript
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
  // ...inversas con − 
}
```

Ejemplo para `hiring` (paréntesis):
```typescript
formulaVisual: {
  hires: [
    { type: 'group', label: '', steps: [
      { type: 'var', id: 'required' },
      { type: 'op', symbol: '−' },
      { type: 'var', id: 'current' },
    ]},
    { type: 'op', symbol: '× 2' },
  ],
}
```

### Cambio en Node.tsx

El rendering actual (loop `definition.variables.map(...)`) se reemplaza por:

1. Si `formulaVisual` existe y hay un `targetId`: renderizar los steps del array como operandos + operadores, y al final el `targetId` como resultado en verde
2. Si no hay `formulaVisual` (ej. `production_target` con 1 sola variable): renderizar como hoy
3. Cada `var` step se renderiza como su input field (con label, unit, tooltip, radio button para cambiar el lock)
4. Cada `op` step se renderiza como un símbolo centrado (×, +, etc.) con tipografía grande
5. La separación `=` es una línea horizontal con el símbolo `=`
6. El resultado usa `bg-emerald-50 border-emerald-300 text-emerald-700`

### Archivos a modificar

1. **`types.ts`** — Agregar tipo `FormulaStep` y campo `formulaVisual` a `ModuleDefinition`
2. **`modules.tsx`** — Agregar `formulaVisual` a los 12 módulos (cada uno con sus variantes por targetId)
3. **`Node.tsx`** — Nuevo layout: renderizar operandos → operador → resultado; radio buttons para cambiar lock; resultado en verde abajo

### Consideraciones

- El selector de lock (radio/candado) se mantiene en cada variable para que el estudiante pueda cambiar qué se calcula
- La fórmula textual (`showFormula` toggle) se puede eliminar o mantener como referencia secundaria
- Módulos de 1 variable (`production_target`) no cambian — se renderizan como input simple
- `inventory_val` tiene una fórmula compleja `(init - used) × old + new × new_price` — se modela con `group`

