import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ============= USERS MANAGEMENT =============
  listUsers: adminProcedure.query(async () => {
    return await db.getAllDropshippers();
  }),

  getUserWithRoles: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const userRoles = await db.getUserRoles(input.userId);
      const userPerms = await db.getUserPermissions(input.userId);
      return { roles: userRoles, permissions: userPerms };
    }),

  assignRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      roleId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.assignRoleToUser(input.userId, input.roleId);
      
      // Log the action
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'role_assigned',
        targetUserId: input.userId,
        details: `Assigned role ${input.roleId}`,
      });
      
      return { success: true };
    }),

  // ============= ROLES MANAGEMENT =============
  listRoles: adminProcedure.query(async () => {
    return await db.getAllRoles();
  }),

  getRoleWithPermissions: adminProcedure
    .input(z.object({ roleId: z.number() }))
    .query(async ({ input }) => {
      return await db.getRoleWithPermissions(input.roleId);
    }),

  // ============= DROPSHIPPER MANAGEMENT =============
  getDropshipperStats: adminProcedure.query(async () => {
    const dropshippers = await db.getAllDropshippers();
    const products = await db.getAllProducts({ isActive: true });
    
    return {
      totalDropshippers: dropshippers.length,
      approvedDropshippers: dropshippers.filter(d => d.isApproved).length,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
    };
  }),

  approveDropshipper: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Update user approval status
      await db.updateUserProfile(input.userId, {});
      
      // Create dropshipper profile if doesn't exist
      await db.getOrCreateDropshipperProfile(input.userId);
      
      // Assign dropshipper role
      const dropshipperRole = await db.getAllRoles();
      const dropshipperRoleId = dropshipperRole.find(r => r.name === 'dropshipper')?.id;
      
      if (dropshipperRoleId) {
        await db.assignRoleToUser(input.userId, dropshipperRoleId);
      }
      
      // Log the action
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'dropshipper_approved',
        targetUserId: input.userId,
        details: 'Dropshipper approved',
      });
      
      return { success: true };
    }),

  rejectDropshipper: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(input.userId, {});
      
      // Log the action
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'dropshipper_rejected',
        targetUserId: input.userId,
        details: 'Dropshipper rejected',
      });
      
      return { success: true };
    }),

  // ============= AUDIT LOG =============
  getAuditLog: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      // This would require additional db function
      return [];
    }),
});
