// pages/Quotes/charts/BarMonthly.tsx
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import useDarkMode from "../../../pages/Quotes/hooks/useDarkMode";

export default function BarMonthly({
  //title = "Volumen mensual",
  series = [{ name: "Cotizaciones", data: [] as number[] }],
  categories = [] as string[],
  height = 220,
}: {
  title?: string;
  series?: { name: string; data: number[] }[];
  categories?: string[];
  height?: number;
}) {
  const isDark = useDarkMode();
  const surface = isDark ? "#171F2F" : "#FFFFFF";           // fondo del chart
  const label   = isDark ? "#C7D2FE" : "#6B7280";            // texto ejes
  const grid    = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";

  const options: ApexOptions = {
    chart: { type: "bar", height, toolbar: { show: false }, background: surface, fontFamily: "Outfit, sans-serif" },
    theme: { mode: isDark ? "dark" : "light" },
    colors: ["#465fff"],
    plotOptions: { bar: { columnWidth: "49%", borderRadius: 5, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories,
      labels: { style: { colors: Array(categories.length).fill(label), fontSize: "14px" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: [label] } } },
    grid: { borderColor: grid, yaxis: { lines: { show: true } } },
    legend: { show: true, position: "top", horizontalAlign: "left", labels: { colors: label } },
    tooltip: { theme: isDark ? "dark" : "light", y: { formatter: (v: number) => `${v}` } },
    fill: { opacity: 1 },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
}
