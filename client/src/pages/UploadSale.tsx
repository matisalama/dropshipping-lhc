import { useState, useMemo } from "react";
import DropshipperLayout from "@/components/DropshipperLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DollarSign, MapPin, Phone, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "card", label: "Tarjeta de Crédito/Débito" },
  { value: "transfer", label: "Transferencia Bancaria" },
  { value: "cash", label: "Efectivo" },
  { value: "cash_on_delivery", label: "Contra Entrega" },
];

export default function UploadSale() {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientDocument: "",
    deliveryAddress: "",
    deliveryCity: "",
    paymentMethod: "",
    productId: "",
    quantity: 1,
    notes: "",
    googleMapsLocation: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(0);

  // Fetch products
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    isActive: true,
  });

  // Fetch shipping costs
  const { data: shippingCosts } = trpc.shippingCosts.list.useQuery();

  // Fetch shipping cost for selected city
  const { data: cityCost } = trpc.shippingCosts.getByCity.useQuery(
    { city: formData.deliveryCity },
    { enabled: !!formData.deliveryCity }
  );

  // Create order mutation
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Venta registrada exitosamente");
      setFormData({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        clientDocument: "",
        deliveryAddress: "",
        deliveryCity: "",
        paymentMethod: "",
        productId: "",
        quantity: 1,
        notes: "",
        googleMapsLocation: "",
      });
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar la venta");
    },
  });

  // Update shipping cost when city changes
  const handleCityChange = (city: string) => {
    setFormData({ ...formData, deliveryCity: city });
    const cost = shippingCosts?.find((c) => c.city === city);
    if (cost) {
      setShippingCost(cost.standardCost);
    }
  };

  // Update selected product when product changes
  const handleProductChange = (productId: string) => {
    const product = products?.find((p) => p.id === parseInt(productId));
    setSelectedProduct(product);
    setFormData({ ...formData, productId });
  };

  // Calculate totals
  const productPrice = selectedProduct ? parseFloat(selectedProduct.suggestedRetailPrice || "0") : 0;
  const subtotal = productPrice * (formData.quantity || 1);
  const total = subtotal + shippingCost;
  const commission = selectedProduct ? (total * (selectedProduct.commissionPercentage || 0)) / 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientPhone || !formData.deliveryCity || !formData.productId) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    createOrderMutation.mutate({
      productId: parseInt(formData.productId),
      quantity: formData.quantity,
      customerName: formData.clientName,
      customerPhone: formData.clientPhone,
      customerEmail: formData.clientEmail,
      deliveryAddress: formData.deliveryAddress,
      deliveryCity: formData.deliveryCity,
      paymentMethod: formData.paymentMethod as any,
      notes: formData.notes,
      unitPrice: productPrice.toString(),
      commissionPercentage: selectedProduct?.commissionPercentage || 0,
    });
  };

  return (
    <DropshipperLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cargar Nueva Venta</h1>
          <p className="text-gray-600">Completa el formulario para registrar una nueva venta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección de Producto */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product">Producto *</Label>
                  <Select value={formData.productId} onValueChange={handleProductChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - Gs. {product.suggestedRetailPrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Precio Mayorista</p>
                      <p className="font-semibold text-lg">Gs. {selectedProduct.wholesalePrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Precio Sugerido</p>
                      <p className="font-semibold text-lg">Gs. {selectedProduct.suggestedRetailPrice}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tu Comisión</p>
                      <p className="font-semibold text-lg text-green-600">{selectedProduct.commissionPercentage}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sección de Datos del Cliente */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-600" />
                Datos del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nombre Completo *</Label>
                  <Input
                    id="clientName"
                    placeholder="Ej: Juan Pérez"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="clientPhone">Teléfono WhatsApp *</Label>
                  <Input
                    id="clientPhone"
                    placeholder="Ej: +595 971 123456"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="clientDocument">Cédula / RUC</Label>
                  <Input
                    id="clientDocument"
                    placeholder="Ej: 1234567"
                    value={formData.clientDocument}
                    onChange={(e) => setFormData({ ...formData, clientDocument: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Entrega */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="deliveryCity">Ciudad *</Label>
                <Select value={formData.deliveryCity} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingCosts?.map((city) => (
                      <SelectItem key={city.id} value={city.city}>
                        {city.city} - Gs. {city.standardCost}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deliveryAddress">Dirección de Entrega *</Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Ej: Calle Principal 123, Apto 4B"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="googleMapsLocation">Ubicación en Google Maps (opcional)</Label>
                <Input
                  id="googleMapsLocation"
                  placeholder="Pega el link de Google Maps aquí"
                  value={formData.googleMapsLocation}
                  onChange={(e) => setFormData({ ...formData, googleMapsLocation: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sección de Pago */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Forma de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Método de Pago *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Cliente requiere entrega en horario específico"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Venta */}
          {selectedProduct && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-white">Resumen de la Venta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({formData.quantity} x Gs. {productPrice})</span>
                      <span className="font-semibold">Gs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo de Envío ({formData.deliveryCity})</span>
                      <span className="font-semibold">Gs. {shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 flex justify-between text-lg">
                      <span>Total a Cobrar</span>
                      <span className="font-bold">Gs. {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-green-500 bg-opacity-20 p-4 rounded-lg border border-green-400">
                    <p className="text-sm text-green-200">Tu Ganancia</p>
                    <p className="text-3xl font-bold text-green-300">Gs. {commission.toLocaleString()}</p>
                    <p className="text-xs text-green-200">{selectedProduct.commissionPercentage}% de comisión</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Registrando..." : "Registrar Venta"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setFormData({
                  clientName: "",
                  clientPhone: "",
                  clientEmail: "",
                  clientDocument: "",
                  deliveryAddress: "",
                  deliveryCity: "",
                  paymentMethod: "",
                  productId: "",
                  quantity: 1,
                  notes: "",
                  googleMapsLocation: "",
                });
                setSelectedProduct(null);
              }}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </div>
    </DropshipperLayout>
  );
}
