import { useState, useEffect } from 'react';
import { Lock, X, Plus, Info, FunctionSquare, HelpCircle } from 'lucide-react';
import { MODULES } from './modules';
import { NodeData } from './types';
import { GuidePulse } from './DemoMode/GuidePulse';
import type { DemoStep } from './DemoMode/demoScenarios';

interface NodeProps {
  node: NodeData;
  data: Record<string, number>;
  onUpdate: (id: string, data: Record<string, number>) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onAddChild: (parentId: string, childType: string, varMap: Record<string, string>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  demoHighlight?: {
    step: DemoStep;
    accentColor: string;
  } | null;
}

export const Node = ({ 
  node, 
  data, 
  onUpdate, 
  onDragStart, 
  onAddChild, 
  onDelete, 
  isSelected, 
  onSelect,
  demoHighlight,
}: NodeProps) => {
  const definition = MODULES[node.type];
  const [inputs, setInputs] = useState<Record<string, number>>(data || {});
  const [showFormula, setShowFormula] = useState(false);
  
  const [targetId, setTargetId] = useState<string | null>(
    definition.variables.length === 1 ? null : definition.variables[0].id
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
    if (definition.solve) {
      const result = definition.solve(inputs, newTarget);
      const currentValue = inputs[newTarget] || 0;

      if (result !== null) {
        if (result === 0 && currentValue !== 0) {
          // Do NOT overwrite. Keep the existing value.
        } else {
          const newInputs = { ...inputs, [newTarget]: parseFloat(result.toFixed(2)) };
          setInputs(newInputs);
          onUpdate(node.id, newInputs);
        }
      }
    }
  };

  // Determine if this node has a demo highlight for a specific variable or suggestion
  const isHighlightedInput = (varId: string) => {
    if (!demoHighlight) return false;
    const { step } = demoHighlight;
    return step.targetType === 'fill-input' && step.targetVariable === varId;
  };

  const isHighlightedSuggestion = (suggestionId: string) => {
    if (!demoHighlight) return false;
    const { step } = demoHighlight;
    return step.targetType === 'click-suggestion' && step.suggestionId === suggestionId;
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

        {definition.variables.map(v => {
          const isTarget = targetId === v.id;
          const hasHighlight = isHighlightedInput(v.id);
          return (
            <div key={v.id} className={`flex items-center gap-2 text-sm relative ${hasHighlight ? 'z-20' : ''}`}>
              {hasHighlight && (
                <div className="absolute -left-8 top-1/2 -translate-y-1/2">
                  <GuidePulse color={demoHighlight!.accentColor} size="sm" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                {definition.variables.length > 1 && (
                  <button 
                    onClick={() => handleTargetChange(v.id)}
                    className={`p-1 rounded transition-colors ${isTarget ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Resolver para esto"
                  >
                    {isTarget ? <Lock className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                  </button>
                )}
                {definition.variables.length === 1 && (
                   <div className="w-5 flex justify-center text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                   </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600 font-medium text-xs">{v.label}</span>
                    {v.insight && (
                      <div className="group relative flex items-center">
                        <HelpCircle className="w-3 h-3 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded shadow-xl z-50 mb-1 pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                          {v.insight}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">{v.unit}</span>
                </div>
                <input 
                  type="number" 
                  step="any"
                  value={inputs[v.id] !== undefined ? inputs[v.id] : ''} 
                  onChange={(e) => handleInputChange(e, v.id)}
                  readOnly={isTarget}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`w-full px-2 py-1 rounded border text-right font-mono
                    ${isTarget 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                      : hasHighlight
                        ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300 outline-none'
                        : 'bg-slate-50 border-slate-200 focus:border-blue-400 outline-none'
                    }
                  `}
                  placeholder="0"
                />
              </div>
            </div>
          );
        })}

        {definition.suggestions && definition.suggestions.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Sugerencias</p>
            <div className="flex flex-wrap gap-2">
              {definition.suggestions.map((s) => {
                const hasHighlight = isHighlightedSuggestion(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChild(node.id, s.id, s.map);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors border relative
                      ${hasHighlight
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-400 ring-2 ring-yellow-300 animate-demo-pulse'
                        : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 border-slate-200'
                      }
                    `}
                  >
                    {hasHighlight && (
                      <span className="absolute -top-1 -right-1">
                        <GuidePulse color={demoHighlight!.accentColor} size="sm" />
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
