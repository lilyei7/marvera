import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();

// GET /api/admin/users - Obtener usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = '1', role = 'all', search = '' } = req.query;
    const limit = 10;
    const offset = (parseInt(page as string) - 1) * limit;

    console.log(`👥 [GET /api/admin/users] Página: ${page}, Role: ${role}, Search: "${search}"`);

    // Construir filtros
    const where: any = {};
    
    if (role !== 'all') {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Obtener usuarios
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    console.log(`👥 [GET /api/admin/users] ${users.length} usuarios encontrados de ${total} total`);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page as string),
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [GET /api/admin/users] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/users/stats - Estadísticas de usuarios
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📊 [GET /api/admin/users/stats] Obteniendo estadísticas...');

    const [totalUsers, activeUsers, adminUsers, customerUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      customerUsers
    };

    console.log('📊 [GET /api/admin/users/stats] Estadísticas:', stats);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ [GET /api/admin/users/stats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
