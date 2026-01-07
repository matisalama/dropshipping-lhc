import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Download,
  FileText,
  Video,
  Image as ImageIcon,
  BookOpen,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Recursos() {
  const { user, isAuthenticated } = useAuth();

  const resources = [
    {
      category: "Guías de Inicio",
      icon: BookOpen,
      items: [
        {
          title: "Cómo empezar en el Dropshipping",
          description: "Guía completa para comenzar tu negocio de dropshipping con éxito",
          type: "PDF",
          url: "#",
        },
        {
          title: "Creación de tu Landing Page",
          description: "Tutorial paso a paso para crear una landing page efectiva",
          type: "PDF",
          url: "#",
        },
        {
          title: "Estrategias de Marketing Digital",
          description: "Aprende a promocionar tus productos en redes sociales",
          type: "PDF",
          url: "#",
        },
      ],
    },
    {
      category: "Plantillas y Diseños",
      icon: ImageIcon,
      items: [
        {
          title: "Plantillas de Landing Page",
          description: "Diseños profesionales listos para usar en tu negocio",
          type: "ZIP",
          url: "#",
        },
        {
          title: "Banners para Redes Sociales",
          description: "Pack de banners editables para Facebook, Instagram y WhatsApp",
          type: "ZIP",
          url: "#",
        },
        {
          title: "Catálogos de Productos",
          description: "Plantillas de catálogos en PDF para compartir con clientes",
          type: "ZIP",
          url: "#",
        },
      ],
    },
    {
      category: "Videos Tutoriales",
      icon: Video,
      items: [
        {
          title: "Configuración de tu Tienda Online",
          description: "Video tutorial de 15 minutos sobre configuración inicial",
          type: "Video",
          url: "#",
        },
        {
          title: "Cómo Usar WhatsApp Business",
          description: "Aprende a gestionar pedidos y clientes con WhatsApp Business",
          type: "Video",
          url: "#",
        },
        {
          title: "Técnicas de Venta Efectivas",
          description: "Estrategias probadas para aumentar tus conversiones",
          type: "Video",
          url: "#",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold">La Hora de las Compras</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/soporte">
                  <Button variant="ghost">Soporte</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Iniciar Sesión</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold">
            Centro de Recursos para Dropshippers
          </h1>
          <p className="text-xl text-muted-foreground">
            Todo lo que necesitas para tener éxito en tu negocio de dropshipping: 
            guías, plantillas, videos y soporte personalizado
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Guías y Tutoriales</CardTitle>
              <CardDescription>
                Aprende las mejores prácticas para vender con éxito
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Contenidos Descargables</CardTitle>
              <CardDescription>
                Imágenes, descripciones y materiales de marketing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Videos Educativos</CardTitle>
              <CardDescription>
                Tutoriales en video para aprender rápidamente
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Resources by Category */}
        {resources.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                          {item.type}
                        </span>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isAuthenticated ? (
                        <Button className="w-full" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      ) : (
                        <a href={getLoginUrl()}>
                          <Button className="w-full" variant="outline">
                            Iniciar sesión para descargar
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Product Resources Section */}
        {isAuthenticated && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Recursos por Producto</CardTitle>
              <CardDescription>
                Accede a materiales específicos de cada producto desde el catálogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Cada producto en nuestro catálogo incluye recursos descargables como:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Imágenes en alta resolución
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Descripciones optimizadas para ventas
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Fichas técnicas y especificaciones
                </li>
              </ul>
              <Link href="/dashboard">
                <Button className="mt-4">
                  Ver Catálogo de Productos
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Support CTA */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">¿Necesitas ayuda personalizada?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier pregunta 
              sobre productos, estrategias de venta o configuración de tu negocio
            </p>
            <Link href="/soporte">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Contactar Soporte
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
