import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DropshipperLayout from "@/components/DropshipperLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User,
  CreditCard,
  Phone,
  Mail,
  Building2,
  FileText,
  Save,
  Loader2,
} from "lucide-react";

export default function DropshipperSettings() {
  const { data: user } = trpc.auth.me.useQuery();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    businessName: user?.businessName || "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankCode: "",
    bankName: "",
    documentNumber: "",
    documentType: "cedula",
    businessDescription: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user profile
      await trpc.auth.updateProfile.useMutation().mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
      });

      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropshipperLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Administra tu perfil y datos bancarios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Tus datos de contacto</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+595 9 1234 5678"
                  />
                </div>
                <div>
                  <Label htmlFor="businessName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Nombre del Negocio
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Mi tienda online"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessDescription" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción del Negocio
                </Label>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre tu negocio..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Información Bancaria</CardTitle>
                  <CardDescription>Para recibir tus comisiones</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Nombre del banco"
                  />
                </div>
                <div>
                  <Label htmlFor="bankCode">Código de Banco</Label>
                  <Input
                    id="bankCode"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleChange}
                    placeholder="Ej: 001"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccountNumber">Número de Cuenta</Label>
                  <Input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountName">Titular de la Cuenta</Label>
                  <Input
                    id="bankAccountName"
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleChange}
                    placeholder="Nombre del titular"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Documento de Identidad</CardTitle>
                  <CardDescription>Para verificación de identidad</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cedula">Cédula de Identidad</option>
                    <option value="ruc">RUC</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    placeholder="1234567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Additional Info */}
        <Card className="border-0 shadow-md mt-8 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">💡 Información Importante</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Verifica que tus datos bancarios sean correctos antes de guardar</li>
                <li>Tus comisiones se depositarán en la cuenta que registres aquí</li>
                <li>Puedes cambiar tu información en cualquier momento</li>
                <li>Asegúrate de usar un número de teléfono WhatsApp válido</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DropshipperLayout>
  );
}
