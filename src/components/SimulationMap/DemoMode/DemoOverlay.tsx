import { X, SkipForward, SkipBack, GraduationCap } from 'lucide-react';
import { useDemo } from './DemoContext';
import { DEMO_SCENARIOS } from './demoScenarios';

export const DemoOverlay = () => {
  const { isDemoActive, currentScenario, currentStep, exitDemo, skipStep, prevStep, getCurrentStep } = useDemo();

  const step = getCurrentStep();
  if (!isDemoActive || !step) return null;

  const scenario = DEMO_SCENARIOS.find(s => s.id === currentScenario);
  const totalSteps = scenario?.steps.length ?? 0;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto max-w-lg w-full px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full transition-all duration-500 ease-out rounded-r-full"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              backgroundColor: scenario?.accentColor ?? '#3b82f6',
            }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${scenario?.accentColor ?? '#3b82f6'}20` }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: scenario?.accentColor ?? '#3b82f6' }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Escenario {currentScenario} · Paso {currentStep + 1}/{totalSteps}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {step.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
                Anterior
              </button>
            )}
            {step.targetType !== 'info' && (
              <button
                onClick={skipStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Saltar
              </button>
            )}
            {step.targetType === 'info' && (
              <button
                onClick={skipStep}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: scenario?.accentColor ?? '#3b82f6' }}
              >
                Continuar
              </button>
            )}
            <button
              onClick={exitDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Modo estudio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
