import { useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import KpiCard from "../../components/quotes/KpiCard";
import BarMonthly from "../../components/purchases/charts/BarMonthly";
import LineTrend from "../../components/purchases/charts/LineTrend";
import { amountPurchasesPerMonth, purchaseMonths, purchases, purchasesByStatus, purchasesPerMonth } from "../../data/purchase";
import DonutStatus from "../../components/purchases/charts/DonusStatus";
import PurchasesTable from "../../components/purchases/PurchasesTable";



export default function Shopping() {
    const { total, totalUSD, totalHNL, pendientes, delta } = useMemo(() => {
        const total = purchases.length;
        const totalUSD = purchases.filter(p => p.currency === "USD").reduce((a, b) => a + b.amount, 0);
        const totalHNL = purchases.filter(p => p.currency === "HNL").reduce((a, b) => a + b.amount, 0);
        const pendientes = purchases.filter(p => p.status === "pendiente").length;

        const m = new Date().getMonth();
        const cur = purchasesPerMonth[m] ?? 0;
        const prev = purchasesPerMonth[(m + 11) % 12] ?? 0;
        const delta = prev === 0 ? 100 : Math.round(((cur - prev) / prev) * 100);
        return { total, totalUSD, totalHNL, pendientes, delta };

        
    }, []);

    

    return (
        <>
            <PageMeta title="Compras · Resumen" description="Resumen de compras" />

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Compras totales" value={total} hint={`Δ ${delta}% vs mes anterior`} tone={delta >= 0 ? "success" : "danger"} />
                <KpiCard title="Monto USD" value={`USD ${totalUSD.toLocaleString()}`} hint="Suma de órdenes" tone="brand" />
                <KpiCard title="Monto HNL" value={`HNL ${totalHNL.toLocaleString()}`} hint="Suma de órdenes" />
                <KpiCard title="Pendientes" value={pendientes} tone="warn" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <ComponentCard title="Órdenes por mes">
                    <BarMonthly categories={purchaseMonths} values={purchasesPerMonth} />
                </ComponentCard>

                <ComponentCard title="Monto mensual (miles)">
                    <LineTrend categories={purchaseMonths} values={amountPurchasesPerMonth} />
                </ComponentCard>

                <ComponentCard title="Estados de compra">
                    <DonutStatus
                        labels={Object.keys(purchasesByStatus)}
                        values={Object.values(purchasesByStatus)}
                        height={420}
                    />

                </ComponentCard>
            </div>

            {/* Tabla */}
            <div className="mt-4">
                <ComponentCard title="Compras recientes" desc="Listado resumido de órdenes">
                    <PurchasesTable data={purchases} />
                </ComponentCard>
            </div>
        </>
    );
}
