// hooks/useFilteredRequests.ts
import { useMemo } from 'react';
import { AssignmentRequest } from '../Assignment';        // adjust the relative path
import type { QuoteFilters } from '../../../components/quotes/filters'
import { daysUntil, inRangeYmd, norm } from './utils';    // import helpers

export const useFilteredRequests = (
  requests: AssignmentRequest[],
  filters: QuoteFilters
) => {
  return useMemo(() => {
    const f = filters || {};
    const horizon =
      f.preset === '7d' ? 7 :
      f.preset === '30d' ? 30 :
      f.preset === '90d' ? 90 :
      null;

    const matchEstado = (r: AssignmentRequest) => {
      const d = daysUntil(r.quoteDeadlineISO);
      const fs = (r.followStatus || '').toUpperCase();
      switch (f.estado) {
        case 'vencidas':   return d < 0;
        case 'pendientes': return !r.assignedTo;
        case 'en_revision':return ['REVIEW','IN_REVIEW','UNDER_REVIEW'].includes(fs);
        case 'cerradas':   return fs === 'DONE' || fs === 'CLOSED' || fs === 'COMPLETED' || r.progress === 100;
        case 'abiertas':   return !(fs === 'DONE' || fs === 'CLOSED' || fs === 'COMPLETED');
        default:           return true;
      }
    };

    const matchPreset = (r: AssignmentRequest) => {
      if (horizon === null) return true;
      return daysUntil(r.quoteDeadlineISO) <= horizon;
    };

    const matchCustomRange = (r: AssignmentRequest) => {
      if (f.preset !== 'custom') return true;
      return inRangeYmd(r.quoteDeadlineISO, f.range?.start, f.range?.end);
    };

    const matchTipoSolicitud = (r: AssignmentRequest) =>
      f.tipoSolicitud && f.tipoSolicitud !== 'todas'
        ? norm(r.requestCategory) === norm(f.tipoSolicitud)
        : true;

    const matchTipoCompra = (r: AssignmentRequest) => {
      if (!f.tipoCompra || f.tipoCompra === 'todas') return true;
      const v = norm(String(r.procuremet));
      return f.tipoCompra === 'nacional' ? v.startsWith('nacional') : v.startsWith('internacional');
    };

    const matchProyecto = (r: AssignmentRequest) =>
      f.proyectoId && f.proyectoId !== 'todos' ? r.projectId === f.proyectoId : true;

    const matchAsignado = (r: AssignmentRequest) => {
      if (!f.asignadoA || f.asignadoA === 'todos') return true;
      if (f.asignadoA === 'sin_asignar') return !r.assignedToId;
      return r.assignedToId === f.asignadoA;
    };

    const matchOrigen = () => true; // no hay campo en datos actuales

    const matchSearch = (r: AssignmentRequest) => {
      const q = norm(f.q);
      if (!q) return true;
      const hay = [
        r.id, r.reference, r.finalClient, r.requesterName, r.description,
        r.assignedTo, r.quoteDeadline, r.createdAt,
        ...(r.items || []).flatMap(it => [it.sku, it.description])
      ]
        .filter(Boolean)
        .map(x => norm(String(x)))
        .some(t => t.includes(q));
      return hay;
    };

    return requests
      .filter(matchEstado)
      .filter(matchPreset)
      .filter(matchCustomRange)
      .filter(matchTipoSolicitud)
      .filter(matchTipoCompra)
      .filter(matchProyecto)
      .filter(matchAsignado)
      .filter(matchOrigen)
      .filter(matchSearch);
  }, [requests, filters]);
};
