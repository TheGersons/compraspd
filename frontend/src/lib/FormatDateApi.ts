// src/lib/formatDate.ts
export function FormatDateApi(dateString: string | null | undefined): string {
  if (!dateString) return "";

  try {
    const s = String(dateString).trim();
    let date: Date | null = null;

    // ISO: 2025-10-21 o 2025-10-21T00:00:00.000Z
    if (s.includes("T") || s.includes("Z") || /^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(s);
      date = isNaN(d.getTime()) ? null : d;
    }

    // DD/MM/YYYY o DD-MM-YYYY
    if (!date && /^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(s)) {
      const [, dd, mm, yyyy] = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)!;
      const day = Number(dd), month = Number(mm), year = Number(yyyy);
      const d = new Date(year, month - 1, day);
      // validar que no hubo "rollover"
      if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) date = d;
    }

    // DD/MM/YY
    if (!date && /^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
      const [dd, mm, yy] = s.split("/");
      const year = 2000 + Number(yy);
      const month = Number(mm);
      const day = Number(dd);
      const d = new Date(year, month - 1, day);
      if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) date = d;
    }

    // Fallback: intentar parseo nativo
    if (!date) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) date = d;
    }

    if (!date) {
      console.warn(`Fecha inválida: ${dateString}`);
      return String(dateString);
    }

    return date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch (e) {
    console.error(`Error al formatear fecha ${dateString}:`, e);
    return String(dateString);
  }
}
