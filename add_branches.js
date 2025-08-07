// Branches endpoints
app.get('/api/branches', async (req, res) => {
  try {
    console.log('🏢 Branches list requested');
    const branches = [{
      id: 1,
      name: 'MarVera Centro',
      address: 'Av. Principal 123, Centro',
      city: 'Veracruz',
      state: 'Veracruz',
      zipCode: '91700',
      phone: '+52 229 123 4567',
      email: 'centro@marvera.com',
      latitude: 19.1738,
      longitude: -96.1342,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }, {
      id: 2,
      name: 'MarVera Costa de Oro',
      address: 'Blvd. Costero 456, Costa de Oro',
      city: 'Boca del Río',
      state: 'Veracruz',
      zipCode: '94299',
      phone: '+52 229 987 6543',
      email: 'costadeoro@marvera.com',
      latitude: 19.1069,
      longitude: -96.1053,
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }];
    res.json({ success: true, data: branches, message: 'Sucursales obtenidas correctamente' });
  } catch (error) {
    console.error('❌ Error getting branches:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

app.post('/api/branches', async (req, res) => {
  try {
    console.log('🏢 Creating new branch:', req.body);
    const newBranch = {
      id: Math.floor(Math.random() * 1000) + 3,
      name: req.body.name || 'Nueva Sucursal',
      address: req.body.address || 'Dirección temporal',
      city: req.body.city || 'Veracruz',
      state: req.body.state || 'Veracruz',
      zipCode: req.body.zipCode || '91700',
      phone: req.body.phone || '+52 229 000 0000',
      email: req.body.email || 'nueva@marvera.com',
      latitude: req.body.latitude || 19.1738,
      longitude: req.body.longitude || -96.1342,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    res.status(201).json({ success: true, data: newBranch, message: 'Sucursal creada correctamente' });
  } catch (error) {
    console.error('❌ Error creating branch:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

app.put('/api/branches/:id', async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    console.log('🏢 Updating branch:', branchId, req.body);
    const updatedBranch = {
      id: branchId,
      ...req.body,
      updatedAt: new Date()
    };
    res.json({ success: true, data: updatedBranch, message: 'Sucursal actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error updating branch:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    console.log('🏢 Deleting branch:', branchId);
    res.json({ success: true, message: 'Sucursal eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error deleting branch:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});
