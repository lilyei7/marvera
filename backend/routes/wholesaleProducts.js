const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../src/middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/wholesale');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'wholesale-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// GET /api/wholesale-products - Obtener todos los productos de mayoreo
router.get('/', async (req, res) => {
  try {
    const products = await prisma.wholesaleProduct.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar los datos para el frontend
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.pricePerBox,
      unitsPerBox: product.unitsPerBox,
      unitType: product.unitType,
      category: product.category?.name || 'Sin categoría',
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: product.stock,
      minimumOrder: product.minimumOrder,
      imageUrl: product.images || '/images/default-wholesale.jpg',
      isFeatured: product.isFeatured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    console.log('📦 Productos de mayoreo obtenidos:', transformedProducts.length);
    res.json(transformedProducts);
  } catch (error) {
    console.error('❌ Error al obtener productos de mayoreo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/wholesale-products/:id - Obtener producto de mayoreo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.wholesaleProduct.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto de mayoreo no encontrado' });
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.pricePerBox,
      unitsPerBox: product.unitsPerBox,
      unitType: product.unitType,
      category: product.category?.name || 'Sin categoría',
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: product.stock,
      minimumOrder: product.minimumOrder,
      imageUrl: product.images || '/images/default-wholesale.jpg',
      isFeatured: product.isFeatured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    console.log('📦 Producto de mayoreo obtenido:', transformedProduct.name);
    res.json(transformedProduct);
  } catch (error) {
    console.error('❌ Error al obtener producto de mayoreo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/admin/wholesale-products - Obtener todos los productos de mayoreo (solo admin)
router.get('/admin/all', auth.authenticateToken, async (req, res) => {
  try {
    // En desarrollo, establecer usuario admin si no existe
    if (!req.user) {
      req.user = {
        id: 1,
        email: 'admin@marvera.com',
        firstName: 'ADMIN',
        lastName: 'MarVera',
        role: 'ADMIN'
      };
    }
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const products = await prisma.wholesaleProduct.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar los datos para el frontend admin
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.pricePerBox,
      unitsPerBox: product.unitsPerBox,
      unitType: product.unitType,
      category: product.category?.name || 'Sin categoría',
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: product.stock,
      minimumOrder: product.minimumOrder,
      imageUrl: product.images ? JSON.parse(product.images) : ['/images/default-wholesale.jpg'],
      isFeatured: product.isFeatured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    console.log('📦 Productos de mayoreo admin obtenidos:', transformedProducts.length);
    res.json(transformedProducts);
  } catch (error) {
    console.error('❌ Error al obtener productos de mayoreo admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/admin/wholesale-products - Crear nuevo producto de mayoreo (solo admin)
router.post('/admin/create', auth.authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Verificar req.user y que sea admin
    if (!req.user) {
      // En desarrollo, crear usuario admin temporal
      req.user = {
        id: 1,
        email: 'admin@marvera.com',
        role: 'ADMIN'
      };
    }
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const {
      name,
      description,
      pricePerBox,
      unitsPerBox,
      unitType,
      categoryId,
      stock,
      minimumOrder,
      isFeatured
    } = req.body;

    // Validaciones
    if (!name || !pricePerBox || !unitsPerBox || !unitType) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
        });
      }
      return res.status(400).json({ message: 'Nombre, precio por caja, unidades por caja y tipo de unidad son requeridos' });
    }

    // Procesar imagen
    let imagePath = '/images/default-wholesale.jpg';
    if (req.file) {
      imagePath = `/uploads/wholesale/${req.file.filename}`;
    }

    // Crear el producto de mayoreo
    const product = await prisma.wholesaleProduct.create({
      data: {
        name,
        description: description || '',
        pricePerBox: parseFloat(pricePerBox),
        unitsPerBox: parseInt(unitsPerBox),
        unitType: unitType || 'kg',
        categoryId: categoryId ? parseInt(categoryId) : null,
        stock: stock ? parseInt(stock) : 0,
        minimumOrder: minimumOrder ? parseInt(minimumOrder) : 1,
        images: JSON.stringify([imagePath]),
        isFeatured: isFeatured === 'true' || isFeatured === true
      },
      include: {
        category: true
      }
    });

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.pricePerBox,
      unitsPerBox: product.unitsPerBox,
      unitType: product.unitType,
      category: product.category?.name || 'Sin categoría',
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: product.stock,
      minimumOrder: product.minimumOrder,
      imageUrl: product.images,
      isFeatured: product.isFeatured
    };

    console.log('✅ Producto de mayoreo creado:', product.name);
    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('❌ Error al crear producto de mayoreo:', error);
    
    // Si hay error, eliminar archivo subido
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error al eliminar archivo:', err);
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/admin/wholesale-products/:id - Actualizar producto de mayoreo (solo admin)
router.put('/admin/:id', auth.authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Verificar req.user y que sea admin
    if (!req.user) {
      // En desarrollo, crear usuario admin temporal
      req.user = {
        id: 1,
        email: 'admin@marvera.com',
        role: 'ADMIN'
      };
    }
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const { id } = req.params;
    const {
      name,
      description,
      pricePerBox,
      unitsPerBox,
      unitType,
      categoryId,
      stock,
      minimumOrder,
      isFeatured
    } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.wholesaleProduct.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
        });
      }
      return res.status(404).json({ message: 'Producto de mayoreo no encontrado' });
    }

    // Preparar datos de actualización
    const updateData = {
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      pricePerBox: pricePerBox ? parseFloat(pricePerBox) : existingProduct.pricePerBox,
      unitsPerBox: unitsPerBox ? parseInt(unitsPerBox) : existingProduct.unitsPerBox,
      unitType: unitType || existingProduct.unitType,
      categoryId: categoryId ? parseInt(categoryId) : existingProduct.categoryId,
      stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
      minimumOrder: minimumOrder !== undefined ? parseInt(minimumOrder) : existingProduct.minimumOrder,
      isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : existingProduct.isFeatured
    };

    // Procesar nueva imagen si se subió
    if (req.file) {
      const newImagePath = `/uploads/wholesale/${req.file.filename}`;
      updateData.images = JSON.stringify([newImagePath]);
      
      // Eliminar imagen anterior si existe
      if (existingProduct.images) {
        try {
          const oldImages = JSON.parse(existingProduct.images);
          oldImages.forEach(oldImagePath => {
            if (oldImagePath.startsWith('/uploads/')) {
              const fullPath = path.join(__dirname, '../../', oldImagePath);
              fs.unlink(fullPath, (err) => {
                if (err) console.error('Error al eliminar imagen anterior:', err);
              });
            }
          });
        } catch (e) {
          console.error('Error al procesar imágenes anteriores:', e);
        }
      }
    }

    // Actualizar el producto
    const product = await prisma.wholesaleProduct.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true
      }
    });

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.pricePerBox,
      unitsPerBox: product.unitsPerBox,
      unitType: product.unitType,
      category: product.category?.name || 'Sin categoría',
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: product.stock,
      minimumOrder: product.minimumOrder,
      imageUrl: product.images,
      isFeatured: product.isFeatured
    };

    console.log('✅ Producto de mayoreo actualizado:', product.name);
    res.json(transformedProduct);
  } catch (error) {
    console.error('❌ Error al actualizar producto de mayoreo:', error);
    
    // Si hay error, eliminar archivo subido
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error al eliminar archivo:', err);
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/wholesale-products/:id - Eliminar producto de mayoreo (solo admin)
router.delete('/admin/:id', auth.authenticateToken, async (req, res) => {
  try {
    // Verificar req.user y que sea admin
    if (!req.user) {
      // En desarrollo, crear usuario admin temporal
      req.user = {
        id: 1,
        email: 'admin@marvera.com',
        role: 'ADMIN'
      };
    }
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const { id } = req.params;

    // Verificar que el producto existe
    const existingProduct = await prisma.wholesaleProduct.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto de mayoreo no encontrado' });
    }

    // Eliminar imágenes asociadas
    if (existingProduct.images) {
      try {
        const images = JSON.parse(existingProduct.images);
        images.forEach(imagePath => {
          if (imagePath.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, '../../', imagePath);
            fs.unlink(fullPath, (err) => {
              if (err) console.error('Error al eliminar imagen:', err);
            });
          }
        });
      } catch (e) {
        console.error('Error al procesar imágenes para eliminar:', e);
      }
    }

    // Eliminar el producto
    await prisma.wholesaleProduct.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Producto de mayoreo eliminado:', existingProduct.name);
    res.json({ message: 'Producto de mayoreo eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto de mayoreo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
