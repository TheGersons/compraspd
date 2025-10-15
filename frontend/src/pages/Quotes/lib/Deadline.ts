import { FormatDateApi } from "../../../lib/FormatDateApi";


// Función auxiliar para crear la fecha objetivo normalizada a medianoche local
const getNormalizedDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    let day, month, year;

    // Caso: Formato DD/MM/YYYY o DD/MM/YY (ej: 28/10/2025 o 28/10/25)
    if (dateString.match(/^\d{2}\/\d{2}\/\d{2,4}$/)) {
        [day, month, year] = dateString.split('/');
        
        // Convertir año de 2 dígitos a 4 dígitos (ej: 25 -> 2025)
        const fullYear = year.length === 2 ? `20${year}` : year;

        // 🚨 CLAVE: Crear la fecha usando componentes LOCALES (YYYY, MM-1, DD)
        // Esto evita que JavaScript la interprete como UTC, que es lo que causa el error de un día.
        const date = new Date(Number(fullYear), Number(month) - 1, Number(day));

        return isNaN(date.getTime()) ? null : date;
    } 
    
    // Caso: Formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ)
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        
        // Normalizamos la hora de la fecha ISO a medianoche local, si es solo una fecha (sin hora).
        date.setHours(0, 0, 0, 0); 
        return date;
    } catch {
        return null;
    }
};


// Función auxiliar para calcular diferencia de días
const calculateDaysDifference = (dateString: string | null | undefined): number => {
    const targetDate = getNormalizedDate(dateString || '');
    if (!targetDate) return 0;

    // 1. Normalizar HOY a medianoche LOCAL
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Obtener la diferencia de tiempo en milisegundos
    const diffTime = targetDate.getTime() - today.getTime();

    // 3. Convertir milisegundos a días y redondear
    // Usamos round() para manejar correctamente los saltos de hora/DTS, 
    // pero para fechas que ya están normalizadas a 00:00:00, floor() o round() funcionan.
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

    return diffDays;
};

// ... el resto de tu código getDeadlineMessage

// Función principal
const getDeadlineMessage = (quoteDeadline: string | null | undefined): string => {
  if (!quoteDeadline) return 'Sin fecha de vencimiento';

  const diffDays = calculateDaysDifference(quoteDeadline);
  const formattedDate = FormatDateApi(quoteDeadline);

  if (diffDays < 0) {
    return `Vence ${formattedDate} • Atrasada (${Math.abs(diffDays)} días)`;
  }

  if (diffDays === 0) {
    return `Vence hoy (${formattedDate})`;
  }

  return `Vence ${formattedDate} • ${diffDays} día${diffDays === 1 ? '' : 's'} restante${diffDays === 1 ? '' : 's'}`;
};

export default getDeadlineMessage;