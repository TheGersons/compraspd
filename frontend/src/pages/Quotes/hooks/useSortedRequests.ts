// hooks/useSortedRequests.ts
export const useSortedRequests = (requests: AssignmentRequest[], ordenar?: QuoteFilters["ordenar"]) => {
  return useMemo(() => {
    const arr = [...requests];
    const by = ordenar || "recientes";

    const byCreated = (r: AssignmentRequest) => parseMs(r.createdAt);
    const byDeadline = (r: AssignmentRequest) => parseMs(r.quoteDeadlineISO);

    if (by === "antiguas") arr.sort((a,b) => byCreated(a) - byCreated(b));
    else if (by === "vence_pronto") arr.sort((a,b) => byDeadline(a) - byDeadline(b));
    else if (by === "monto_desc" || by === "monto_asc") {
      // si agregas monto, reemplaza compute con el real
      const compute = (r: AssignmentRequest) => 0;
      arr.sort((a,b) => (by === "monto_desc" ? -1 : 1) * (compute(a) - compute(b)));
    } else { // recientes
      arr.sort((a,b) => byCreated(b) - byCreated(a));
    }
    return arr;
  }, [requests, ordenar]);
};
