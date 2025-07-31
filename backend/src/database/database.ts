import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../database.sqlite');

export class DatabaseManager {
  private db: Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        // Ejecutar inicialización de forma sincronizada
        this.db.serialize(() => {
          this.initializeTables();
        });
      }
    });
  }

  private initializeTables(): void {
    // Tabla de usuarios
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role VARCHAR(20) DEFAULT 'customer',
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de categorías
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        comparePrice DECIMAL(10,2),
        category_id INTEGER,
        stock INTEGER DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'kg',
        images TEXT,
        isActive BOOLEAN DEFAULT 1,
        isFeatured BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Tabla de pedidos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderNumber VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL,
        shippingCost DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        paymentMethod VARCHAR(50),
        paymentStatus VARCHAR(50) DEFAULT 'pending',
        shippingAddress TEXT,
        deliveryDate DATETIME,
        driver_id INTEGER,
        trackingCode VARCHAR(100),
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (driver_id) REFERENCES drivers (id)
      )
    `);

    // Tabla de items del pedido
    this.db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Tabla de repartidores
    this.db.run(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        vehicleType VARCHAR(50),
        plateNumber VARCHAR(20),
        isActive BOOLEAN DEFAULT 1,
        currentLat DECIMAL(10,8),
        currentLng DECIMAL(11,8),
        isAvailable BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de tracking de entregas
    this.db.run(`
      CREATE TABLE IF NOT EXISTS delivery_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        notes TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (driver_id) REFERENCES drivers (id)
      )
    `);

    // Tabla de sucursales
    this.db.run(`
      CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postalCode VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        openingHours TEXT,
        services TEXT,
        manager VARCHAR(255),
        description TEXT,
        image VARCHAR(255),
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar categorías por defecto
    this.insertDefaultCategories();
    // Insertar productos por defecto
    this.insertDefaultProducts();
    // Insertar sucursales por defecto
    this.insertDefaultBranches();
    // Crear usuario admin por defecto
    this.createAdminUser();
  }

  private insertDefaultCategories(): void {
    const categories = [
      { name: 'Pescados Frescos', slug: 'pescados-frescos', description: 'Pescados frescos del día' },
      { name: 'Mariscos', slug: 'mariscos', description: 'Mariscos frescos y de calidad' },
      { name: 'Crustáceos', slug: 'crustaceos', description: 'Langostas, cangrejos y camarones' },
      { name: 'Moluscos', slug: 'moluscos', description: 'Ostras, mejillones y almejas' },
      { name: 'Productos Premium', slug: 'premium', description: 'Selección premium de mariscos' },
      { name: 'Productos Procesados', slug: 'procesados', description: 'Productos preparados y conservas' }
    ];

    categories.forEach(category => {
      this.db.run(
        'INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [category.name, category.slug, category.description]
      );
    });
  }

  private insertDefaultProducts(): void {
    const products = [
      {
        name: 'Salmón Atlántico',
        slug: 'salmon-atlantico',
        description: 'Salmón fresco del Atlántico Norte, rico en omega-3',
        price: 25.99,
        category_id: 1,
        stock: 50,
        unit: 'kg',
        isFeatured: 1
      },
      {
        name: 'Langosta Viva',
        slug: 'langosta-viva',
        description: 'Langosta fresca capturada del día',
        price: 45.99,
        category_id: 3,
        stock: 20,
        unit: 'kg',
        isFeatured: 1
      },
      {
        name: 'Ostras Frescas',
        slug: 'ostras-frescas',
        description: 'Ostras frescas del Pacífico',
        price: 18.99,
        category_id: 4,
        stock: 100,
        unit: 'docena',
        isFeatured: 1
      },
      {
        name: 'Camarones Jumbo',
        slug: 'camarones-jumbo',
        description: 'Camarones grandes y frescos',
        price: 32.99,
        category_id: 3,
        stock: 75,
        unit: 'kg',
        isFeatured: 0
      },
      {
        name: 'Atún Rojo',
        slug: 'atun-rojo',
        description: 'Atún rojo de primera calidad',
        price: 55.99,
        category_id: 5,
        stock: 15,
        unit: 'kg',
        isFeatured: 1
      },
      {
        name: 'Pulpo Fresco',
        slug: 'pulpo-fresco',
        description: 'Pulpo fresco del Mediterráneo',
        price: 28.99,
        category_id: 4,
        stock: 30,
        unit: 'kg',
        isFeatured: 0
      }
    ];

    products.forEach(product => {
      this.db.run(
        `INSERT OR IGNORE INTO products 
         (name, slug, description, price, category_id, stock, unit, isFeatured) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.name, product.slug, product.description, product.price, 
         product.category_id, product.stock, product.unit, product.isFeatured]
      );
    });
  }

  private insertDefaultBranches(): void {
    const branches = [
      {
        name: 'MarVera Centro',
        address: 'Av. Revolución 1234, Col. Centro',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '06000',
        phone: '55-1234-5678',
        email: 'centro@marvera.com',
        latitude: 19.4326,
        longitude: -99.1332,
        openingHours: 'Lunes a Domingo: 8:00 AM - 8:00 PM',
        services: 'Venta al menudeo, Preparación de mariscos, Entrega a domicilio',
        manager: 'Carlos González',
        description: 'Nuestra sucursal principal en el corazón de la ciudad'
      },
      {
        name: 'MarVera Norte',
        address: 'Av. San Jerónimo 567, Col. San Jerónimo',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '10400',
        phone: '55-2345-6789',
        email: 'norte@marvera.com',
        latitude: 19.3762,
        longitude: -99.2051,
        openingHours: 'Lunes a Sábado: 9:00 AM - 7:00 PM, Domingo: 10:00 AM - 6:00 PM',
        services: 'Venta al menudeo, Mayoreo, Catering',
        manager: 'María López',
        description: 'Amplia variedad de productos del mar en la zona norte'
      },
      {
        name: 'MarVera Sur',
        address: 'Calzada de Tlalpan 890, Col. Portales',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '03300',
        phone: '55-3456-7890',
        email: 'sur@marvera.com',
        latitude: 19.3675,
        longitude: -99.1576,
        openingHours: 'Lunes a Domingo: 8:30 AM - 7:30 PM',
        services: 'Venta al menudeo, Preparación especializada, Productos orgánicos',
        manager: 'Roberto Martínez',
        description: 'Especialistas en mariscos frescos y productos orgánicos'
      }
    ];

    branches.forEach(branch => {
      this.db.run(
        `INSERT OR IGNORE INTO branches 
         (name, address, city, state, postalCode, phone, email, latitude, longitude, 
          openingHours, services, manager, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [branch.name, branch.address, branch.city, branch.state, branch.postalCode,
         branch.phone, branch.email, branch.latitude, branch.longitude,
         branch.openingHours, branch.services, branch.manager, branch.description]
      );
    });
  }

  private createAdminUser(): void {
    // Usar require en lugar de import para evitar problemas
    const bcrypt = require('bcryptjs');
    
    // Verificar si ya existe el admin
    this.db.get('SELECT * FROM users WHERE email = ?', ['admin'], (err: any, row: any) => {
      if (err) {
        console.error('❌ Error checking admin user:', err);
        return;
      }
      
      if (!row) {
        console.log('🔨 Creando usuario admin...');
        // Crear usuario admin
        bcrypt.hash('admin', 10).then((hashedPassword: string) => {
          this.db.run(
            `INSERT INTO users (email, password, firstName, lastName, role) 
             VALUES (?, ?, ?, ?, ?)`,
            ['admin', hashedPassword, 'Administrador', 'MarVera', 'admin'],
            function(err: any) {
              if (err) {
                console.error('❌ Error creating admin user:', err);
              } else {
                console.log('✅ Usuario admin creado - email: admin, password: admin');
              }
            }
          );
        }).catch((err: any) => {
          console.error('❌ Error hashing password:', err);
        });
      } else {
        console.log('✅ Usuario admin ya existe en la base de datos');
      }
    });
  }

  public getDb(): Database {
    return this.db;
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export const dbManager = new DatabaseManager();
