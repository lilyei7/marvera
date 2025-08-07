// Endpoint de ofertas destacadas con mock data (para agregar antes de app.listen)
app.get('/api/offers/featured', async (req, res) => {
  try {
    console.log('🌟 Featured offers requested');
    
    // Mock data similar a productos destacados
    const offers = [
      {
        id: 1,
        title: "Oferta Especial Atún Premium",
        description: "20% descuento en todo el atún fresco del día",
        discount: 20,
        originalPrice: 150,
        discountedPrice: 120,
        image: "/uploads/products/atun-offer.jpg",
        validUntil: "2025-08-31T23:59:59.000Z",
        isActive: true,
        isFeatured: true,
        productId: 1
      },
      {
        id: 2,
        title: "Combo Mariscos Premium",
        description: "Combo especial de mariscos frescos con 15% descuento",
        discount: 15,
        originalPrice: 300,
        discountedPrice: 255,
        image: "/uploads/products/mariscos-combo.jpg",
        validUntil: "2025-08-31T23:59:59.000Z",
        isActive: true,
        isFeatured: true,
        productId: 2
      }
    ];

    console.log(`✅ ${offers.length} ofertas destacadas encontradas`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      message: "Ofertas destacadas obtenidas correctamente",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener ofertas destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});
