import { Lightbulb, X } from 'lucide-react';
import { useGuide } from './GuideContext';

export const GuideOverlay = () => {
  const { isGuideActive, guideMessage } = useGuide();

  if (!isGuideActive || !guideMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] pointer-events-auto max-w-md w-full px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
        <div className="h-1 bg-blue-100">
          <div className="h-full bg-blue-500 w-full rounded-r-full" />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                Asistente
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {guideMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
