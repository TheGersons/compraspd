// Define esto en el frontend, por ejemplo: src/types/quotes.ts

// Tipos para las relaciones incluidas en la consulta de Prisma
interface Requester {
  fullName: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Department {
  name: string;
}

interface Assignment {
  // Solo devolvemos assignedTo, pero podemos agregar más si es necesario
  assignedTo: {
    id: string;
    fullName: string;
  };
  // El servicio filtra por followStatus, pero este campo está implícito
  // followStatus: string; 
}

// 🛑 El tipo principal que necesitas para el .map()
export interface Quote { 
  // Propiedades directas de PurchaseRequest (deben estar tipadas según tu schema de Prisma)
  id: string;
  reference: string;
  title: string;
  status: string; // Este es el campo que estás traduciendo
  createdAt: Date; // O string, si no lo parseas
  // ... (otros campos directos)
  
  // Relaciones incluidas:
  requester: Requester;
  project: Project;
  department: Department;
  assignments: Assignment[]; // Es un array porque es un 'findMany', aunque tomas solo 1
}