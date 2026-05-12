"use client";

interface ResponseSparkProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function ResponseSpark({ data, width = 120, height = 32, color = "#6366f1" }: ResponseSparkProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>No data</span>
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));

  const line = pts.reduce((a, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${a} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const fill = `${line} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z`;
  const gid = `sg-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={color} />
    </svg>
  );
}
