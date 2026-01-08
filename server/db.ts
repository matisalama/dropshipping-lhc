import { eq, and, like, gte, lte, desc, sql, or, asc } from "drizzle-orm";
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
  permissions,
  roles,
  rolePermissions,
  userRoles,
  auditLog,
  dropshipperProfiles,
  orderIssues,
  productMedia,
  shippingCosts,
  InsertProductMedia,
  InsertShippingCost,
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
  InsertEmailNotification,
  InsertPermission,
  InsertRole,
  InsertAuditLog,
  InsertDropshipperProfile,
  InsertOrderIssue
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


// ============= ROLES AND PERMISSIONS =============

export async function initializeDefaultRoles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if roles already exist
  const existingRoles = await db.select().from(roles).limit(1);
  if (existingRoles.length > 0) return;
  
  // Create default roles
  await db.insert(roles).values([
    { name: 'admin', description: 'Administrator with full access', isSystem: true },
    { name: 'dropshipper', description: 'Dropshipper user', isSystem: true },
    { name: 'support', description: 'Support staff', isSystem: true },
  ]);
  
  // Create default permissions
  const defaultPermissions = [
    // Product permissions
    { name: 'view_products', description: 'View products', category: 'products' },
    { name: 'create_products', description: 'Create products', category: 'products' },
    { name: 'edit_products', description: 'Edit products', category: 'products' },
    { name: 'delete_products', description: 'Delete products', category: 'products' },
    
    // User permissions
    { name: 'view_users', description: 'View users', category: 'users' },
    { name: 'manage_users', description: 'Manage users and roles', category: 'users' },
    { name: 'manage_permissions', description: 'Manage permissions', category: 'users' },
    
    // Order permissions
    { name: 'view_all_orders', description: 'View all orders', category: 'orders' },
    { name: 'view_own_orders', description: 'View own orders', category: 'orders' },
    { name: 'manage_orders', description: 'Manage orders', category: 'orders' },
    
    // Analytics permissions
    { name: 'view_analytics', description: 'View analytics', category: 'analytics' },
    { name: 'view_own_analytics', description: 'View own analytics', category: 'analytics' },
  ];
  
  await db.insert(permissions).values(defaultPermissions);
  
  // Assign permissions to admin role
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
  const allPermissions = await db.select().from(permissions);
  
  if (adminRole.length > 0) {
    await db.insert(rolePermissions).values(
      allPermissions.map(p => ({ roleId: adminRole[0].id, permissionId: p.id }))
    );
  }
  
  // Assign permissions to dropshipper role
  const dropshipperRole = await db.select().from(roles).where(eq(roles.name, 'dropshipper')).limit(1);
  const dropshipperPerms = allPermissions.filter(p => 
    ['view_products', 'view_own_orders', 'view_own_analytics'].includes(p.name)
  );
  
  if (dropshipperRole.length > 0) {
    await db.insert(rolePermissions).values(
      dropshipperPerms.map(p => ({ roleId: dropshipperRole[0].id, permissionId: p.id }))
    );
  }
}

export async function getUserRoles(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userRolesList = await db.select({
    role: roles,
  })
  .from(userRoles)
  .innerJoin(roles, eq(userRoles.roleId, roles.id))
  .where(eq(userRoles.userId, userId));
  
  return userRolesList.map(ur => ur.role);
}

export async function getUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userPerms = await db.select({
    permission: permissions,
  })
  .from(userRoles)
  .innerJoin(roles, eq(userRoles.roleId, roles.id))
  .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
  .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
  .where(eq(userRoles.userId, userId));
  
  return userPerms.map(up => up.permission);
}

export async function hasPermission(userId: number, permissionName: string): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return userPerms.some(p => p.name === permissionName);
}

export async function assignRoleToUser(userId: number, roleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Remove existing roles
  await db.delete(userRoles).where(eq(userRoles.userId, userId));
  
  // Assign new role
  await db.insert(userRoles).values({ userId, roleId });
}

export async function getAllRoles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(roles);
}

export async function getRoleWithPermissions(roleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const roleData = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  if (roleData.length === 0) return null;
  
  const rolePerms = await db.select({
    permission: permissions,
  })
  .from(rolePermissions)
  .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
  .where(eq(rolePermissions.roleId, roleId));
  
  return {
    ...roleData[0],
    permissions: rolePerms.map(rp => rp.permission),
  };
}

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(auditLog).values(data);
}

// ============= DROPSHIPPER PROFILES =============

export async function getOrCreateDropshipperProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(dropshipperProfiles).where(eq(dropshipperProfiles.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  await db.insert(dropshipperProfiles).values({ userId });
  const created = await db.select().from(dropshipperProfiles).where(eq(dropshipperProfiles.userId, userId)).limit(1);
  
  return created[0];
}

export async function updateDropshipperProfile(userId: number, data: Partial<InsertDropshipperProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(dropshipperProfiles)
    .set(data)
    .where(eq(dropshipperProfiles.userId, userId));
}

export async function getDropshipperProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(dropshipperProfiles).where(eq(dropshipperProfiles.userId, userId)).limit(1);
}

// ============= ORDER ISSUES =============

export async function createOrderIssue(data: InsertOrderIssue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(orderIssues).values(data);
}

export async function getOrderIssues(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(orderIssues).where(eq(orderIssues.orderId, orderId));
}

export async function getOpenIssuesForDropshipper(dropshipperId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select({
    issue: orderIssues,
    order: orders,
  })
  .from(orderIssues)
  .innerJoin(orders, eq(orderIssues.orderId, orders.id))
  .where(and(
    eq(orders.dropshipperId, dropshipperId),
    eq(orderIssues.status, 'open')
  ));
}

export async function updateOrderIssue(issueId: number, data: Partial<InsertOrderIssue>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(orderIssues)
    .set(data)
    .where(eq(orderIssues.id, issueId));
}


// Product Media Functions
export async function addProductMedia(data: {
  productId: number;
  type: "photo" | "video" | "link";
  url: string;
  title?: string;
  description?: string;
  displayOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(productMedia).values(data);
}

export async function getProductMedia(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(productMedia)
    .where(eq(productMedia.productId, productId))
    .orderBy(asc(productMedia.displayOrder));
}

export async function deleteProductMedia(mediaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(productMedia).where(eq(productMedia.id, mediaId));
}

export async function updateProductMedia(mediaId: number, data: Partial<InsertProductMedia>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(productMedia)
    .set(data)
    .where(eq(productMedia.id, mediaId));
}

// Shipping Costs Functions
export async function getShippingCosts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(shippingCosts).orderBy(asc(shippingCosts.city));
}

export async function getShippingCostByCity(city: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(shippingCosts)
    .where(eq(shippingCosts.city, city))
    .limit(1);
  
  return result[0];
}

export async function addShippingCost(data: InsertShippingCost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(shippingCosts).values(data);
}

export async function updateShippingCost(city: string, data: Partial<InsertShippingCost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(shippingCosts)
    .set(data)
    .where(eq(shippingCosts.city, city));
}

export async function seedShippingCosts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cities = [
    { city: "Asunción", standardCost: 20000, sameDayCost: 25000 },
    { city: "Fdo. de la Mora", standardCost: 25000, sameDayCost: 30000 },
    { city: "Lambaré", standardCost: 25000, sameDayCost: 30000 },
    { city: "San Lorenzo", standardCost: 25000, sameDayCost: 30000 },
    { city: "Villa Elisa", standardCost: 25000, sameDayCost: 30000 },
    { city: "Ñemby", standardCost: 25000, sameDayCost: 30000 },
    { city: "Luque", standardCost: 25000, sameDayCost: 30000 },
    { city: "M. Roque Alonso", standardCost: 25000, sameDayCost: 30000 },
    { city: "Capiatá", standardCost: 35000, sameDayCost: 40000 },
    { city: "San Antonio", standardCost: 35000, sameDayCost: 40000 },
    { city: "Areguá", standardCost: 35000, sameDayCost: 40000 },
    { city: "Limpio", standardCost: 35000, sameDayCost: 40000 },
    { city: "Ypané", standardCost: 35000, sameDayCost: 40000 },
    { city: "J. A. Saldivar", standardCost: 35000, sameDayCost: 40000 },
    { city: "Villeta", standardCost: 35000, sameDayCost: 40000 },
    { city: "Itauguá", standardCost: 35000, sameDayCost: 40000 },
    { city: "Itá", standardCost: 35000, sameDayCost: 40000 },
    { city: "Ypacaraí", standardCost: 35000, sameDayCost: 40000 },
    { city: "Emboscada", standardCost: 35000, sameDayCost: 40000 },
    { city: "San Bernardino", standardCost: 35000, sameDayCost: 40000 },
    { city: "Nueva Italia", standardCost: 35000, sameDayCost: 40000 },
    { city: "Pirayú", standardCost: 35000, sameDayCost: 40000 },
    { city: "Pedrozo", standardCost: 35000, sameDayCost: 40000 },
    { city: "Yaguarón", standardCost: 35000, sameDayCost: 40000 },
    { city: "Loma Grande", standardCost: 40000, sameDayCost: 45000 },
    { city: "Caacupé", standardCost: 40000, sameDayCost: 45000 },
    { city: "Altos", standardCost: 40000, sameDayCost: 45000 },
    { city: "Atyrá", standardCost: 40000, sameDayCost: 45000 },
    { city: "Paraguarí", standardCost: 40000, sameDayCost: 45000 },
  ];
  
  for (const city of cities) {
    try {
      await db.insert(shippingCosts).values(city).onDuplicateKeyUpdate({
        set: {
          standardCost: city.standardCost,
          sameDayCost: city.sameDayCost,
        },
      });
    } catch (error) {
      console.warn(`Failed to insert shipping cost for ${city.city}:`, error);
    }
  }
}
