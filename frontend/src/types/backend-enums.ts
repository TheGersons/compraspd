// Define el Enum de categorías que viene de la DB/Backend (en mayúsculas)
export enum RequestCategory {
    SUMINISTROS = 'SUMINISTROS',
    LICITACIONES = 'LICITACIONES',
    INVENTARIOS = 'INVENTARIOS',
    PROYECTOS = 'PROYECTOS',
}

// Define el Enum de tipos de adquisición (procurement)
export enum ProcurementType {
    NATIONAL = 'NATIONAL',
    INTERNATIONAL = 'INTERNATIONAL',
}

// Define el Enum de tipos de entrega (deliveryType)
export enum DeliveryType {
    WAREHOUSE = 'WAREHOUSE', // Almacen
    PROJECT = 'PROJECT',     // Proyecto
}

// Opcional: Tipo base para una línea de ítem de PR
export interface PRItemCreateDto {
    sku: string;
    description: string;
    quantity: number;
    unit: string;
    extraSpecs?: string | null;
}

// Opcional: Tipo DTO simplificado para el cuerpo de la petición POST
export interface CreatePurchaseRequestDto {
    requesterId: string; 
    procurement: ProcurementType;
    requestCategory: RequestCategory; // Usamos el nuevo enum
    reference: string;
    clientId: string | null; 
    quoteDeadline: string; 
    dueDate: string | null;
    deliveryType: DeliveryType;
    warehouseId: string | null;
    projectId: string | null;
    comment: string | null;
    title: string;
    description: string;
    items: PRItemCreateDto[];
}