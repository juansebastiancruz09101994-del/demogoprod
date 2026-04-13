import { useState, useEffect } from 'react';
import { X, Plus, Info, FunctionSquare } from 'lucide-react';
import { MODULES } from './modules';
import { NodeData } from './types';
import { GuidePulse } from './DemoMode/GuidePulse';
import { FormulaLayout } from './FormulaLayout';
import type { DemoStep } from './DemoMode/demoScenarios';

interface NodeProps {
  node: NodeData;
  data: Record<string, number>;
  onUpdate: (id: string, data: Record<string, number>) => void;
  onTargetChange: (id: string, targetId: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onAddChild: (parentId: string, childType: string, varMap: Record<string, string>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  demoHighlight?: {
    step: DemoStep;
    accentColor: string;
  } | null;
  guideHighlight?: {
    highlightFields: string[];
    highlightSuggestions: boolean;
  } | null;
}

export const Node = ({ 
  node, 
  data, 
  onUpdate, 
  onTargetChange,
  onDragStart, 
  onAddChild, 
  onDelete, 
  isSelected, 
  onSelect,
  demoHighlight,
  guideHighlight,
}: NodeProps) => {
  const definition = MODULES[node.type];
  const [inputs, setInputs] = useState<Record<string, number>>(data || {});
  const [showFormula, setShowFormula] = useState(false);
  
  const [targetId, setTargetId] = useState<string | null>(
    node.targetId || (definition.variables.length === 1 ? null : definition.variables[0].id)
  );

  const currentFormula = (targetId && definition.formulas && definition.formulas[targetId]) 
    ? definition.formulas[targetId] 
    : definition.baseFormula;

  useEffect(() => {
    if (data) setInputs(prev => ({ ...prev, ...data }));
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, varId: string) => {
    const val = parseFloat(e.target.value) || 0;
    const newInputs = { ...inputs, [varId]: val };
    
    if (definition.solve && targetId) {
      const result = definition.solve(newInputs, targetId);
      if (result !== null) {
        newInputs[targetId] = parseFloat(result.toFixed(2));
      }
    }
    
    setInputs(newInputs);
    onUpdate(node.id, newInputs);
  };

  const handleTargetChange = (newTarget: string) => {
    setTargetId(newTarget);
    onTargetChange(node.id, newTarget);
    if (definition.solve) {
      const result = definition.solve(inputs, newTarget);
      const currentValue = inputs[newTarget] || 0;

      if (result !== null) {
        if (result === 0 && currentValue !== 0) {
          // Do NOT overwrite
        } else {
          const newInputs = { ...inputs, [newTarget]: parseFloat(result.toFixed(2)) };
          setInputs(newInputs);
          onUpdate(node.id, newInputs);
        }
      }
    }
  };

  const isHighlightedSuggestion = (suggestionId: string) => {
    // Demo highlight takes priority
    if (demoHighlight) {
      const { step } = demoHighlight;
      return step.targetType === 'click-suggestion' && step.suggestionId === suggestionId;
    }
    // Guide highlight: all suggestions glow green when node is complete
    if (guideHighlight?.highlightSuggestions) return true;
    return false;
  };

  return (
    <div 
      className={`absolute w-80 shadow-lg rounded-xl flex flex-col transition-shadow duration-200 
        ${isSelected ? 'ring-4 ring-blue-400/50 z-50' : 'ring-1 ring-slate-900/10 z-10'}
        bg-white select-none
      `}
      style={{ left: node.x, top: node.y }}
      onMouseDown={(e) => {
         e.stopPropagation();
         onDragStart(e, node.id);
         onSelect(node.id);
      }}
    >
      <div className={`p-3 rounded-t-xl flex items-center justify-between cursor-move ${definition.color} text-white`}>
        <div className="flex items-center gap-2">
          {definition.icon}
          <span className="font-bold text-sm">{definition.title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowFormula(!showFormula); }}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${showFormula ? 'bg-white/30' : ''}`}
            title="Mostrar Fórmula"
          >
            <FunctionSquare className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="opacity-60 hover:opacity-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 bg-white/95 backdrop-blur-sm rounded-b-xl">
        
        {showFormula && (
          <div className="bg-slate-100 border border-slate-200 rounded p-2 mb-3 text-xs font-mono text-slate-600 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="font-bold mb-1 text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3" /> Lógica de la Fórmula
            </div>
            {currentFormula}
          </div>
        )}

        <FormulaLayout
          definition={definition}
          targetId={targetId}
          inputs={inputs}
          onInputChange={handleInputChange}
          onTargetChange={handleTargetChange}
          demoHighlight={demoHighlight}
          guideHighlightFields={guideHighlight?.highlightFields}
        />

        {definition.suggestions && definition.suggestions.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Sugerencias</p>
            <div className="flex flex-wrap gap-2">
              {definition.suggestions.map((s) => {
                    const hasDemoHL = demoHighlight && isHighlightedSuggestion(s.id);
                    const hasGuideHL = !demoHighlight && guideHighlight?.highlightSuggestions;
                    const hasHighlight = hasDemoHL || hasGuideHL;
                    return (
                      <button
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddChild(node.id, s.id, s.map);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors border relative
                          ${hasDemoHL
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-400 ring-2 ring-yellow-300 animate-demo-pulse'
                            : hasGuideHL
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200 animate-demo-pulse'
                              : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 border-slate-200'
                          }
                        `}
                      >
                        {hasDemoHL && (
                          <span className="absolute -top-1 -right-1">
                            <GuidePulse color={demoHighlight!.accentColor} size="sm" />
                          </span>
                        )}
                        {hasGuideHL && !hasDemoHL && (
                          <span className="absolute -top-1 -right-1">
                            <GuidePulse color="#10b981" size="sm" />
                          </span>
                        )}
                        <Plus className="w-3 h-3" /> {s.label}
                      </button>
                    );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
