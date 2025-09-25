import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label, Sector,
} from "recharts";
import useDarkMode from "../../../pages/Quotes/hooks/useDarkMode";

const FROM = ["#0D47A1", "#1976D2", "#00ACC1", "#26C6DA", "#80DEEA"];
const TO   = ["#1976D2", "#00BCD4", "#26C6DA", "#80DEEA", "#B2EBF2"];

export default function DonutStatus({
  labels,
  values,
  height = 420, // altura máxima; real se rige por aspect 1:1
}: {
  labels: string[];
  values: number[];
  height?: number;
}) {
  // construir data
  const data = useMemo(
    () => labels.map((l, i) => ({ name: l, value: values[i] ?? 0 })),
    [labels, values]
  );
  const total = useMemo(() => data.reduce((a, b) => a + b.value, 0), [data]);

  // tema
  const isDark = useDarkMode();

  // interacción
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const activeIndex = useMemo(() => {
    if (hoverIdx != null) return hoverIdx;
    if (activeLabel) return data.findIndex(d => d.name === activeLabel);
    return -1;
  }, [hoverIdx, activeLabel, data]);

  // center label
  const CenterLabel = ({ viewBox }: any) => {
    if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") return null;
    const cx = viewBox.cx;
    const cy = viewBox.cy;

    const isAnyActive = activeIndex >= 0 && data[activeIndex];
    const currentValue = isAnyActive ? data[activeIndex].value : total;
    const currentName  = isAnyActive ? data[activeIndex].name  : "Total";

    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <text
          x={0}
          y={-2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-semibold"
          style={{ fontSize: 22, fill: isDark ? "#fff" : "#0f172a" }}
        >
          {currentValue}
        </text>
        <text
          x={0}
          y={22}
          textAnchor="middle"
          dominantBaseline="hanging"
          style={{ fontSize: 12, fill: isDark ? "#cbd5e1" : "#475569" }}
        >
          {currentName}
        </text>
      </g>
    );
  };

  // shape activo (agrandar)
  const activeShape = (props: any) => {
    const { outerRadius = 0 } = props;
    return (
      <g>
        <Sector {...props} outerRadius={outerRadius + 10} />
        <Sector {...props} outerRadius={outerRadius + 24} innerRadius={outerRadius + 12} />
      </g>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Contenedor responsivo cuadrado */}
      <div style={{ width: "100%", maxWidth: 680, height }}>
        <ResponsiveContainer width="100%" aspect={1}>
          <PieChart margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
            {/* gradientes por slice */}
            <defs>
              {data.map((_, i) => (
                <linearGradient key={i} id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={FROM[i % FROM.length]} />
                  <stop offset="100%" stopColor={TO[i % TO.length]} />
                </linearGradient>
              ))}
            </defs>

            <Tooltip
              cursor={false}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: isDark ? "#fff" : "#0f172a",
              }}
              itemStyle={{ color: isDark ? "#fff" : "#0f172a", fontWeight: "bold", fontSize: 20 }}
              formatter={(v: any, _name: any, p: any) => {
                const pct = total ? Math.round((p.value / total) * 100) : 0;
                return [`${v} (${pct}%)`, p.name];
              }}
            />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ color: isDark ? "#fff" : "#0f172a" }}
              onClick={(e: any) => {
                const name = e?.value as string | undefined;
                if (!name) return;
                setActiveLabel(prev => (prev === name ? null : name));
              }}
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="56%"
              outerRadius="86%"
              isAnimationActive
              activeShape={activeIndex >= 0 ? activeShape : undefined}
              onMouseEnter={(_, idx) => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={(_, idx) => setActiveLabel(data[idx]?.name ?? null)}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={`url(#g-${i})`}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ))}

              {/* etiqueta centrada (total o valor del activo) */}
              <Label content={CenterLabel} position="center" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
