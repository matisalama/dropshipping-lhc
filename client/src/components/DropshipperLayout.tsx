import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useDropshipperRoute } from "@/hooks/useProtectedRoute";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface DropshipperLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dropshipper/dashboard",
    description: "Ventas y beneficios",
  },
  {
    label: "Productos",
    icon: Package,
    href: "/dropshipper/productos",
    description: "Catálogo disponible",
  },
  {
    label: "Pedidos",
    icon: ShoppingCart,
    href: "/dropshipper/pedidos",
    description: "Mis ventas",
  },
  {
    label: "Problemas",
    icon: MessageSquare,
    href: "/dropshipper/problemas",
    description: "Resolver incidencias",
  },
  {
    label: "Herramientas",
    icon: Sparkles,
    href: "/dropshipper/herramientas",
    description: "Marketing y análisis",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/dropshipper/configuracion",
    description: "Datos personales",
  },
];

export default function DropshipperLayout({ children }: DropshipperLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  useDropshipperRoute(); // Protect this route

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-700 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg">La Hora</h1>
              <p className="text-xs text-blue-200">Dropshipping</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-blue-700"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg hover:bg-blue-700 transition-colors group"
              title={item.label}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <div className="text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-blue-200">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-blue-700 p-4">
          {sidebarOpen && (
            <div className="mb-4 pb-4 border-b border-blue-700">
              <p className="text-sm font-medium truncate">{user?.name || "Usuario"}</p>
              <p className="text-xs text-blue-200 truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-white hover:bg-blue-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && "Cerrar Sesión"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Panel de Dropshipper</h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.businessName || "Sin negocio"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}
