export class ProductoParaAsignarOCDto {
  estadoProductoId: string;
  precio: number;
  comprobanteDescuento: string; // 'no_aplica' or URL/filename
  precioDescuento?: number;
}

export class AprobarYAsignarOCDto {
  ordenCompraId: string;
  productos: ProductoParaAsignarOCDto[];
}
