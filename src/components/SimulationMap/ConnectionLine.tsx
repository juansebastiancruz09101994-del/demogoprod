interface ConnectionLineProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export const ConnectionLine = ({ start, end }: ConnectionLineProps) => {
  const path = `M ${start.x} ${start.y} C ${start.x} ${start.y + 50}, ${end.x} ${end.y - 50}, ${end.x} ${end.y}`;
  return (
    <path d={path} stroke="#cbd5e1" strokeWidth="3" fill="none" />
  );
};
