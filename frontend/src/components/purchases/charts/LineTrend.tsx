import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
//import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card/card";
import useDarkMode from "../../../pages/Quotes/hooks/useDarkMode";

export default function LineTrend({
  //title = "Monto mensual (miles)",
  categories,
  values,
  height = 400,
}: { title?: string; categories: string[]; values: number[]; height?: number }) {
  const isDark = useDarkMode();
  const data = useMemo(() => categories.map((c, i) => ({ name: c, value: values[i] ?? 0 })), [categories, values]);

  return (
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaBlueMint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D47A1" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#80DEEA" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#fff' : '#000' }} />
              <YAxis tick={{ fill: isDark ? '#fff' : '#000' }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: isDark ? '#fff' : '#000'   }} formatter={(v: any) => [v, "Monto"]} itemStyle={{fontWeight: 'bold'}} />
              <Area type="monotone" dataKey="value" stroke="#1976D2" strokeWidth={2.5} fill="url(#areaBlueMint)" activeDot={{ r: 5, stroke: "#00BCD4", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
  );
}
