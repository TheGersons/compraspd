-- Reporte Control de Compras: status editable por usuario (override del derivado)
ALTER TABLE "estado_producto" ADD COLUMN "status_manual" VARCHAR(50);
