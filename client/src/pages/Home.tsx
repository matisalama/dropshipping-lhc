import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Headphones, 
  Truck,
  ArrowRight,
  Star,
  Users,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">La Hora de las Compras</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Link href="/admin">
                    <Button variant="outline">Panel Admin</Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline">Mi Panel de Control</Button>
                  </Link>
                )}
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Iniciar Sesión</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-accent text-accent-foreground px-4 py-1.5 text-sm font-medium">
                Plataforma de Dropshipping Profesional
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Maximiza tus ganancias con{" "}
                <span className="text-primary">productos de calidad</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Únete a nuestra red de dropshippers exitosos. Accede a un amplio catálogo de productos, 
                precios mayoristas competitivos y el mejor servicio de entrega de Paraguay.
              </p>
              <div className="flex flex-wrap gap-4">
                {!isAuthenticated ? (
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="text-lg px-8">
                      Comenzar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                ) : (
                  <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                    <Button size="lg" className="text-lg px-8">
                      Ir al Panel de Control <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Link href="/recursos">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ver Recursos
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
              <Card className="relative shadow-2xl border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Ventajas Competitivas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">97% Efectividad en Entregas</h3>
                      <p className="text-muted-foreground">
                        Superamos ampliamente el estándar del mercado (75%) con nuestro sistema de logística propio
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="bg-accent text-accent-foreground p-3 rounded-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Entrega en Menos de 24hrs</h3>
                      <p className="text-muted-foreground">
                        Entregas el mismo día o en menos de 24 horas en Central, Paraguay
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary border border-border">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <Headphones className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Soporte Personalizado</h3>
                      <p className="text-muted-foreground">
                        Asistencia rápida y personalizada para ayudarte a crecer tu negocio
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">97%</div>
              <div className="text-sm text-muted-foreground">Efectividad en Entregas</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">&lt;24h</div>
              <div className="text-sm text-muted-foreground">Tiempo de Entrega</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Productos Disponibles</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Soporte Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">¿Por qué elegir nuestra plataforma?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ofrecemos todo lo que necesitas para tener éxito en el dropshipping
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Márgenes de Ganancia Claros</CardTitle>
                <CardDescription>
                  Visualiza tus ganancias potenciales en cada producto con cálculos automáticos y transparentes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Amplio Catálogo</CardTitle>
                <CardDescription>
                  Accede a cientos de productos de calidad con stock garantizado y precios mayoristas competitivos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Logística Confiable</CardTitle>
                <CardDescription>
                  Nosotros nos encargamos de todas las entregas con 97% de efectividad y rapidez garantizada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Panel de Control Completo</CardTitle>
                <CardDescription>
                  Gestiona tus productos, visualiza stock en tiempo real y analiza tus mejores oportunidades
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Soporte Dedicado</CardTitle>
                <CardDescription>
                  Recibe ayuda personalizada para crear tu landing page, contenidos y estrategias de venta
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Recursos Descargables</CardTitle>
                <CardDescription>
                  Accede a imágenes, descripciones y materiales de marketing para cada producto
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">¿Cómo funciona?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comienza a vender en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Regístrate</h3>
              <p className="text-muted-foreground">
                Crea tu cuenta gratuita y accede inmediatamente a nuestro catálogo completo de productos
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Elige Productos</h3>
              <p className="text-muted-foreground">
                Selecciona los productos que quieres vender y descarga los recursos para promocionarlos
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Comienza a Vender</h3>
              <p className="text-muted-foreground">
                Promociona los productos en tus canales y nosotros nos encargamos de la entrega
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">¿Listo para comenzar?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Únete a nuestra red de dropshippers exitosos y comienza a generar ingresos hoy mismo
          </p>
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Registrarse Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          ) : (
            <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Ir al Panel de Control <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <span className="font-bold">La Hora de las Compras</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma de dropshipping más confiable de Paraguay
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Panel de Control</Link></li>
                <li><Link href="/productos" className="hover:text-foreground transition-colors">Productos</Link></li>
                <li><Link href="/recursos" className="hover:text-foreground transition-colors">Recursos</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/soporte" className="hover:text-foreground transition-colors">Centro de Ayuda</Link></li>
                <li><Link href="/soporte" className="hover:text-foreground transition-colors">Contacto</Link></li>
                <li><Link href="/soporte" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Contacto</h4>
              <p className="text-sm text-muted-foreground">
                Central, Paraguay<br />
                Soporte 24/7
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2026 La Hora de las Compras. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
