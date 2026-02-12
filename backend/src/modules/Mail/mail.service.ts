import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 587,
      secure: true,
      auth: {
        user: process.env.MAIL_USER ,
        pass: process.env.MAIL_PASS ,
      },
      connectionTimeout: 5000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Enviar correo con contraseña temporal
   */
  async sendPasswordResetEmail(to: string, tempPassword: string, userName: string): Promise<boolean> {
    const mailOptions = {
      from: `"Energía PD - Sistema" <${process.env.MAIL_USER || 'noreply@energiapd.com'}>`,
      to,
      subject: '🔐 Tu nueva contraseña temporal - Energía PD',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td>
                <!-- Card principal -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header con gradiente -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0D76B8 0%, #14559c 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        Energía PD
                      </h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        Sistema de Gestión de Cotizaciones
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <!-- Icono -->
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; width: 64px; height: 64px; background: #e8f4fc; border-radius: 50%; line-height: 64px;">
                          <span style="font-size: 32px;">🔐</span>
                        </div>
                      </div>

                      <!-- Saludo -->
                      <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 22px; text-align: center;">
                        Hola, ${userName}
                      </h2>
                      
                      <p style="margin: 0 0 24px; color: #4a5568; font-size: 15px; line-height: 1.6; text-align: center;">
                        Recibimos una solicitud para restablecer tu contraseña. 
                        Aquí está tu nueva contraseña temporal:
                      </p>

                      <!-- Caja de contraseña -->
                      <div style="background: linear-gradient(135deg, #f8fafc 0%, #e8f4fc 100%); border: 2px dashed #0D76B8; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                          Tu contraseña temporal
                        </p>
                        <p style="margin: 0; color: #0D76B8; font-size: 28px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                          ${tempPassword}
                        </p>
                      </div>

                      <!-- Aviso importante -->
                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                          <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar esta contraseña 
                          inmediatamente después de iniciar sesión desde tu perfil.
                        </p>
                      </div>

                      <!-- Botón -->
                      <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${process.env.FRONTEND_URL}/signin" 
                           style="display: inline-block; background: linear-gradient(135deg, #0D76B8 0%, #14559c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                          Iniciar Sesión
                        </a>
                      </div>

                      <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.5;">
                        Si no solicitaste este cambio, puedes ignorar este correo. 
                        Tu contraseña actual seguirá funcionando hasta que uses la nueva.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center; line-height: 1.5;">
                        Este es un correo automático del sistema de Energía PD.<br>
                        Por favor no respondas a este mensaje.
                      </p>
                      <p style="margin: 16px 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                        © ${new Date().getFullYear()} Energía PD. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
        console.log(mailOptions);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado a ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error);
      return false;
    }
  }
}