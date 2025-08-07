import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Configuración de multer para la carga de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../uploads/slideshow');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET /api/slideshow - Obtener todos los slides activos ordenados
router.get('/', async (req, res) => {
  try {
    const slides = await prisma.slideshow.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(slides);
  } catch (error) {
    console.error('Error fetching slideshow:', error);
    res.status(500).json({ error: 'Error al obtener el slideshow' });
  }
});

// GET /api/slideshow/all - Obtener todos los slides (para admin)
router.get('/all', async (req, res) => {
  try {
    const slides = await prisma.slideshow.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(slides);
  } catch (error) {
    console.error('Error fetching all slides:', error);
    res.status(500).json({ error: 'Error al obtener todos los slides' });
  }
});

// POST /api/slideshow - Crear nuevo slide
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor,
      isActive,
      order
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/slideshow/${req.file.filename}`;
    }

    const slide = await prisma.slideshow.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        imageUrl,
        backgroundColor: backgroundColor || '#1E3A8A',
        textColor: textColor || '#FFFFFF',
        isActive: isActive === 'true' || isActive === true,
        order: parseInt(order) || 0
      }
    });

    res.status(201).json(slide);
  } catch (error) {
    console.error('Error creating slide:', error);
    res.status(500).json({ error: 'Error al crear el slide' });
  }
});

// PUT /api/slideshow/:id - Actualizar slide
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor,
      isActive,
      order
    } = req.body;

    // Buscar el slide existente
    const existingSlide = await prisma.slideshow.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlide) {
      return res.status(404).json({ error: 'Slide no encontrado' });
    }

    let imageUrl = existingSlide.imageUrl;
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (existingSlide.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingSlide.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/slideshow/${req.file.filename}`;
    }

    const slide = await prisma.slideshow.update({
      where: { id: parseInt(id) },
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        imageUrl,
        backgroundColor: backgroundColor || '#1E3A8A',
        textColor: textColor || '#FFFFFF',
        isActive: isActive === 'true' || isActive === true,
        order: parseInt(order) || 0
      }
    });

    res.json(slide);
  } catch (error) {
    console.error('Error updating slide:', error);
    res.status(500).json({ error: 'Error al actualizar el slide' });
  }
});

// DELETE /api/slideshow/:id - Eliminar slide
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingSlide = await prisma.slideshow.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlide) {
      return res.status(404).json({ error: 'Slide no encontrado' });
    }

    // Eliminar imagen si existe
    if (existingSlide.imageUrl) {
      const imagePath = path.join(__dirname, '../../', existingSlide.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.slideshow.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Slide eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    res.status(500).json({ error: 'Error al eliminar el slide' });
  }
});

// PUT /api/slideshow/:id/toggle - Activar/desactivar slide
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const existingSlide = await prisma.slideshow.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlide) {
      return res.status(404).json({ error: 'Slide no encontrado' });
    }

    const slide = await prisma.slideshow.update({
      where: { id: parseInt(id) },
      data: { isActive: !existingSlide.isActive }
    });

    res.json(slide);
  } catch (error) {
    console.error('Error toggling slide:', error);
    res.status(500).json({ error: 'Error al cambiar estado del slide' });
  }
});

export default router;
