/*
  Warnings:

  - You are about to drop the `Assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FileAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `POLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PRItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuoteLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuoteOffer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuoteOfferLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShipmentEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShipmentLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thread` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThreadParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_purchaseRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_purchaseRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_quoteOfferId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_purchaseRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatMessage" DROP CONSTRAINT "ChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FileAttachment" DROP CONSTRAINT "FileAttachment_chatMessageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_threadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."POLine" DROP CONSTRAINT "POLine_prItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."POLine" DROP CONSTRAINT "POLine_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."POLine" DROP CONSTRAINT "POLine_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PRItem" DROP CONSTRAINT "PRItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PRItem" DROP CONSTRAINT "PRItem_purchaseRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductAttribute" DROP CONSTRAINT "ProductAttribute_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_managerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseRequest" DROP CONSTRAINT "PurchaseRequest_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quote" DROP CONSTRAINT "Quote_purchaseRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuoteLine" DROP CONSTRAINT "QuoteLine_prItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuoteLine" DROP CONSTRAINT "QuoteLine_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuoteOffer" DROP CONSTRAINT "QuoteOffer_quoteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuoteOffer" DROP CONSTRAINT "QuoteOffer_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuoteOfferLine" DROP CONSTRAINT "QuoteOfferLine_prItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuoteOfferLine" DROP CONSTRAINT "QuoteOfferLine_quoteOfferId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shipment" DROP CONSTRAINT "Shipment_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShipmentEvent" DROP CONSTRAINT "ShipmentEvent_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShipmentLine" DROP CONSTRAINT "ShipmentLine_poLineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShipmentLine" DROP CONSTRAINT "ShipmentLine_shipmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplierProduct" DROP CONSTRAINT "SupplierProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplierProduct" DROP CONSTRAINT "SupplierProduct_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Thread" DROP CONSTRAINT "Thread_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ThreadParticipant" DROP CONSTRAINT "ThreadParticipant_threadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ThreadParticipant" DROP CONSTRAINT "ThreadParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_roleId_fkey";

-- DropTable
DROP TABLE "public"."Assignment";

-- DropTable
DROP TABLE "public"."Attachment";

-- DropTable
DROP TABLE "public"."AuditLog";

-- DropTable
DROP TABLE "public"."ChatMessage";

-- DropTable
DROP TABLE "public"."Client";

-- DropTable
DROP TABLE "public"."Currency";

-- DropTable
DROP TABLE "public"."Department";

-- DropTable
DROP TABLE "public"."ExchangeRate";

-- DropTable
DROP TABLE "public"."FileAttachment";

-- DropTable
DROP TABLE "public"."Location";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."POLine";

-- DropTable
DROP TABLE "public"."PRItem";

-- DropTable
DROP TABLE "public"."Permission";

-- DropTable
DROP TABLE "public"."Product";

-- DropTable
DROP TABLE "public"."ProductAttribute";

-- DropTable
DROP TABLE "public"."Project";

-- DropTable
DROP TABLE "public"."ProjectMember";

-- DropTable
DROP TABLE "public"."PurchaseOrder";

-- DropTable
DROP TABLE "public"."PurchaseRequest";

-- DropTable
DROP TABLE "public"."Quote";

-- DropTable
DROP TABLE "public"."QuoteLine";

-- DropTable
DROP TABLE "public"."QuoteOffer";

-- DropTable
DROP TABLE "public"."QuoteOfferLine";

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."RolePermission";

-- DropTable
DROP TABLE "public"."Shipment";

-- DropTable
DROP TABLE "public"."ShipmentEvent";

-- DropTable
DROP TABLE "public"."ShipmentLine";

-- DropTable
DROP TABLE "public"."Supplier";

-- DropTable
DROP TABLE "public"."SupplierProduct";

-- DropTable
DROP TABLE "public"."Thread";

-- DropTable
DROP TABLE "public"."ThreadParticipant";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."DeliveryType";

-- DropEnum
DROP TYPE "public"."FollowStatus";

-- DropEnum
DROP TYPE "public"."ItemType";

-- DropEnum
DROP TYPE "public"."ProcurementType";

-- DropEnum
DROP TYPE "public"."RequestCategory";

-- CreateTable
CREATE TABLE "public"."area" (
    "id" UUID NOT NULL,
    "nombre_area" TEXT NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipo" (
    "id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departamento" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proyecto" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proveedor" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "rtn" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rol" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permisos" (
    "id" UUID NOT NULL,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rol_permisos" (
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("rol_id","permiso_id")
);

-- CreateTable
CREATE TABLE "public"."usuario" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol_id" UUID NOT NULL,
    "departamento_id" UUID NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cotizacion" (
    "id" UUID NOT NULL,
    "tipo_compra" TEXT NOT NULL DEFAULT 'NACIONAL',
    "tipo_id" UUID NOT NULL,
    "solicitante_id" UUID NOT NULL,
    "lugar_entrega" TEXT NOT NULL DEFAULT 'ALMACEN',
    "comentarios" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ENVIADA',
    "nombre_cotizacion" TEXT NOT NULL,
    "proyecto_id" UUID,
    "fecha_estimada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cotizacion_detalle" (
    "id" UUID NOT NULL,
    "cotizacion_id" UUID NOT NULL,
    "sku" TEXT,
    "descripcion_producto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "tipo_unidad" TEXT NOT NULL,
    "notas" TEXT,
    "precios_id" UUID,

    CONSTRAINT "cotizacion_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."precios" (
    "id" UUID NOT NULL,
    "cotizacion_detalle_id" UUID NOT NULL,
    "precio" DECIMAL(15,4) NOT NULL,
    "precio_descuento" DECIMAL(15,4),
    "proveedor_id" UUID NOT NULL,
    "fecha_consulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprobante_descuento" TEXT,

    CONSTRAINT "precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compra" (
    "id" UUID NOT NULL,
    "cotizacion_id" UUID NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compra_detalle" (
    "id" UUID NOT NULL,
    "compra_id" UUID NOT NULL,
    "sku" TEXT,
    "descripcion_producto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "tipo_unidad" TEXT NOT NULL,
    "notas" TEXT,
    "precio" DECIMAL(15,4) NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PRE-COMPRA',
    "fecha_compra" TIMESTAMP(3),
    "fecha_fabricacion" TIMESTAMP(3),
    "fecha_fors" TIMESTAMP(3),
    "fecha_cif" TIMESTAMP(3),
    "fecha_recibido" TIMESTAMP(3),
    "fecha_ultima_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compra_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seguimiento" (
    "id" UUID NOT NULL,
    "compra_id" UUID,
    "compra_detalle_id" UUID,
    "user_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat" (
    "id" UUID NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participantes_chat" (
    "chat_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ultimo_leido" TIMESTAMP(3),

    CONSTRAINT "participantes_chat_pkey" PRIMARY KEY ("chat_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."mensaje" (
    "id" UUID NOT NULL,
    "chat_id" UUID NOT NULL,
    "emisor_id" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo_mensaje" TEXT NOT NULL DEFAULT 'TEXTO',
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."adjuntos" (
    "id" UUID NOT NULL,
    "mensaje_id" UUID NOT NULL,
    "direccion_archivo" TEXT NOT NULL,
    "tipo_archivo" TEXT NOT NULL,
    "tamanio" BIGINT NOT NULL,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjuntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificacion" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tipo_area_id_idx" ON "public"."tipo"("area_id");

-- CreateIndex
CREATE INDEX "proveedor_activo_idx" ON "public"."proveedor"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "public"."rol"("nombre");

-- CreateIndex
CREATE INDEX "permisos_modulo_idx" ON "public"."permisos"("modulo");

-- CreateIndex
CREATE INDEX "permisos_accion_idx" ON "public"."permisos"("accion");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_modulo_accion_key" ON "public"."permisos"("modulo", "accion");

-- CreateIndex
CREATE INDEX "rol_permisos_rol_id_idx" ON "public"."rol_permisos"("rol_id");

-- CreateIndex
CREATE INDEX "rol_permisos_permiso_id_idx" ON "public"."rol_permisos"("permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "public"."usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_email_idx" ON "public"."usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_rol_id_idx" ON "public"."usuario"("rol_id");

-- CreateIndex
CREATE INDEX "usuario_activo_idx" ON "public"."usuario"("activo");

-- CreateIndex
CREATE INDEX "cotizacion_solicitante_id_idx" ON "public"."cotizacion"("solicitante_id");

-- CreateIndex
CREATE INDEX "cotizacion_estado_idx" ON "public"."cotizacion"("estado");

-- CreateIndex
CREATE INDEX "cotizacion_proyecto_id_idx" ON "public"."cotizacion"("proyecto_id");

-- CreateIndex
CREATE INDEX "cotizacion_fecha_solicitud_idx" ON "public"."cotizacion"("fecha_solicitud");

-- CreateIndex
CREATE INDEX "cotizacion_detalle_cotizacion_id_idx" ON "public"."cotizacion_detalle"("cotizacion_id");

-- CreateIndex
CREATE INDEX "cotizacion_detalle_sku_idx" ON "public"."cotizacion_detalle"("sku");

-- CreateIndex
CREATE INDEX "precios_cotizacion_detalle_id_idx" ON "public"."precios"("cotizacion_detalle_id");

-- CreateIndex
CREATE INDEX "precios_proveedor_id_idx" ON "public"."precios"("proveedor_id");

-- CreateIndex
CREATE INDEX "compra_cotizacion_id_idx" ON "public"."compra"("cotizacion_id");

-- CreateIndex
CREATE INDEX "compra_estado_idx" ON "public"."compra"("estado");

-- CreateIndex
CREATE INDEX "compra_detalle_compra_id_idx" ON "public"."compra_detalle"("compra_id");

-- CreateIndex
CREATE INDEX "compra_detalle_proveedor_id_idx" ON "public"."compra_detalle"("proveedor_id");

-- CreateIndex
CREATE INDEX "compra_detalle_estado_idx" ON "public"."compra_detalle"("estado");

-- CreateIndex
CREATE INDEX "compra_detalle_sku_idx" ON "public"."compra_detalle"("sku");

-- CreateIndex
CREATE INDEX "seguimiento_compra_id_idx" ON "public"."seguimiento"("compra_id");

-- CreateIndex
CREATE INDEX "seguimiento_compra_detalle_id_idx" ON "public"."seguimiento"("compra_detalle_id");

-- CreateIndex
CREATE INDEX "seguimiento_user_id_idx" ON "public"."seguimiento"("user_id");

-- CreateIndex
CREATE INDEX "seguimiento_fecha_idx" ON "public"."seguimiento"("fecha");

-- CreateIndex
CREATE INDEX "participantes_chat_chat_id_idx" ON "public"."participantes_chat"("chat_id");

-- CreateIndex
CREATE INDEX "participantes_chat_user_id_idx" ON "public"."participantes_chat"("user_id");

-- CreateIndex
CREATE INDEX "mensaje_chat_id_idx" ON "public"."mensaje"("chat_id");

-- CreateIndex
CREATE INDEX "mensaje_emisor_id_idx" ON "public"."mensaje"("emisor_id");

-- CreateIndex
CREATE INDEX "mensaje_creado_idx" ON "public"."mensaje"("creado");

-- CreateIndex
CREATE INDEX "adjuntos_mensaje_id_idx" ON "public"."adjuntos"("mensaje_id");

-- CreateIndex
CREATE INDEX "notificacion_user_id_idx" ON "public"."notificacion"("user_id");

-- CreateIndex
CREATE INDEX "notificacion_completada_idx" ON "public"."notificacion"("completada");

-- CreateIndex
CREATE INDEX "notificacion_creada_idx" ON "public"."notificacion"("creada");

-- AddForeignKey
ALTER TABLE "public"."tipo" ADD CONSTRAINT "tipo_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rol_permisos" ADD CONSTRAINT "rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rol_permisos" ADD CONSTRAINT "rol_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "public"."permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario" ADD CONSTRAINT "usuario_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion" ADD CONSTRAINT "cotizacion_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "public"."tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion" ADD CONSTRAINT "cotizacion_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion" ADD CONSTRAINT "cotizacion_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion_detalle" ADD CONSTRAINT "cotizacion_detalle_precios_id_fkey" FOREIGN KEY ("precios_id") REFERENCES "public"."precios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."precios" ADD CONSTRAINT "precios_cotizacion_detalle_id_fkey" FOREIGN KEY ("cotizacion_detalle_id") REFERENCES "public"."cotizacion_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."precios" ADD CONSTRAINT "precios_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compra" ADD CONSTRAINT "compra_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compra_detalle" ADD CONSTRAINT "compra_detalle_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "public"."compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compra_detalle" ADD CONSTRAINT "compra_detalle_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seguimiento" ADD CONSTRAINT "seguimiento_compra_id_fkey" FOREIGN KEY ("compra_id") REFERENCES "public"."compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seguimiento" ADD CONSTRAINT "seguimiento_compra_detalle_id_fkey" FOREIGN KEY ("compra_detalle_id") REFERENCES "public"."compra_detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seguimiento" ADD CONSTRAINT "seguimiento_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participantes_chat" ADD CONSTRAINT "participantes_chat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participantes_chat" ADD CONSTRAINT "participantes_chat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensaje" ADD CONSTRAINT "mensaje_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensaje" ADD CONSTRAINT "mensaje_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjuntos" ADD CONSTRAINT "adjuntos_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "public"."mensaje"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificacion" ADD CONSTRAINT "notificacion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
