import React, { useEffect, useMemo, useState } from "react";

export type Slice = {
  label: string;
  value: number;
  color: string;
};

type ChartProps = {
  data: Slice[];
};

export const Chart: React.FC<ChartProps> = ({ data }) => {
  const strokeWidth = 28;
  const radius = 60;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const total = data.reduce((s, d) => s + d.value, 0);

  // Precompute dash & offset for each slice so render is deterministic
  const segments = useMemo(() => {
    const segs: {
      label: string;
      value: number;
      color: string;
      portion: number;
      dash: string;
      offset: number;
    }[] = [];

    let acc = 0;
    for (const d of data) {
      const portion = total === 0 ? 0 : d.value / total;
      const length = portion * circumference;
      // offset matches original logic: negative cumulative fraction * circumference
      const offset = total === 0 ? 0 : -((acc / total) * circumference);
      segs.push({
        label: d.label,
        value: d.value,
        color: d.color,
        portion,
        dash: `${length.toFixed(2)} ${circumference.toFixed(2)}`,
        offset,
      });
      acc += d.value;
    }
    return segs;
  }, [data, total, circumference]);

  // mounted toggles the animation target values
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // small delay so the initial render with "hidden" state is painted
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <svg
        className="w-[236px] h-[236px] md:w-[160px] md:h-[160px]"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        role="img"
        aria-label="Portfolio pie chart"
      >
        <g transform={`translate(${radius}, ${radius}) rotate(-90)`}>
          {segments.map((s, idx) => {
            // initial hidden offset: -circumference (fully shifted away)
            const initialOffset = -circumference;
            // final offset (precomputed)
            const finalOffset = s.offset;
            const dash = s.dash;

            // staggered animation delay by index (ms)
            const delayMs = idx * 90;

            return (
              <circle
                key={s.label + idx}
                r={normalizedRadius}
                fill="transparent"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dash}
                // set style-driven strokeDashoffset to animate on mount
                strokeDashoffset={mounted ? finalOffset : initialOffset}
                strokeLinecap="butt"
                style={{
                  transition: `stroke-dashoffset 700ms cubic-bezier(.22,.9,.28,1) ${delayMs}ms`,
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
