interface GuidePulseProps {
  color?: string;
  size?: 'sm' | 'md';
}

export const GuidePulse = ({ color = '#3b82f6', size = 'md' }: GuidePulseProps) => {
  const dims = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const ringDims = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size === 'sm' ? 24 : 32, height: size === 'sm' ? 24 : 32 }}>
      {/* Outer ring - pulsing */}
      <span
        className={`absolute ${ringDims} rounded-full animate-demo-pulse opacity-40`}
        style={{ backgroundColor: color }}
      />
      {/* Inner dot */}
      <span
        className={`relative ${dims} rounded-full shadow-lg`}
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
      />
    </span>
  );
};
