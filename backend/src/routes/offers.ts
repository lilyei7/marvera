import express from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configuración de multer para subida de imágenes de ofertas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.NODE_ENV === 'production' 
      ? '/var/www/marvera/uploads/offers'
      : './uploads/offers';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, 'offer_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('Solo se permiten archivos de imagen') as any;
      cb(error, false);
    }
  }
});

// GET /api/offers - Obtener todas las ofertas activas (público)
router.get('/', async (req, res) => {
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

// GET /api/offers/featured - Obtener ofertas destacadas (público)
router.get('/featured', async (req, res) => {
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

// GET /admin/offers - Obtener todas las ofertas (admin)
router.get('/admin', authenticateToken, async (req: any, res) => {
  try {
    console.log('🔧 Admin offers requested');
    
    // Verificar que el usuario sea admin o super admin
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }
    
    const offers = await prisma.specialOffer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ ${offers.length} ofertas encontradas en admin`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en admin offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    });
  }
});

// POST /admin/upload-image - Subir imagen de oferta (admin)
router.post('/admin/upload-image', authenticateToken, upload.single('image'), (req: any, res) => {
  try {
    // Verificar que el usuario sea admin o super admin
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    const imageUrl = `/uploads/offers/${req.file.filename}`;
    console.log('✅ Offer image uploaded:', imageUrl);

    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida exitosamente'
    });
  } catch (error) {
    console.error('❌ Error uploading offer image:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al subir la imagen'
    });
  }
});

// POST /admin - Crear nueva oferta (admin)
router.post('/admin', authenticateToken, async (req: any, res) => {
  try {
    console.log('📝 Creating offer:', req.body);
    
    // Verificar que el usuario sea admin o super admin
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }
    
    const {
      title,
      description,
      originalPrice,
      discountPrice,
      discountPercent,
      imageUrl,
      backgroundColor,
      isActive,
      isFeatured,
      validUntil,
      productIds,
      maxRedemptions
    } = req.body;

    // Validar campos requeridos
    if (!title || !description || !originalPrice || !discountPrice) {
      return res.status(400).json({ 
        success: false,
        message: 'Los campos título, descripción, precio original y precio con descuento son requeridos' 
      });
    }

    const offerData = {
      title,
      description,
      originalPrice: parseFloat(originalPrice),
      discountPrice: parseFloat(discountPrice),
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      imageUrl: imageUrl || null,
      backgroundColor: backgroundColor || '#1E3A8A',
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      validUntil: validUntil ? new Date(validUntil) : null,
      productIds: productIds ? JSON.stringify(productIds) : null,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null
    };

    const offer = await prisma.specialOffer.create({
      data: offerData
    });

    console.log('✅ Oferta creada:', offer.title);
    res.status(201).json({
      success: true,
      data: offer,
      message: 'Oferta creada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al crear oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /admin/:id - Actualizar oferta existente (admin)
router.put('/admin/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    console.log('📝 Updating offer:', id, updateData);
    
    // Verificar que el usuario sea admin o super admin
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }
    
    // Convertir tipos si es necesario
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.discountPercent) updateData.discountPercent = parseFloat(updateData.discountPercent);
    if (updateData.maxRedemptions) updateData.maxRedemptions = parseInt(updateData.maxRedemptions);
    if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);
    if (updateData.productIds) updateData.productIds = JSON.stringify(updateData.productIds);

    const offer = await prisma.specialOffer.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    console.log('✅ Oferta actualizada:', offer.title);
    res.json({
      success: true,
      data: offer,
      message: 'Oferta actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al actualizar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /admin/:id - Eliminar oferta (admin)
router.delete('/admin/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting offer:', id);

    // Verificar que el usuario sea admin o super admin
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    await prisma.specialOffer.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Oferta eliminada:', id);
    res.json({
      success: true,
      message: 'Oferta eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
