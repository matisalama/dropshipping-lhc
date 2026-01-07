import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  processing: { label: 'Procesando', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-orange-100 text-orange-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Clock },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800', icon: DollarSign },
};

export default function OrderTracking() {
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seguimiento de Pedidos</h1>
          <p className="text-muted-foreground">
            Monitorea el estado de todas tus ventas y entregas
          </p>
        </div>

        {/* New Order Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/create-order")}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Package className="h-4 w-4 mr-2" />
            Registrar Nueva Venta
          </Button>
        </div>

        {/* Orders List */}
        {orders && orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      {/* Status */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className="h-5 w-5" />
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('es-PY')}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="md:col-span-3">
                        <div className="font-semibold text-sm mb-1">Producto</div>
                        <div className="text-sm text-muted-foreground">
                          Pedido #{order.id}
                        </div>
                        <div className="text-xs mt-2">
                          Cantidad: {order.quantity}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="md:col-span-3">
                        <div className="font-semibold text-sm mb-1">Cliente</div>
                        <div className="text-sm">{order.customerName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {order.customerPhone}
                        </div>
                      </div>

                      {/* Delivery Location */}
                      <div className="md:col-span-2">
                        <div className="font-semibold text-sm mb-1">Entrega</div>
                        <div className="flex items-start gap-1 text-xs">
                          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <div className="text-muted-foreground">
                            {order.deliveryCity || order.deliveryDepartment || 'Central'}
                          </div>
                        </div>
                      </div>

                      {/* Commission Amount */}
                      <div className="md:col-span-2 text-right">
                        <div className="font-semibold text-lg text-green-600">
                          ₲ {parseFloat(order.commissionAmount).toLocaleString('es-PY')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tu comisión ({order.commissionPercentage}%)
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dirección:</span>
                          <div className="font-medium">{order.deliveryAddress}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Método de Pago:</span>
                          <div className="font-medium capitalize">
                            {order.paymentMethod.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Monto Total:</span>
                          <div className="font-medium">
                            ₲ {parseFloat(order.totalAmount).toLocaleString('es-PY')}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Precio Unitario:</span>
                          <div className="font-medium">
                            ₲ {parseFloat(order.unitPrice).toLocaleString('es-PY')}
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notas:</span>
                          <div className="font-medium">{order.notes}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay pedidos aún</h3>
              <p className="text-muted-foreground mb-6">
                Comienza a registrar tus ventas para verlas aquí
              </p>
              <Button
                onClick={() => navigate("/create-order")}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Package className="h-4 w-4 mr-2" />
                Registrar Primera Venta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
