import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function AdminProducts() {
  const [activeTab, setActiveTab] = useState<'import' | 'edit'>('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  

  const importMutation = trpc.products.importExcel.useMutation();
  const updateMutation = trpc.products.updateFull.useMutation();
  const productsQuery = trpc.products.list.useQuery({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo Excel');
      return;
    }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const result = await importMutation.mutateAsync({
          fileData: base64,
        });
        
        setImportResult(result);
        setSelectedFile(null);
        toast.success(`Importación completada - Creados: ${result.created}, Actualizados: ${result.updated}, Errores: ${result.failed}`);
        
        // Refrescar lista de productos
        productsQuery.refetch();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error(`Error en la importación: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    try {
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description,
        marketingName: editingProduct.marketingName,
        wholesalePrice: editingProduct.wholesalePrice,
        suggestedRetailPrice: editingProduct.suggestedRetailPrice,
        previousPrice: editingProduct.previousPrice,
        stock: editingProduct.stock,
        imageUrls: editingProduct.imageUrls,
        categories: editingProduct.categories,
        combinations: editingProduct.combinations,
        webUrl: editingProduct.webUrl,
      });

      toast.success('Producto actualizado correctamente');

      setIsEditing(false);
      setEditingProduct(null);
      productsQuery.refetch();
    } catch (error) {
      toast.error(`Error al actualizar: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'import' ? 'default' : 'outline'}
          onClick={() => setActiveTab('import')}
        >
          Importar Excel
        </Button>
        <Button
          variant={activeTab === 'edit' ? 'default' : 'outline'}
          onClick={() => setActiveTab('edit')}
        >
          Editar Productos
        </Button>
      </div>

      {activeTab === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>Importar Productos desde Excel</CardTitle>
            <CardDescription>
              Sube un archivo Excel con los productos. Si el SKU ya existe, se actualizarán los datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Archivo Excel</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </div>

            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="w-full"
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>

            {importResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-900">Importación completada</p>
                <ul className="text-sm text-green-800 mt-2">
                  <li>✓ Creados: {importResult.created}</li>
                  <li>✓ Actualizados: {importResult.updated}</li>
                  <li>✗ Errores: {importResult.failed}</li>
                </ul>
                {importResult.errors?.length > 0 && (
                  <div className="mt-2 text-sm text-red-800">
                    <p className="font-semibold">Errores:</p>
                    <ul>
                      {importResult.errors.map((error: string, idx: number) => (
                        <li key={idx}>- {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'edit' && (
        <div className="space-y-4">
          {isEditing && editingProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>Editar Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Nombre de Marketing</Label>
                  <Input
                    value={editingProduct.marketingName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, marketingName: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio Mayorista</Label>
                    <Input
                      type="number"
                      value={editingProduct.wholesalePrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Precio Sugerido</Label>
                    <Input
                      type="number"
                      value={editingProduct.suggestedRetailPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, suggestedRetailPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio Anterior</Label>
                    <Input
                      type="number"
                      value={editingProduct.previousPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, previousPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>URLs de Imágenes (separadas por coma)</Label>
                  <Textarea
                    value={editingProduct.imageUrls || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrls: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Categorías (separadas por coma)</Label>
                  <Input
                    value={editingProduct.categories || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categories: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Combinaciones (talles, colores, etc)</Label>
                  <Input
                    value={editingProduct.combinations || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, combinations: e.target.value })}
                  />
                </div>

                <div>
                  <Label>URL Web</Label>
                  <Input
                    value={editingProduct.webUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, webUrl: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveProduct} disabled={updateMutation.isPending}>
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <h3 className="font-semibold">Productos ({productsQuery.data?.length || 0})</h3>
              {productsQuery.data?.map((product: any) => (
                <Card key={product.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
