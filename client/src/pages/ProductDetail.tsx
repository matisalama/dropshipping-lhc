import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  ArrowLeft,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Truck,
  Clock
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const productId = parseInt(id || "0");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading } = trpc.products.get.useQuery({ id: productId });
  const { data: categories } = trpc.categories.list.useQuery();
  
  // Parse imageUrls
  let imageUrls: string[] = [];
  if (product?.imageUrls) {
    try {
      imageUrls = typeof product.imageUrls === 'string' 
        ? JSON.parse(product.imageUrls) 
        : product.imageUrls;
    } catch (e) {
      imageUrls = [];
    }
  }
  const currentImage = imageUrls?.[currentImageIndex] || product?.imageUrl;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="container py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Producto no encontrado</CardTitle>
            <CardDescription>El producto que buscas no existe</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Panel de Control
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const margin = parseFloat(product.profitMargin || "0");
  const isLowStock = product.stock <= product.lowStockThreshold;
  const categoryName = categories?.find(c => c.id === product.categoryId)?.name;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel de Control
            </Button>
          </Link>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold">La Hora de las Compras</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative group">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              
              {/* Image Navigation Arrows */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Imagen anterior"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Siguiente imagen"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {imageUrls.length}
                  </div>
                </>
              )}
            </div>

            {/* Service Highlights */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">97% Efectividad en Entregas</div>
                    <div className="text-sm text-muted-foreground">Logística confiable</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-accent text-accent-foreground p-2 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Entrega en menos de 24hrs</div>
                    <div className="text-sm text-muted-foreground">En Central, Paraguay</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              {categoryName && (
                <Badge variant="outline">{categoryName}</Badge>
              )}
              {margin >= 30 && (
                <Badge className="ml-2 bg-accent text-accent-foreground">
                  Alto Margen de Ganancia
                </Badge>
              )}
              
              <h1 className="text-4xl font-bold">{product.name}</h1>
              
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {isLowStock ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive font-medium">
                      Stock bajo: {product.stock} unidades disponibles
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-muted-foreground">
                      En stock: {product.stock} unidades disponibles
                    </span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Pricing Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Análisis de Rentabilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio mayorista:</span>
                    <span className="text-xl font-semibold">
                      ₲ {parseFloat(product.wholesalePrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio sugerido de venta:</span>
                    <span className="text-xl font-semibold">
                      ₲ {parseFloat(product.suggestedRetailPrice).toLocaleString()}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Tu ganancia por unidad:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₲ {parseFloat(product.profitAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Margen de ganancia:</span>
                      <span className="text-xl font-bold text-accent">
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Example calculations */}
                  <div className="pt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Si vendes 10 unidades:</span>
                      <span className="font-medium text-foreground">
                        ₲ {(parseFloat(product.profitAmount) * 10).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Si vendes 50 unidades:</span>
                      <span className="font-medium text-foreground">
                        ₲ {(parseFloat(product.profitAmount) * 50).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Si vendes 100 unidades:</span>
                      <span className="font-medium text-foreground">
                        ₲ {(parseFloat(product.profitAmount) * 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Product Details */}
            {(product.weight || product.dimensions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Especificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="font-medium">{product.weight} kg</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensiones:</span>
                      <span className="font-medium">{product.dimensions}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
