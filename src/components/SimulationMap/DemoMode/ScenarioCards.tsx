import { Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useDemo } from './DemoContext';
import { DEMO_SCENARIOS } from './demoScenarios';

export const ScenarioCards = () => {
  const { currentScenario, scenarioExpanded, selectScenario, isScenarioCompleted, completedScenarios } = useDemo();

  return (
    <div className="fixed top-5 right-5 z-50 w-80 space-y-2 pointer-events-auto">
      {DEMO_SCENARIOS.map((scenario) => {
        const isCompleted = isScenarioCompleted(scenario.id);
        const isActive = currentScenario === scenario.id;
        const isLocked = !isCompleted && scenario.id > 1 && !completedScenarios.includes(scenario.id - 1) && currentScenario !== scenario.id;
        const isExpanded = scenarioExpanded === scenario.id;

        return (
          <div
            key={scenario.id}
            className={`
              rounded-xl border shadow-lg transition-all duration-300 overflow-hidden
              ${isCompleted
                ? 'bg-white border-emerald-200 opacity-80'
                : isActive
                  ? `bg-white border-2 shadow-xl ${scenario.id === 1 ? 'border-emerald-400' : scenario.id === 2 ? 'border-orange-400' : 'border-red-400'}`
                  : isLocked
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
              }
            `}
            onClick={() => !isLocked && selectScenario(scenario.id)}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Status icon */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                ${isCompleted
                  ? 'bg-emerald-500'
                  : isActive
                    ? `${scenario.color} ${!isExpanded ? 'animate-demo-pulse' : ''}`
                    : isLocked
                      ? 'bg-slate-300'
                      : 'bg-slate-400'
                }
              `}>
                {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : scenario.id}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                  {scenario.title}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isCompleted ? 'Completado ✓' : isActive ? `Paso ${Math.min(currentScenario > 0 ? 1 : 0, 1)}` : isLocked ? 'Bloqueado' : 'Disponible'}
                </p>
              </div>

              {!isLocked && (
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              )}
            </div>

            {/* Expanded enunciado */}
            {isExpanded && !isLocked && (
              <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className={`
                  rounded-lg p-3 text-xs leading-relaxed
                  ${scenario.id === 1 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                    : scenario.id === 2 ? 'bg-orange-50 text-orange-800 border border-orange-100' 
                    : 'bg-red-50 text-red-800 border border-red-100'}
                `}>
                  {scenario.enunciado}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
