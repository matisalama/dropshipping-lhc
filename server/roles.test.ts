import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Roles and Permissions System", () => {
  describe("Role Functions", () => {
    it("should initialize default roles", async () => {
      await db.initializeDefaultRoles();
      const roles = await db.getAllRoles();
      expect(roles.length).toBeGreaterThanOrEqual(3);
    });

    it("should return all roles", async () => {
      const roles = await db.getAllRoles();
      expect(Array.isArray(roles)).toBe(true);
      
      const roleNames = roles.map((r) => r.name);
      expect(roleNames).toContain("admin");
      expect(roleNames).toContain("dropshipper");
      expect(roleNames).toContain("support");
    });

    it("should get role with permissions", async () => {
      const roles = await db.getAllRoles();
      const adminRole = roles.find((r) => r.name === "admin");

      if (adminRole) {
        const roleWithPerms = await db.getRoleWithPermissions(adminRole.id);
        expect(roleWithPerms).toBeDefined();
        expect(roleWithPerms?.permissions).toBeDefined();
        expect(Array.isArray(roleWithPerms?.permissions)).toBe(true);
        expect(roleWithPerms?.permissions.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Permission Functions", () => {
    it("should check user permissions", async () => {
      const hasPermission = await db.hasPermission(9999, "view_products");
      expect(typeof hasPermission).toBe("boolean");
    });

    it("should get user permissions", async () => {
      const permissions = await db.getUserPermissions(9999);
      expect(Array.isArray(permissions)).toBe(true);
    });

    it("should get user roles", async () => {
      const roles = await db.getUserRoles(9999);
      expect(Array.isArray(roles)).toBe(true);
    });
  });

  describe("Dropshipper Profile Functions", () => {
    it("should have getOrCreateDropshipperProfile function", async () => {
      expect(db.getOrCreateDropshipperProfile).toBeDefined();
    });

    it("should have getDropshipperProfile function", async () => {
      expect(db.getDropshipperProfile).toBeDefined();
    });

    it("should have updateDropshipperProfile function", async () => {
      expect(db.updateDropshipperProfile).toBeDefined();
    });
  });

  describe("Audit Log Functions", () => {
    it("should have createAuditLog function", async () => {
      expect(db.createAuditLog).toBeDefined();
    });
  });

  describe("Order Issues Functions", () => {
    it("should have createOrderIssue function", async () => {
      expect(db.createOrderIssue).toBeDefined();
    });

    it("should have getOrderIssues function", async () => {
      expect(db.getOrderIssues).toBeDefined();
    });

    it("should have updateOrderIssue function", async () => {
      expect(db.updateOrderIssue).toBeDefined();
    });

    it("should have getOpenIssuesForDropshipper function", async () => {
      expect(db.getOpenIssuesForDropshipper).toBeDefined();
    });
  });

  describe("Role Assignment Functions", () => {
    it("should have assignRoleToUser function", async () => {
      expect(db.assignRoleToUser).toBeDefined();
    });
  });
});
