import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Phone, DollarSign } from "lucide-react";

export default function CreateOrder() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [googleMapsLocation, setGoogleMapsLocation] = useState("");

  const { data: products } = trpc.products.list.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerIdNumber: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryDepartment: "",
    deliveryPostalCode: "",
    notes: "",
  });

  const selectedProductData = products?.find(p => p.id === parseInt(selectedProduct));
  const unitPrice = selectedProductData?.suggestedRetailPrice || "0";
  const commissionPercentage = "15"; // Default commission
  const totalAmount = (parseFloat(unitPrice) * quantity).toFixed(2);
  const commissionAmount = (parseFloat(totalAmount) * parseFloat(commissionPercentage) / 100).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !paymentMethod) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        productId: parseInt(selectedProduct),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        customerIdNumber: formData.customerIdNumber || undefined,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity || undefined,
        deliveryDepartment: formData.deliveryDepartment || undefined,
        deliveryPostalCode: formData.deliveryPostalCode || undefined,
        googleMapsLocation: googleMapsLocation || undefined,
        paymentMethod: paymentMethod as any,
        quantity,
        unitPrice,
        commissionPercentage,
        notes: formData.notes || undefined,
      });

      toast.success("¡Venta registrada exitosamente!");
      navigate("/dashboard/orders");
    } catch (error) {
      toast.error("Error al registrar la venta");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registrar Nueva Venta</h1>
            <p className="text-muted-foreground">Completa los datos del cliente y el producto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Producto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Selecciona el Producto
              </CardTitle>
              <CardDescription>
                Elige el producto que vas a vender
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Producto *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - ₲ {parseFloat(product.suggestedRetailPrice).toLocaleString('es-PY')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProductData && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Precio Unitario</div>
                    <div className="text-lg font-bold">₲ {parseFloat(unitPrice).toLocaleString('es-PY')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Cantidad</div>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-lg font-bold">₲ {parseFloat(totalAmount).toLocaleString('es-PY')}</div>
                  </div>
                </div>
              )}

              {selectedProductData && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div>
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">Tu Comisión (15%)</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₲ {parseFloat(commissionAmount).toLocaleString('es-PY')}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm text-green-900 dark:text-green-100">Beneficio por unidad</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        ₲ {(parseFloat(commissionAmount) / quantity).toLocaleString('es-PY')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>
                Completa los datos del cliente que está realizando la compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nombre Completo *</Label>
                  <Input
                    id="customerName"
                    placeholder="Juan Pérez"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Teléfono con WhatsApp *</Label>
                  <Input
                    id="customerPhone"
                    placeholder="+595 991 234567"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Correo Electrónico</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="cliente@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="customerIdNumber">Cédula de Identidad / RUC</Label>
                  <Input
                    id="customerIdNumber"
                    placeholder="1.234.567"
                    value={formData.customerIdNumber}
                    onChange={(e) => setFormData({ ...formData, customerIdNumber: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Entrega
              </CardTitle>
              <CardDescription>
                Especifica dónde debe llegar el producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deliveryAddress">Dirección Completa *</Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Calle, número, barrio, referencias..."
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deliveryCity">Ciudad</Label>
                  <Input
                    id="deliveryCity"
                    placeholder="Asunción"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDepartment">Departamento</Label>
                  <Input
                    id="deliveryDepartment"
                    placeholder="Central"
                    value={formData.deliveryDepartment}
                    onChange={(e) => setFormData({ ...formData, deliveryDepartment: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryPostalCode">Código Postal</Label>
                  <Input
                    id="deliveryPostalCode"
                    placeholder="1500"
                    value={formData.deliveryPostalCode}
                    onChange={(e) => setFormData({ ...formData, deliveryPostalCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="googleMapsLocation">Ubicación en Google Maps (opcional)</Label>
                <Input
                  id="googleMapsLocation"
                  placeholder="https://maps.google.com/..."
                  value={googleMapsLocation}
                  onChange={(e) => setGoogleMapsLocation(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pega el enlace de la ubicación en Google Maps si tienes disponible
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Método de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Método de Pago
              </CardTitle>
              <CardDescription>
                Selecciona cómo pagará el cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="tigo_money">Tigo Money</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="cash_on_delivery">Contra Entrega</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
              <CardDescription>
                Agrega cualquier información relevante sobre la venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ej: Cliente solicitó entrega en horario específico, requiere factura, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {createOrderMutation.isPending ? "Registrando..." : "Registrar Venta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
