import prisma from '../lib/prisma';
import { Order, OrderItem } from '../types';

type OrderWithRelations = {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string | null;
  paymentStatus: string;
  shippingAddress: string | null;
  deliveryDate: Date | null;
  driverId: number | null;
  trackingCode: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  driver?: {
    firstName: string;
    lastName: string;
  } | null;
  orderItems?: {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    total: number;
    product?: {
      name: string;
      unit: string;
    };
  }[];
};

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
          paymentMethod: orderData.paymentMethod || null,
          paymentStatus: orderData.paymentStatus || 'pending',
          shippingAddress: orderData.shippingAddress || null,
          notes: orderData.notes || null,
          orderItems: orderData.items ? {
            create: orderData.items.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
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
          orderItems: {
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
      }) as OrderWithRelations;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        user_id: order.userId,
        status: order.status as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled',
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod || undefined,
        paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        shippingAddress: order.shippingAddress || undefined,
        deliveryDate: order.deliveryDate || undefined,
        driver_id: order.driverId || undefined,
        trackingCode: order.trackingCode || undefined,
        notes: order.notes || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems?.map(item => ({
          id: item.id,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          quantity: item.quantity,
          price: item.price
        })) || []
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
          orderItems: {
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
        id: order.id,
        orderNumber: order.orderNumber,
        user_id: order.userId,
        status: order.status as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled',
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod || undefined,
        paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        shippingAddress: order.shippingAddress || undefined,
        deliveryDate: order.deliveryDate || undefined,
        driver_id: order.driverId || undefined,
        trackingCode: order.trackingCode || undefined,
        notes: order.notes || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems?.map(item => ({
          id: item.id,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          quantity: item.quantity,
          price: item.price
        })) || []
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
          orderItems: {
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
      }) as OrderWithRelations[];

      return orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        user_id: order.userId,
        status: order.status as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled',
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod || undefined,
        paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        shippingAddress: order.shippingAddress || undefined,
        deliveryDate: order.deliveryDate || undefined,
        driver_id: order.driverId || undefined,
        trackingCode: order.trackingCode || undefined,
        notes: order.notes || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems?.map(item => ({
          id: item.id,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          quantity: item.quantity,
          price: item.price
        })) || []
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
          orderItems: {
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
      }) as OrderWithRelations[];

      return orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        user_id: order.userId,
        status: order.status as 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled',
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod || undefined,
        paymentStatus: order.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        shippingAddress: order.shippingAddress || undefined,
        deliveryDate: order.deliveryDate || undefined,
        driver_id: order.driverId || undefined,
        trackingCode: order.trackingCode || undefined,
        notes: order.notes || undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems?.map(item => ({
          id: item.id,
          product_id: item.productId,
          order_id: item.orderId,
          productName: item.product?.name,
          quantity: item.quantity,
          price: item.price
        })) || []
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
