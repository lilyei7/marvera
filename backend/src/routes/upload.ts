import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test endpoint para verificar autenticación
router.get('/test', authenticateToken, requireAdmin, (req: any, res) => {
  res.json({
    success: true,
    message: 'Upload route working',
    user: req.user
  });
});

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Usar ruta absoluta
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
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

// Simple test endpoint sin autenticación
router.post('/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS working fine',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para subir múltiples imágenes
router.post('/upload', authenticateToken, requireAdmin, upload.array('images', 5), (req: any, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'No se subieron archivos'
      });
    }

    const imageUrls = req.files.map((file: any) => {
      return `/uploads/images/${file.filename}`;
    });

    res.json({
      success: true,
      message: 'Imágenes subidas correctamente',
      images: imageUrls
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir las imágenes'
    });
  }
});

// Endpoint para subir una sola imagen
router.post('/upload-single', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ningún archivo'
      });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen'
    });
  }
});

export default router;
