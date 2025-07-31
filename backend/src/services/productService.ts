import prisma from '../lib/prisma';
import { Product, Category } from '../types';

export class ProductService {

  static async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      
      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }

  static async getAllProducts(categoryId?: number, search?: string): Promise<Product[]> {
    try {
      const where: any = { isActive: true };
      
      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { name: 'asc' }
        ]
      });

      return products.map(product => ({
        ...product,
        categoryName: product.category?.name,
        category_id: product.categoryId,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
      }));
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isFeatured: true
        },
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: { name: 'asc' },
        take: 6
      });

      return products.map(product => ({
        ...product,
        categoryName: product.category?.name,
        category_id: product.categoryId,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
      }));
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      return [];
    }
  }

  static async getProductById(id: number): Promise<Product | null> {
    try {
      const product = await prisma.product.findFirst({
        where: {
          id: id,
          isActive: true
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      if (product) {
        return {
          ...product,
          categoryName: product.category?.name,
          category_id: product.categoryId,
          images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      return null;
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const product = await prisma.product.findFirst({
        where: {
          slug: slug,
          isActive: true
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      if (product) {
        return {
          ...product,
          categoryName: product.category?.name,
          category_id: product.categoryId,
          images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo producto por slug:', error);
      return null;
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          comparePrice: productData.comparePrice,
          categoryId: productData.category_id,
          stock: productData.stock,
          unit: productData.unit,
          images: JSON.stringify(Array.isArray(productData.images) ? productData.images : []),
          isActive: productData.isActive,
          isFeatured: productData.isFeatured
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      return {
        ...product,
        categoryName: product.category?.name,
        category_id: product.categoryId,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
      };
    } catch (error) {
      console.error('Error creando producto:', error);
      return null;
    }
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
    try {
      const updateData: any = {};

      if (productData.name) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.stock !== undefined) updateData.stock = productData.stock;
      if (productData.images !== undefined) {
        updateData.images = JSON.stringify(Array.isArray(productData.images) ? productData.images : []);
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: { name: true }
          }
        }
      });

      return {
        ...product,
        categoryName: product.category?.name,
        category_id: product.categoryId,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || [])
      };
    } catch (error) {
      console.error('Error actualizando producto:', error);
      return null;
    }
  }

  static async deleteProduct(id: number): Promise<boolean> {
    try {
      // Verificar que el producto existe
      const product = await ProductService.getProductById(id);
      if (!product) {
        return false;
      }

      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      return true;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return false;
    }
  }
}
