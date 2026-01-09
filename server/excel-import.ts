import { Buffer } from 'buffer';

let XLSX: any = null;

async function getXLSX() {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
}

export interface ExcelProduct {
  sku: string;
  nombre: string;
  nombreMarketing: string;
  combinacion: string;
  stock: number;
  precioAnterior: number;
  precio: number;
  descripcion: string;
  categorias: string;
  urlWeb: string;
  imagenes: string;
}

/**
 * Parsear archivo Excel y extraer datos de productos
 */
export async function parseExcelFile(buffer: Buffer): Promise<ExcelProduct[]> {
  try {
    const xlsx = await getXLSX();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convertir a JSON
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    // Mapear columnas del Excel a nuestro formato
    const products: ExcelProduct[] = rows.map((row: any) => ({
      sku: String(row['SKU'] || row['sku'] || '').trim(),
      nombre: String(row['Nombre'] || row['nombre'] || '').trim(),
      nombreMarketing: String(row['Nombre Marketing'] || row['nombreMarketing'] || '').trim(),
      combinacion: String(row['Combinacion'] || row['combinacion'] || '').trim(),
      stock: parseInt(row['Stock'] || row['stock'] || '0'),
      precioAnterior: parseFloat(row['Precio Anterior'] || row['precioAnterior'] || '0'),
      precio: parseFloat(row['Precio'] || row['precio'] || '0'),
      descripcion: String(row['Descripción Producto'] || row['descripcion'] || '').trim(),
      categorias: String(row['Categorias'] || row['categorias'] || '').trim(),
      urlWeb: String(row['url web'] || row['urlWeb'] || '').trim(),
      imagenes: String(row['Imágenes'] || row['imagenes'] || '').trim(),
    }));
    
    return products;
  } catch (error) {
    console.error('[Excel] Error parsing file:', error);
    throw new Error('Failed to parse Excel file');
  }
}

/**
 * Procesar lista de imágenes separadas por coma
 */
export function parseImageUrls(imageString: string): string[] {
  if (!imageString) return [];
  return imageString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Procesar lista de categorías separadas por coma
 */
export function parseCategories(categoryString: string): string[] {
  if (!categoryString) return [];
  return categoryString
    .split(',')
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0);
}

/**
 * Validar que un producto tenga los campos requeridos
 */
export function validateProduct(product: ExcelProduct): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!product.sku) errors.push('SKU is required');
  if (!product.nombre) errors.push('Nombre is required');
  if (product.precio <= 0) errors.push('Precio must be greater than 0');
  if (product.stock < 0) errors.push('Stock cannot be negative');
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
