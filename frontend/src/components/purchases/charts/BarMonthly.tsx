import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
//import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card/card";
import useDarkMode from "../../../pages/Quotes/hooks/useDarkMode";

export default function BarMonthly({
  //title = "Órdenes por mes",
  categories,
  values,
  height = 400,
}: { title?: string; categories: string[]; values: number[]; height?: number }) {
  const isDark = useDarkMode();
  const data = useMemo(() => categories.map((c, i) => ({ name: c, value: values[i] ?? 0 })), [categories, values]);

  return (
        <div style={{ width: "100%", height }}> 
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={data} barSize={26}>
              <defs>
                <linearGradient id="barBlueMint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1976D2" />
                  <stop offset="100%" stopColor="#26C6DA" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#fff' : '#000' }} />
              <YAxis tick={{ fill: isDark ? '#fff' : '#000' }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: isDark ? '#ffffffff' : '#000' }} formatter={(value) => [value, "Órdenes"]} itemStyle={{ color: isDark ? '#3219d2ff' : '#3219d2ff' , fontWeight: 'bold' }} />
              <Bar dataKey="value" stroke="#1976D2" fill="url(#barBlueMint)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
  );
}
