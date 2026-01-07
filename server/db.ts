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
  InsertProduct,
  InsertCategory,
  InsertProductResource,
  InsertSupportTicket,
  InsertFaq
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
