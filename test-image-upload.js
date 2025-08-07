#!/usr/bin/env node

// Script para probar upload de imagen de ofertas
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

console.log('🖼️ Probando upload de imagen de ofertas...');

async function testImageUpload() {
  try {
    // Verificar si existe una imagen de prueba
    const testImagePath = './fondorectangulo3.png';
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ No se encontró imagen de prueba');
      return;
    }

    console.log('📁 Preparando FormData...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    console.log('📡 Enviando imagen a la API...');
    const response = await fetch('https://marvera.mx/api/admin/offers/upload-image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Imagen subida exitosamente:', result);
      
      // Probar acceso a la imagen
      console.log('🔍 Probando acceso a la imagen...');
      const imageResponse = await fetch(`https://marvera.mx${result.imageUrl}`);
      console.log(`📷 Estado de imagen: ${imageResponse.status} ${imageResponse.statusText}`);
      
    } else {
      console.error('❌ Error al subir imagen:', result);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testImageUpload();
