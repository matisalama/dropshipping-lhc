# TODO - La Hora de las Compras - Plataforma de Dropshipping

## Base de Datos y Backend
- [x] Diseñar esquema de base de datos para productos
- [x] Diseñar esquema de base de datos para categorías
- [x] Diseñar esquema de base de datos para dropshippers
- [x] Implementar procedimientos tRPC para gestión de productos
- [x] Implementar procedimientos tRPC para gestión de categorías
- [x] Implementar procedimientos tRPC para gestión de dropshippers
- [x] Implementar procedimiento de cálculo automático de ganancias
- [x] Implementar búsqueda y filtrado de productos

## Landing Page Promocional
- [x] Diseñar hero section con propuesta de valor
- [x] Destacar 97% efectividad en entregas
- [x] Destacar entrega en menos de 24hrs en Central Paraguay
- [x] Destacar soporte personalizado
- [x] Sección de beneficios para dropshippers
- [x] Sección de cómo funciona el sistema
- [x] Call-to-action para registro
- [x] Footer con información de contacto

## Dashboard de Dropshipper
- [x] Implementar autenticación y perfil personalizado
- [x] Mostrar catálogo de productos disponibles
- [x] Mostrar stock en tiempo real
- [x] Mostrar precio mayorista por producto
- [x] Mostrar precio sugerido de venta
- [x] Mostrar margen de ganancia calculado
- [x] Implementar búsqueda de productos
- [x] Implementar filtrado por categorías
- [x] Implementar filtrado por márgenes de ganancia
- [x] Implementar filtrado por precios

## Panel de Administración
- [x] Crear interfaz de administración
- [x] CRUD completo de productos
- [x] CRUD completo de categorías
- [x] Gestión de precios mayoristas
- [x] Gestión de stock
- [x] Ver lista de dropshippers registrados
- [x] Ver estadísticas de productos más solicitados

## Sección de Recursos y Soporte
- [x] Crear página de recursos para dropshippers
- [x] Implementar descarga de contenidos de productos
- [x] Crear guías para crear landing pages
- [x] Implementar formulario de contacto de soporte
- [x] Sección de preguntas frecuentes

## Diseño y Estilo
- [x] Aplicar estilo elegante y profesional
- [x] Configurar paleta de colores
- [x] Configurar tipografía
- [x] Diseño responsive para móviles
- [x] Animaciones y transiciones suaves

## Testing y Documentación
- [x] Crear tests para procedimientos críticos
- [x] Probar flujo completo de registro
- [x] Probar cálculo de ganancias
- [x] Probar búsqueda y filtrado
- [x] Documentar uso de la plataforma

## Nuevas Funcionalidades - Fase 2 ✅ COMPLETADA

### Billetera Virtual y Comisiones
- [x] Agregar tablas de billetera, transacciones y comisiones a la BD
- [x] Implementar cálculo automático de comisiones por venta
- [x] Crear panel de billetera virtual en dashboard
- [x] Mostrar historial de transacciones

### Panel de Seguimiento de Pedidos
- [x] Crear tabla de pedidos en BD
- [x] Implementar panel de seguimiento para dropshippers
- [x] Mostrar estado de pedidos en tiempo real
- [x] Historial de pedidos

### Panel de Administración de Dropshippers
- [x] Crear vista de todos los dropshippers registrados
- [x] Mostrar estadísticas por dropshipper
- [x] Ver billetera y transacciones de cada dropshipper
- [x] Aprobar/rechazar dropshippers

### Mejoras en Ficha de Producto
- [x] Destacar monto de beneficio para dropshipper
- [x] Mostrar % de comisión
- [x] Agregar sección de objeciones comunes
- [x] Agregar ganchos de ventas
- [x] Agregar técnicas de manejo de objeciones
- [x] Agregar frases marketineras
- [x] Agregar preguntas frecuentes del producto

### Panel de Carga de Ventas
- [x] Crear formulario de carga de ventas
- [x] Campos: nombre cliente, teléfono WhatsApp, cédula/RUC
- [x] Campo de dirección de entrega
- [x] Integración con Google Maps
- [x] Opciones de forma de pago
- [x] Campo de correo electrónico
- [x] Campos adicionales relevantes

### Sistema de Notificaciones
- [x] Configurar servicio de correo
- [x] Enviar correo al cliente cuando se confirma pedido
- [x] Enviar copia al vendedor (dropshipper)
- [x] Enviar copia a la empresa
- [x] Plantillas de correo profesionales

### Integración WhatsApp
- [x] Agregar botón de WhatsApp flotante
- [x] Número: +595 994715200
- [x] Integración en todas las páginas
- [x] Mensaje predefinido para soporte

### Testing y Finalización
- [x] Crear tests para nuevas funcionalidades
- [x] Probar flujo completo de pedidos
- [x] Probar cálculo de comisiones
- [x] Probar notificaciones por correo


## Sistema de Notificaciones por Correo - Fase 3 ✅ COMPLETADA

- [x] Configurar servicio de correo (Nodemailer)
- [x] Crear plantilla HTML para correo de cliente
- [x] Crear plantilla HTML para correo de dropshipper
- [x] Crear plantilla HTML para correo de empresa
- [x] Implementar procedimiento tRPC para enviar notificaciones
- [x] Agregar tabla de historial de notificaciones en BD
- [x] Integrar envío de correos en creación de pedidos
- [x] Crear panel de historial de notificaciones
- [x] Implementar reintentos automáticos de envío
- [x] Tests para sistema de notificaciones
