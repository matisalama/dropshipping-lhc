import DropshipperLayout from "@/components/DropshipperLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BarChart3,
  QrCode,
  TrendingUp,
  Calendar,
  Users,
  Copy,
  Download,
  Share2,
  Zap,
} from "lucide-react";

const TOOLS = [
  {
    id: 1,
    title: "Generador de Contenido",
    description: "Crea publicaciones automáticas para Instagram, Facebook y TikTok",
    icon: Sparkles,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    features: [
      "Plantillas personalizables",
      "Hashtags automáticos",
      "Emojis estratégicos",
      "Textos de venta optimizados",
    ],
    action: "Generar Contenido",
  },
  {
    id: 2,
    title: "Calculadora de Precios",
    description: "Calcula automáticamente tus precios de venta y márgenes",
    icon: BarChart3,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    features: [
      "Cálculo de margen automático",
      "Comparativa de competencia",
      "Historial de precios",
      "Sugerencias de precios óptimos",
    ],
    action: "Abrir Calculadora",
  },
  {
    id: 3,
    title: "Generador de Códigos QR",
    description: "Crea códigos QR para tus productos y redes sociales",
    icon: QrCode,
    color: "bg-green-100",
    iconColor: "text-green-600",
    features: [
      "QR para productos",
      "QR para redes sociales",
      "QR para WhatsApp",
      "Descarga en alta resolución",
    ],
    action: "Generar QR",
  },
  {
    id: 4,
    title: "Análisis de Tendencias",
    description: "Descubre qué productos están en tendencia en el mercado",
    icon: TrendingUp,
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    features: [
      "Productos trending",
      "Análisis de demanda",
      "Precios de mercado",
      "Recomendaciones de venta",
    ],
    action: "Ver Tendencias",
  },
  {
    id: 5,
    title: "Calendario de Promociones",
    description: "Planifica tus promociones y campañas de venta",
    icon: Calendar,
    color: "bg-pink-100",
    iconColor: "text-pink-600",
    features: [
      "Fechas clave de venta",
      "Campañas sugeridas",
      "Recordatorios automáticos",
      "Plantillas de promoción",
    ],
    action: "Planificar Promociones",
  },
  {
    id: 6,
    title: "Gestor de Clientes",
    description: "Mantén un registro de tus clientes frecuentes",
    icon: Users,
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    features: [
      "Base de datos de clientes",
      "Historial de compras",
      "Notas personalizadas",
      "Ofertas personalizadas",
    ],
    action: "Gestionar Clientes",
  },
];

export default function DropshipperTools() {
  return (
    <DropshipperLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Herramientas Innovadoras</h1>
          <p className="text-gray-600">Potencia tu negocio con nuestras herramientas exclusivas</p>
        </div>

        {/* Featured Tool */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-8">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-6 rounded-lg">
                <Zap className="h-12 w-12" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Generador de Contenido IA</h2>
                <p className="text-blue-100 mb-4">
                  Crea contenido viral automáticamente con inteligencia artificial. Optimizado para
                  máximas conversiones.
                </p>
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  Probar Ahora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${tool.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {tool.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Tips */}
        <Card className="border-0 shadow-md mt-8 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Consejos para Maximizar Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">📱 Redes Sociales</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Publica 3-4 veces por semana</li>
                  <li>• Usa hashtags relevantes</li>
                  <li>• Responde comentarios rápidamente</li>
                  <li>• Crea historias con ofertas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">💰 Estrategia de Precios</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Mantén márgenes competitivos</li>
                  <li>• Ofrece promociones estratégicas</li>
                  <li>• Crea paquetes de productos</li>
                  <li>• Aprovecha fechas especiales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="border-0 shadow-md mt-8 border-l-4 border-blue-600">
          <CardHeader>
            <CardTitle className="text-lg">Próximas Herramientas</CardTitle>
            <CardDescription>Estamos desarrollando nuevas herramientas para ti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">🎥 Editor de Videos</div>
                <div className="text-xs text-gray-600">Crea videos cortos para TikTok y Reels</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">📊 Dashboard Avanzado</div>
                <div className="text-xs text-gray-600">Análisis detallado de tu negocio</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">🤖 Chatbot IA</div>
                <div className="text-xs text-gray-600">Atiende clientes automáticamente</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-sm mb-1">📧 Email Marketing</div>
                <div className="text-xs text-gray-600">Campañas de email automáticas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DropshipperLayout>
  );
}
