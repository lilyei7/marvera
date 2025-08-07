#!/usr/bin/env node

// Script para verificar ofertas e imágenes
import fetch from 'node-fetch';

console.log('🔍 Verificando ofertas destacadas e imágenes...');

async function checkOffers() {
  try {
    console.log('📡 Obteniendo ofertas destacadas...');
    const response = await fetch('https://marvera.mx/api/offers/featured');
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${result.count} ofertas destacadas encontradas:`);
      
      for (const offer of result.data) {
        console.log(`\n📋 Oferta ID ${offer.id}: "${offer.title}"`);
        console.log(`   💰 Precio: $${offer.originalPrice} → $${offer.discountPrice} (${offer.discountPercent}% OFF)`);
        console.log(`   🏷️ Destacada: ${offer.isFeatured ? 'Sí' : 'No'}`);
        console.log(`   🎨 Color: ${offer.backgroundColor}`);
        
        if (offer.imageUrl) {
          console.log(`   🖼️ Imagen: ${offer.imageUrl}`);
          
          // Probar si la imagen está accesible
          try {
            const imageResponse = await fetch(`https://marvera.mx${offer.imageUrl}`, { method: 'HEAD' });
            console.log(`   📷 Estado imagen: ${imageResponse.status} ${imageResponse.statusText}`);
          } catch (imgError) {
            console.log(`   ❌ Error imagen: ${imgError.message}`);
          }
        } else {
          console.log(`   📷 Sin imagen`);
        }
      }
      
    } else {
      console.error('❌ Error al obtener ofertas:', result);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkOffers();
