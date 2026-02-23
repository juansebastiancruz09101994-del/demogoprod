

## Soportar archivos Excel en espanol e ingles

### Problema
Al cambiar los nombres de hojas a espanol, se rompio la compatibilidad con archivos en ingles porque la busqueda parcial de `getSheet()` no puede relacionar nombres completamente distintos (ej: "Produccion y productividad" vs "Manufacturing Output").

### Solucion
Crear una funcion `getSheetMulti()` que reciba un array de nombres posibles y devuelva la primera hoja encontrada. Cada llamada incluira ambos nombres (espanol e ingles).

### Cambios en `src/utils/excelParser.ts`

1. Agregar funcion auxiliar `getSheetMulti`:
```typescript
const getSheetMulti = (workbook: XLSX.WorkBook, names: string[]): XLSX.WorkSheet | undefined => {
  for (const name of names) {
    const sheet = getSheet(workbook, name);
    if (sheet) return sheet;
  }
  return undefined;
};
```

2. Actualizar las 9 llamadas en lineas 109-117 para usar `getSheetMulti` con ambos nombres:

| Variable | Nombres (espanol primero, ingles segundo) |
|---|---|
| manufacturingOutputSheet | 'Produccion y productividad', 'Manufacturing Output' |
| manufacturingCostSheet | 'Costo de produccion', 'Manufacturing Cost' |
| labourSheet | 'Mano de obra', 'Labour Force' |
| rawMaterialsSheet | 'Inventario- MP', 'Inventory-Raw Materials' |
| basicProductsSheet | 'Inventario - PT', 'Inventory-Basic products' |
| incomeSheet | 'Perdidas y ganacias', 'Income Statement' |
| demandSheet | 'Pedidos y ventas totales', 'Total Demand And Sales' |
| cashFlowSheet | 'Flujo de caja', 'Cash Flow' |
| detailedIncomeSheet | 'Informacion sobre la linea d', 'Detailed Income Statement Repo' |

### Archivo a modificar
- `src/utils/excelParser.ts`

