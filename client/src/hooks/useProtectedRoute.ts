import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export type RequiredRole = "admin" | "dropshipper" | "user" | "support";

export function useProtectedRoute(requiredRole?: RequiredRole) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated, redirect to home
      navigate("/");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Wrong role, redirect to home
      navigate("/");
      return;
    }
  }, [user, loading, requiredRole, navigate]);

  return { user, loading };
}

export function useAdminRoute() {
  return useProtectedRoute("admin");
}

export function useDropshipperRoute() {
  return useProtectedRoute("dropshipper");
}
