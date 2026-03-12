import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationsService {
  // Lista temporal de almacenes hasta que se decida implementar en base de datos
  private readonly warehouses = [
    { id: 'ALM-001', name: 'Almacén Central TGU', type: 'PRINCIPAL' },
    { id: 'ALM-002', name: 'Bodega Zona Norte SPS', type: 'SECUNDARIA' },
    { id: 'ALM-003', name: 'Almacén Sur Choluteca', type: 'SECUNDARIA' },
  ];

  getWarehouses() {
    return this.warehouses;
  }
}
