import { GraduationCap, Lightbulb } from 'lucide-react';

interface ModeToggleProps {
  mode: 'demo' | 'study';
  onChange: (next: 'demo' | 'study') => void;
}

export const ModeToggle = ({ mode, onChange }: ModeToggleProps) => {
  return (
    <div
      className="relative flex flex-col items-center justify-between p-1.5"
      style={{
        width: 56,
        height: 120,
        borderRadius: 9999,
        background: 'linear-gradient(180deg, #2563FF 0%, #1E50E0 100%)',
        boxShadow:
          '0 10px 24px -8px rgba(37, 99, 255, 0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
      role="radiogroup"
      aria-label="Selector de modo"
    >
      {/* Indicador deslizante azul oscuro */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: 44,
          height: 44,
          borderRadius: '9999px',
          background: 'linear-gradient(180deg, #1D4ED8 0%, #1E40AF 100%)',
          boxShadow:
            '0 4px 10px -2px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
          top: mode === 'demo' ? 6 : 70,
        }}
      />

      {/* Slot superior: Demo (birrete) */}
      <button
        type="button"
        onClick={() => onChange('demo')}
        className="relative z-10 flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{
          width: 44,
          height: 44,
          background: mode === 'demo' ? 'transparent' : '#FFFFFF',
          boxShadow:
            mode === 'demo'
              ? 'none'
              : '0 2px 6px -2px rgba(15, 23, 42, 0.25), inset 0 -1px 0 rgba(15,23,42,0.04)',
        }}
        role="radio"
        aria-checked={mode === 'demo'}
        aria-label="Modo Demo"
        title="Modo Demo"
      >
        <GraduationCap
          size={20}
          color={mode === 'demo' ? '#FFFFFF' : '#94A3B8'}
          strokeWidth={2.2}
        />
      </button>

      {/* Separador */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: 58,
          width: 16,
          height: 2,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.35)',
        }}
      />

      {/* Slot inferior: Estudio (bombillo) */}
      <button
        type="button"
        onClick={() => onChange('study')}
        className="relative z-10 flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{
          width: 44,
          height: 44,
          background: mode === 'study' ? 'transparent' : '#FFFFFF',
          boxShadow:
            mode === 'study'
              ? 'none'
              : '0 2px 6px -2px rgba(15, 23, 42, 0.25), inset 0 -1px 0 rgba(15,23,42,0.04)',
        }}
        role="radio"
        aria-checked={mode === 'study'}
        aria-label="Modo Estudio"
        title="Modo Estudio (apoyo estratégico)"
      >
        <Lightbulb
          size={20}
          color={mode === 'study' ? '#FFFFFF' : '#94A3B8'}
          strokeWidth={2.2}
        />
      </button>
    </div>
  );
};
