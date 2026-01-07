import { eq, and, like, gte, lte, desc, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  products, 
  categories, 
  productResources, 
  supportTickets, 
  faqs,
  wallets,
  walletTransactions,
  orders,
  productStrategies,
  commissionSettings,
  emailNotifications,
  InsertProduct,
  InsertCategory,
  InsertProductResource,
  InsertSupportTicket,
  InsertFaq,
  InsertWallet,
  InsertWalletTransaction,
  InsertOrder,
  InsertProductStrategy,
  InsertCommissionSetting,
  InsertEmailNotification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER MANAGEMENT =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "businessName"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.isApproved !== undefined) {
      values.isApproved = user.isApproved;
      updateSet.isApproved = user.isApproved;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDropshippers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).where(eq(users.role, 'user')).orderBy(desc(users.createdAt));
}

export async function updateUserProfile(userId: number, data: { name?: string; email?: string; phone?: string; businessName?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============= CATEGORY MANAGEMENT =============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(categories).where(eq(categories.id, id));
}

// ============= PRODUCT MANAGEMENT =============

export async function getAllProducts(filters?: {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minMargin?: number;
  search?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(products).$dynamic();
  
  const conditions = [];
  
  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  
  if (filters?.minPrice !== undefined) {
    conditions.push(gte(products.wholesalePrice, filters.minPrice.toString()));
  }
  
  if (filters?.maxPrice !== undefined) {
    conditions.push(lte(products.wholesalePrice, filters.maxPrice.toString()));
  }
  
  if (filters?.search) {
    conditions.push(
      or(
        like(products.name, `%${filters.search}%`),
        like(products.description, `%${filters.search}%`),
        like(products.sku, `%${filters.search}%`)
      )
    );
  }
  
  if (filters?.isActive !== undefined) {
    conditions.push(eq(products.isActive, filters.isActive));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const results = await query.orderBy(desc(products.createdAt));
  
  // Filter by margin if specified
  if (filters?.minMargin !== undefined) {
    return results.filter(product => {
      const wholesale = parseFloat(product.wholesalePrice);
      const retail = parseFloat(product.suggestedRetailPrice);
      const margin = ((retail - wholesale) / retail) * 100;
      return margin >= filters.minMargin!;
    });
  }
  
  return results;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(eq(products.id, id));
}

export async function updateProductStock(id: number, newStock: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set({ stock: newStock }).where(eq(products.id, id));
}

// ============= PRODUCT RESOURCES =============

export async function getResourcesByProductId(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(productResources).where(eq(productResources.productId, productId));
}

export async function createProductResource(data: InsertProductResource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(productResources).values(data);
  return result;
}

export async function deleteProductResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(productResources).where(eq(productResources.id, id));
}

// ============= SUPPORT TICKETS =============

export async function getAllSupportTickets(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
  }
  
  return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function createSupportTicket(data: InsertSupportTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(supportTickets).values(data);
  return result;
}

export async function updateSupportTicket(id: number, data: Partial<InsertSupportTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

// ============= FAQ =============

export async function getAllFaqs() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(faqs.order, faqs.createdAt);
}

export async function createFaq(data: InsertFaq) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(faqs).values(data);
  return result;
}

export async function updateFaq(id: number, data: Partial<InsertFaq>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFaq(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(faqs).where(eq(faqs.id, id));
}

// ============= WALLET MANAGEMENT =============

export async function getOrCreateWallet(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  const result = await db.insert(wallets).values({ userId });
  const newWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return newWallet[0];
}

export async function getWalletByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWalletBalance(walletId: number, newBalance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId));
}

export async function addWalletTransaction(data: InsertWalletTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(walletTransactions).values(data);
}

export async function getWalletTransactions(walletId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(walletTransactions).where(eq(walletTransactions.walletId, walletId)).orderBy(desc(walletTransactions.createdAt));
}

// ============= ORDER MANAGEMENT =============

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(orders).values(data);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByDropshipper(dropshipperId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders).where(eq(orders.dropshipperId, dropshipperId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// ============= PRODUCT STRATEGIES =============

export async function getProductStrategy(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(productStrategies).where(eq(productStrategies.productId, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProductStrategy(data: InsertProductStrategy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(productStrategies).values(data);
}

export async function updateProductStrategy(productId: number, data: Partial<InsertProductStrategy>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(productStrategies).set(data).where(eq(productStrategies.productId, productId));
}

// ============= COMMISSION SETTINGS =============

export async function getCommissionSettings(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (productId) {
    const result = await db.select().from(commissionSettings).where(eq(commissionSettings.productId, productId)).limit(1);
    return result.length > 0 ? result : [];
  }
  
  return await db.select().from(commissionSettings);
}

export async function setCommissionSettings(data: InsertCommissionSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(commissionSettings).values(data);
}


// ============= EMAIL NOTIFICATIONS =============

export async function createEmailNotification(data: InsertEmailNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(emailNotifications).values(data);
}

export async function updateEmailNotificationStatus(
  id: number,
  status: "sent" | "failed" | "bounced",
  failureReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {
    status,
    sentAt: new Date(),
  };
  
  if (failureReason) {
    updateData.failureReason = failureReason;
  }
  
  return await db.update(emailNotifications).set(updateData).where(eq(emailNotifications.id, id));
}

export async function getEmailNotificationsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(emailNotifications).where(eq(emailNotifications.orderId, orderId));
}

export async function getFailedEmailNotifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(emailNotifications)
    .where(and(
      eq(emailNotifications.status, "failed"),
      lte(emailNotifications.retryCount, 3)
    ))
    .limit(10);
}

export async function incrementEmailNotificationRetry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(emailNotifications)
    .set({ retryCount: sql`${emailNotifications.retryCount} + 1` })
    .where(eq(emailNotifications.id, id));
}
