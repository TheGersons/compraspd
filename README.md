# Admin Dashboard - Sistema de Gestión de Compras

Panel de administración especializado para la gestión integral de procesos de compras, cotizaciones y órdenes de compra con integración automática a Odoo.

## 🎯 Descripción General

Este dashboard proporciona una interfaz centralizada para supervisores, jefes de compras y administradores para gestionar:

- **Cotizaciones**: Registro, seguimiento y análisis de proveedores
- **Órdenes de Compra**: Creación, edición y monitoreo de compras
- **Productos**: Gestión de catálogo de productos y detalles técnicos
- **Sincronización Odoo**: Integración automática con Odoo cada 5 minutos
- **Reportes**: Análisis de compras, proveedores y rendimiento

## 🔧 Stack Tecnológico

- **React 19** - Framework UI moderno
- **TypeScript** - Type safety y mejor DX
- **Tailwind CSS v4** - Estilos responsivos y customizables
- **React Router** - Navegación SPA
- **ApexCharts** - Visualización de datos

## ⚡ Características Principales

### Control de Acceso por Roles
- **ADMIN**: Acceso completo al sistema
- **SUPERVISOR**: Supervisión de procesos y reportes
- **JEFE_COMPRAS**: Gestión de compras y cotizaciones
- Filtros dinámicos según permisos del usuario

### Interfaz Interactiva
- Tablas avanzadas con sorting, filtering y paginación
- Celdas editables para fechas y campos críticos
- Modales detallados con información completa
- Selects buscables para responsables, proyectos y proveedores
- Dark mode integrado 🌙

### Integración Odoo
- Sincronización automática cada 5 minutos
- Importación de oportunidades con adjuntos Excel
- Mapeo bidireccional de datos
- Logs de sincronización y manejo de errores

### Funcionalidades de Compras
- Búsqueda y filtrado avanzado por múltiples criterios
- Asignación de responsables con validación de roles
- Bloqueo inteligente de campos según el estado
- Historial de cambios y auditoría
- Exportación de reportes

## 📋 Requisitos Previos

- Node.js 18.x o superior (recomendado 20.x+)
- npm o yarn
- Acceso a instancia Odoo para sincronización

## 🚀 Instalación y Setup

1. **Clonar repositorio**
   ```bash
   git clone [repository-url]
   cd admin-dashboard-main
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

   > En caso de conflictos de peer dependencies: `npm install --legacy-peer-deps`

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Completar valores de Odoo y base de datos

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   Acceder en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Tables/         # Tablas especializadas
│   ├── Forms/          # Formularios de compras
│   ├── Modals/         # Modales de detalle
│   └── ...
├── pages/              # Páginas/vistas principales
│   ├── Compras/
│   ├── Cotizaciones/
│   ├── Productos/
│   └── ...
├── services/           # Lógica de negocio
│   ├── odooSync.ts     # Integración Odoo
│   ├── api.ts          # Llamadas a API
│   └── ...
├── types/              # Definiciones TypeScript
├── hooks/              # Custom React hooks
└── styles/             # Estilos globales
```

## 🔄 Flujos Principales

### Gestión de Cotizaciones
1. Crear o importar cotización desde Odoo
2. Asignar responsable (validar rol)
3. Editar detalles de productos
4. Cambiar estado según avance
5. Generar orden de compra

### Sincronización Odoo
- Cron automático cada 5 minutos
- Importa nuevas oportunidades con adjuntos
- Actualiza estado de órdenes
- Maneja conflictos y errores

### Reportes y Análisis
- Dashboard con métricas clave
- Filtros por periodo, responsable, proveedor
- Exportación a Excel para análisis externo

## 🔐 Seguridad

- Validación de permisos en cada acción
- Control de acceso por rol en filtros y campos
- Protección contra ediciones no autorizadas
- Logs de auditoría para cambios críticos

## 📦 Scripts Disponibles

```bash
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build para producción
npm run lint             # Verificar código con ESLint
npm run type-check       # Verificar tipos TypeScript
npm run preview          # Preview del build de producción
```

## 🐛 Problemas Conocidos y Soluciones

**Sincronización Odoo no actualiza**: Verificar credenciales en variables de entorno y logs del cron

**Filtro de responsable no aparece**: Verificar que el usuario tiene rol ADMIN, SUPERVISOR o JEFE_COMPRAS

**Celdas no editables en tabla**: Algunos campos se bloquean según el estado - verificar estado de compra

## 📝 Changelog

### v1.0.0 - Actual
- Dashboard completo de compras
- Integración Odoo con cron cada 5 min
- Sistema de roles y permisos
- Tablas interactivas con celdas editables
- Filtros avanzados por responsable y proyecto
- Dark mode

## 👨‍💻 Contacto y Soporte

Para reportar bugs o sugerir mejoras, contactar al equipo de desarrollo.

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

---

**Nota**: Este dashboard está específicamente diseñado para los procesos de compra de la organización. Para cambios o extensiones, consultar con el equipo técnico.
