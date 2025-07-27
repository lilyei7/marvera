import { dbManager } from '../database/database';
import { Order, OrderItem } from '../types';

export class OrderService {

  static async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      const db = dbManager.getDb();
      
      // Generar número de orden único
      const orderNumber = this.generateOrderNumber();

      const orderId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO orders 
           (orderNumber, user_id, status, subtotal, shippingCost, tax, total, paymentMethod, paymentStatus, shippingAddress, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderNumber,
            orderData.user_id,
            orderData.status || 'pending',
            orderData.subtotal,
            orderData.shippingCost || 0,
            orderData.tax || 0,
            orderData.total,
            orderData.paymentMethod,
            orderData.paymentStatus || 'pending',
            orderData.shippingAddress,
            orderData.notes
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Insertar items del pedido
      if (orderData.items && orderData.items.length > 0) {
        for (const item of orderData.items) {
          await new Promise<void>((resolve, reject) => {
            db.run(
              'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
              [orderId, item.product_id, item.quantity, item.price],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error creando orden:', error);
      return null;
    }
  }

  static async getOrderById(id: number): Promise<Order | null> {
    try {
      const db = dbManager.getDb();

      const order = await new Promise<Order | null>((resolve, reject) => {
        db.get(
          `SELECT o.*, u.firstName, u.lastName, u.email, d.firstName as driverFirstName, d.lastName as driverLastName
           FROM orders o
           LEFT JOIN users u ON o.user_id = u.id
           LEFT JOIN drivers d ON o.driver_id = d.id
           WHERE o.id = ?`,
          [id],
          (err, row: any) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });

      if (!order) return null;

      // Obtener items del pedido
      const items = await new Promise<OrderItem[]>((resolve, reject) => {
        db.all(
          `SELECT oi.*, p.name as productName, p.unit
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [id],
          (err, rows: any[]) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      return {
        ...order,
        items
      };
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      return null;
    }
  }

  static async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      const db = dbManager.getDb();

      return new Promise<Order[]>((resolve, reject) => {
        db.all(
          `SELECT o.*, d.firstName as driverFirstName, d.lastName as driverLastName
           FROM orders o
           LEFT JOIN drivers d ON o.driver_id = d.id
           WHERE o.user_id = ?
           ORDER BY o.createdAt DESC`,
          [userId],
          async (err, rows: any[]) => {
            if (err) {
              reject(err);
            } else {
              // Obtener items para cada orden
              const ordersWithItems = await Promise.all(
                rows.map(async (order) => {
                  const items = await new Promise<OrderItem[]>((resolve, reject) => {
                    db.all(
                      `SELECT oi.*, p.name as productName, p.unit
                       FROM order_items oi
                       LEFT JOIN products p ON oi.product_id = p.id
                       WHERE oi.order_id = ?`,
                      [order.id],
                      (err, itemRows: any[]) => {
                        if (err) reject(err);
                        else resolve(itemRows || []);
                      }
                    );
                  });
                  return { ...order, items };
                })
              );
              resolve(ordersWithItems);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo órdenes del usuario:', error);
      return [];
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const db = dbManager.getDb();

      return new Promise<Order[]>((resolve, reject) => {
        db.all(
          `SELECT o.*, u.firstName, u.lastName, u.email, d.firstName as driverFirstName, d.lastName as driverLastName
           FROM orders o
           LEFT JOIN users u ON o.user_id = u.id
           LEFT JOIN drivers d ON o.driver_id = d.id
           ORDER BY o.createdAt DESC`,
          [],
          async (err, rows: any[]) => {
            if (err) {
              reject(err);
            } else {
              // Obtener items para cada orden
              const ordersWithItems = await Promise.all(
                rows.map(async (order) => {
                  const items = await new Promise<OrderItem[]>((resolve, reject) => {
                    db.all(
                      `SELECT oi.*, p.name as productName, p.unit
                       FROM order_items oi
                       LEFT JOIN products p ON oi.product_id = p.id
                       WHERE oi.order_id = ?`,
                      [order.id],
                      (err, itemRows: any[]) => {
                        if (err) reject(err);
                        else resolve(itemRows || []);
                      }
                    );
                  });
                  return { ...order, items };
                })
              );
              resolve(ordersWithItems);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo todas las órdenes:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: number, status: Order['status']): Promise<Order | null> {
    try {
      const db = dbManager.getDb();

      await new Promise<void>((resolve, reject) => {
        db.run(
          'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [status, orderId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      return null;
    }
  }

  static async assignDriver(orderId: number, driverId: number): Promise<Order | null> {
    try {
      const db = dbManager.getDb();

      await new Promise<void>((resolve, reject) => {
        db.run(
          'UPDATE orders SET driver_id = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [driverId, 'shipped', orderId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error asignando conductor:', error);
      return null;
    }
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `MV-${timestamp}-${random}`.toUpperCase();
  }
}
