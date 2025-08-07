import express from 'express';
import { ProductService } from '../services/productService';

const router = express.Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    console.log('📂 [GET /api/categories] Solicitando categorías...');
    
    const categories = await ProductService.getAllCategories();
    
    console.log(`📂 [GET /api/categories] ${categories.length} categorías encontradas`);
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('❌ [GET /api/categories] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
