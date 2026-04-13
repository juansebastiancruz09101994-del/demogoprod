import { Lock, HelpCircle } from 'lucide-react';
import { Variable, FormulaStep, ModuleDefinition } from './types';
import { GuidePulse } from './DemoMode/GuidePulse';
import type { DemoStep } from './DemoMode/demoScenarios';

interface FormulaLayoutProps {
  definition: ModuleDefinition;
  targetId: string | null;
  inputs: Record<string, number>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, varId: string) => void;
  onTargetChange: (newTarget: string) => void;
  demoHighlight?: {
    step: DemoStep;
    accentColor: string;
  } | null;
  guideHighlightFields?: string[];
}

export const FormulaLayout = ({
  definition,
  targetId,
  inputs,
  onInputChange,
  onTargetChange,
  demoHighlight,
  guideHighlightFields,
}: FormulaLayoutProps) => {
  const variables = definition.variables;
  const formulaVisual = definition.formulaVisual;

  // If no formulaVisual or single variable, render simple
  if (!formulaVisual || !targetId || variables.length <= 1) {
    return (
      <div className="space-y-3">
        {variables.map(v => (
          <VariableInput
            key={v.id}
            variable={v}
            value={inputs[v.id]}
            isTarget={false}
            showLock={false}
            onChange={onInputChange}
            onTargetChange={onTargetChange}
            demoHighlight={demoHighlight}
          />
        ))}
      </div>
    );
  }

  const steps = formulaVisual[targetId];
  if (!steps) {
    // Fallback: render flat
    return (
      <div className="space-y-3">
        {variables.map(v => (
          <VariableInput
            key={v.id}
            variable={v}
            value={inputs[v.id]}
            isTarget={targetId === v.id}
            showLock={variables.length > 1}
            onChange={onInputChange}
            onTargetChange={onTargetChange}
            demoHighlight={demoHighlight}
          />
        ))}
      </div>
    );
  }

  const varMap = new Map(variables.map(v => [v.id, v]));
  const targetVar = varMap.get(targetId);

  return (
    <div className="space-y-1">
      {/* Operands */}
      <div className="space-y-1">
        {steps.map((step, i) => (
          <StepRenderer
            key={i}
            step={step}
            varMap={varMap}
            inputs={inputs}
            targetId={targetId}
            onInputChange={onInputChange}
            onTargetChange={onTargetChange}
            demoHighlight={demoHighlight}
          />
        ))}
      </div>

      {/* Equals separator */}
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 border-t-2 border-emerald-300" />
        <span className="text-emerald-500 font-bold text-sm">=</span>
        <div className="flex-1 border-t-2 border-emerald-300" />
      </div>

      {/* Result */}
      {targetVar && (
        <VariableInput
          variable={targetVar}
          value={inputs[targetId]}
          isTarget={true}
          showLock={variables.length > 1}
          onChange={onInputChange}
          onTargetChange={onTargetChange}
          demoHighlight={demoHighlight}
          isResult
        />
      )}
    </div>
  );
};

// Renders a single step (var, op, or group)
const StepRenderer = ({
  step,
  varMap,
  inputs,
  targetId,
  onInputChange,
  onTargetChange,
  demoHighlight,
  nested = false,
}: {
  step: FormulaStep;
  varMap: Map<string, Variable>;
  inputs: Record<string, number>;
  targetId: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, varId: string) => void;
  onTargetChange: (newTarget: string) => void;
  demoHighlight?: { step: DemoStep; accentColor: string } | null;
  nested?: boolean;
}) => {
  if (step.type === 'op') {
    return (
      <div className={`flex items-center justify-center ${nested ? 'px-1' : 'py-0.5'}`}>
        <span className={`font-bold text-slate-400 ${nested ? 'text-xs' : 'text-base'}`}>
          {step.symbol}
        </span>
      </div>
    );
  }

  if (step.type === 'var') {
    const variable = varMap.get(step.id);
    if (!variable) return null;
    return (
      <VariableInput
        variable={variable}
        value={inputs[step.id]}
        isTarget={false}
        showLock={varMap.size > 1}
        onChange={onInputChange}
        onTargetChange={onTargetChange}
        demoHighlight={demoHighlight}
        compact={nested}
      />
    );
  }

  if (step.type === 'group') {
    return (
      <div className="mx-2 my-0.5 border-l-2 border-slate-300 rounded-r bg-slate-50/50 px-2 py-1">
        {step.label && (
          <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 block">{step.label}</span>
        )}
        {step.steps.map((s, i) => (
          <StepRenderer
            key={i}
            step={s}
            varMap={varMap}
            inputs={inputs}
            targetId={targetId}
            onInputChange={onInputChange}
            onTargetChange={onTargetChange}
            demoHighlight={demoHighlight}
            nested
          />
        ))}
      </div>
    );
  }

  return null;
};

// Single variable input row
const VariableInput = ({
  variable,
  value,
  isTarget,
  showLock,
  onChange,
  onTargetChange,
  demoHighlight,
  isResult = false,
  compact = false,
}: {
  variable: Variable;
  value: number | undefined;
  isTarget: boolean;
  showLock: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, varId: string) => void;
  onTargetChange: (newTarget: string) => void;
  demoHighlight?: { step: DemoStep; accentColor: string } | null;
  isResult?: boolean;
  compact?: boolean;
}) => {
  const hasHighlight = demoHighlight
    && demoHighlight.step.targetType === 'fill-input'
    && demoHighlight.step.targetVariable === variable.id;

  return (
    <div className={`flex items-center gap-2 text-sm relative ${hasHighlight ? 'z-20' : ''} ${compact ? 'py-0' : ''}`}>
      {hasHighlight && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2">
          <GuidePulse color={demoHighlight!.accentColor} size="sm" />
        </div>
      )}

      {showLock && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onTargetChange(variable.id)}
            className={`p-1 rounded transition-colors ${
              isTarget || isResult
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Resolver para esto"
          >
            {isTarget || isResult ? (
              <Lock className="w-3 h-3" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current" />
            )}
          </button>
        </div>
      )}

      {!showLock && (
        <div className="w-5 flex justify-center text-slate-300">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        </div>
      )}

      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-1">
            <span className={`font-medium text-xs ${isResult ? 'text-emerald-700' : 'text-slate-600'}`}>
              {variable.label}
            </span>
            {variable.insight && (
              <div className="group relative flex items-center">
                <HelpCircle className="w-3 h-3 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded shadow-xl z-50 mb-1 pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                  {variable.insight}
                </div>
              </div>
            )}
          </div>
          <span className="text-slate-400 font-mono text-[10px]">{variable.unit}</span>
        </div>
        <input
          type="number"
          step="any"
          value={value !== undefined ? value : ''}
          onChange={(e) => onChange(e, variable.id)}
          readOnly={isTarget || isResult}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-full px-2 py-1 rounded border text-right font-mono
            ${isTarget || isResult
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
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
};
