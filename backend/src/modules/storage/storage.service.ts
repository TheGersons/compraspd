import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
    private readonly webdavUrl: string;
    private readonly username: string;
    private readonly password: string;
    private readonly basePath: string;

    constructor(private configService: ConfigService) {
        this.webdavUrl = this.configService.get<string>('NEXTCLOUD_WEBDAV_URL')
            || '';
        this.username = this.configService.get<string>('NEXTCLOUD_USERNAME') || '';
        this.password = this.configService.get<string>('NEXTCLOUD_PASSWORD') || '';
        this.basePath = this.configService.get<string>('NEXTCLOUD_BASE_PATH') || '';
    }

    /**
     * Genera las credenciales de autenticación Basic
     */
    private getAuthHeader(): string {
        const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        return `Basic ${credentials}`;
    }

    /**
     * Crea una carpeta en Nextcloud (recursivamente si es necesario)
     */
    private async createFolder(folderPath: string): Promise<void> {
        // Construir URL completa
        const url = `${this.webdavUrl}/${folderPath}`;

        try {
            const response = await fetch(url, {
                method: 'MKCOL',
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });

            // 201 = creado, 405 = ya existe (ambos son OK)
            if (!response.ok && response.status !== 405 && response.status !== 409) {
                // Si falla, intentar crear carpetas padre
                const parentPath = folderPath.split('/').slice(0, -1).join('/');
                if (parentPath && parentPath.length > 0) {
                    await this.createFolderRecursive(parentPath);
                    // Reintentar crear la carpeta actual
                    await fetch(url, {
                        method: 'MKCOL',
                        headers: {
                            'Authorization': this.getAuthHeader(),
                        },
                    });
                }
            }
        } catch (error) {
            console.warn(`No se pudo crear carpeta ${folderPath}:`, (error as Error).message);
        }
    }

    /**
 * Crea una carpeta en Nextcloud (recursivamente)
 */
    private async createFolderRecursive(folderPath: string): Promise<void> {
        const parts = folderPath.split('/').filter(p => p.length > 0);
        let currentPath = '';

        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const url = `${this.webdavUrl}/${currentPath}`;

            try {
                const response = await fetch(url, {
                    method: 'MKCOL',
                    headers: {
                        'Authorization': this.getAuthHeader(),
                    },
                });

                // 201 = creado, 405 = ya existe, 409 = ya existe - todos OK
                if (response.ok || response.status === 405 || response.status === 409) {
                    continue;
                }
            } catch (error) {
                console.warn(`Error creando carpeta ${currentPath}:`, (error as Error).message);
            }
        }
    }

    /**
     * Genera la ruta de carpeta según la estructura definida
     * /Aplicativos/Compras/cotizaciones/2025/01/COT-{id}/comprobantes_descuento/
     */
    private generateFolderPath(cotizacionId: string, tipo: 'comprobantes_descuento' | 'facturas' | 'ordenes_compra' | 'otros'): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        return `${this.basePath}/${year}/${month}/COT-${cotizacionId.substring(0, 8)}/${tipo}`;
    }

    /**
     * Genera nombre de archivo único
     * {SKU}_{proveedor}_{timestamp}.{ext}
     */
    private generateFileName(sku: string, proveedorNombre: string, originalName: string): string {
        const ext = originalName.split('.').pop()?.toLowerCase() || 'pdf';
        const timestamp = Date.now();
        const proveedorSlug = proveedorNombre
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 20);

        return `${sku}_${proveedorSlug}_${timestamp}.${ext}`;
    }

    /**
     * Sube un archivo a Nextcloud
     */
    async uploadFile(
        file: Buffer,
        originalName: string,
        cotizacionId: string,
        sku: string,
        proveedorNombre: string,
        tipo: 'comprobantes_descuento' | 'facturas' | 'ordenes_compra' | 'otros' = 'comprobantes_descuento'
    ): Promise<{ url: string; path: string; fileName: string }> {

        // Validar tipo de archivo
        const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
        const ext = originalName.split('.').pop()?.toLowerCase();

        if (!ext || !allowedExtensions.includes(ext)) {
            throw new BadRequestException(
                `Tipo de archivo no permitido. Permitidos: ${allowedExtensions.join(', ')}`
            );
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.length > maxSize) {
            throw new BadRequestException('El archivo excede el tamaño máximo de 10MB');
        }

        try {
            // Generar ruta y nombre
            const folderPath = this.generateFolderPath(cotizacionId, tipo);
            const fileName = this.generateFileName(sku, proveedorNombre, originalName);
            const fullPath = `${folderPath}/${fileName}`;

            // Crear carpeta si no existe
            await this.createFolderRecursive(folderPath);

            // Subir archivo
            const uploadUrl = `${this.webdavUrl}/${fullPath}`;
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/octet-stream',
                },
                body: new Uint8Array(file),
            });

            if (!response.ok) {
                throw new Error(`Error al subir archivo: ${response.status} ${response.statusText}`);
            }

            // Generar URL pública (share link)
            const publicUrl = await this.getShareLink(fullPath);

            return {
                url: publicUrl,
                path: fullPath,
                fileName,
            };
        } catch (error) {
            console.error('Error al subir archivo a Nextcloud:', error);
            throw new InternalServerErrorException('Error al subir archivo al servidor de almacenamiento');
        }
    }

    /**
     * Obtiene o crea un link de compartir para un archivo
     */
    private async getShareLink(filePath: string): Promise<string> {
        const shareApiUrl = `https://nx88862.your-storageshare.de/ocs/v2.php/apps/files_sharing/api/v1/shares`;

        try {
            const response = await fetch(shareApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'OCS-APIRequest': 'true',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    path: `/${filePath}`,
                    shareType: '3', // 3 = public link
                    permissions: '1', // 1 = read only
                }),
            });

            if (response.ok) {
                const text = await response.text();
                // Parsear respuesta XML para obtener URL
                const urlMatch = text.match(/<url>([^<]+)<\/url>/);
                if (urlMatch) {
                    return urlMatch[1];
                }
            }

            // Si falla crear share, retornar URL directa de WebDAV
            return `${this.webdavUrl}/${filePath}`;
        } catch (error) {
            console.warn('No se pudo crear share link:', error);
            return `${this.webdavUrl}/${filePath}`;
        }
    }

    /**
     * Verifica si un archivo existe
     */
    async fileExists(filePath: string): Promise<boolean> {
        try {
            const url = `${this.webdavUrl}/${filePath}`;
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Elimina un archivo
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            const url = `${this.webdavUrl}/${filePath}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': this.getAuthHeader(),
                },
            });
        } catch (error) {
            console.warn('Error al eliminar archivo:', error);
        }
    }

    /**
     * Genera un comprobante automático para "No aplica descuento"
     */
    generateNoAplicaComprobante(): string {
        const timestamp = Date.now();
        return `NO_APLICA_${timestamp}`;
    }
}