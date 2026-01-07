import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus,
  Edit,
  Trash2,
  Users,
  BarChart3,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Product form state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    wholesalePrice: "",
    suggestedRetailPrice: "",
    stock: "0",
    lowStockThreshold: "10",
    imageUrl: "",
    isActive: true,
    isFeatured: false,
  });

  // Category form state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    slug: "",
  });

  // Queries
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: products } = trpc.products.list.useQuery({});
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: dropshippers } = trpc.admin.listDropshippers.useQuery();

  // Mutations
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      utils.admin.getStats.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
      toast.success("Producto creado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      utils.admin.getStats.invalidate();
      setProductDialogOpen(false);
      resetProductForm();
      toast.success("Producto actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      utils.admin.getStats.invalidate();
      toast.success("Producto eliminado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const createCategory = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", description: "", slug: "" });
      toast.success("Categoría creada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Categoría eliminada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      wholesalePrice: "",
      suggestedRetailPrice: "",
      stock: "0",
      lowStockThreshold: "10",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      sku: product.sku || "",
      categoryId: product.categoryId?.toString() || "",
      wholesalePrice: product.wholesalePrice,
      suggestedRetailPrice: product.suggestedRetailPrice,
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    const data = {
      name: productForm.name,
      description: productForm.description || undefined,
      sku: productForm.sku || undefined,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : undefined,
      wholesalePrice: productForm.wholesalePrice,
      suggestedRetailPrice: productForm.suggestedRetailPrice,
      stock: parseInt(productForm.stock),
      lowStockThreshold: parseInt(productForm.lowStockThreshold),
      imageUrl: productForm.imageUrl || undefined,
      isActive: productForm.isActive,
      isFeatured: productForm.isFeatured,
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...data });
    } else {
      createProduct.mutate(data);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Solo administradores pueden acceder a este panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
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
              <span className="font-bold">La Hora de las Compras - Admin</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
            <Badge variant="default">Admin</Badge>
            <span className="text-sm font-medium">{user.name || user.email}</span>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona productos, categorías y dropshippers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.activeProducts || 0} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dropshippers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDropshippers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.approvedDropshippers || 0} aprobados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.lowStockProducts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Soporte pendiente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="dropshippers">Dropshippers</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gestión de Productos</h2>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetProductForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                    </DialogTitle>
                    <DialogDescription>
                      Completa la información del producto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select
                          value={productForm.categoryId}
                          onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="wholesalePrice">Precio Mayorista (₲) *</Label>
                        <Input
                          id="wholesalePrice"
                          type="number"
                          value={productForm.wholesalePrice}
                          onChange={(e) => setProductForm({ ...productForm, wholesalePrice: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="suggestedRetailPrice">Precio Sugerido (₲) *</Label>
                        <Input
                          id="suggestedRetailPrice"
                          type="number"
                          value={productForm.suggestedRetailPrice}
                          onChange={(e) => setProductForm({ ...productForm, suggestedRetailPrice: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lowStockThreshold">Umbral Stock Bajo</Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          value={productForm.lowStockThreshold}
                          onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="imageUrl">URL de Imagen</Label>
                      <Input
                        id="imageUrl"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProduct}>
                      {editingProduct ? "Actualizar" : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => {
                const isLowStock = product.stock <= product.lowStockThreshold;
                const categoryName = categories?.find(c => c.id === product.categoryId)?.name;

                return (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                          {categoryName && (
                            <Badge variant="outline" className="text-xs">
                              {categoryName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("¿Eliminar este producto?")) {
                                deleteProduct.mutate({ id: product.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        {isLowStock ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">Stock: {product.stock}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Stock: {product.stock}</span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mayorista:</span>
                          <span className="font-medium">₲ {parseFloat(product.wholesalePrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sugerido:</span>
                          <span className="font-medium">₲ {parseFloat(product.suggestedRetailPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-primary">
                          <span>Margen:</span>
                          <span className="font-semibold">{product.profitMargin}%</span>
                        </div>
                      </div>
                      {!product.isActive && (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gestión de Categorías</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva Categoría</DialogTitle>
                    <DialogDescription>
                      Crea una nueva categoría de productos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="catName">Nombre *</Label>
                      <Input
                        id="catName"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="catSlug">Slug *</Label>
                      <Input
                        id="catSlug"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        placeholder="categoria-ejemplo"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="catDesc">Descripción</Label>
                      <Textarea
                        id="catDesc"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => createCategory.mutate(categoryForm)}>
                      Crear
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription className="mt-1">{category.slug}</CardDescription>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("¿Eliminar esta categoría?")) {
                            deleteCategory.mutate({ id: category.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  {category.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dropshippers Tab */}
          <TabsContent value="dropshippers" className="space-y-4">
            <h2 className="text-2xl font-semibold">Dropshippers Registrados</h2>

            <div className="grid gap-4">
              {dropshippers?.map((dropshipper) => (
                <Card key={dropshipper.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle>{dropshipper.name || "Sin nombre"}</CardTitle>
                        <CardDescription>{dropshipper.email}</CardDescription>
                      </div>
                      <Badge variant={dropshipper.isApproved ? "default" : "secondary"}>
                        {dropshipper.isApproved ? "Aprobado" : "Pendiente"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {dropshipper.businessName && (
                        <div>
                          <span className="text-muted-foreground">Negocio:</span>
                          <span className="ml-2 font-medium">{dropshipper.businessName}</span>
                        </div>
                      )}
                      {dropshipper.phone && (
                        <div>
                          <span className="text-muted-foreground">Teléfono:</span>
                          <span className="ml-2 font-medium">{dropshipper.phone}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Registro:</span>
                        <span className="ml-2 font-medium">
                          {new Date(dropshipper.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último acceso:</span>
                        <span className="ml-2 font-medium">
                          {new Date(dropshipper.lastSignedIn).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
