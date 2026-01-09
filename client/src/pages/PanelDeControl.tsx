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
        product.categoryId?.toString() === selectedCategory;

      // Margin filter
      let matchesMargin = true;
      if (minMargin !== "all") {
        const margin = parseFloat(product.profitMargin || "0");
        const minMarginValue = parseFloat(minMargin);
        matchesMargin = margin >= minMarginValue;
      }

      return matchesSearch && matchesCategory && matchesMargin;
    });
  }, [products, searchQuery, selectedCategory, minMargin]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!products) return { totalProducts: 0, avgMargin: 0, highMarginProducts: 0 };

    const totalProducts = products.length;
    const avgMargin = products.reduce((sum, p) => sum + parseFloat(p.profitMargin || "0"), 0) / totalProducts;
    const highMarginProducts = products.filter(p => parseFloat(p.profitMargin || "0") >= 30).length;

    return { totalProducts, avgMargin, highMarginProducts };
  }, [products]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>Debes iniciar sesión para acceder al dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
            <Link href="/recursos">
              <Button variant="ghost">Recursos</Button>
            </Link>
            <Link href="/soporte">
              <Button variant="ghost">Soporte</Button>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Hola,</span>
              <span className="text-sm font-medium">{user.name || user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Panel de Control de Dropshipper</h1>
          <p className="text-muted-foreground">
            Explora nuestro catálogo de productos y encuentra las mejores oportunidades de ganancia
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Productos Disponibles</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Con stock disponible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ganancia promedio por producto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alto Margen (&gt;30%)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highMarginProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Productos con alta rentabilidad
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Margen mínimo</label>
                <Select value={minMargin} onValueChange={setMinMargin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier margen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier margen</SelectItem>
                    <SelectItem value="20">20% o más</SelectItem>
                    <SelectItem value="30">30% o más</SelectItem>
                    <SelectItem value="40">40% o más</SelectItem>
                    <SelectItem value="50">50% o más</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Catálogo de Productos ({filteredProducts.length})
            </h2>
          </div>

          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
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
                const firstImage = imageUrls?.[0];

                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      {firstImage ? (
                        <img 
                          src={firstImage} 
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
                      {margin >= 30 && (
                        <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                          Alto Margen
                        </Badge>
                      )}
                    </div>
                    
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
                          <span className="font-medium">₲ {parseFloat(product.wholesalePrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Precio sugerido:</span>
                          <span className="font-medium">₲ {parseFloat(product.suggestedRetailPrice).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="font-semibold">Tu ganancia:</span>
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              ₲ {parseFloat(product.profitAmount).toLocaleString()}
                            </div>
                            <div className="text-xs text-accent font-semibold">
                              {margin.toFixed(1)}% margen
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => setLocation(`/producto/${product.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
