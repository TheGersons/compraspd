// src/types/jspdf-autotable.d.ts
import "jspdf";
declare module "jspdf-autotable" {
  import jsPDF from "jspdf";
  export interface AutoTableOptions { [key: string]: any }
  export default function autoTable(doc: jsPDF, options: AutoTableOptions): jsPDF;
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY?: number };
  }
}
