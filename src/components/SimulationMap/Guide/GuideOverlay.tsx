import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { useGuide } from './GuideContext';

const ParsedMessage = ({ text }: { text: string }) => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const mainLines: string[] = [];
  const bulletLines: string[] = [];

  for (const line of lines) {
    if (line.trimStart().startsWith('•')) {
      bulletLines.push(line.trim());
    } else {
      mainLines.push(line.trim());
    }
  }

  return (
    <div className="space-y-1.5">
      {mainLines.length > 0 && (
        <p className="text-xs text-slate-700/90 leading-relaxed">
          {mainLines.join(' ')}
        </p>
      )}
      {bulletLines.length > 0 && (
        <ul className="space-y-0.5">
          {bulletLines.map((line, i) => {
            const clean = line.replace(/^•\s*/, '');
            const arrowIdx = clean.indexOf(' → ');
            if (arrowIdx !== -1) {
              const label = clean.slice(0, arrowIdx);
              const desc = clean.slice(arrowIdx + 3);
              if (desc.trim()) {
                return (
                  <li key={i} className="text-[11px] text-slate-600/80 leading-relaxed">
                    <span className="font-semibold text-slate-700/90">{label}</span>: {desc}
                  </li>
                );
              }
              return (
                <li key={i} className="text-[11px] text-slate-600/80 leading-relaxed">
                  <span className="font-semibold text-slate-700/90">{label}</span>
                </li>
              );
            }
            return (
              <li key={i} className="text-[11px] text-slate-600/80 leading-relaxed">
                <span className="font-semibold text-slate-700/90">{clean}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const GuideOverlay = () => {
  const { isGuideActive, guideMessage, toggleGuide } = useGuide();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Reset position when guide deactivates
  useEffect(() => {
    if (!isGuideActive) setPosition(null);
  }, [isGuideActive]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget.closest('[data-goprod-overlay]') as HTMLElement)?.getBoundingClientRect();
    if (!rect) return;
    setDragging(true);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  }, [position]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const onUp = (e: MouseEvent) => {
      e.stopPropagation();
      setDragging(false);
    };
    window.addEventListener('mousemove', onMove, { capture: true });
    window.addEventListener('mouseup', onUp, { capture: true });
    return () => {
      window.removeEventListener('mousemove', onMove, { capture: true });
      window.removeEventListener('mouseup', onUp, { capture: true });
    };
  }, [dragging, dragOffset]);

  if (!isGuideActive || !guideMessage) return null;

  const positionStyle = position
    ? { left: position.x, top: position.y, transform: 'none' }
    : { left: '50%', bottom: 80, transform: 'translateX(-50%)' };

  return (
    <div
      data-goprod-overlay
      className="fixed z-[55] pointer-events-auto max-w-md w-full px-4"
      style={positionStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="group bg-white/40 backdrop-blur-xl hover:bg-white/70 rounded-2xl shadow-xl border border-white/30 overflow-hidden transition-all duration-300">
        <div
          className="h-1 bg-blue-100/50 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="h-full bg-blue-500/60 w-full rounded-r-full" />
        </div>

        <div className="p-3 max-h-[240px] overflow-y-auto">
          <div className="flex items-start gap-2">
            <div
              className="p-1.5 rounded-lg bg-blue-50/50 flex-shrink-0 cursor-move select-none"
              onMouseDown={handleMouseDown}
            >
              <Lightbulb className="w-3.5 h-3.5 text-blue-600/70" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400/70 mb-0.5">
                GoProd
              </p>
              <ParsedMessage text={guideMessage} />
            </div>

            <button
              onClick={toggleGuide}
              className="p-1 rounded-md hover:bg-slate-100/50 transition-colors flex-shrink-0"
              aria-label="Cerrar asistente"
            >
              <X className="w-3.5 h-3.5 text-slate-400/70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
