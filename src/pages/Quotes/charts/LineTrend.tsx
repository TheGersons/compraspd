// pages/Quotes/charts/LineTrend.tsx
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import useDarkMode from "../hooks/useDarkMode";

export default function LineTrend({
  series,
  categories,
  height = 280,
  
  //title = "Tendencia",
}: {
  series: { name: string; data: number[] }[]; categories: string[]; height?: number; title?: string;
}) {
  const isDark = useDarkMode();
  const surface = isDark ? "#101828" : "#FFFFFF";
  const label   = isDark ? "#C7D2FE" : "#6B7280";
  const grid    = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";

  const options: ApexOptions = {
    chart: { type: "area", height, toolbar: { show: false }, background: surface, fontFamily: "Outfit, sans-serif" },
    theme: { mode: isDark ? "dark" : "light" },
    legend: { show: false },
    colors: ["#465FFF", "#9CB9FF"],
    stroke: { curve: "straight", width: [2, 2] },
    fill: { type: "gradient", gradient: { shade: isDark ? "dark" : "light", opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: { borderColor: grid, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    xaxis: {
      type: "category",
      categories,
      labels: { style: { colors: Array(categories.length).fill(label) } },
      axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false },
    },
    yaxis: { labels: { style: { colors: [label], fontSize: "12px" } } },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  return <Chart options={options} series={series} type="area" height={height} />;
}
