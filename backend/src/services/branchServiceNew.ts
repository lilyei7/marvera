import prisma from '../lib/prisma';
import { Branch, Prisma } from '@prisma/client';

export type BranchCreateInput = Prisma.BranchCreateInput;
export type BranchUpdateInput = Prisma.BranchUpdateInput;

export class BranchService {
  // Obtener todas las sucursales (para admin)
  static async getAllBranches(): Promise<Branch[]> {
    return prisma.branch.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Obtener solo sucursales activas (para público)
  static async getActiveBranches(): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  // Obtener sucursal por ID
  static async getBranchById(id: number): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { id }
    });
  }

  // Crear nueva sucursal
  static async createBranch(data: BranchCreateInput): Promise<Branch> {
    return prisma.branch.create({
      data
    });
  }

  // Actualizar sucursal
  static async updateBranch(id: number, data: BranchUpdateInput): Promise<Branch | null> {
    try {
      return await prisma.branch.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Registro no encontrado
      }
      throw error;
    }
  }

  // Eliminar sucursal
  static async deleteBranch(id: number): Promise<boolean> {
    try {
      await prisma.branch.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Registro no encontrado
      }
      throw error;
    }
  }

  // Alternar estado activo/inactivo
  static async toggleBranchStatus(id: number): Promise<Branch | null> {
    const branch = await this.getBranchById(id);
    if (!branch) return null;

    return prisma.branch.update({
      where: { id },
      data: { isActive: !branch.isActive }
    });
  }

  // Buscar sucursales por ciudad
  static async getBranchesByCity(city: string): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: {
        city: {
          contains: city
        },
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
  }

  // Buscar sucursales cercanas (por coordenadas)
  static async getNearbyBranches(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 10
  ): Promise<Branch[]> {
    // Para SQLite, hacemos una búsqueda simple por ahora
    // En producción se podría usar PostGIS con PostgreSQL
    const branches = await prisma.branch.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    // Filtrar por distancia usando la fórmula de Haversine
    return branches.filter(branch => {
      if (!branch.latitude || !branch.longitude) return false;
      
      const distance = this.calculateDistance(
        latitude, 
        longitude, 
        branch.latitude, 
        branch.longitude
      );
      
      return distance <= radiusKm;
    });
  }

  // Calcular distancia entre dos puntos (Haversine)
  private static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
