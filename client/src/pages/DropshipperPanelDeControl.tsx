import { trpc } from "@/lib/trpc";
import DropshipperLayout from "@/components/DropshipperLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Target,
  Award,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DropshipperPanelDeControl() {
  const { data: wallet } = trpc.wallet.getBalance.useQuery();
  const { data: orders } = trpc.orders.list.useQuery();
  const { data: products } = trpc.products.list.useQuery({});

  // Calculate metrics
  const totalOrders = orders?.length || 0;
  const totalSalesAmount = orders?.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) || 0;
  const totalEarnings = orders?.reduce((sum, o) => sum + parseFloat(o.commissionAmount || "0"), 0) || 0;
  const deliveredOrders = orders?.filter(o => o.status === "delivered").length || 0;
  const uniqueProducts = new Set(orders?.map(o => o.productId)).size || 0;

  // Mock data for charts (in production, this would come from the backend)
  const salesData = [
    { name: "Sem 1", ventas: 4000, comisiones: 2400 },
    { name: "Sem 2", ventas: 3000, comisiones: 1398 },
    { name: "Sem 3", ventas: 2000, comisiones: 9800 },
    { name: "Sem 4", ventas: 2780, comisiones: 3908 },
    { name: "Sem 5", ventas: 1890, comisiones: 4800 },
  ];

  const topProducts = products?.slice(0, 5).map(p => ({
    name: p.name,
    sales: Math.floor(Math.random() * 100),
    commission: parseFloat(p.profitMargin || "0"),
  })) || [];

  return (
    <DropshipperLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control de Ventas</h1>
          <p className="text-gray-600">Resumen de tu desempeño y ganancias</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Vendido */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Vendido</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₲ {totalSalesAmount.toLocaleString("es-PY")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{totalOrders} pedidos</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Utilidad Total */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Utilidad Total</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₲ {totalEarnings.toLocaleString("es-PY")}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    {totalSalesAmount > 0 ? ((totalEarnings / totalSalesAmount) * 100).toFixed(1) : 0}% promedio
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Disponible */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saldo Disponible</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ₲ {wallet?.balance ? parseFloat(wallet.balance).toLocaleString("es-PY") : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Para retirar</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Entregados */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pedidos Entregados</p>
                  <p className="text-3xl font-bold text-orange-600">{deliveredOrders}</p>
                  <p className="text-xs text-orange-600 mt-2">
                    {totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(0) : 0}% de efectividad
                  </p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos Vendidos */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Productos Vendidos</p>
                  <p className="text-3xl font-bold text-indigo-600">{uniqueProducts}</p>
                  <p className="text-xs text-muted-foreground mt-2">Productos diferentes</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-lg">
                  <Package className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasa de Conversión */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Promedio por Pedido</p>
                  <p className="text-3xl font-bold text-cyan-600">
                    ₲ {totalOrders > 0 ? (totalEarnings / totalOrders).toLocaleString("es-PY", { maximumFractionDigits: 0 }) : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Comisión promedio</p>
                </div>
                <div className="bg-cyan-100 p-4 rounded-lg">
                  <Target className="h-8 w-8 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Tendencia de Ventas</CardTitle>
              <CardDescription>Últimas 5 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#3b82f6" name="Ventas (₲)" />
                  <Line type="monotone" dataKey="comisiones" stroke="#10b981" name="Comisiones (₲)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Top 5 productos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" name="Ventas (Qty)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos 10 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Pedido</th>
                    <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold">Producto</th>
                    <th className="text-right py-3 px-4 font-semibold">Monto</th>
                    <th className="text-right py-3 px-4 font-semibold">Comisión</th>
                    <th className="text-center py-3 px-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">#{order.id}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4 truncate max-w-xs">{order.productId}</td>
                      <td className="py-3 px-4 text-right">₲ {parseFloat(order.totalAmount || "0").toLocaleString("es-PY")}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ₲ {parseFloat(order.commissionAmount || "0").toLocaleString("es-PY")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={order.status === "delivered" ? "default" : "secondary"}
                        >
                          {order.status === "delivered" ? "Entregado" : "Pendiente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DropshipperLayout>
  );
}
