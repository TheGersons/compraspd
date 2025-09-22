// src/utils/export.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QuoteHistory }  from "../types/quotes";


const fmtDate = (iso?: string) =>
    iso ? new Intl.DateTimeFormat("es-HN", { year: "2-digit", month: "2-digit", day: "2-digit" }).format(new Date(iso)) : "";

const money = (v?: number, c = "USD") => (v == null ? "" : `${c} ${v.toLocaleString()}`);

/* -------- Excel (XLSX) -------- */
export function exportHistoryToExcel(rows: QuoteHistory[], filename = `historial_${Date.now()}.xlsx`) {
    // Hoja 1: Resumen
    const summary = rows.map(r => ({
        ID: r.id,
        Referencia: r.reference,
        Solicitante: r.requester,
        Asignado: r.assignedTo ?? "",
        Tipo: r.requestType,
        Alcance: r.scope,
        Creada: fmtDate(r.createdAt),
        Cerrada: fmtDate(r.closedAt),
        Monto: r.amount ?? "",
        Moneda: r.currency ?? "USD",
        Estado: r.status,
        Notas: r.notes ?? "",
    }));

    // Hoja 2: Ítems (detalle expandido)
    const items = rows.flatMap(r =>
        (r.items ?? []).map(it => ({
            Cotización: r.id,
            Referencia: r.reference,
            SKU: it.sku,
            Descripción: it.description,
            Cantidad: it.quantity,
            "Precio unit.": money(it.unitPrice, it.currency ?? r.currency ?? "USD"),
            Importe: money(it.quantity * it.unitPrice, it.currency ?? r.currency ?? "USD"),
            Solicitante: r.requester,
            Asignado: r.assignedTo ?? "",
            Estado: r.status,
        })),
    );

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    const wsItems = XLSX.utils.json_to_sheet(items);

    // Ajuste de ancho aproximado
    const setCols = (ws: XLSX.WorkSheet, widths: number[]) => {
        (ws["!cols"] = widths.map(w => ({ wch: w })));
    };
    setCols(wsSummary, [12, 16, 14, 14, 12, 12, 10, 10, 12, 8, 12, 24]);
    setCols(wsItems, [14, 16, 14, 28, 10, 14, 14, 14, 14, 12]);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsItems, "Items");
    XLSX.writeFile(wb, filename);
}

/* -------- PDF (jsPDF + autoTable) -------- */
export function exportHistoryToPDF(rows: QuoteHistory[], filename = `historial_${Date.now()}.pdf`) {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

    // Portada ligera
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 100, "F");
    doc.setTextColor(18, 18, 18);
    doc.setFontSize(18);
    doc.text("Historial de cotizaciones", 40, 55);
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text(`Generado: ${fmtDate(new Date().toISOString())}`, 40, 75);

    // Tabla Resumen
    const headSummary = [
        [
            "ID",
            "Referencia",
            "Solicitante",
            "Asignado",
            "Tipo",
            "Alcance",
            "Creada",
            "Cerrada",
            "Monto",
            "Moneda",
            "Estado",
        ],
    ];
    const bodySummary = rows.map(r => [
        r.id,
        r.reference,
        r.requester,
        r.assignedTo ?? "",
        r.requestType,
        r.scope,
        fmtDate(r.createdAt),
        fmtDate(r.closedAt),
        r.amount?.toLocaleString() ?? "",
        r.currency ?? "USD",
        r.status,
    ]);

    autoTable(doc, {
        startY: 120,
        head: headSummary,
        body: bodySummary,
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // verde
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 40, right: 40 },
        tableWidth: "auto",
    });

    // Saltos por items
    rows.forEach((r) => {
        const its = r.items ?? [];
        if (its.length === 0) return;

        doc.addPage("landscape");

        // Encabezado por cotización
        doc.setFillColor(239, 246, 255);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 86, "F");
        doc.setTextColor(18, 18, 18);
        doc.setFontSize(14);
        doc.text(`Detalle de ítems — ${r.id} (${r.reference})`, 40, 48);
        doc.setFontSize(10);
        doc.setTextColor(90);
        doc.text(
            `Solicitante: ${r.requester}   •   Asignado: ${r.assignedTo ?? "—"}   •   Estado: ${r.status}`,
            40,
            66
        );

        const head = [["SKU", "Descripción", "Cant.", "P. unit", "Importe"]];
        const body = its.map(it => [
            it.sku,
            it.description,
            String(it.quantity),
            money(it.unitPrice, it.currency ?? r.currency ?? "USD"),
            money(it.quantity * it.unitPrice, it.currency ?? r.currency ?? "USD"),
        ]);

        autoTable(doc, {
            startY: 110,
            head,
            body,
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [246, 253, 249] },
            margin: { left: 40, right: 40 },
            tableWidth: "auto",
        });

        // 👇 Recupera la última tabla con cast para TypeScript
        const last = (doc as any).lastAutoTable;
        const y = last?.finalY ? last.finalY + 20 : 130;
        const total = its.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);

        doc.setFontSize(11);
        doc.setTextColor(18, 18, 18);
        doc.text(`Total: ${money(total, r.currency ?? "USD")}`, 40, y);
    });

    doc.save(filename);
}
