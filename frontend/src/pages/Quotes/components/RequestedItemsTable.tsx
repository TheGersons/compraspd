// components/RequestedItemsTable.tsx

// Define la interfaz Item, asumiendo los campos que usas
interface RequestItem {
    id?: string;
    sku?: string;
    description: string;
    quantity: number;
    unit: string;
    extraSpecs?: string | null; // Usas JSON.stringify, así que es un objeto o null/undefined
}

// Asumo que tienes un componente ComponentCard para el envoltorio

import React from 'react';
import ComponentCard from '../../../components/common/ComponentCard';

interface RequestedItemsTableProps {
    items: RequestItem[];
}

export const RequestedItemsTable: React.FC<RequestedItemsTableProps> = ({ items }) => {

    // Si no hay ítems, no renderizamos nada
    if (items.length === 0) {
        return null;
    }

    return (
        // ✅ Mantienes ComponentCard y toda la estructura interna de la tabla
        <ComponentCard
            title="Productos Solicitados"
            desc={`${items.length} producto${items.length !== 1 ? 's' : ''}`}
        >
            <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-sm table-auto">
                    <thead className="sticky top-0 bg-white dark:bg-[#101828] z-10">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                                SKU
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                                Descripción
                            </th>
                            <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                                Cantidad
                            </th>
                            <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                                Unidad
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                                Comentarios
                            </th>
                        </tr>
                    </thead>
                    <tbody className="align-top">
                        {items.map((item, index) => (
                            <tr
                                key={item.id || index}
                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                            >
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                                    {item.sku || '-'}
                                </td>
                                <td className="py-3 px-3 text-gray-800 dark:text-gray-200">
                                    {item.description}
                                </td>
                                <td className="py-3 px-3 text-center font-medium text-gray-800 dark:text-gray-200">
                                    {item.quantity}
                                </td>
                                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                                    {item.unit}
                                </td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-200">
                                    {
                                        item.extraSpecs || ''
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ComponentCard>
    );
};