import { useState, useCallback } from 'react';
import { FileSpreadsheet, Upload, X, ChevronLeft, ChevronRight, Users, Package, Factory, DollarSign } from 'lucide-react';
import { parseExcelReport } from '@/utils/excelParser';
import type { ReportData } from './types';
import { GuidePulse } from './DemoMode/GuidePulse';

interface ReportPanelProps {
  reportData: ReportData | null;
  onReportLoaded: (data: ReportData) => void;
  onReportCleared: () => void;
  demoHighlight?: boolean;
}

export const ReportPanel = ({ reportData, onReportLoaded, onReportCleared, demoHighlight }: ReportPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback(async (file: File) => {
    if (!file) return;
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];
    
    const isValid = validTypes.some(type => 
      file.type === type || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (!isValid) {
      alert('Por favor, sube un archivo Excel (.xlsx o .xls)');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await parseExcelReport(file);
      onReportLoaded(data);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      alert('Error al leer el archivo Excel. Verifica el formato.');
    } finally {
      setIsLoading(false);
    }
  }, [onReportLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  }, [handleFileChange]);

  const handleCollapse = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsCollapsed(true);
      setIsAnimating(false);
    }, 250);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-MX');
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDecimal = (num: number, decimals: number = 2) => {
    return num.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Collapsed state - blue accent tab
  if (isCollapsed) {
    return (
      <button
        onClick={handleExpand}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30 rounded-r-xl px-3 py-5 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/40 hover:shadow-xl transition-all duration-300 group relative"
      >
        {demoHighlight && (
          <div className="absolute -right-3 -top-3">
            <GuidePulse color="#3b82f6" />
          </div>
        )}
        <div className="flex flex-col items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-white animate-pulse-soft" />
          <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`
        fixed left-5 top-5 z-50 w-80 bg-white/95 backdrop-blur-md shadow-xl shadow-blue-500/10 
        rounded-2xl border overflow-hidden max-h-[calc(100vh-40px)] flex flex-col
        ${demoHighlight && !reportData ? 'border-blue-400 ring-2 ring-blue-300' : 'border-blue-100'}
        ${isAnimating ? 'animate-slide-out-left' : 'animate-slide-in-left'}
      `}
    >
      {/* Demo pulse indicator */}
      {demoHighlight && !reportData && (
        <div className="absolute -right-3 -top-3 z-10">
          <GuidePulse color="#3b82f6" />
        </div>
      )}

      {/* Header - Blue Gradient */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="font-semibold text-white flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-blue-200" />
          Reporte de Resultados del Q anterior
        </h2>
        <button
          onClick={handleCollapse}
          className="text-blue-200 hover:text-white hover:bg-blue-500/30 rounded-lg p-1 transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Upload Section */}
        <div className="p-4 border-b border-blue-100/50">
          {reportData ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl px-4 py-3 border border-blue-200/50 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-800 truncate">{reportData.fileName}</span>
              </div>
              <button
                onClick={onReportCleared}
                className="text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-xl p-5 text-center transition-all duration-300 cursor-pointer
                ${isDragOver 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : demoHighlight
                    ? 'border-blue-400 bg-blue-50/80 animate-demo-pulse'
                    : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'}
                ${isLoading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
                id="excel-upload"
                disabled={isLoading}
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-700">
                  {isLoading ? 'Procesando...' : 'Subir Excel de reportes (no de decisiones)'}
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Arrastra o haz clic aquí
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Summary Sections - Only show when report is loaded */}
        {reportData && (
          <div className="p-4 space-y-4">
            {/* Producción */}
            <div className="space-y-2 group">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <Factory className="w-3.5 h-3.5 text-blue-500" />
                Producción
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 rounded-xl p-3.5 space-y-2 text-sm border border-blue-100/50 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Unidades producidas</span>
                  <span className="font-semibold text-blue-900">{formatNumber(reportData.unitsProduced)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Capacidad de planta</span>
                  <span className="font-semibold text-blue-900">{formatNumber(reportData.plantCapacity)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Tasa MP</span>
                  <span className="font-semibold text-blue-900">{formatDecimal(reportData.mpRate)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Tasa MO</span>
                  <span className="font-semibold text-blue-900">{formatDecimal(reportData.laborRate)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Tasa uso de planta</span>
                  <span className="font-semibold text-blue-900">{formatDecimal(reportData.plantUsageRate)}</span>
                </div>
              </div>
            </div>

            {/* Costos de Referencia */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                Costos de Referencia
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 rounded-xl p-3.5 space-y-2 text-sm border border-blue-100/50 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Costo total (CGS)</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.totalProductionCost)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Costo unit. Industrial</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.unitCostIndustrial)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Costo unit. Consumo</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.unitCostConsumer)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Gastos discrecionales</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.discretionaryExpenses)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Costos fijos</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.fixedCosts)}</span>
                </div>
              </div>
            </div>

            {/* Mano de Obra */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Mano de Obra
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 rounded-xl p-3.5 space-y-2 text-sm border border-blue-100/50 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Trabajadores finales</span>
                  <span className="font-semibold text-blue-900">{formatNumber(reportData.workersClosing)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Salario/hora</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.hourlyWage)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Unit produced per worker</span>
                  <span className="font-semibold text-blue-900">{formatDecimal(reportData.productivity)}</span>
                </div>
              </div>
            </div>

            {/* Inventario MP */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-blue-500" />
                Inventario MP
              </h3>
              <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 rounded-xl p-3.5 space-y-2 text-sm border border-blue-100/50 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Stock final</span>
                  <span className="font-semibold text-blue-900">{formatNumber(reportData.mpFinalQty)} uds</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Nuevo precio</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.mpNewPrice)}</span>
                </div>
                <div className="flex justify-between hover:bg-blue-100/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                  <span className="text-blue-600/80">Costo total</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(reportData.mpTotalCost)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
