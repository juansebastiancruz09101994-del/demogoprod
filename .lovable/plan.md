

## Cambios: posición GoProd + formato numérico con separador de miles

### 1. Posición por defecto del asistente GoProd en la esquina superior derecha

En `GuideOverlay.tsx`, cambiar la posición inicial de `{ left: '50%', bottom: 80, transform: 'translateX(-50%)' }` a `{ right: 16, top: 16 }` (esquina superior derecha del canvas). Ajustar el estilo inline y la lógica de posición para que arranque ahí.

### 2. Formato de miles automático + validación de comas en inputs numéricos

El input actual es `type="number"`, lo cual no permite formatear visualmente con comas. Para lograr el comportamiento deseado:

**En `FormulaLayout.tsx` (componente `VariableInput`):**
- Cambiar `type="number"` → `type="text"` con `inputMode="decimal"`
- Mantener un estado local `displayValue` (string formateado) separado del valor numérico real
- Al escribir:
  - Rechazar comas (`,`): si el usuario escribe una coma, colorear el borde en rojo y mostrar un mensaje inline pequeño ("Usa punto (.) para decimales")
  - Permitir solo dígitos y un punto decimal
  - Formatear automáticamente la parte entera con comas de miles (ej: `1,250,000`)
  - Pasar el valor numérico limpio (`parseFloat`) al `onChange` existente
- Al recibir un resultado calculado (campos `isTarget`/`isResult`), mostrar también formateado con comas de miles

**En `Node.tsx` (`handleInputChange`):**
- Adaptar para recibir el valor numérico ya parseado (sin cambios significativos, porque el parsing se hará dentro de `VariableInput`)

### Detalle técnico del formateo

```text
Usuario escribe: 1250000
Se muestra: 1,250,000

Usuario escribe: 4.30
Se muestra: 4.30

Usuario escribe: 4,30 (con coma)
→ Borde rojo + tooltip: "Usa punto (.) para decimales"
→ No se acepta el valor
```

### Archivos a modificar

1. **`src/components/SimulationMap/Guide/GuideOverlay.tsx`** — posición inicial top-right
2. **`src/components/SimulationMap/FormulaLayout.tsx`** — input text con formateo de miles, validación de coma, estado display local

