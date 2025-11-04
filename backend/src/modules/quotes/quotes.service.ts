// quotes/quotes.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(filters: any) {
    const where: any = {};

    // Filtro de período
    if (filters.period) {
      const daysMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '180d': 180,
        '365d': 365,
      };
      const days = daysMap[filters.period] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      where.createdAt = { gte: startDate };
    }

    // Filtro de estado
    if (filters.status) {
      where.status = filters.status.toUpperCase();
    }

    // Filtro de categoría
    if (filters.category) {
      where.requestCategory = filters.category.toUpperCase();
    }

    // Filtro de tipo de compra
    if (filters.procurement) {
      where.procurement = filters.procurement.toUpperCase();
    }

    // Filtro de proyecto
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    // Filtro de búsqueda
    if (filters.search) {
      where.OR = [
        { reference: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { finalClient: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const requests = await this.prisma.purchaseRequest.findMany({
      where,
      include: {
        requester: {
          select: { fullName: true, email: true }
        },
        project: {
          select: { id: true, name: true, code: true }
        },
        department: {
          select: { name: true }
        },
        items: {
          select : { quantity: true }
        },
        assignments: {
          //where: { followStatus: { not: 'COMPLETED' } },
          include: {
            assignedTo: {
              select: { id: true, fullName: true }
            }
          },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filtro por asignado (después de la consulta porque es una relación)
    let filteredRequests = requests;
    if (filters.assignedTo) {
      filteredRequests = requests.filter(req => 
        req.assignments[0]?.assignedTo?.id === filters.assignedTo
      );
    }

    return { requests: filteredRequests };
  }

  async getStats(period: string) {
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365,
    };
    const days = daysMap[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener todas las solicitudes del período
    const requests = await this.prisma.purchaseRequest.findMany({
      where: {
        createdAt: { gte: startDate }
      },
    });

    // Agrupar por mes
    const monthlyData: Record<string, { count: number; totalAmount: number; estimatedRevenue: number }> = {};
    
    requests.forEach(req => {
      const monthKey = new Date(req.createdAt).toLocaleDateString('es-HN', { 
        month: 'short',
        year: 'numeric' 
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, totalAmount: 0, estimatedRevenue: 0 };
      }

      monthlyData[monthKey].count++;
      // TODO: Sumar montos reales cuando existan
      monthlyData[monthKey].totalAmount += 50000; // Placeholder
      monthlyData[monthKey].estimatedRevenue += 5000; // Placeholder
    });

    const monthlyStats = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));

    return { monthlyStats };
  }
}