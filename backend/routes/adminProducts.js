const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../src/middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Crear directorios de uploads si no existen
const uploadsDir = path.join(__dirname, '../uploads');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Configuración de multer para subida de imágenes de productos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir); // Usar directorio específico para productos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 7 // Maximum 7 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/admin/products - Obtener todos los productos (solo admin)
router.get('/', auth.authenticateToken, async (req, res) => {
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

    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar productos para la respuesta
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category.name,
      unit: product.unit,
      inStock: product.stock > 0,
      imageUrl: product.images ? (
        // Intentar parsear JSON, si falla asumir string (compatibilidad con formato anterior)
        (() => {
          try {
            return JSON.parse(product.images);
          } catch (e) {
            return [product.images]; // Convertir string a array
          }
        })()
      ) : [],
      isFeatured: product.isFeatured,
      stock: product.stock
    }));

    console.log('📦 Productos admin obtenidos:', transformedProducts.length);
    res.json(transformedProducts);
  } catch (error) {
    console.error('❌ Error al obtener productos admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/admin/products - Crear nuevo producto (solo admin)
router.post('/', auth.authenticateToken, upload.array('images', 7), async (req, res) => {
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
      price,
      category,
      unit,
      inStock,
      isFeatured
    } = req.body;

    // Validar campos requeridos
    if (!name || !price || !category) {
      return res.status(400).json({ 
        message: 'Los campos nombre, precio y categoría son requeridos' 
      });
    }

    // Buscar categoría existente por nombre o slug
    const categorySlug = createSlug(category);
    let categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: category, mode: 'insensitive' } },
          { slug: categorySlug }
        ]
      }
    });

    if (!categoryRecord) {
      // Solo crear si realmente no existe
      try {
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            slug: categorySlug
          }
        });
      } catch (createError) {
        // Si falla por slug duplicado, buscar por slug
        if (createError.code === 'P2002') {
          categoryRecord = await prisma.category.findFirst({
            where: { slug: categorySlug }
          });
        } else {
          throw createError;
        }
      }
    }

    // Construir URLs de imágenes si se subieron archivos
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    console.log('📸 Imágenes procesadas:', imageUrls.length);

    const productData = {
      name,
      slug: createSlug(name),
      description: description || '',
      price: parseFloat(price),
      categoryId: categoryRecord.id,
      unit: unit || 'kg',
      stock: (inStock === 'true' || inStock === true) ? 100 : 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      images: JSON.stringify(imageUrls) // Guardar como JSON string
    };

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true
      }
    });

    // Transformar respuesta
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category.name,
      unit: product.unit,
      inStock: product.stock > 0,
      imageUrl: product.images ? JSON.parse(product.images) : [], // Parsear JSON a array
      isFeatured: product.isFeatured,
      stock: product.stock
    };

    console.log('✅ Producto creado:', product.name, 'con', imageUrls.length, 'imágenes');
    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    
    // Si hay error, eliminar archivos subidos
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
        });
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/admin/products/:id - Actualizar producto (solo admin)
router.put('/:id', auth.authenticateToken, upload.array('images', 7), async (req, res) => {
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
      price,
      category,
      unit,
      inStock,
      isFeatured
    } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const updateData = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price ? parseFloat(price) : existingProduct.price,
      unit: unit || existingProduct.unit,
      stock: inStock !== undefined ? ((inStock === 'true' || inStock === true) ? 100 : 0) : existingProduct.stock,
      isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : existingProduct.isFeatured
    };

    // Si se actualiza el nombre, actualizar slug
    if (name && name !== existingProduct.name) {
      updateData.slug = createSlug(name);
    }

    // Si se cambió la categoría, buscar o crear
    if (category && category !== existingProduct.category.name) {
      const categorySlug = createSlug(category);
      let categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: category, mode: 'insensitive' } },
            { slug: categorySlug }
          ]
        }
      });

      if (!categoryRecord) {
        // Solo crear si realmente no existe
        try {
          categoryRecord = await prisma.category.create({
            data: {
              name: category,
              slug: categorySlug
            }
          });
        } catch (createError) {
          // Si falla por slug duplicado, buscar por slug
          if (createError.code === 'P2002') {
            categoryRecord = await prisma.category.findFirst({
              where: { slug: categorySlug }
            });
          } else {
            throw createError;
          }
        }
      }

      updateData.categoryId = categoryRecord.id;
    }

    // Si se subieron nuevas imágenes, actualizar URLs y eliminar imágenes anteriores
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      updateData.images = JSON.stringify(newImageUrls);
      
      console.log('📸 Actualizando con', req.files.length, 'nuevas imágenes');
      
      // Eliminar imágenes anteriores si existen
      if (existingProduct.images) {
        try {
          const oldImageUrls = JSON.parse(existingProduct.images);
          if (Array.isArray(oldImageUrls)) {
            oldImageUrls.forEach(imageUrl => {
              const oldImagePath = path.join(__dirname, '..', imageUrl);
              fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Error al eliminar imagen anterior:', err);
              });
            });
          }
        } catch (e) {
          // Si no se puede parsear, asumir que es una URL string (formato anterior)
          const oldImagePath = path.join(__dirname, '..', existingProduct.images);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Error al eliminar imagen anterior:', err);
          });
        }
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { category: true }
    });

    // Transformar respuesta
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category.name,
      unit: product.unit,
      inStock: product.stock > 0,
      imageUrl: product.images ? JSON.parse(product.images) : [], // Parsear JSON a array
      isFeatured: product.isFeatured,
      stock: product.stock
    };

    console.log('✅ Producto actualizado:', product.name);
    res.json(transformedProduct);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    
    // Si hay error, eliminar archivos subidos
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
        });
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/products/:id - Eliminar producto (solo admin)
router.delete('/:id', auth.authenticateToken, async (req, res) => {
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
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar imagen asociada si existe
    if (existingProduct.images) {
      const imagePath = path.join(__dirname, '..', existingProduct.images);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error al eliminar imagen:', err);
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Producto eliminado:', existingProduct.name);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
