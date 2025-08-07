import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const { optimizeImage, createImageSizes } = require('../../image_optimizer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');        
const router = express.Router();

// Crear directorios de uploads si no existen
const uploadsBaseDir = path.join(__dirname, '../../uploads');
const uploadsDir = path.join(uploadsBaseDir, 'branches');
const tempDir = path.join(uploadsBaseDir, 'temp');

[uploadsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Test endpoint para verificar autenticación
router.get('/test', authenticateToken, requireAdmin, (req: any, res) => {
  res.json({
    success: true,
    message: 'Upload route working',
    user: req.user
  });
});

// Configurar multer para subir imágenes temporalmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Subir a temp primero
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo temporal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);      
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));        
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB máximo por archivo
  }
});

// Función para procesar y optimizar imagen después del upload
async function processUploadedImage(tempFilePath: string, originalName: string) {
  try {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const uniqueId = Math.round(Math.random() * 1E9);
    
    // Crear nombre base para las versiones optimizadas
    const baseFileName = `branch_${timestamp}_${uniqueId}`;
    
    // Crear diferentes tamaños optimizados
    const sizes = [
      { suffix: '_thumb', width: 200, height: 200, quality: 70 },
      { suffix: '_medium', width: 400, height: 400, quality: 80 },
      { suffix: '_large', width: 800, height: 800, quality: 85 },
      { suffix: '_original', width: 1200, height: 1200, quality: 90 }
    ];
    
    const optimizedImages = {};
    
    for (const size of sizes) {
      const outputPath = path.join(uploadsDir, `${baseFileName}${size.suffix}.webp`);
      const result = await optimizeImage(tempFilePath, outputPath, {
        width: size.width,
        height: size.height,
        quality: size.quality,
        format: 'webp'
      });
      
      if (result) {
        // Guardar la URL relativa que el frontend puede usar
        const relativeUrl = `/uploads/branches/${path.basename(result)}`;
        optimizedImages[size.suffix.replace('_', '')] = relativeUrl;
      }
    }
    
    // Eliminar archivo temporal
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    return optimizedImages;
  } catch (error) {
    console.error('Error processing image:', error);
    // Eliminar archivo temporal en caso de error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
}

// Simple test endpoint sin autenticación
router.post('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS working fine',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para subir múltiples imágenes con optimización
router.post('/upload', authenticateToken, requireAdmin, upload.array('images', 5), async (req: any, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'No se subieron archivos'
      });
    }

    // Procesar cada imagen
    const processedImages = [];
    
    for (const file of req.files) {
      try {
        const optimizedSizes = await processUploadedImage(file.path, file.originalname);
        processedImages.push({
          originalName: file.originalname,
          sizes: optimizedSizes
        });
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        // Continuar con las demás imágenes
      }
    }

    res.json({
      success: true,
      message: `${processedImages.length} imágenes procesadas correctamente`,
      images: processedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir las imágenes'
    });
  }
});

// Endpoint para subir una sola imagen con optimización
router.post('/upload-single', authenticateToken, requireAdmin, upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ningún archivo'
      });
    }

    // Procesar y optimizar la imagen
    const optimizedSizes = await processUploadedImage(req.file.path, req.file.originalname);

    res.json({
      success: true,
      message: 'Imagen procesada correctamente',
      imageUrls: optimizedSizes
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la imagen'
    });
  }
});

export default router;
