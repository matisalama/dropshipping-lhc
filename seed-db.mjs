import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    
    // Insert categories
    console.log("Creating categories...");
    await connection.execute(`
      INSERT INTO categories (name, description, slug) VALUES
      ('Electrónica', 'Productos electrónicos y tecnología', 'electronica'),
      ('Hogar y Cocina', 'Artículos para el hogar y cocina', 'hogar-cocina'),
      ('Deportes', 'Equipamiento deportivo y fitness', 'deportes'),
      ('Moda', 'Ropa y accesorios', 'moda'),
      ('Belleza', 'Productos de belleza y cuidado personal', 'belleza')
      ON DUPLICATE KEY UPDATE name=name
    `);

    // Get category IDs
    const [categories] = await connection.execute('SELECT id, slug FROM categories');
    const catMap = {};
    categories.forEach(cat => { catMap[cat.slug] = cat.id; });

    // Insert products
    console.log("Creating products...");
    const products = [
      {
        name: 'Auriculares Bluetooth Premium',
        description: 'Auriculares inalámbricos con cancelación de ruido y 30 horas de batería',
        sku: 'AUR-BT-001',
        categoryId: catMap['electronica'],
        wholesalePrice: '150000',
        suggestedRetailPrice: '250000',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
      {
        name: 'Smartwatch Deportivo',
        description: 'Reloj inteligente con monitor de frecuencia cardíaca y GPS',
        sku: 'SW-DEP-002',
        categoryId: catMap['electronica'],
        wholesalePrice: '200000',
        suggestedRetailPrice: '350000',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      },
      {
        name: 'Licuadora de Alta Potencia',
        description: 'Licuadora profesional de 1200W con 5 velocidades',
        sku: 'LIC-HP-003',
        categoryId: catMap['hogar-cocina'],
        wholesalePrice: '180000',
        suggestedRetailPrice: '280000',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500',
      },
      {
        name: 'Set de Cuchillos Profesionales',
        description: 'Juego de 8 cuchillos de acero inoxidable con base de madera',
        sku: 'CUCH-PRO-004',
        categoryId: catMap['hogar-cocina'],
        wholesalePrice: '120000',
        suggestedRetailPrice: '200000',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
      },
      {
        name: 'Colchoneta de Yoga Premium',
        description: 'Colchoneta antideslizante de 6mm con bolsa de transporte',
        sku: 'YOG-MAT-005',
        categoryId: catMap['deportes'],
        wholesalePrice: '80000',
        suggestedRetailPrice: '140000',
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
      },
      {
        name: 'Mancuernas Ajustables 20kg',
        description: 'Par de mancuernas con peso ajustable de 5 a 20kg',
        sku: 'MAN-ADJ-006',
        categoryId: catMap['deportes'],
        wholesalePrice: '250000',
        suggestedRetailPrice: '400000',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
      },
      {
        name: 'Mochila Urbana Impermeable',
        description: 'Mochila de 25L con compartimento para laptop y puerto USB',
        sku: 'MOCH-URB-007',
        categoryId: catMap['moda'],
        wholesalePrice: '100000',
        suggestedRetailPrice: '180000',
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      },
      {
        name: 'Gafas de Sol Polarizadas',
        description: 'Gafas con protección UV400 y lentes polarizadas',
        sku: 'GAF-POL-008',
        categoryId: catMap['moda'],
        wholesalePrice: '60000',
        suggestedRetailPrice: '120000',
        stock: 70,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      },
      {
        name: 'Kit de Skincare Completo',
        description: 'Set de 5 productos para rutina facial diaria',
        sku: 'SKIN-KIT-009',
        categoryId: catMap['belleza'],
        wholesalePrice: '150000',
        suggestedRetailPrice: '260000',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
      },
      {
        name: 'Secador de Pelo Profesional',
        description: 'Secador iónico de 2000W con 3 temperaturas',
        sku: 'SEC-PRO-010',
        categoryId: catMap['belleza'],
        wholesalePrice: '130000',
        suggestedRetailPrice: '220000',
        stock: 28,
        imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
      },
    ];

    for (const product of products) {
      await connection.execute(`
        INSERT INTO products (name, description, sku, categoryId, wholesalePrice, suggestedRetailPrice, stock, imageUrl, isActive, isFeatured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, false)
        ON DUPLICATE KEY UPDATE name=name
      `, [
        product.name,
        product.description,
        product.sku,
        product.categoryId,
        product.wholesalePrice,
        product.suggestedRetailPrice,
        product.stock,
        product.imageUrl,
      ]);
    }

    // Insert FAQs
    console.log("Creating FAQs...");
    const faqs = [
      {
        question: '¿Cómo empiezo a vender como dropshipper?',
        answer: 'Primero regístrate en la plataforma, explora nuestro catálogo de productos, selecciona los que quieres vender y descarga los recursos de marketing. Nosotros nos encargamos de la logística y entregas.',
        category: 'General',
        order: 1,
      },
      {
        question: '¿Cuánto tiempo tardan las entregas?',
        answer: 'Realizamos entregas en menos de 24 horas en Central, Paraguay, con un 97% de efectividad. Para otras zonas, el tiempo puede variar entre 24-48 horas.',
        category: 'Entregas',
        order: 2,
      },
      {
        question: '¿Cómo calculo mis ganancias?',
        answer: 'La plataforma calcula automáticamente tu margen de ganancia. Es la diferencia entre el precio mayorista (lo que pagas) y el precio sugerido de venta. Puedes vender al precio que desees.',
        category: 'Precios',
        order: 3,
      },
      {
        question: '¿Qué recursos de marketing proporcionan?',
        answer: 'Ofrecemos imágenes en alta resolución, descripciones optimizadas, guías para crear landing pages, plantillas de redes sociales y soporte personalizado para ayudarte a vender.',
        category: 'Marketing',
        order: 4,
      },
      {
        question: '¿Cómo funciona el soporte personalizado?',
        answer: 'Nuestro equipo está disponible 24/7 para ayudarte. Puedes crear tickets de soporte desde la plataforma y recibirás respuesta en menos de 2 horas.',
        category: 'Soporte',
        order: 5,
      },
    ];

    for (const faq of faqs) {
      await connection.execute(`
        INSERT INTO faqs (question, answer, category, \`order\`, isPublished)
        VALUES (?, ?, ?, ?, true)
        ON DUPLICATE KEY UPDATE question=question
      `, [faq.question, faq.answer, faq.category, faq.order]);
    }

    await connection.end();
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
