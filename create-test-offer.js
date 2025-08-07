#!/usr/bin/env node

// Script para crear una oferta de prueba en MarVera
console.log('🎁 Creando oferta de prueba en MarVera...');

const testOffer = {
  title: "Combo Familiar Especial",
  description: "Selección premium de mariscos frescos para toda la familia. Incluye camarones, salmón, atún y más.",
  originalPrice: 199.99,
  discountPrice: 149.99,
  discountPercent: 25,
  backgroundColor: "#1E3A8A",
  isActive: true,
  isFeatured: true,
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
  maxRedemptions: 100,
  currentRedemptions: 0
};

async function createTestOffer() {
  try {
    console.log('📡 Enviando oferta a la API...');
    
    const response = await fetch('https://marvera.mx/api/admin/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOffer)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Oferta creada exitosamente:', result);
      
      // Verificar ofertas destacadas
      console.log('🔍 Verificando ofertas destacadas...');
      const featuredResponse = await fetch('https://marvera.mx/api/offers/featured');
      const featuredResult = await featuredResponse.json();
      console.log('🌟 Ofertas destacadas:', featuredResult);
      
    } else {
      console.error('❌ Error al crear oferta:', result);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error);
  }
}

createTestOffer();
