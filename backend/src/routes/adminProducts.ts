import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends express.Request {
  user?: any;
}

const router = express.Router();
const prisma = new PrismaClient();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

// GET /api/admin/products - Obtener todos los productos (solo admin)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📦 Productos admin obtenidos:', products.length);
    res.json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/admin/products - Crear nuevo producto (solo admin)
router.post('/', authenticateToken, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const {
      name,
      description,
      price,
      categoryId,
      unit,
      stock,
      isFeatured
    } = req.body;

    // Validar campos requeridos
    if (!name || !price || !categoryId) {
      return res.status(400).json({ 
        message: 'Los campos nombre, precio y categoría son requeridos' 
      });
    }

    // Construir URL de imagen si se subió archivo
    let images = null;
    if (req.file) {
      images = JSON.stringify([`/uploads/${req.file.filename}`]);
    }

    const productData = {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description: description || '',
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      unit: unit || 'kg',
      stock: stock ? parseInt(stock) : 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      images
    };

    const product = await prisma.product.create({
      data: productData
    });

    console.log('✅ Producto creado:', product.name);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    
    // Si hay error, eliminar archivo subido
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error al eliminar archivo:', err);
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/admin/products/:id - Actualizar producto (solo admin)
router.put('/:id', authenticateToken, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      unit,
      stock,
      isFeatured
    } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const updateData: any = {
      name: name || existingProduct.name,
      slug: name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : existingProduct.slug,
      description: description || existingProduct.description,
      price: price ? parseFloat(price) : existingProduct.price,
      categoryId: categoryId ? parseInt(categoryId) : existingProduct.categoryId,
      unit: unit || existingProduct.unit,
      stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
      isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : existingProduct.isFeatured
    };

    // Si se subió nueva imagen, actualizar URL y eliminar imagen anterior
    if (req.file) {
      updateData.images = JSON.stringify([`/uploads/${req.file.filename}`]);
      
      // Eliminar imagen anterior si existe
      if (existingProduct.images) {
        try {
          const oldImages = JSON.parse(existingProduct.images);
          if (Array.isArray(oldImages) && oldImages[0]) {
            const oldImagePath = path.join(__dirname, '../..', oldImages[0]);
            fs.unlink(oldImagePath, (err) => {
              if (err) console.error('Error al eliminar imagen anterior:', err);
            });
          }
        } catch (error) {
          console.error('Error al parsear imágenes anteriores:', error);
        }
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    console.log('✅ Producto actualizado:', product.name);
    res.json(product);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    
    // Si hay error, eliminar archivo subido
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error al eliminar archivo:', err);
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/products/:id - Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user?.role !== 'admin') {
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
      try {
        const images = JSON.parse(existingProduct.images);
        if (Array.isArray(images) && images[0]) {
          const imagePath = path.join(__dirname, '../..', images[0]);
          fs.unlink(imagePath, (err) => {
            if (err) console.error('Error al eliminar imagen:', err);
          });
        }
      } catch (error) {
        console.error('Error al parsear imágenes:', error);
      }
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

export default router;
