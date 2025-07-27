import express from 'express';
import { ProductService } from '../services/productService';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Obtener todas las categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await ProductService.getAllCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener todos los productos con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const categoryId = category ? parseInt(category as string) : undefined;
    const searchTerm = search as string;

    const products = await ProductService.getAllProducts(categoryId, searchTerm);
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener productos destacados
router.get('/featured', async (req, res) => {
  try {
    const products = await ProductService.getFeaturedProducts();
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
    }

    const product = await ProductService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener producto por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await ProductService.getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error obteniendo producto por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productData = req.body;

    // Validación básica
    if (!productData.name || !productData.price || !productData.category_id) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, precio y categoría son requeridos'
      });
    }

    // Generar slug si no se proporciona
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const product = await ProductService.createProduct(productData);
    
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Error creando producto'
      });
    }

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    const updateData = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto inválido'
      });
    }

    const product = await ProductService.updateProduct(productId, updateData);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
