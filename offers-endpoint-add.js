// Endpoint de ofertas destacadas para agregar a server-fixed.js
app.get('/api/offers/featured', async (req, res) => {
  try {
    console.log('🌟 Featured offers requested');
    
    // Como no tenemos tabla specialOffer en server-fixed.js, usamos mock data
    const offers = [
      {
        id: 1,
        title: "Oferta Especial Atún",
        description: "20% descuento en atún fresco del día",
        discount: 20,
        image: "/uploads/products/offer-1.jpg",
        validUntil: "2025-08-31",
        isActive: true,
        isFeatured: true
      },
      {
        id: 2,
        title: "Combo Mariscos Premium",
        description: "Combo especial de mariscos frescos con descuento",
        discount: 15,
        image: "/uploads/products/offer-2.jpg", 
        validUntil: "2025-08-31",
        isActive: true,
        isFeatured: true
      }
    ];

    console.log(`✅ ${offers.length} ofertas destacadas encontradas`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
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
