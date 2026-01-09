-- Script para agregar nuevos campos a la tabla products
-- Compatible con MySQL 5.7 y anteriores
-- Ejecutar en AlmaLinux 9 con: mysql -u dropshipping_user -p la_hora_dropshipping < ADD_PRODUCT_FIELDS.sql

-- Agregar campo marketingName
ALTER TABLE products ADD COLUMN marketingName TEXT;

-- Agregar campo previousPrice
ALTER TABLE products ADD COLUMN previousPrice DECIMAL(10, 2);

-- Agregar campo categories
ALTER TABLE products ADD COLUMN categories TEXT;

-- Agregar campo combinations
ALTER TABLE products ADD COLUMN combinations TEXT;

-- Agregar campo webUrl
ALTER TABLE products ADD COLUMN webUrl TEXT;

-- Verificar que los campos fueron agregados
DESCRIBE products;
