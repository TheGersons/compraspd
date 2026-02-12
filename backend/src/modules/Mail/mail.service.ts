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
      secure: false,
      auth: {
        user: process.env.MAIL_USER ,
        pass: process.env.MAIL_PASS ,
      },
      connectionTimeout: 5000,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
  }

   /**
   * Logo SVG de la empresa en base64 para emails
   */
  private getLogoSvg(): string {
    return `
      <svg
        class="h-50 text-white-800"
        xmlns="http://www.w3.org/2000/svg"
        id="Capa_1"
        data-name="Capa 1"
        viewBox="0 0 1080 406.86">
        <defs>
          <style>
            .cls-1 {
              fill: #921915;
            }

            .cls-2 {
              fill: #1177b7;
            }

            .cls-3 {
              fill: #14559c;
            }

            .cls-4 {
              fill: #a11e1f;
            }

            .cls-5 {
              fill: #bd484a;
            }

            .cls-6 {
              fill: #259dd7;
            }
          </style>
        </defs>
        <g>
          <polygon
            points="441.63 141.83 441.63 158.22 441.63 193.35 441.63 209.22 441.63 238.62 459.32 238.62 459.32 209.22 488.2 209.22 488.2 193.35 459.32 193.35 459.32 158.22 493.14 158.22 493.14 141.83 441.63 141.83"
            fill="currentColor" />
          <rect
            x="441.63"
            y="243.82"
            width="51.51"
            height="17.17"
            fill="currentColor" />
        </g>
        <path
          d="M789.77,142.61h8.55v109.33c0,4.85-3.94,8.79-8.79,8.79h-8.13v-109.76c0-4.61,3.74-8.36,8.36-8.36Z"
          fill="currentColor" />
        <path
          class="cls-1"
          d="M240.43,19.55l90.89,92.1-62.44,62.96-61.69-61.34c-16.82-16.73-16.97-43.9-.34-60.82l33.58-32.91Z" />
        <path
          class="cls-5"
          d="M268.66,174.87l90.89,92.1-62.44,62.96-61.69-61.34c-16.82-16.73-16.97-43.9-.34-60.82l33.58-32.91Z" />
        <path
          class="cls-4"
          d="M359.79,266.76l-90.81-92.17,62.49-62.91,61.64,61.39c16.81,16.74,16.94,43.92.29,60.82l-33.61,32.88Z" />
        <g>
          <path
            class="cls-3"
            d="M211.55,387.3l-90.89-92.1,62.44-62.96,61.69,61.34c16.82,16.73,16.97,43.9.34,60.82l-33.58,32.91Z" />
          <path
            class="cls-6"
            d="M183.32,231.98l-90.89-92.1,62.44-62.96,61.69,61.34c16.82,16.73,16.97,43.9.34,60.82l-33.58,32.91Z" />
          <path
            class="cls-2"
            d="M92.2,140.1l90.81,92.17-62.49,62.91-61.64-61.39c-16.81-16.74-16.94-43.92-.29-60.82l33.61-32.88Z" />
        </g>
        <g fill="currentColor">
          <polygon
            points="577.24 141.7 577.24 158.09 577.24 193.22 577.24 209.09 577.24 238.49 594.93 238.49 594.93 209.09 623.81 209.09 623.81 193.22 594.93 193.22 594.93 158.09 628.76 158.09 628.76 141.7 577.24 141.7" />
          <rect x="577.24" y="243.69" width="51.51" height="17.17" />
        </g>
        <path
          d="M555.19,142.03c-5.39,0-9.76,4.37-9.76,9.76v61.47l-25.56-71.55h-17.17v119.29h7.41c5.39,0,9.76-4.37,9.76-9.76v-61.47l25.56,71.55h17.17v-119.29h-7.41Z"
          fill="currentColor" />
        <polygon
          points="857.05 260.73 874.23 260.73 847.69 141.7 833.83 141.7 817.44 214.16 833.25 213.97 840.47 176.5 848.86 219.1 831.88 219.1 816.27 219.1 812.63 235.23 812.72 235.23 807.1 260.73 824.08 260.73 828.86 235.23 852.03 235.23 857.05 260.73"
          fill="currentColor" />
        <path
          d="M787.78,138.26h8.61c1.58,0,3.08-.64,4.17-1.78l20.58-21.44h-12c-3.93,0-7.59,1.99-9.73,5.29l-11.64,17.93Z"
          fill="currentColor" />
        <path
          d="M1006.57,141.7h-28.21v98.86h17.17v-81.22l8.94-.09c6.47-.07,11.75,5.17,11.74,11.64l-.11,59.37c-.01,7.49-6.09,13.55-13.58,13.54l-24.17-.03v17.02h27.88c14.85,0,26.92-11.97,27.04-26.82l.53-64.8c.12-15.13-12.11-27.47-27.24-27.47Z"
          fill="currentColor" />
        <path
          d="M966.35,169.41c-.12-15.34-12.59-27.71-27.93-27.71h-27.51v119.09h7.32c5.33,0,9.66-4.32,9.66-9.66v-35.58h11.03c15.32-.02,27.7-12.51,27.58-27.84l-.15-18.3ZM938.14,198.61l-10.26.05v-39.74l11.59.12c5.59.06,10.1,4.59,10.12,10.18l.09,17.74c.03,6.41-5.13,11.62-11.54,11.66Z"
          fill="currentColor" />
        <path
          d="M511.78,291.92c-1.69-2.43-4.18-2.88-7.26-2.88-1.6,0-5.12.4-7.86,4.72v-4.22h-7.41v34.29h7.41v-23.97c.22-2.59,1.15-5.34,4.39-5.4,5.87-.11,4.88,6.34,4.88,8.39v20.98h7.43v-20.81c0-4.45.12-8.66-1.58-11.09Z"
          fill="currentColor" />
        <path
          d="M555.2,282.46l6.25-10.17,5.72,2.99-8.17,9.32-3.8-2.14ZM554.38,289.53h7.64v34.29h-7.64v-34.29Z"
          fill="currentColor" />
        <path
          d="M609.7,295.66c-.77-2.17-1.89-3.82-3.36-4.94-1.47-1.12-3.25-1.68-5.32-1.68-1.8,0-3.43.61-4.91,1.82-1.39,1.15-2.53,2.76-3.41,4.82,0,0,0,0,0-.01-.75-2.17-1.85-3.82-3.29-4.94-1.45-1.12-3.18-1.68-5.2-1.68-1.74,0-3.29.56-4.64,1.67-1.07.88-1.98,2.08-2.75,3.57v-4.74h-6.64v34.29h6.64v-21.21c0-1.92.44-3.4,1.33-4.44.89-1.05,2.15-1.57,3.78-1.57s2.99.6,3.9,1.8c.92,1.2,1.38,2.91,1.38,5.14v20.28h6.61v-20.32c0-.1,0-.19,0-.28v.05c0-2.14.45-3.78,1.33-4.94.88-1.16,2.13-1.73,3.74-1.73,1.7,0,3.02.6,3.95,1.8.93,1.2,1.39,2.91,1.39,5.14v20.28h6.64v-20.32c0-3.06-.39-5.68-1.15-7.85Z"
          fill="currentColor" />
        <path
          d="M659.1,313.77c-.18-.72-.23-3.14-.19-5.87l17.25-.08c0-3.86-.47-7.61-1.4-10.35-.94-2.74-2.29-4.83-4.08-6.27-1.78-1.44-5.89-1.77-8.4-1.69-6.31.21-8.22,4.42-9.21,6.78-.99,2.37-1.48,5.22-1.49,8.57,0,5.3.33,13.82,4.68,16.81,3.12,2.15,5.71,2.15,8.49,2.15,1.89,0,3.76-.44,5.62-1.32,1.86-.88,5.11-3.66,5.21-10.48h-6.83c.59,7.61-7.88,8.91-9.66,1.76ZM663.88,294.75c3.83.24,4.2,6.46,4.39,8.82l-9.24.24c.11-2.59.29-4.85.48-5.54.75-2.64,2.32-3.65,4.36-3.52Z"
          fill="currentColor" />
        <g fill="currentColor">
          <rect x="472.85" y="289.53" width="8.2" height="34.29" />
          <ellipse cx="476.85" cy="279.43" rx="5.17" ry="4.59" />
        </g>
        <g fill="currentColor">
          <rect x="618.1" y="289.73" width="8.2" height="34.29" />
          <ellipse cx="622.1" cy="279.63" rx="5.17" ry="4.59" />
        </g>
        <polygon
          points="647.42 289.53 643.19 289.53 643.19 279.63 635.78 279.63 635.78 289.53 631.68 289.53 631.68 294.36 635.78 294.36 635.78 323.82 643.19 323.82 643.19 294.36 647.42 294.36 647.42 289.53"
          fill="currentColor" />
        <path
          d="M698.22,290.94v5.76s-5.27-3.22-8.98-.88c-3.71,2.34.1,6.63,3.71,8.39s9.48,6.36,7.02,13.17c-2.54,7.02-11.02,7.51-17.85,4.88v-6.15s5.17,4.2,9.56,1.17c4.39-3.02-1.07-8.2-4.1-9.56-3.24-1.47-8.78-6-6.73-11.61,2.18-5.96,8.78-8.39,17.37-5.17Z"
          fill="currentColor" />
        <rect
          x="537.89"
          y="269.87"
          width="7.93"
          height="53.95"
          fill="currentColor" />
        <path
          d="M464.85,271.53l-.1,6.93s-9.83-5.27-13.35.98c-3.52,6.24,2.24,10.12,6.23,13.85,4.59,4.29,13.28,10.42,9.56,20.98-3.61,10.24-14.01,11.39-22.93,7.25v-7.54s7.94,6.57,13.08,1.17c5.76-6.05.2-12.59-7.51-18.34-5.75-4.29-9.7-10.46-6.87-18.46,2.83-8,12.17-10.52,21.9-6.81Z"
          fill="currentColor" />
        <path
          d="M765.54,176.84s1.56-12.05-1.95-18.09c-3.51-6.05-11.32-17.43-26.93-16.13-15.61,1.3-25.37,8.72-27.51,24.33v1.95h-.85v66.34h.85v.78c1.06,14.6,13.2,26.08,27.71,26.34,14.72.26,27.38-11.11,28.68-25.91v-40.5h-30.18v14.83h13.2v24.46c-.91,5.64-5.84,9.8-11.51,9.76-5.6-.05-10.42-4.19-11.32-9.76v-66.34c1.53-6.03,7.15-9.96,12.88-9.37,4.91.51,9.11,4.27,10.34,9.37-.07,2.65-.13,5.3-.2,7.95h16.78Z"
          fill="currentColor" />
        <path
          d="M699.98,260.86l-17.94-53.94c19.87-10.51,13.89-37.23,13.89-37.23-.13-15.34-12.85-27.71-28.51-27.71h-28.07v119.09h6.2c5.44,0,11.13-4.32,11.13-9.66v-40.63h9.7l15.47,50.08h18.15ZM655.88,195.04v-36.94l12.24.12c5.9.06,10.67,4.61,10.7,10.23l.07,13.92c.03,6.44-2.33,12.68-12.31,12.68h-10.7Z"
          fill="currentColor" />
      </svg>
    `;
  }

  /**
   * Enviar correo con contraseña temporal - Diseño profesional
   */
  async sendPasswordResetEmail(to: string, tempPassword: string, userName: string): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const changePasswordUrl = `${frontendUrl}/change-password-required`;
    
    const mailOptions = {
      from: `"Energía PD" <${process.env.MAIL_USER || 'noreply@energiapd.com'}>`,
      to,
      subject: 'Restablecimiento de Contraseña - Energía PD',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecimiento de Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8; -webkit-font-smoothing: antialiased;">
          
          <!-- Wrapper -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f4f8; padding: 48px 16px;">
            <tr>
              <td align="center">
                
                <!-- Container -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header con Logo -->
                  <tr>
                    <td style="background: linear-gradient(145deg, #0D76B8 0%, #0a5a8c 50%, #14559c 100%); padding: 48px 40px; text-align: center;">
                      <!-- Logo SVG -->
                      <div style="margin-bottom: 16px;">
                        ${this.getLogoSvg()}
                      </div>
                      <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase;">
                        Sistema de Gestión Empresarial
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido Principal -->
                  <tr>
                    <td style="padding: 48px 40px 32px;">
                      
                      <!-- Título -->
                      <h1 style="margin: 0 0 8px; color: #1a202c; font-size: 24px; font-weight: 700; text-align: center; letter-spacing: -0.5px;">
                        Nueva Contraseña Temporal
                      </h1>
                      
                      <p style="margin: 0 0 32px; color: #64748b; font-size: 15px; text-align: center; line-height: 1.6;">
                        Hola <strong style="color: #334155;">${userName}</strong>, hemos generado una nueva contraseña temporal para tu cuenta.
                      </p>

                      <!-- Caja de Contraseña -->
                      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center;">
                        <p style="margin: 0 0 12px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                          Tu contraseña temporal
                        </p>
                        <div style="background: linear-gradient(135deg, #0D76B8 0%, #14559c 100%); border-radius: 12px; padding: 20px 24px; display: inline-block;">
                          <p style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; letter-spacing: 3px;">
                            ${tempPassword}
                          </p>
                        </div>
                      </div>

                      <!-- Botón CTA -->
                      <div style="text-align: center; margin-bottom: 32px;">
                        <a href="${changePasswordUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #0D76B8 0%, #0a5a8c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(13, 118, 184, 0.4); transition: all 0.2s ease;">
                          Cambiar Contraseña Ahora
                        </a>
                      </div>

                      <!-- Instrucciones -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="32" valign="top">
                              <span style="font-size: 20px;">⚠️</span>
                            </td>
                            <td>
                              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6; font-weight: 500;">
                                <strong>Importante:</strong> Por seguridad, deberás cambiar esta contraseña temporal la próxima vez que inicies sesión.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Pasos -->
                      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <p style="margin: 0 0 16px; color: #334155; font-size: 14px; font-weight: 600;">
                          📋 Pasos a seguir:
                        </p>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                              <span style="display: inline-block; width: 24px; height: 24px; background: #0D76B8; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px;">1</span>
                              Haz clic en el botón "Cambiar Contraseña Ahora"
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                              <span style="display: inline-block; width: 24px; height: 24px; background: #0D76B8; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px;">2</span>
                              Ingresa la contraseña temporal mostrada arriba
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                              <span style="display: inline-block; width: 24px; height: 24px; background: #0D76B8; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; margin-right: 12px;">3</span>
                              Crea una nueva contraseña segura
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Nota de seguridad -->
                      <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.6;">
                        Si no solicitaste este cambio, ignora este correo.<br>
                        Tu contraseña actual permanecerá sin cambios.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="text-align: center;">
                            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                              Este es un correo automático, por favor no respondas.
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                              © ${new Date().getFullYear()} Energía PD · Todos los derechos reservados
                            </p>
                          </td>
                        </tr>
                      </table>
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
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de reset password enviado a ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error);
      return false;
    }
  }
}