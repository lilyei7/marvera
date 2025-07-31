import express from 'express';
import { BranchService } from '../../services/branchService';
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

// GET todas las sucursales (público - solo activas)
router.get('/public', async (req, res) => {
  try {
    const branches = await BranchService.getActiveBranches();
    res.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error fetching public branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales'
    });
  }
});

// GET todas las sucursales (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const branches = await BranchService.getAllBranches();
    res.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales'
    });
  }
});

// GET sucursal por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sucursal inválido'
      });
    }

    const branch = await BranchService.getBranchById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    res.json({
      success: true,
      branch
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursal'
    });
  }
});

// POST crear nueva sucursal (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name, address, city, state, postalCode, phone, email,
      latitude, longitude, openingHours, services, manager, description, image
    } = req.body;

    // Validaciones básicas - solo nombre es requerido
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la sucursal es requerido'
      });
    }

    const branchData = {
      name,
      address: address || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      phone: phone || null,
      email: email || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      openingHours: openingHours || null,
      services: services || null,
      manager: manager || null,
      description: description || null,
      image: image || null,
      isActive: true
    };

    const branchId = await BranchService.createBranch(branchData);

    res.status(201).json({
      success: true,
      message: 'Sucursal creada exitosamente',
      branchId
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sucursal'
    });
  }
});

// PUT actualizar sucursal (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sucursal inválido'
      });
    }

    const {
      name, address, city, state, postalCode, phone, email,
      latitude, longitude, openingHours, services, manager, description, image, isActive
    } = req.body;

    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (openingHours !== undefined) updateData.openingHours = openingHours;
    if (services !== undefined) updateData.services = services;
    if (manager !== undefined) updateData.manager = manager;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const success = await BranchService.updateBranch(id, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sucursal actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sucursal'
    });
  }
});

// DELETE eliminar sucursal (soft delete - admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sucursal inválido'
      });
    }

    const success = await BranchService.deleteBranch(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sucursal eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sucursal'
    });
  }
});

// POST toggle status de sucursal (admin)
router.post('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de sucursal inválido'
      });
    }

    const success = await BranchService.toggleBranchStatus(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estado de sucursal actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error toggling branch status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de sucursal'
    });
  }
});

// GET sucursales por ciudad
router.get('/city/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const branches = await BranchService.getBranchesByCity(city);
    
    res.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error fetching branches by city:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales por ciudad'
    });
  }
});

// GET sucursales cercanas
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const latitude = parseFloat(req.params.lat);
    const longitude = parseFloat(req.params.lng);
    const radius = req.query.radius ? parseFloat(req.query.radius) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Coordenadas inválidas'
      });
    }

    const branches = await BranchService.getNearbyBranches(latitude, longitude, radius);
    
    res.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error fetching nearby branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales cercanas'
    });
  }
});

export default router;
