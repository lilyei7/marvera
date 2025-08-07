-- Insertar categorías primero
INSERT OR IGNORE INTO categories (id, name, slug, description, isActive, createdAt) VALUES 
(1, 'Camarones', 'camarones', 'Camarones frescos y congelados', 1, datetime('now')),
(2, 'Pulpo', 'pulpo', 'Pulpo fresco del océano', 1, datetime('now')),
(3, 'Pescado', 'pescado', 'Pescados frescos de temporada', 1, datetime('now')),
(4, 'Langostinos', 'langostinos', 'Langostinos premium', 1, datetime('now')),
(5, 'Atún', 'atun', 'Atún fresco para sashimi', 1, datetime('now'));

-- Insertar productos con estructura correcta
INSERT OR IGNORE INTO products (id, name, slug, description, price, categoryId, stock, unit, images, isActive, isFeatured, createdAt, updatedAt) VALUES 
(1, 'Camarones Frescos Premium', 'camarones-frescos-premium', 'Camarones frescos del Golfo de México, tamaño jumbo', 450.00, 1, 100, 'kg', '/fondorectangulo3.png', 1, 1, datetime('now'), datetime('now')),
(2, 'Pulpo Fresco del Pacífico', 'pulpo-fresco-pacifico', 'Pulpo fresco capturado en aguas del Pacífico mexicano', 380.00, 2, 50, 'kg', '/fondorectangulo3.png', 1, 1, datetime('now'), datetime('now')),
(3, 'Pescado Huachinango', 'pescado-huachinango', 'Huachinango fresco, ideal para preparaciones gourmet', 320.00, 3, 75, 'kg', '/fondorectangulo3.png', 1, 0, datetime('now'), datetime('now')),
(4, 'Langostinos Gigantes', 'langostinos-gigantes', 'Langostinos de tamaño extra grande, perfectos para platillos especiales', 550.00, 4, 30, 'kg', '/fondorectangulo3.png', 1, 1, datetime('now'), datetime('now')),
(5, 'Atún Fresco Sashimi', 'atun-fresco-sashimi', 'Atún de la más alta calidad, ideal para sashimi y sushi', 680.00, 5, 25, 'kg', '/fondorectangulo3.png', 1, 1, datetime('now'), datetime('now'));

-- Insertar slides de ejemplo  
INSERT OR IGNORE INTO slideshow (id, title, subtitle, description, buttonText, buttonLink, imageUrl, backgroundColor, textColor, isActive, `order`, createdAt, updatedAt) VALUES 
(1, 'Del mar directo a tu restaurante', 'Productos frescos del mar', 'Mariscos frescos y productos del mar de la más alta calidad para tu negocio', 'Ver Productos', '/productos', '/fondorectangulo3.png', '#1E3A8A', '#FFFFFF', 1, 0, datetime('now'), datetime('now')),
(2, 'Calidad Premium MarVera', 'Los mejores mariscos', 'Selección especial de productos del mar con la mejor calidad y frescura', 'Ver Catálogo', '/productos', '/fondorectangulo3.png', '#40E0D0', '#1E3A8A', 1, 1, datetime('now'), datetime('now')),
(3, 'Frescura Garantizada', 'Directamente del océano', 'Productos capturados diariamente para garantizar máxima frescura', 'Conocer Más', '/nosotros', '/fondorectangulo3.png', '#87CEEB', '#1E3A8A', 1, 2, datetime('now'), datetime('now'));
