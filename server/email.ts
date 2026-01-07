import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  commissionAmount: string;
  commissionPercentage: string;
  deliveryAddress: string;
  deliveryCity?: string;
  paymentMethod: string;
  dropshipperName: string;
  dropshipperEmail: string;
  companyEmail: string;
  orderDate: Date;
}

/**
 * Generate HTML email template for customer
 */
function generateCustomerEmailHTML(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { color: #333; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Pedido Confirmado</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">La Hora de las Compras</p>
        </div>
        
        <div class="content">
          <h2>¡Hola ${data.customerName}!</h2>
          <p>Tu pedido ha sido confirmado exitosamente. Aquí están los detalles:</p>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Número de Pedido:</span>
              <span class="detail-value">#${data.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">${data.orderDate.toLocaleDateString('es-PY')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Producto:</span>
              <span class="detail-value">${data.productName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cantidad:</span>
              <span class="detail-value">${data.quantity}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Precio Unitario:</span>
              <span class="detail-value">₲ ${parseFloat(data.unitPrice).toLocaleString('es-PY')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Monto Total:</span>
              <span class="detail-value" style="font-size: 18px; color: #10b981; font-weight: bold;">₲ ${parseFloat(data.totalAmount).toLocaleString('es-PY')}</span>
            </div>
          </div>
          
          <div class="highlight">
            <strong>📍 Dirección de Entrega:</strong><br>
            ${data.deliveryAddress}<br>
            ${data.deliveryCity ? `${data.deliveryCity}, Paraguay` : 'Paraguay'}
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Método de Pago:</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Teléfono de Contacto:</span>
              <span class="detail-value">${data.customerPhone}</span>
            </div>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <strong style="color: #047857;">✓ 97% Efectividad en Entregas</strong><br>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Tu pedido será entregado en menos de 24 horas en Central, Paraguay con nuestro sistema de logística propio.</p>
          </div>
          
          <p style="text-align: center; margin-top: 30px;">
            <strong>¿Preguntas?</strong> Contacta con nuestro equipo de soporte
          </p>
          
          <div class="footer">
            <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
            <p>© 2024 La Hora de las Compras. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML email template for dropshipper
 */
function generateDropshipperEmailHTML(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { color: #333; }
        .commission-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; text-align: center; }
        .commission-amount { font-size: 32px; font-weight: bold; color: #d97706; }
        .commission-label { font-size: 14px; color: #92400e; margin-top: 5px; }
        .highlight { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Nueva Venta Confirmada!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">La Hora de las Compras</p>
        </div>
        
        <div class="content">
          <h2>¡Felicidades ${data.dropshipperName}!</h2>
          <p>Tu venta ha sido confirmada. Aquí están los detalles:</p>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Número de Pedido:</span>
              <span class="detail-value">#${data.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">${data.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Producto:</span>
              <span class="detail-value">${data.productName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cantidad:</span>
              <span class="detail-value">${data.quantity}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Monto Total:</span>
              <span class="detail-value">₲ ${parseFloat(data.totalAmount).toLocaleString('es-PY')}</span>
            </div>
          </div>
          
          <div class="commission-box">
            <div class="commission-label">Tu Comisión</div>
            <div class="commission-amount">₲ ${parseFloat(data.commissionAmount).toLocaleString('es-PY')}</div>
            <div class="commission-label">${data.commissionPercentage}% de comisión</div>
          </div>
          
          <div class="highlight">
            <strong>📍 Dirección de Entrega:</strong><br>
            ${data.deliveryAddress}<br>
            ${data.deliveryCity ? `${data.deliveryCity}, Paraguay` : 'Paraguay'}<br><br>
            <strong>📞 Contacto del Cliente:</strong><br>
            ${data.customerPhone}
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Método de Pago:</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha del Pedido:</span>
              <span class="detail-value">${data.orderDate.toLocaleDateString('es-PY')}</span>
            </div>
          </div>
          
          <p style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <strong>✓ Entrega Garantizada en Menos de 24hrs</strong><br>
            <span style="font-size: 14px; color: #666;">Nosotros nos encargamos de la entrega con 97% de efectividad. Tu cliente recibirá el producto rápidamente.</span>
          </p>
          
          <div class="footer">
            <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
            <p>© 2024 La Hora de las Compras. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML email template for company
 */
function generateCompanyEmailHTML(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { color: #333; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-box { background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #bfdbfe; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Nuevo Pedido Registrado</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">La Hora de las Compras - Panel Administrativo</p>
        </div>
        
        <div class="content">
          <h2>Nuevo Pedido Confirmado</h2>
          <p>Se ha registrado un nuevo pedido en el sistema. Detalles:</p>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Número de Pedido:</span>
              <span class="detail-value">#${data.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dropshipper:</span>
              <span class="detail-value">${data.dropshipperName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value">${data.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Producto:</span>
              <span class="detail-value">${data.productName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cantidad:</span>
              <span class="detail-value">${data.quantity}</span>
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">₲ ${parseFloat(data.totalAmount).toLocaleString('es-PY')}</div>
              <div class="stat-label">Monto Total</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">₲ ${parseFloat(data.commissionAmount).toLocaleString('es-PY')}</div>
              <div class="stat-label">Comisión Dropshipper</div>
            </div>
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Email Cliente:</span>
              <span class="detail-value">${data.customerEmail || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Teléfono Cliente:</span>
              <span class="detail-value">${data.customerPhone}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dirección de Entrega:</span>
              <span class="detail-value">${data.deliveryCity || 'Central'}, Paraguay</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Método de Pago:</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático del sistema. Por favor no respondas a este mensaje.</p>
            <p>© 2024 La Hora de las Compras. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send order confirmation emails to customer, dropshipper, and company
 */
export async function sendOrderConfirmationEmails(data: OrderEmailData): Promise<{
  customerSent: boolean;
  dropshipperSent: boolean;
  companySent: boolean;
}> {
  const results = {
    customerSent: false,
    dropshipperSent: false,
    companySent: false,
  };

  try {
    // Send to customer
    if (data.customerEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@lahoradelas compras.com",
        to: data.customerEmail,
        subject: `Pedido Confirmado #${data.orderId} - La Hora de las Compras`,
        html: generateCustomerEmailHTML(data),
      });
      results.customerSent = true;
    }
  } catch (error) {
    console.error("Error sending customer email:", error);
  }

  try {
    // Send to dropshipper
    if (data.dropshipperEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@lahoradelas compras.com",
        to: data.dropshipperEmail,
        subject: `¡Nueva Venta! Pedido #${data.orderId} - La Hora de las Compras`,
        html: generateDropshipperEmailHTML(data),
      });
      results.dropshipperSent = true;
    }
  } catch (error) {
    console.error("Error sending dropshipper email:", error);
  }

  try {
    // Send to company
    if (data.companyEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@lahoradelas compras.com",
        to: data.companyEmail,
        subject: `Nuevo Pedido #${data.orderId} - La Hora de las Compras`,
        html: generateCompanyEmailHTML(data),
      });
      results.companySent = true;
    }
  } catch (error) {
    console.error("Error sending company email:", error);
  }

  return results;
}

/**
 * Send a generic email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@lahoradelas compras.com",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
