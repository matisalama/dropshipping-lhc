import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, 
  Search, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function PanelDeControl() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minMargin, setMinMargin] = useState<string>("all");
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});

  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    isActive: true,
  });

  const { data: categories } = trpc.categories.list.useQuery();

  // Filter products based on search, category, and margin
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(product => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || 
        product.categoryId === parseInt(selectedCategory);

      // Margin filter
      if (minMargin !== "all") {
        const margin = parseFloat(product.profitMargin || "0");
        const minValue = parseInt(minMargin);
        if (margin < minValue) return false;
      }

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory, minMargin]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>Debes iniciar sesión para acceder al dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Panel de Control</h1>
              <p className="text-muted-foreground">Bienvenido, {user.name || user.email}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={minMargin} onValueChange={setMinMargin}>
              <SelectTrigger>
                <SelectValue placeholder="Margen mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los márgenes</SelectItem>
                <SelectItem value="0">0% o más</SelectItem>
                <SelectItem value="10">10% o más</SelectItem>
                <SelectItem value="20">20% o más</SelectItem>
                <SelectItem value="30">30% o más</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats Cards */}
        {!productsLoading && products && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Total de Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredProducts.length} coinciden con los filtros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Margen Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.length > 0 
                    ? (products.reduce((sum, p) => sum + parseFloat(p.profitMargin || "0"), 0) / products.length).toFixed(1)
                    : "0"}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.filter(p => p.stock <= p.lowStockThreshold).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Productos para reabastecer</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-64 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay productos que coincidan con los filtros</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const margin = parseFloat(product.profitMargin || "0");
              const isLowStock = product.stock <= product.lowStockThreshold;
              const categoryName = categories?.find(c => c.id === product.categoryId)?.name;
              
              // Parse imageUrls from JSON string
              let imageUrls: string[] = [];
              if (product.imageUrls) {
                try {
                  imageUrls = typeof product.imageUrls === 'string' 
                    ? JSON.parse(product.imageUrls) 
                    : product.imageUrls;
                } catch (e) {
                  imageUrls = [];
                }
              }
              const currentIndex = currentImageIndex[product.id] || 0;
              const currentImage = imageUrls?.[currentIndex] || imageUrls?.[0];

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/producto/${product.id}`}>
                    <div className="aspect-square bg-muted relative group cursor-pointer">
                      {currentImage ? (
                        <img 
                          src={currentImage} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Image Navigation Arrows */}
                      {imageUrls.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentImageIndex(prev => ({
                                ...prev,
                                [product.id]: (prev[product.id] || 0) - 1 < 0 ? imageUrls.length - 1 : (prev[product.id] || 0) - 1
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Imagen anterior"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentImageIndex(prev => ({
                                ...prev,
                                [product.id]: ((prev[product.id] || 0) + 1) % imageUrls.length
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Siguiente imagen"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {currentIndex + 1}/{imageUrls.length}
                          </div>
                        </>
                      )}
                      
                      {margin >= 30 && (
                        <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                          Alto Margen
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <CardHeader>
                    <div className="space-y-2">
                      {categoryName && (
                        <Badge variant="outline" className="text-xs">
                          {categoryName}
                        </Badge>
                      )}
                      <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description || "Sin descripción"}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stock Status */}
                    <div className="flex items-center gap-2 text-sm">
                      {isLowStock ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">Stock bajo: {product.stock} unidades</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">Stock: {product.stock} unidades</span>
                        </>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio mayorista:</span>
                        <span className="font-semibold">₲ {parseFloat(product.wholesalePrice || "0").toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio sugerido:</span>
                        <span className="font-semibold">₲ {parseFloat(product.suggestedRetailPrice || "0").toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Profit Margin */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">Tu ganancia:</span>
                      <span className={`text-lg font-bold ${margin >= 30 ? "text-accent" : "text-primary"}`}>
                        ₲ {margin.toFixed(1)}%
                      </span>
                    </div>

                    {/* View Details Button */}
                    <Link href={`/producto/${product.id}`}>
                      <Button className="w-full mt-4">Ver Detalles</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
