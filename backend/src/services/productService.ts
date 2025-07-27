import { dbManager } from '../database/database';
import { Product, Category } from '../types';

export class ProductService {

  static async getAllCategories(): Promise<Category[]> {
    try {
      const db = dbManager.getDb();
      
      return new Promise<Category[]>((resolve, reject) => {
        db.all(
          'SELECT * FROM categories WHERE isActive = 1 ORDER BY name',
          [],
          (err, rows: Category[]) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }

  static async getAllProducts(categoryId?: number, search?: string): Promise<Product[]> {
    try {
      const db = dbManager.getDb();
      
      let query = `
        SELECT p.*, c.name as categoryName 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.isActive = 1
      `;
      
      const params: any[] = [];

      if (categoryId) {
        query += ' AND p.category_id = ?';
        params.push(categoryId);
      }

      if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY p.isFeatured DESC, p.name';

      return new Promise<Product[]>((resolve, reject) => {
        db.all(query, params, (err, rows: Product[]) => {
          if (err) reject(err);
          else {
            // Parsear images JSON si existe
            const products = rows.map(product => ({
              ...product,
              images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
            }));
            resolve(products);
          }
        });
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const db = dbManager.getDb();
      
      return new Promise<Product[]>((resolve, reject) => {
        db.all(
          `SELECT p.*, c.name as categoryName 
           FROM products p 
           LEFT JOIN categories c ON p.category_id = c.id 
           WHERE p.isActive = 1 AND p.isFeatured = 1 
           ORDER BY p.name 
           LIMIT 6`,
          [],
          (err, rows: Product[]) => {
            if (err) reject(err);
            else {
              const products = rows.map(product => ({
                ...product,
                images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
              }));
              resolve(products);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      return [];
    }
  }

  static async getProductById(id: number): Promise<Product | null> {
    try {
      const db = dbManager.getDb();
      
      return new Promise<Product | null>((resolve, reject) => {
        db.get(
          `SELECT p.*, c.name as categoryName 
           FROM products p 
           LEFT JOIN categories c ON p.category_id = c.id 
           WHERE p.id = ? AND p.isActive = 1`,
          [id],
          (err, row: Product) => {
            if (err) reject(err);
            else {
              if (row) {
                const product = {
                  ...row,
                  images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || [])
                };
                resolve(product);
              } else {
                resolve(null);
              }
            }
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      return null;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const db = dbManager.getDb();
      
      return new Promise<Product | null>((resolve, reject) => {
        db.get(
          `SELECT p.*, c.name as categoryName 
           FROM products p 
           LEFT JOIN categories c ON p.category_id = c.id 
           WHERE p.slug = ? AND p.isActive = 1`,
          [slug],
          (err, row: Product) => {
            if (err) reject(err);
            else {
              if (row) {
                const product = {
                  ...row,
                  images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || [])
                };
                resolve(product);
              } else {
                resolve(null);
              }
            }
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo producto por slug:', error);
      return null;
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
      const db = dbManager.getDb();
      
      const productId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO products 
           (name, slug, description, price, comparePrice, category_id, stock, unit, images, isActive, isFeatured) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productData.name,
            productData.slug,
            productData.description,
            productData.price,
            productData.comparePrice,
            productData.category_id,
            productData.stock,
            productData.unit,
            JSON.stringify(Array.isArray(productData.images) ? productData.images : []),
            productData.isActive ? 1 : 0,
            productData.isFeatured ? 1 : 0
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      return await ProductService.getProductById(productId);
    } catch (error) {
      console.error('Error creando producto:', error);
      return null;
    }
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
    try {
      const db = dbManager.getDb();
      
      const fields: string[] = [];
      const values: any[] = [];

      if (productData.name) {
        fields.push('name = ?');
        values.push(productData.name);
      }
      if (productData.description !== undefined) {
        fields.push('description = ?');
        values.push(productData.description);
      }
      if (productData.price !== undefined) {
        fields.push('price = ?');
        values.push(productData.price);
      }
      if (productData.stock !== undefined) {
        fields.push('stock = ?');
        values.push(productData.stock);
      }
      if (productData.images !== undefined) {
        fields.push('images = ?');
        values.push(JSON.stringify(Array.isArray(productData.images) ? productData.images : []));
      }

      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      await new Promise<void>((resolve, reject) => {
        db.run(
          `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
          values,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      return await ProductService.getProductById(id);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      return null;
    }
  }
}
