const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to optimize images
async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp'
    } = options;
    
    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality })
      .toFile(outputPath);
      
    console.log(`✅ Optimized: ${inputPath} -> ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error);
    return null;
  }
}

// Function to create multiple sizes
async function createImageSizes(inputPath, outputDir, filename) {
  const sizes = [
    { suffix: '_thumb', width: 200, height: 200, quality: 70 },
    { suffix: '_medium', width: 400, height: 400, quality: 80 },
    { suffix: '_large', width: 800, height: 800, quality: 85 }
  ];
  
  const results = {};
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${filename}${size.suffix}.webp`);
    const result = await optimizeImage(inputPath, outputPath, size);
    if (result) {
      results[size.suffix.replace('_', '')] = result;
    }
  }
  
  return results;
}

module.exports = { optimizeImage, createImageSizes };
