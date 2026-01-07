import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        businessName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============= CATEGORIES =============
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        slug: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createCategory(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        slug: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ============= PRODUCTS =============
  products: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minMargin: z.number().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        const products = await db.getAllProducts(input);
        
        // Calculate profit margin for each product
        return products.map(product => {
          const wholesale = parseFloat(product.wholesalePrice);
          const retail = parseFloat(product.suggestedRetailPrice);
          const profitAmount = retail - wholesale;
          const profitMargin = ((profitAmount / retail) * 100);
          
          return {
            ...product,
            profitAmount: profitAmount.toFixed(2),
            profitMargin: profitMargin.toFixed(2),
          };
        });
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) return null;
        
        const wholesale = parseFloat(product.wholesalePrice);
        const retail = parseFloat(product.suggestedRetailPrice);
        const profitAmount = retail - wholesale;
        const profitMargin = ((profitAmount / retail) * 100);
        
        return {
          ...product,
          profitAmount: profitAmount.toFixed(2),
          profitMargin: profitMargin.toFixed(2),
        };
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.number().optional(),
        wholesalePrice: z.string(),
        suggestedRetailPrice: z.string(),
        stock: z.number().default(0),
        lowStockThreshold: z.number().default(10),
        imageUrl: z.string().optional(),
        imageUrls: z.string().optional(),
        weight: z.string().optional(),
        dimensions: z.string().optional(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.number().optional(),
        wholesalePrice: z.string().optional(),
        suggestedRetailPrice: z.string().optional(),
        stock: z.number().optional(),
        lowStockThreshold: z.number().optional(),
        imageUrl: z.string().optional(),
        imageUrls: z.string().optional(),
        weight: z.string().optional(),
        dimensions: z.string().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
    
    updateStock: adminProcedure
      .input(z.object({
        id: z.number(),
        stock: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateProductStock(input.id, input.stock);
        return { success: true };
      }),
  }),

  // ============= PRODUCT RESOURCES =============
  resources: router({
    listByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getResourcesByProductId(input.productId);
      }),
    
    create: adminProcedure
      .input(z.object({
        productId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductResource(input);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductResource(input.id);
        return { success: true };
      }),
  }),

  // ============= SUPPORT =============
  support: router({
    listTickets: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin') {
        return await db.getAllSupportTickets();
      }
      return await db.getAllSupportTickets(ctx.user.id);
    }),
    
    createTicket: protectedProcedure
      .input(z.object({
        subject: z.string(),
        message: z.string(),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSupportTicket({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    updateTicket: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSupportTicket(id, data);
        return { success: true };
      }),
    
    listFaqs: publicProcedure.query(async () => {
      return await db.getAllFaqs();
    }),
    
    createFaq: adminProcedure
      .input(z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        order: z.number().default(0),
        isPublished: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await db.createFaq(input);
        return { success: true };
      }),
    
    updateFaq: adminProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFaq(id, data);
        return { success: true };
      }),
    
    deleteFaq: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFaq(input.id);
        return { success: true };
      }),
  }),

  // ============= ADMIN =============
  admin: router({
    listDropshippers: adminProcedure.query(async () => {
      return await db.getAllDropshippers();
    }),
    
    getStats: adminProcedure.query(async () => {
      const dropshippers = await db.getAllDropshippers();
      const products = await db.getAllProducts({ isActive: true });
      const tickets = await db.getAllSupportTickets();
      
      return {
        totalDropshippers: dropshippers.length,
        approvedDropshippers: dropshippers.filter(d => d.isApproved).length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        lowStockProducts: products.filter(p => p.stock <= p.lowStockThreshold).length,
        openTickets: tickets.filter(t => t.status === 'open').length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
