import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with dropshipper-specific fields.
 */
/**
 * Users table with local authentication support
 * passwordHash: bcrypt hash for local auth
 * openId: optional for OAuth legacy support
 * email: unique identifier for local auth
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  passwordHash: text("passwordHash"),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Dropshipper specific fields
  phone: varchar("phone", { length: 20 }),
  businessName: text("businessName"),
  isApproved: boolean("isApproved").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product categories for organization and filtering
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products available for dropshipping
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  marketingName: text("marketingName"), // Nombre de marketing (breve descripción)
  sku: varchar("sku", { length: 100 }).unique(),
  categoryId: int("categoryId").references(() => categories.id),
  
  // Pricing
  wholesalePrice: decimal("wholesalePrice", { precision: 10, scale: 2 }).notNull(), // Precio mayorista
  suggestedRetailPrice: decimal("suggestedRetailPrice", { precision: 10, scale: 2 }).notNull(), // Precio sugerido de venta
  previousPrice: decimal("previousPrice", { precision: 10, scale: 2 }), // Precio anterior para mostrar descuento
  
  // Stock management
  stock: int("stock").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  
  // Product media
  imageUrl: text("imageUrl"),
  imageUrls: text("imageUrls"), // JSON array of additional images
  
  // Categories (múltiples)
  categories: text("categories"), // JSON array of category names
  
  // Combinations (talles, colores, tamaños, etc)
  combinations: text("combinations"), // JSON array of combinations
  
  // Web URL
  webUrl: text("webUrl"), // URL a la página web del producto
  
  // Product details
  weight: decimal("weight", { precision: 8, scale: 2 }), // in kg
  dimensions: text("dimensions"), // JSON: {length, width, height}
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product resources (downloadable content for dropshippers)
 */
export const productResources = mysqlTable("productResources", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").references(() => products.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileType: varchar("fileType", { length: 50 }), // e.g., 'image', 'pdf', 'video'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductResource = typeof productResources.$inferSelect;
export type InsertProductResource = typeof productResources.$inferInsert;

/**
 * Support tickets from dropshippers
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * FAQ entries for self-service support
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  order: int("order").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;

/**
 * Dropshipper wallet for tracking earnings
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0").notNull(),
  totalWithdrawn: decimal("totalWithdrawn", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Wallet transactions (earnings, withdrawals, refunds)
 */
export const walletTransactions = mysqlTable("walletTransactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").references(() => wallets.id).notNull(),
  orderId: int("orderId").references(() => orders.id),
  type: mysqlEnum("type", ["sale_commission", "withdrawal", "refund", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Sales/Orders created by dropshippers
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  dropshipperId: int("dropshipperId").references(() => users.id).notNull(),
  productId: int("productId").references(() => products.id).notNull(),
  
  // Customer information
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerIdNumber: varchar("customerIdNumber", { length: 50 }), // Cédula o RUC
  
  // Delivery information
  deliveryAddress: text("deliveryAddress").notNull(),
  deliveryCity: varchar("deliveryCity", { length: 100 }),
  deliveryDepartment: varchar("deliveryDepartment", { length: 100 }),
  deliveryPostalCode: varchar("deliveryPostalCode", { length: 20 }),
  googleMapsLocation: text("googleMapsLocation"), // JSON: {lat, lng, url}
  
  // Payment information
  paymentMethod: mysqlEnum("paymentMethod", ["card", "transfer", "tigo_money", "cash", "cash_on_delivery"]).notNull(),
  
  // Order details
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Product sales strategies and objection handling
 */
export const productStrategies = mysqlTable("productStrategies", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").references(() => products.id).notNull().unique(),
  
  // Sales hooks
  salesHooks: text("salesHooks"), // JSON array of sales hooks/opening lines
  
  // Common objections and responses
  commonObjections: text("commonObjections"), // JSON array of {objection, response}
  
  // Sales techniques
  salesTechniques: text("salesTechniques"), // JSON array of techniques
  
  // Marketing phrases
  marketingPhrases: text("marketingPhrases"), // JSON array of marketing phrases
  
  // Product FAQs
  productFaqs: text("productFaqs"), // JSON array of {question, answer}
  
  // Benefits to highlight
  keyBenefits: text("keyBenefits"), // JSON array of key benefits
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductStrategy = typeof productStrategies.$inferSelect;
export type InsertProductStrategy = typeof productStrategies.$inferInsert;

/**
 * Commission configuration
 */
export const commissionSettings = mysqlTable("commissionSettings", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").references(() => products.id).unique(),
  defaultCommissionPercentage: decimal("defaultCommissionPercentage", { precision: 5, scale: 2 }).notNull(),
  minCommissionAmount: decimal("minCommissionAmount", { precision: 10, scale: 2 }).default("0"),
  maxCommissionAmount: decimal("maxCommissionAmount", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissionSetting = typeof commissionSettings.$inferSelect;
export type InsertCommissionSetting = typeof commissionSettings.$inferInsert;


/**
 * Email notifications history for orders
 */
export const emailNotifications = mysqlTable("emailNotifications", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").references(() => orders.id),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientType: mysqlEnum("recipientType", ["customer", "dropshipper", "company"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;


/**
 * Permissions for role-based access control
 */
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // e.g., 'products', 'users', 'orders', 'analytics'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

/**
 * Roles for grouping permissions
 */
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isSystem: boolean("isSystem").default(false).notNull(), // System roles cannot be deleted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

/**
 * Junction table for roles and permissions (many-to-many)
 */
export const rolePermissions = mysqlTable("rolePermissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").references(() => roles.id).notNull(),
  permissionId: int("permissionId").references(() => permissions.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * User roles (many-to-many relationship)
 */
export const userRoles = mysqlTable("userRoles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  roleId: int("roleId").references(() => roles.id).notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

/**
 * Audit log for role and permission changes
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // e.g., 'role_assigned', 'permission_granted'
  targetUserId: int("targetUserId").references(() => users.id),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * Dropshipper profile information
 */
export const dropshipperProfiles = mysqlTable("dropshipperProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).unique().notNull(),
  bankAccountName: text("bankAccountName"),
  bankAccountNumber: varchar("bankAccountNumber", { length: 50 }),
  bankCode: varchar("bankCode", { length: 20 }),
  bankName: text("bankName"),
  documentNumber: varchar("documentNumber", { length: 50 }),
  documentType: varchar("documentType", { length: 20 }), // 'cedula' or 'ruc'
  businessDescription: text("businessDescription"),
  socialMediaLinks: text("socialMediaLinks"), // JSON string
  totalSalesCount: int("totalSalesCount").default(0).notNull(),
  totalDelivered: int("totalDelivered").default(0).notNull(),
  totalSalesAmount: decimal("totalSalesAmount", { precision: 15, scale: 2 }).default("0").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 15, scale: 2 }).default("0").notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("5").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DropshipperProfile = typeof dropshipperProfiles.$inferSelect;
export type InsertDropshipperProfile = typeof dropshipperProfiles.$inferInsert;

/**
 * Order issues/problems tracking
 */
export const orderIssues = mysqlTable("orderIssues", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").references(() => orders.id).notNull(),
  issueType: mysqlEnum("issueType", ["wrong_address", "product_complaint", "delivery_delay", "customer_complaint", "other"]).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  reportedBy: int("reportedBy").references(() => users.id),
  assignedTo: int("assignedTo").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type OrderIssue = typeof orderIssues.$inferSelect;
export type InsertOrderIssue = typeof orderIssues.$inferInsert;


/**
 * Shipping costs by city
 */
export const shippingCosts = mysqlTable("shippingCosts", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 255 }).notNull().unique(),
  standardCost: int("standardCost").notNull(), // Cost in Gs.
  sameDayCost: int("sameDayCost").notNull(), // Cost in Gs. for same-day delivery
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShippingCost = typeof shippingCosts.$inferSelect;
export type InsertShippingCost = typeof shippingCosts.$inferInsert;

/**
 * Product media (photos, videos, links)
 */
export const productMedia = mysqlTable("productMedia", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["photo", "video", "link"]).notNull(),
  url: text("url").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductMedia = typeof productMedia.$inferSelect;
export type InsertProductMedia = typeof productMedia.$inferInsert;
