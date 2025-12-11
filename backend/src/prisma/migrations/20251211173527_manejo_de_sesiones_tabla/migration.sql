-- CreateTable
CREATE TABLE "public"."sesion" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "refresh_token" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,
    "dispositivo" TEXT,
    "navegador" TEXT,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "refresh_expira_en" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sesion_token_key" ON "public"."sesion"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sesion_jti_key" ON "public"."sesion"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "sesion_refresh_token_key" ON "public"."sesion"("refresh_token");

-- CreateIndex
CREATE INDEX "sesion_usuario_id_idx" ON "public"."sesion"("usuario_id");

-- CreateIndex
CREATE INDEX "sesion_jti_idx" ON "public"."sesion"("jti");

-- CreateIndex
CREATE INDEX "sesion_activa_idx" ON "public"."sesion"("activa");

-- CreateIndex
CREATE INDEX "sesion_expira_en_idx" ON "public"."sesion"("expira_en");

-- AddForeignKey
ALTER TABLE "public"."sesion" ADD CONSTRAINT "sesion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
