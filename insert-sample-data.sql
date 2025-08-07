-- Insertar productos de ejemplo
INSERT INTO products (id, name, description, price, imageUrl, category, isActive, isFeatured, stock, createdAt, updatedAt) VALUES 
(1, 'Camarones Frescos Premium', 'Camarones frescos del Golfo de México, tamaño jumbo', 450.00, '/fondorectangulo3.png', 'Camarones', 1, 1, 100, datetime('now'), datetime('now')),
(2, 'Pulpo Fresco del Pacífico', 'Pulpo fresco capturado en aguas del Pacífico mexicano', 380.00, '/fondorectangulo3.png', 'Pulpo', 1, 1, 50, datetime('now'), datetime('now')),
(3, 'Pescado Huachinango', 'Huachinango fresco, ideal para preparaciones gourmet', 320.00, '/fondorectangulo3.png', 'Pescado', 1, 0, 75, datetime('now'), datetime('now')),
(4, 'Langostinos Gigantes', 'Langostinos de tamaño extra grande, perfectos para platillos especiales', 550.00, '/fondorectangulo3.png', 'Langostinos', 1, 1, 30, datetime('now'), datetime('now')),
(5, 'Atún Fresco Sashimi', 'Atún de la más alta calidad, ideal para sashimi y sushi', 680.00, '/fondorectangulo3.png', 'Atún', 1, 1, 25, datetime('now'), datetime('now'));

-- Insertar slides de ejemplo  
INSERT INTO slideshow (id, title, subtitle, description, buttonText, buttonLink, imageUrl, backgroundColor, textColor, isActive, `order`, createdAt, updatedAt) VALUES 
(1, 'Del mar directo a tu restaurante', 'Productos frescos del mar', 'Mariscos frescos y productos del mar de la más alta calidad para tu negocio', 'Ver Productos', '/productos', '/fondorectangulo3.png', '#1E3A8A', '#FFFFFF', 1, 0, datetime('now'), datetime('now')),
(2, 'Calidad Premium MarVera', 'Los mejores mariscos', 'Selección especial de productos del mar con la mejor calidad y frescura', 'Ver Catálogo', '/productos', '/fondorectangulo3.png', '#40E0D0', '#1E3A8A', 1, 1, datetime('now'), datetime('now')),
(3, 'Frescura Garantizada', 'Directamente del océano', 'Productos capturados diariamente para garantizar máxima frescura', 'Conocer Más', '/nosotros', '/fondorectangulo3.png', '#87CEEB', '#1E3A8A', 1, 2, datetime('now'), datetime('now'));
