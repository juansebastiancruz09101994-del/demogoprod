import * as XLSX from 'xlsx';
import type { ReportData } from '@/components/SimulationMap/types';

// Helper to safely get cell value as number
const getNumericValue = (sheet: XLSX.WorkSheet | undefined, cell: string): number => {
  if (!sheet) return 0;
  const cellData = sheet[cell];
  if (!cellData) return 0;
  const value = cellData.v;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[,$]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper to get sheet by name with fallback search
const getSheet = (workbook: XLSX.WorkBook, sheetName: string): XLSX.WorkSheet | undefined => {
  // Try exact match first
  if (workbook.Sheets[sheetName]) {
    return workbook.Sheets[sheetName];
  }
  // Try case-insensitive match
  const lowerName = sheetName.toLowerCase();
  const foundName = workbook.SheetNames.find(name => name.toLowerCase() === lowerName);
  if (foundName) {
    return workbook.Sheets[foundName];
  }
  // Try partial match
  const partialMatch = workbook.SheetNames.find(name => 
    name.toLowerCase().includes(lowerName) || lowerName.includes(name.toLowerCase())
  );
  if (partialMatch) {
    return workbook.Sheets[partialMatch];
  }
  return undefined;
};

// Debug helper: log all cells in a sheet
const debugSheet = (sheet: XLSX.WorkSheet | undefined, sheetName: string) => {
  if (!sheet) {
    console.log(`[DEBUG] Sheet "${sheetName}" not found`);
    return;
  }
  
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z20');
  const rows: Record<string, Record<string, any>> = {};
  
  for (let R = range.s.r; R <= Math.min(range.e.r, 15); R++) {
    for (let C = range.s.c; C <= Math.min(range.e.c, 10); C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = sheet[cellAddress];
      if (cell) {
        if (!rows[`Row ${R + 1}`]) rows[`Row ${R + 1}`] = {};
        rows[`Row ${R + 1}`][cellAddress] = cell.v;
      }
    }
  }
  
  console.log(`[DEBUG] Sheet "${sheetName}" contents:`, rows);
};

// Helper to find value by label in a sheet
// labelCol: column to search for the label (default 'A')
// valueCol: column to get the value from (default 'B')
const findValueByLabel = (sheet: XLSX.WorkSheet | undefined, label: string, labelCol: string = 'A', valueCol: string = 'B'): number => {
  if (!sheet) return 0;
  
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100');
  
  for (let R = range.s.r; R <= range.e.r; R++) {
    const labelCell = sheet[`${labelCol}${R + 1}`];
    if (labelCell && typeof labelCell.v === 'string' && 
        labelCell.v.toLowerCase().includes(label.toLowerCase())) {
      console.log(`[findValueByLabel] Found "${label}" at ${labelCol}${R + 1}: "${labelCell.v}"`);
      const valueCell = sheet[`${valueCol}${R + 1}`];
      if (valueCell) {
        const value = valueCell.v;
        console.log(`[findValueByLabel] Value at ${valueCol}${R + 1}:`, value);
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[,$]/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
      }
    }
  }
  console.log(`[findValueByLabel] Label "${label}" not found in column ${labelCol}`);
  return 0;
};

export const parseExcelReport = async (file: File): Promise<ReportData> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  // EXTENSIVE DEBUGGING - Log ALL sheet names
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    EXCEL PARSER DEBUG                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('📁 File:', file.name);
  console.log('📋 ALL SHEET NAMES:', workbook.SheetNames);
  console.log('📋 Sheet count:', workbook.SheetNames.length);
  workbook.SheetNames.forEach((name, idx) => {
    console.log(`  [${idx}] "${name}"`);
  });
  
  // Helper to search multiple sheet names (supports both Spanish and English files)
  const getSheetMulti = (names: string[]): XLSX.WorkSheet | undefined => {
    for (const name of names) {
      const sheet = getSheet(workbook, name);
      if (sheet) return sheet;
    }
    return undefined;
  };

  // Get all required sheets (Spanish first, English fallback)
  const manufacturingOutputSheet = getSheetMulti(['Producción y productividad', 'Manufacturing Output']);
  const manufacturingCostSheet = getSheetMulti(['Costo de producción', 'Manufacturing Cost']);
  const labourSheet = getSheetMulti(['Mano de obra', 'Labour Force']);
  const rawMaterialsSheet = getSheetMulti(['Inventario- MP', 'Inventory-Raw Materials']);
  const basicProductsSheet = getSheetMulti(['Inventario - PT', 'Inventory-Basic products']);
  const incomeSheet = getSheetMulti(['Perdidas y ganacias', 'Income Statement']);
  const demandSheet = getSheetMulti(['Pedidos y ventas totales', 'Total Demand And Sales']);
  const cashFlowSheet = getSheetMulti(['Flujo de caja', 'Cash Flow']);
  const detailedIncomeSheet = getSheetMulti(['Información sobre la línea d', 'Detailed Income Statement Repo']);
  
  // Log which sheets were found
  console.log('Sheets found:', {
    manufacturingOutput: !!manufacturingOutputSheet,
    manufacturingCost: !!manufacturingCostSheet,
    labour: !!labourSheet,
    rawMaterials: !!rawMaterialsSheet,
    basicProducts: !!basicProductsSheet,
    income: !!incomeSheet,
    demand: !!demandSheet,
    cashFlow: !!cashFlowSheet,
    detailedIncome: !!detailedIncomeSheet,
  });
  
  // Debug each sheet
  debugSheet(manufacturingOutputSheet, 'Manufacturing Output');
  debugSheet(manufacturingCostSheet, 'Manufacturing Cost');
  debugSheet(labourSheet, 'Labour Force');
  debugSheet(rawMaterialsSheet, 'Inventory-Raw Materials');
  debugSheet(cashFlowSheet, 'Cash Flow');
  debugSheet(detailedIncomeSheet, 'Detailed Income Statement Repo');
  
  // Extract quarter label from filename
  const fileNameMatch = file.name.match(/(\d+-\d+)/);
  const quarterLabel = fileNameMatch ? `Q${fileNameMatch[1]}` : 'Q';
  
  // === PRODUCCIÓN (Manufacturing Output) ===
  // C2: Units Produced
  // B11: Plant Capacity
  // C9: Raw Material Rate (Tasa MP)
  // C8: Labor Rate (Tasa MO)
  // C6: Plant Usage Rate
  const unitsProduced = getNumericValue(manufacturingOutputSheet, 'C2');
  const plantCapacity = getNumericValue(manufacturingOutputSheet, 'B11');
  const mpRate = getNumericValue(manufacturingOutputSheet, 'C9');
  const laborRate = getNumericValue(manufacturingOutputSheet, 'C8');
  const plantUsageRate = getNumericValue(manufacturingOutputSheet, 'C6');
  
  console.log('[PRODUCCIÓN]', { unitsProduced, plantCapacity, mpRate, laborRate, plantUsageRate });
  
  // === COSTOS DE REFERENCIA ===
  // Income Statement B4: CGS (Cost of Goods Sold)
  const totalProductionCost = getNumericValue(incomeSheet, 'B4');
  
  // Detailed Income Statement Repo: Costos unitarios
  // unitCostIndustrial = promedio(C8, G8)
  // unitCostConsumer = promedio(E8, I8)
  const c8 = getNumericValue(detailedIncomeSheet, 'C8');
  const g8 = getNumericValue(detailedIncomeSheet, 'G8');
  const e8 = getNumericValue(detailedIncomeSheet, 'E8');
  const i8 = getNumericValue(detailedIncomeSheet, 'I8');
  const unitCostIndustrial = (c8 + g8) / 2;
  const unitCostConsumer = (e8 + i8) / 2;
  
  console.log('[DETAILED INCOME]', { c8, g8, e8, i8, unitCostIndustrial, unitCostConsumer });
  
  // Cash Flow C6: Fixed Costs
  const fixedCosts = getNumericValue(cashFlowSheet, 'C6');
  // Income Statement B11: Discretionary Expenses
  const discretionaryExpenses = getNumericValue(incomeSheet, 'B11');
  
  console.log('[COSTOS] fixedCosts:', fixedCosts, 'discretionaryExpenses:', discretionaryExpenses);
  
  // === MANO DE OBRA (Labour Force) ===
  // B6: Closing workers
  // D3: Hourly Wage (Actual)
  // F2: Units Produced per Worker
  const workersClosing = getNumericValue(labourSheet, 'B6');
  const hourlyWage = getNumericValue(labourSheet, 'D3');
  const productivity = getNumericValue(labourSheet, 'F2');
  const workersOpening = getNumericValue(labourSheet, 'B2');
  const workersHired = getNumericValue(labourSheet, 'B3');
  const workersResigned = getNumericValue(labourSheet, 'B5');
  
  console.log('[MANO DE OBRA]', { workersClosing, hourlyWage, productivity, workersOpening });
  
  // === INVENTARIO MP (Inventory-Raw Materials) ===
  // B8: Final Stock (Quantity)
  // C8: Unit Cost Standard (Nuevo precio)
  // F8: Total Cost Actual (Costo total)
  const mpFinalQty = getNumericValue(rawMaterialsSheet, 'B8');
  const mpNewPrice = getNumericValue(rawMaterialsSheet, 'C8');
  const mpTotalCost = getNumericValue(rawMaterialsSheet, 'F8');
  const mpInitialQty = getNumericValue(rawMaterialsSheet, 'B3');
  const mpUsed = getNumericValue(rawMaterialsSheet, 'B6');
  const mpPurchased = getNumericValue(rawMaterialsSheet, 'B7');
  const mpOldPrice = getNumericValue(rawMaterialsSheet, 'C3');
  
  console.log('[INVENTARIO MP]', { mpFinalQty, mpNewPrice, mpTotalCost, mpInitialQty });
  
  // === OTROS ===
  const ptStock = getNumericValue(basicProductsSheet, 'B6');
  const unitCost = getNumericValue(manufacturingCostSheet, 'E7');
  const revenue = getNumericValue(incomeSheet, 'B2');
  const ordersReceived = getNumericValue(demandSheet, 'B3') || getNumericValue(demandSheet, 'C3');
  const unitsSold = getNumericValue(demandSheet, 'B4') || getNumericValue(demandSheet, 'C4');
  
  const reportData: ReportData = {
    quarterLabel,
    fileName: file.name,
    
    // Producción
    unitsProduced,
    plantCapacity,
    mpRate,
    laborRate,
    plantUsageRate,
    
    // Costos de Referencia
    totalProductionCost,
    unitCostIndustrial,
    unitCostConsumer,
    discretionaryExpenses,
    fixedCosts,
    
    // Mano de Obra
    workersOpening,
    workersHired,
    workersResigned,
    workersClosing,
    hourlyWage,
    productivity,
    
    // Inventario MP
    mpInitialQty,
    mpUsed,
    mpPurchased,
    mpFinalQty,
    mpOldPrice,
    mpNewPrice,
    mpTotalCost,
    
    // Inventario PT
    ptStock,
    
    // Otros
    unitCost,
    ordersReceived,
    unitsSold,
    revenue,
  };
  
  console.log('=== PARSED REPORT DATA ===', reportData);
  
  return reportData;
};
