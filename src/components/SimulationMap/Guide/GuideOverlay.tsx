import { Lightbulb, X } from 'lucide-react';
import { useGuide } from './GuideContext';

const ParsedMessage = ({ text }: { text: string }) => {
  const blocks = text.split('\n\n');
  const mainMsg = blocks[0];
  const bulletLines = blocks.slice(1).filter(l => l.startsWith('•'));

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700/90 leading-relaxed">{mainMsg}</p>
      {bulletLines.length > 0 && (
        <ul className="space-y-1">
          {bulletLines.map((line, i) => {
            const clean = line.replace(/^•\s*/, '');
            const arrowIdx = clean.indexOf(' → ');
            if (arrowIdx !== -1) {
              const label = clean.slice(0, arrowIdx);
              const desc = clean.slice(arrowIdx + 3);
              return (
                <li key={i} className="text-xs text-slate-600/80 leading-relaxed">
                  <span className="font-semibold text-slate-700/90">{label}</span>: {desc}
                </li>
              );
            }
            return <li key={i} className="text-xs text-slate-600/80 leading-relaxed">{clean}</li>;
          })}
        </ul>
      )}
    </div>
  );
};

export const GuideOverlay = () => {
  const { isGuideActive, guideMessage, toggleGuide } = useGuide();

  if (!isGuideActive || !guideMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] pointer-events-auto max-w-xl w-full px-4">
      <div className="group bg-white/40 backdrop-blur-xl hover:bg-white/70 rounded-2xl shadow-xl border border-white/30 overflow-hidden transition-all duration-300">
        <div className="h-1 bg-blue-100/50">
          <div className="h-full bg-blue-500/60 w-full rounded-r-full" />
        </div>

        <div className="p-4 h-[160px] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50/50 flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-blue-600/70" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400/70 mb-1">
                GoProd
              </p>
              <ParsedMessage text={guideMessage} />
            </div>

            <button
              onClick={toggleGuide}
              className="p-1 rounded-md hover:bg-slate-100/50 transition-colors flex-shrink-0"
              aria-label="Cerrar asistente"
            >
              <X className="w-4 h-4 text-slate-400/70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
