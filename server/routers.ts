import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { sendOrderConfirmationEmails } from "./email";
import { adminRouter } from "./routers/admin";
import { registerUser, loginUser, verifyToken } from "./auth-service";

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
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await registerUser(input.email, input.password, input.name);
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error });
        }
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, result.token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        return result;
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await loginUser(input.email, input.password);
        if (!result.success) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: result.error });
        }
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, result.token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        return result;
      }),
    
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
        imageUrl: z.string().optional(),
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
        wholesalePrice: z.string().optional(),
        suggestedRetailPrice: z.string().optional(),
        stock: z.number().optional(),
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

  // ============= SUPPORT =============
  support: router({
    listFaqs: publicProcedure.query(async () => {
      return await db.getAllFaqs();
    }),
    
    createTicket: protectedProcedure
      .input(z.object({
        subject: z.string(),
        message: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSupportTicket({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    listTickets: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAllSupportTickets(ctx.user.id);
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

  // ============= WALLET =============
  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getOrCreateWallet(ctx.user.id);
      return wallet;
    }),
    
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getWalletByUserId(ctx.user.id);
      if (!wallet) return [];
      return await db.getWalletTransactions(wallet.id);
    }),
  }),

  // ============= ORDERS =============
  orders: router({
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string().email().optional(),
        customerIdNumber: z.string().optional(),
        deliveryAddress: z.string(),
        deliveryCity: z.string().optional(),
        deliveryDepartment: z.string().optional(),
        deliveryPostalCode: z.string().optional(),
        googleMapsLocation: z.string().optional(),
        paymentMethod: z.enum(['card', 'transfer', 'tigo_money', 'cash', 'cash_on_delivery']),
        quantity: z.number().min(1),
        unitPrice: z.string(),
        commissionPercentage: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        
        const totalAmount = (parseFloat(input.unitPrice) * input.quantity).toString();
        const commissionAmount = (parseFloat(totalAmount) * parseFloat(input.commissionPercentage) / 100).toString();
        
        const result = await db.createOrder({
          dropshipperId: ctx.user.id,
          productId: input.productId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          customerIdNumber: input.customerIdNumber,
          deliveryAddress: input.deliveryAddress,
          deliveryCity: input.deliveryCity,
          deliveryDepartment: input.deliveryDepartment,
          deliveryPostalCode: input.deliveryPostalCode,
          googleMapsLocation: input.googleMapsLocation,
          paymentMethod: input.paymentMethod as any,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          totalAmount: totalAmount,
          commissionPercentage: input.commissionPercentage,
          commissionAmount: commissionAmount,
          notes: input.notes,
          status: 'pending',
        });
        
        const orderId = (result as any).insertId || 0;
        
        // Send confirmation emails asynchronously
        if (orderId) {
          sendOrderConfirmationEmails(orderId).catch(err => {
            console.error('Failed to send confirmation emails:', err);
          });
        }
        
        return { success: true, orderId };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByDropshipper(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) return null;
        
        // Verify ownership
        if (order.dropshipperId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return order;
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
        
        if (order.dropshipperId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============= SALES STRATEGIES =============
  strategies: router({
    getByProductId: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductStrategy(input.productId);
      }),
    
    create: adminProcedure
      .input(z.object({
        productId: z.number(),
        objections: z.array(z.object({
          objection: z.string(),
          response: z.string(),
        })).optional(),
        salesHooks: z.array(z.string()).optional(),
        faqs: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProductStrategy(input);
        return { success: true };
      }),
  }),

  // ============= SHIPPING COSTS =============
  shipping: router({
    getCities: publicProcedure.query(async () => {
      return await db.getShippingCosts();
    }),
    
    getCostByCity: publicProcedure
      .input(z.object({ city: z.string() }))
      .query(async ({ input }) => {
        return await db.getShippingCostByCity(input.city);
      }),
  }),

  // ============= PRODUCT MEDIA =============
  productMedia: router({
    getByProductId: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductMedia(input.productId);
      }),
    
    create: adminProcedure
      .input(z.object({
        productId: z.number(),
        type: z.enum(['photo', 'video', 'link']),
        url: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addProductMedia(input);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductMedia(input.id);
        return { success: true };
      }),
  }),

  // ============= NOTIFICATIONS =============
  notifications: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const orders = await db.getOrdersByDropshipper(ctx.user.id);
      const notifications: any[] = [];
      for (const order of orders) {
        const notifs = await db.getEmailNotificationsByOrderId(order.id);
        notifications.push(...notifs);
      }
      return notifications;
    }),
    
    getAdminHistory: adminProcedure.query(async () => {
      return await db.getFailedEmailNotifications();
    }),
  }),
});
