// components/gerencia/DetalleTabla.tsx
import { useState, useMemo } from 'react';
import { DetalleProducto } from '../../types/gerencia.types';

interface DetalleTablaProps {
  productos: DetalleProducto[];
  titulo: string;
}

type AgrupacionType = 'ninguna' | 'cotizacion' | 'proveedor' | 'responsable';

export default function DetalleTabla({ productos, titulo }: DetalleTablaProps) {
  const [agrupacion, setAgrupacion] = useState<AgrupacionType>('ninguna');
  const [ordenPor, setOrdenPor] = useState<'sku' | 'precio' | 'fecha'>('sku');

  // Agrupar productos
  const productosAgrupados = useMemo(() => {
    if (agrupacion === 'ninguna') {
      return { 'Todos los productos': productos };
    }

    const grupos: Record<string, DetalleProducto[]> = {};
    productos.forEach(producto => {
      let clave = '';
      switch (agrupacion) {
        case 'cotizacion':
          clave = producto.cotizacionNombre;
          break;
        case 'proveedor':
          clave = producto.proveedor;
          break;
        case 'responsable':
          clave = producto.responsable;
          break;
      }
      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(producto);
    });

    return grupos;
  }, [productos, agrupacion]);

  // Ordenar productos
  const ordenarProductos = (prods: DetalleProducto[]) => {
    return [...prods].sort((a, b) => {
      switch (ordenPor) {
        case 'sku':
          return a.sku.localeCompare(b.sku);
        case 'precio':
          return (b.precioTotal || 0) - (a.precioTotal || 0);
        case 'fecha':
          return new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime();
        default:
          return 0;
      }
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      warn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
    };
    return badges[estado as keyof typeof badges] || badges.success;
  };

  const formatearMoneda = (valor: number) => {
    return `L ${valor.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {titulo}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {productos.length} productos
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Agrupación */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Agrupar por:
            </label>
            <select
              value={agrupacion}
              onChange={(e) => setAgrupacion(e.target.value as AgrupacionType)}
              className="rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="ninguna">Sin agrupar</option>
              <option value="cotizacion">Por Cotización</option>
              <option value="proveedor">Por Proveedor</option>
              <option value="responsable">Por Responsable</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Ordenar por:
            </label>
            <select
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value as 'sku' | 'precio' | 'fecha')}
              className="rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="sku">SKU</option>
              <option value="precio">Precio (mayor primero)</option>
              <option value="fecha">Fecha solicitud</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tablas por grupo */}
      {Object.entries(productosAgrupados).map(([nombreGrupo, productosGrupo]) => {
        const productosOrdenados = ordenarProductos(productosGrupo);
        const totalGrupo = productosGrupo.reduce((sum, p) => sum + (p.precioTotal || 0), 0);

        return (
          <div key={nombreGrupo} className="space-y-2">
            {agrupacion !== 'ninguna' && (
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                  {nombreGrupo}
                </h4>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {productosGrupo.length} productos • {formatearMoneda(totalGrupo)}
                </span>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                      Cant.
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Cotización
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Proveedor
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Responsable
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Proceso
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                      P. Unit.
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      F. Solicitud
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      F. Estimada
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {productosOrdenados.map((producto) => (
                    <tr
                      key={producto.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {producto.sku}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        <div className="max-w-xs">{producto.descripcion}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {producto.cantidad}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {producto.cotizacionNombre}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {producto.proveedor}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {producto.responsable}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {producto.proceso}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getEstadoBadge(
                            producto.estado
                          )}`}
                        >
                          {producto.estado === 'success'
                            ? 'Normal'
                            : producto.estado === 'warn'
                            ? 'Atención'
                            : 'Crítico'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {producto.precioUnitario ? formatearMoneda(producto.precioUnitario) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {producto.precioTotal ? formatearMoneda(producto.precioTotal) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {new Date(producto.fechaSolicitud).toLocaleDateString('es-HN')}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {new Date(producto.fechaEstimada).toLocaleDateString('es-HN')}
                        {producto.diasRetraso && (
                          <span className="ml-2 font-medium text-rose-600 dark:text-rose-400">
                            (+{producto.diasRetraso}d)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}