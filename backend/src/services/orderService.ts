import prisma from '../lib/prisma';
import { Order, OrderItem } from '../types';

export class OrderService {

  static async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      // Generar número de orden único
      const orderNumber = this.generateOrderNumber();

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: orderData.user_id,
          status: orderData.status || 'pending',
          subtotal: orderData.subtotal,
          shippingCost: orderData.shippingCost || 0,
          tax: orderData.tax || 0,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus || 'pending',
          shippingAddress: orderData.shippingAddress,
          notes: orderData.notes,
          items: orderData.items ? {
            create: orderData.items.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price
            }))
          } : undefined
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  unit: true
                }
              }
            }
          }
        }
      });

      return {
        ...order,
        user_id: order.userId,
        driver_id: order.driverId,
        firstName: order.user?.firstName,
        lastName: order.user?.lastName,
        email: order.user?.email,
        driverFirstName: order.driver?.firstName,
        driverLastName: order.driver?.lastName,
        items: order.items.map(item => ({
          ...item,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          unit: item.product?.unit
        }))
      };
    } catch (error) {
      console.error('Error creando orden:', error);
      return null;
    }
  }

  static async getOrderById(id: number): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  unit: true
                }
              }
            }
          }
        }
      });

      if (!order) return null;

      return {
        ...order,
        user_id: order.userId,
        driver_id: order.driverId,
        firstName: order.user?.firstName,
        lastName: order.user?.lastName,
        email: order.user?.email,
        driverFirstName: order.driver?.firstName,
        driverLastName: order.driver?.lastName,
        items: order.items.map(item => ({
          ...item,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          unit: item.product?.unit
        }))
      };
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      return null;
    }
  }

  static async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  unit: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders.map(order => ({
        ...order,
        user_id: order.userId,
        driver_id: order.driverId,
        driverFirstName: order.driver?.firstName,
        driverLastName: order.driver?.lastName,
        items: order.items.map(item => ({
          ...item,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          unit: item.product?.unit
        }))
      }));
    } catch (error) {
      console.error('Error obteniendo órdenes del usuario:', error);
      return [];
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          driver: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  unit: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders.map(order => ({
        ...order,
        user_id: order.userId,
        driver_id: order.driverId,
        firstName: order.user?.firstName,
        lastName: order.user?.lastName,
        email: order.user?.email,
        driverFirstName: order.driver?.firstName,
        driverLastName: order.driver?.lastName,
        items: order.items.map(item => ({
          ...item,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          unit: item.product?.unit
        }))
      }));
    } catch (error) {
      console.error('Error obteniendo todas las órdenes:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId: number, status: Order['status']): Promise<Order | null> {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      return null;
    }
  }

  static async assignDriver(orderId: number, driverId: number): Promise<Order | null> {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          driverId: driverId,
          status: 'shipped'
        }
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
