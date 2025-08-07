import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// GET /api/offers/featured - Obtener ofertas destacadas (público)
router.get('/offers/featured', async (req, res) => {
  try {
    console.log('🌟 Featured offers requested');
    const offers = await prisma.specialOffer.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ ${offers.length} ofertas destacadas encontradas`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error al obtener ofertas destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/offers - Obtener todas las ofertas activas (público)
router.get('/offers', async (req, res) => {
  try {
    console.log('🎁 Special offers requested');
    const offers = await prisma.specialOffer.findMany({
      where: {
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ ${offers.length} ofertas encontradas`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error al obtener ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
