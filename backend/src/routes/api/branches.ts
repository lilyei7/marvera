import express from 'express';
import { BranchService } from '../../services/branchService';
import { authenticateToken, requireAdmin } from '../../middleware/auth';

const router = express.Router();

// GET todas las sucursales (público - solo activas)
router.get('/public', async (req, res) => {
  try {
    console.log('🏢 Accediendo a endpoint público de sucursales');
    const branches = await BranchService.getActiveBranches();
    console.log('🏢 Sucursales activas encontradas:', branches.length);
    
    res.json({
      success: true,
      branches: branches
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
    console.log('🏢 Accediendo a endpoint de sucursales (admin)');
    const branches = await BranchService.getAllBranches();
    res.json({
      success: true,
      branches: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sucursales'
    });
  }
});

// GET todas las sucursales (temporal sin auth para debug)
router.get('/debug', async (req, res) => {
  try {
    console.log('🏢 Accediendo a endpoint de sucursales (debug)');
    const branches = await BranchService.getAllBranches();
    res.json({
      success: true,
      branches: branches
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

    res.json(branch);
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
      name, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      email, 
      latitude, 
      longitude, 
      openingTime,
      closingTime,
      openDays,
      services, 
      description, 
      imageUrl,
      status
    } = req.body;

    // Validaciones básicas
    if (!name || !address || !city || !state || !zipCode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, dirección, ciudad, estado, código postal y teléfono'
      });
    }

    // Combinar opening y closing time en openingHours
    const openingHours = openingTime && closingTime ? 
      `${openingTime} - ${closingTime} (${openDays || 'Lunes a Viernes'})` : 
      undefined;

    const branchData = {
      name,
      address,
      city,
      state,
      postalCode: zipCode, // Mapear zipCode a postalCode para la DB
      phone,
      email: email || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      openingHours,
      services: services || undefined,
      description: description || undefined,
      image: imageUrl || undefined,
      isActive: status === 'active'
    };

    const branch = await BranchService.createBranch(branchData);

    res.status(201).json({
      success: true,
      message: 'Sucursal creada exitosamente',
      branch
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
      name, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      email,
      latitude, 
      longitude, 
      openingTime,
      closingTime,
      openDays,
      services, 
      description, 
      imageUrl,
      status
    } = req.body;

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.postalCode = zipCode; // Map zipCode to postalCode
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (openingTime !== undefined || closingTime !== undefined || openDays !== undefined) {
      const openingHours = openingTime && closingTime ? 
        `${openingTime} - ${closingTime} (${openDays || 'Lunes a Viernes'})` : 
        undefined;
      if (openingHours) updateData.openingHours = openingHours;
    }
    if (services !== undefined) updateData.services = services;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (status !== undefined) updateData.isActive = status === 'active';

    const branch = await BranchService.updateBranch(id, updateData);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Sucursal actualizada exitosamente',
      branch
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

    const branch = await BranchService.toggleBranchStatus(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada'
      });
    }

    res.json({
      success: true,
      message: `Sucursal ${branch.isActive ? 'activada' : 'desactivada'} exitosamente`,
      branch
    });
  } catch (error) {
    console.error('Error toggling branch status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de sucursal'
    });
  }
});

// GET buscar sucursales
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const branches = await BranchService.searchBranches(query);
    
    res.json({
      success: true,
      branches
    });
  } catch (error) {
    console.error('Error searching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar sucursales'
    });
  }
});

// GET sucursales cercanas
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const latitude = parseFloat(req.params.lat);
    const longitude = parseFloat(req.params.lng);
    const radius = req.query.radius ? parseFloat(req.query.radius.toString()) : 10;

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
