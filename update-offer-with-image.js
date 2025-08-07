#!/usr/bin/env node

// Script para actualizar oferta con la imagen subida
import fetch from 'node-fetch';

console.log('🎁 Actualizando oferta con imagen...');

async function updateOfferWithImage() {
  try {
    // Actualizar la primera oferta con la imagen subida
    const updateData = {
      title: "Combo Familiar Especial con Imagen",
      description: "Selección premium de mariscos frescos para toda la familia. Incluye camarones, salmón, atún y más. ¡Ahora con imagen!",
      originalPrice: 199.99,
      discountPrice: 149.99,
      discountPercent: 25,
      imageUrl: "/uploads/offers/offer_1754430153614_64324274.png",
      backgroundColor: "#1E3A8A",
      isActive: true,
      isFeatured: true,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxRedemptions: 100
    };

    console.log('📡 Actualizando oferta ID 1...');
    
    const response = await fetch('https://marvera.mx/api/admin/offers/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Oferta actualizada exitosamente:', result);
      
      // Verificar ofertas destacadas
      console.log('🔍 Verificando ofertas destacadas...');
      const featuredResponse = await fetch('https://marvera.mx/api/offers/featured');
      const featuredResult = await featuredResponse.json();
      console.log('🌟 Ofertas destacadas con imagen:', featuredResult);
      
    } else {
      console.error('❌ Error al actualizar oferta:', result);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

updateOfferWithImage();
