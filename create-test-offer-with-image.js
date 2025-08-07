#!/usr/bin/env node

// Script para crear oferta con imagen usando multer
console.log('🖼️ Creando oferta de prueba con imagen...');

// Datos de la oferta
const offerData = {
  title: "Sushi Premium Especial",
  description: "Exquisita selección de sushi fresco preparado por nuestros chefs especializados. Perfecto para una cena especial.",
  originalPrice: 89.99,
  discountPrice: 69.99,
  discountPercent: 22,
  backgroundColor: "#DC2626",
  isActive: true,
  isFeatured: true,
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días
  maxRedemptions: 50,
  currentRedemptions: 0
};

async function createOfferWithImage() {
  try {
    console.log('📡 Enviando oferta con imagen a la API...');
    
    const response = await fetch('https://marvera.mx/api/admin/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Oferta con imagen creada exitosamente:', result);
      
      // Verificar todas las ofertas
      console.log('🔍 Verificando todas las ofertas...');
      const allOffersResponse = await fetch('https://marvera.mx/api/offers');
      const allOffersResult = await allOffersResponse.json();
      console.log('📋 Todas las ofertas:', allOffersResult);
      
    } else {
      console.error('❌ Error al crear oferta:', result);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error);
  }
}

createOfferWithImage();
