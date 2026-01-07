import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with dropshipper-specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
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
  sku: varchar("sku", { length: 100 }).unique(),
  categoryId: int("categoryId").references(() => categories.id),
  
  // Pricing
  wholesalePrice: decimal("wholesalePrice", { precision: 10, scale: 2 }).notNull(), // Precio mayorista
  suggestedRetailPrice: decimal("suggestedRetailPrice", { precision: 10, scale: 2 }).notNull(), // Precio sugerido de venta
  
  // Stock management
  stock: int("stock").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  
  // Product media
  imageUrl: text("imageUrl"),
  imageUrls: text("imageUrls"), // JSON array of additional images
  
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
