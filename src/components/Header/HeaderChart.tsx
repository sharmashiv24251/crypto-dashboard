// src/components/HeaderChart.tsx
import React, { useMemo } from "react";
import { Chart, type Slice } from "../UI/Chart";

type Props = {
  slices: { label: string; value: number }[];
  total?: number;
};

const PALETTE = [
  "#32CA5B",
  "#A78BFA",
  "#18C9DD",
  "#FB923C",
  "#FB7185",
  "#2AD2D6",
  "#F59E0B",
  "#60A5FA",
  "#34D399",
];

const HeaderChart: React.FC<Props> = ({ slices, total }) => {
  // filter out non-positive slices and ensure numeric values
  const cleaned = useMemo(
    () =>
      (slices || [])
        .map((s) => ({ ...s, value: Number(s.value || 0) }))
        .filter((s) => Number.isFinite(s.value) && s.value > 0),
    [slices]
  );

  const computedTotal = useMemo(() => {
    if (typeof total === "number" && total > 0) return total;
    return cleaned.reduce((sum, s) => sum + s.value, 0);
  }, [cleaned, total]);

  // guard: if no data, render a small empty state (keeps layout stable)
  if (!cleaned.length || computedTotal === 0) {
    return (
      <section className="w-full h-full flex flex-col text-[14px]">
        <span className="text-[14px] text-[var(--color-text-muted)] font-medium mb-4 block md:block">
          Portfolio Breakdown
        </span>
        <div className="flex items-center justify-center flex-1">
          <span className="text-text-muted text-sm">
            no holdings to display
          </span>
        </div>
      </section>
    );
  }

  // build Slice[] for Chart with colors
  const data: Slice[] = cleaned.map((s, i) => ({
    label: s.label,
    value: s.value,
    color: PALETTE[i % PALETTE.length],
  }));

  const sum =
    computedTotal || data.reduce((s, d) => s + (d.value || 0), 0) || 1;

  return (
    <section className="w-full h-full flex flex-col text-[14px]">
      <span className="text-[14px] text-[var(--color-text-muted)] font-medium mb-4 block md:block">
        Portfolio Breakdown
      </span>

      <div className="flex flex-col items-center md:flex-row md:items-start gap-6 flex-1">
        <div className="flex-shrink-0">
          <Chart data={data} />
        </div>

        <div className="w-full md:w-auto flex-1">
          <ul className="space-y-4 max-w-full">
            {data.map((d, i) => {
              const percentage = (d.value / sum) * 100 || 0;
              return (
                <li
                  key={d.label + i}
                  className="flex items-center justify-between w-full md:pr-8"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[14px]" style={{ color: d.color }}>
                      {d.label}
                    </span>
                  </div>

                  <div className="ml-auto md:ml-12 flex-shrink-0 text-right">
                    <span className="text-[14px] font-medium text-text-muted">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeaderChart;
