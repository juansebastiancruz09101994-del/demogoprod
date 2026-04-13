import { ReactNode } from 'react';

export type FormulaStep =
  | { type: 'var'; id: string }
  | { type: 'op'; symbol: string }
  | { type: 'group'; label: string; steps: FormulaStep[] };

export interface Variable {
  id: string;
  label: string;
  unit: string;
  insight?: string;
}

export interface Suggestion {
  id: string;
  label: string;
  map: Record<string, string>;
}

export interface ModuleDefinition {
  id: string;
  category: string;
  title: string;
  color: string;
  icon: ReactNode;
  description: string;
  isInputNode?: boolean;
  baseFormula: string;
  formulas?: Record<string, string>;
  variables: Variable[];
  formulaVisual?: Record<string, FormulaStep[]>;
  solve: (vals: Record<string, number>, targetId: string) => number | null;
  suggestions: Suggestion[];
}

export interface NodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  data: Record<string, number>;
  targetId?: string;
}

export interface Edge {
  from: string;
  to: string;
  varMap?: Record<string, string>;
}

export interface ReportData {
  quarterLabel: string;
  fileName: string;
  
  // Producción
  unitsProduced: number;
  plantCapacity: number;
  mpRate: number;
  laborRate: number;
  plantUsageRate: number;
  
  // Costos de Referencia
  totalProductionCost: number;
  unitCostIndustrial: number;
  unitCostConsumer: number;
  discretionaryExpenses: number;
  fixedCosts: number;
  
  // Mano de Obra
  workersOpening: number;
  workersHired: number;
  workersResigned: number;
  workersClosing: number;
  hourlyWage: number;
  productivity: number;
  
  // Inventario MP
  mpInitialQty: number;
  mpUsed: number;
  mpPurchased: number;
  mpFinalQty: number;
  mpOldPrice: number;
  mpNewPrice: number;
  mpTotalCost: number;
  
  // Inventario PT
  ptStock: number;
  
  // Ventas (legacy)
  unitCost: number;
  ordersReceived: number;
  unitsSold: number;
  revenue: number;
}
