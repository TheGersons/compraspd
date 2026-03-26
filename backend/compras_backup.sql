--
-- PostgreSQL database dump
--

\restrict 98lA1j3OKBP8EgvZeeEPRpNtNLj1ijPZOvqsa6BfdV5jQQL1Kbu7eeMBV94PXgC

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 18.0

-- Started on 2026-03-26 10:04:54

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_rol_id_fkey;
ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_departamento_id_fkey;
ALTER TABLE ONLY public.tipo DROP CONSTRAINT tipo_area_id_fkey;
ALTER TABLE ONLY public.timeline_sku DROP CONSTRAINT "timeline_sku_paisOrigenId_fkey";
ALTER TABLE ONLY public.sesion DROP CONSTRAINT sesion_usuario_id_fkey;
ALTER TABLE ONLY public.seguimiento DROP CONSTRAINT seguimiento_user_id_fkey;
ALTER TABLE ONLY public.seguimiento DROP CONSTRAINT seguimiento_compra_id_fkey;
ALTER TABLE ONLY public.seguimiento DROP CONSTRAINT seguimiento_compra_detalle_id_fkey;
ALTER TABLE ONLY public.rol_permisos DROP CONSTRAINT rol_permisos_rol_id_fkey;
ALTER TABLE ONLY public.rol_permisos DROP CONSTRAINT rol_permisos_permiso_id_fkey;
ALTER TABLE ONLY public.proyecto DROP CONSTRAINT proyecto_area_id_fkey;
ALTER TABLE ONLY public.precios DROP CONSTRAINT precios_proveedor_id_fkey;
ALTER TABLE ONLY public.precios DROP CONSTRAINT precios_cotizacion_detalle_id_fkey;
ALTER TABLE ONLY public.participantes_chat DROP CONSTRAINT participantes_chat_user_id_fkey;
ALTER TABLE ONLY public.participantes_chat DROP CONSTRAINT participantes_chat_chat_id_fkey;
ALTER TABLE ONLY public.oferta_producto DROP CONSTRAINT oferta_producto_responsable_id_fkey;
ALTER TABLE ONLY public.oferta_producto DROP CONSTRAINT oferta_producto_oferta_id_fkey;
ALTER TABLE ONLY public.oferta_producto DROP CONSTRAINT oferta_producto_estado_producto_id_fkey;
ALTER TABLE ONLY public.oferta DROP CONSTRAINT oferta_cotizacion_id_fkey;
ALTER TABLE ONLY public.oferta DROP CONSTRAINT oferta_archivada_por_id_fkey;
ALTER TABLE ONLY public.notificacion DROP CONSTRAINT notificacion_user_id_fkey;
ALTER TABLE ONLY public.mensaje DROP CONSTRAINT mensaje_emisor_id_fkey;
ALTER TABLE ONLY public.mensaje DROP CONSTRAINT mensaje_chat_id_fkey;
ALTER TABLE ONLY public.licitacion_producto DROP CONSTRAINT licitacion_producto_responsable_id_fkey;
ALTER TABLE ONLY public.licitacion_producto DROP CONSTRAINT licitacion_producto_licitacion_id_fkey;
ALTER TABLE ONLY public.licitacion_producto DROP CONSTRAINT licitacion_producto_estado_producto_id_fkey;
ALTER TABLE ONLY public.licitacion DROP CONSTRAINT licitacion_cotizacion_id_fkey;
ALTER TABLE ONLY public.licitacion DROP CONSTRAINT licitacion_archivada_por_id_fkey;
ALTER TABLE ONLY public.justificacion_no_aplica DROP CONSTRAINT justificacion_no_aplica_estado_producto_id_fkey;
ALTER TABLE ONLY public.justificacion_no_aplica DROP CONSTRAINT justificacion_no_aplica_creado_por_fkey;
ALTER TABLE ONLY public.historial_fecha_limite DROP CONSTRAINT historial_fecha_limite_estado_producto_id_fkey;
ALTER TABLE ONLY public.historial_fecha_limite DROP CONSTRAINT historial_fecha_limite_creado_por_fkey;
ALTER TABLE ONLY public.historial_cotizacion DROP CONSTRAINT historial_cotizacion_usuario_id_fkey;
ALTER TABLE ONLY public.historial_cotizacion DROP CONSTRAINT historial_cotizacion_cotizacion_id_fkey;
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT estado_producto_responsable_seguimiento_id_fkey;
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT "estado_producto_proyectoId_fkey";
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT "estado_producto_paisOrigenId_fkey";
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT "estado_producto_cotizacionId_fkey";
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT "estado_producto_cotizacionDetalleId_fkey";
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT "estado_producto_compraId_fkey";
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT "estado_producto_compraDetalleId_fkey";
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT estado_producto_aprobado_compra_por_id_fkey;
ALTER TABLE ONLY public.documento_adjunto DROP CONSTRAINT documento_adjunto_subido_por_fkey;
ALTER TABLE ONLY public.documento_adjunto DROP CONSTRAINT documento_adjunto_estado_producto_id_fkey;
ALTER TABLE ONLY public.documento_adjunto DROP CONSTRAINT documento_adjunto_documento_requerido_id_fkey;
ALTER TABLE ONLY public.cotizacion DROP CONSTRAINT cotizacion_tipo_id_fkey;
ALTER TABLE ONLY public.cotizacion DROP CONSTRAINT cotizacion_supervisor_responsable_id_fkey;
ALTER TABLE ONLY public.cotizacion DROP CONSTRAINT cotizacion_solicitante_id_fkey;
ALTER TABLE ONLY public.cotizacion DROP CONSTRAINT cotizacion_proyecto_id_fkey;
ALTER TABLE ONLY public.cotizacion_detalle DROP CONSTRAINT cotizacion_detalle_precios_id_fkey;
ALTER TABLE ONLY public.cotizacion_detalle DROP CONSTRAINT cotizacion_detalle_cotizacion_id_fkey;
ALTER TABLE ONLY public.cotizacion DROP CONSTRAINT cotizacion_chat_id_fkey;
ALTER TABLE ONLY public.compra_detalle DROP CONSTRAINT compra_detalle_proveedor_id_fkey;
ALTER TABLE ONLY public.compra_detalle DROP CONSTRAINT compra_detalle_compra_id_fkey;
ALTER TABLE ONLY public.compra DROP CONSTRAINT compra_cotizacion_id_fkey;
ALTER TABLE ONLY public.adjuntos DROP CONSTRAINT adjuntos_mensaje_id_fkey;
DROP TRIGGER trigger_generate_sku ON public.cotizacion_detalle;
DROP INDEX public.usuario_rol_id_idx;
DROP INDEX public.usuario_email_key;
DROP INDEX public.usuario_email_idx;
DROP INDEX public.usuario_activo_idx;
DROP INDEX public.tipo_area_id_nombre_key;
DROP INDEX public.tipo_area_id_idx;
DROP INDEX public.timeline_sku_sku_key;
DROP INDEX public.timeline_sku_sku_idx;
DROP INDEX public."timeline_sku_paisOrigenId_idx";
DROP INDEX public.sesion_usuario_id_idx;
DROP INDEX public.sesion_token_key;
DROP INDEX public.sesion_refresh_token_key;
DROP INDEX public.sesion_jti_key;
DROP INDEX public.sesion_jti_idx;
DROP INDEX public.sesion_expira_en_idx;
DROP INDEX public.sesion_activa_idx;
DROP INDEX public.seguimiento_user_id_idx;
DROP INDEX public.seguimiento_fecha_idx;
DROP INDEX public.seguimiento_compra_id_idx;
DROP INDEX public.seguimiento_compra_detalle_id_idx;
DROP INDEX public.rol_permisos_rol_id_idx;
DROP INDEX public.rol_permisos_permiso_id_idx;
DROP INDEX public.rol_nombre_key;
DROP INDEX public.proyecto_nombre_key;
DROP INDEX public.proyecto_estado_idx;
DROP INDEX public.proyecto_criticidad_idx;
DROP INDEX public.proveedor_nombre_key;
DROP INDEX public.proveedor_activo_idx;
DROP INDEX public.proceso_personalizado_orden_idx;
DROP INDEX public.proceso_personalizado_codigo_key;
DROP INDEX public.proceso_personalizado_activo_idx;
DROP INDEX public.precios_proveedor_id_idx;
DROP INDEX public.precios_cotizacion_detalle_id_idx;
DROP INDEX public.permisos_modulo_idx;
DROP INDEX public.permisos_modulo_accion_key;
DROP INDEX public.permisos_accion_idx;
DROP INDEX public.participantes_chat_user_id_idx;
DROP INDEX public.participantes_chat_chat_id_idx;
DROP INDEX public.pais_nombre_key;
DROP INDEX public.pais_codigo_key;
DROP INDEX public.pais_activo_idx;
DROP INDEX public.oferta_producto_oferta_id_idx;
DROP INDEX public.oferta_estado_idx;
DROP INDEX public.notificacion_user_id_idx;
DROP INDEX public.notificacion_creada_idx;
DROP INDEX public.notificacion_completada_idx;
DROP INDEX public.mensaje_emisor_id_idx;
DROP INDEX public.mensaje_creado_idx;
DROP INDEX public.mensaje_chat_id_idx;
DROP INDEX public.licitacion_producto_licitacion_id_idx;
DROP INDEX public.licitacion_estado_idx;
DROP INDEX public.justificacion_no_aplica_estado_producto_id_idx;
DROP INDEX public.justificacion_no_aplica_estado_idx;
DROP INDEX public.idx_estado_producto_aprobado_compra;
DROP INDEX public.idx_area_tipo;
DROP INDEX public.historial_fecha_limite_estado_producto_id_idx;
DROP INDEX public.historial_fecha_limite_estado_idx;
DROP INDEX public.historial_fecha_limite_creado_por_idx;
DROP INDEX public.historial_fecha_limite_creado_idx;
DROP INDEX public.historial_cotizacion_usuario_id_idx;
DROP INDEX public.historial_cotizacion_creado_idx;
DROP INDEX public.historial_cotizacion_cotizacion_id_idx;
DROP INDEX public.estado_producto_sku_idx;
DROP INDEX public."estado_producto_proyectoId_idx";
DROP INDEX public."estado_producto_paisOrigenId_idx";
DROP INDEX public."estado_producto_nivelCriticidad_idx";
DROP INDEX public."estado_producto_medioTransporte_idx";
DROP INDEX public.estado_producto_criticidad_idx;
DROP INDEX public."estado_producto_cotizacionId_idx";
DROP INDEX public.documento_requerido_estado_idx;
DROP INDEX public.documento_requerido_activo_idx;
DROP INDEX public.documento_adjunto_subido_por_idx;
DROP INDEX public.documento_adjunto_estado_producto_id_idx;
DROP INDEX public.documento_adjunto_estado_idx;
DROP INDEX public.documento_adjunto_documento_requerido_id_idx;
DROP INDEX public.departamento_nombre_key;
DROP INDEX public.cotizacion_supervisor_responsable_id_idx;
DROP INDEX public.cotizacion_solicitante_id_idx;
DROP INDEX public.cotizacion_proyecto_id_idx;
DROP INDEX public.cotizacion_fecha_solicitud_idx;
DROP INDEX public.cotizacion_estado_idx;
DROP INDEX public.cotizacion_detalle_sku_idx;
DROP INDEX public.cotizacion_detalle_cotizacion_id_idx;
DROP INDEX public.cotizacion_chat_id_key;
DROP INDEX public.cotizacion_chat_id_idx;
DROP INDEX public.compra_estado_idx;
DROP INDEX public.compra_detalle_sku_idx;
DROP INDEX public.compra_detalle_proveedor_id_idx;
DROP INDEX public.compra_detalle_estado_idx;
DROP INDEX public.compra_detalle_compra_id_idx;
DROP INDEX public.compra_cotizacion_id_idx;
DROP INDEX public.area_tipo_idx;
DROP INDEX public.area_nombre_area_key;
DROP INDEX public.adjuntos_mensaje_id_idx;
ALTER TABLE ONLY public.usuario DROP CONSTRAINT usuario_pkey;
ALTER TABLE ONLY public.tipo DROP CONSTRAINT tipo_pkey;
ALTER TABLE ONLY public.timeline_sku DROP CONSTRAINT timeline_sku_pkey;
ALTER TABLE ONLY public.sesion DROP CONSTRAINT sesion_pkey;
ALTER TABLE ONLY public.seguimiento DROP CONSTRAINT seguimiento_pkey;
ALTER TABLE ONLY public.rol DROP CONSTRAINT rol_pkey;
ALTER TABLE ONLY public.rol_permisos DROP CONSTRAINT rol_permisos_pkey;
ALTER TABLE ONLY public.proyecto DROP CONSTRAINT proyecto_pkey;
ALTER TABLE ONLY public.proveedor DROP CONSTRAINT proveedor_pkey;
ALTER TABLE ONLY public.proceso_personalizado DROP CONSTRAINT proceso_personalizado_pkey;
ALTER TABLE ONLY public.precios DROP CONSTRAINT precios_pkey;
ALTER TABLE ONLY public.permisos DROP CONSTRAINT permisos_pkey;
ALTER TABLE ONLY public.participantes_chat DROP CONSTRAINT participantes_chat_pkey;
ALTER TABLE ONLY public.pais DROP CONSTRAINT pais_pkey;
ALTER TABLE ONLY public.oferta_producto DROP CONSTRAINT oferta_producto_pkey;
ALTER TABLE ONLY public.oferta DROP CONSTRAINT oferta_pkey;
ALTER TABLE ONLY public.oferta DROP CONSTRAINT oferta_cotizacion_id_key;
ALTER TABLE ONLY public.notificacion DROP CONSTRAINT notificacion_pkey;
ALTER TABLE ONLY public.mensaje DROP CONSTRAINT mensaje_pkey;
ALTER TABLE ONLY public.licitacion_producto DROP CONSTRAINT licitacion_producto_pkey;
ALTER TABLE ONLY public.licitacion DROP CONSTRAINT licitacion_pkey;
ALTER TABLE ONLY public.licitacion DROP CONSTRAINT licitacion_cotizacion_id_key;
ALTER TABLE ONLY public.justificacion_no_aplica DROP CONSTRAINT justificacion_no_aplica_pkey;
ALTER TABLE ONLY public.justificacion_no_aplica DROP CONSTRAINT justificacion_no_aplica_estado_producto_id_estado_key;
ALTER TABLE ONLY public.historial_fecha_limite DROP CONSTRAINT historial_fecha_limite_pkey;
ALTER TABLE ONLY public.historial_cotizacion DROP CONSTRAINT historial_cotizacion_pkey;
ALTER TABLE ONLY public.estado_producto DROP CONSTRAINT estado_producto_pkey;
ALTER TABLE ONLY public.documento_requerido DROP CONSTRAINT documento_requerido_pkey;
ALTER TABLE ONLY public.documento_requerido DROP CONSTRAINT documento_requerido_estado_nombre_key;
ALTER TABLE ONLY public.documento_adjunto DROP CONSTRAINT documento_adjunto_pkey;
ALTER TABLE ONLY public.departamento DROP CONSTRAINT departamento_pkey;
ALTER TABLE ONLY public.cotizacion DROP CONSTRAINT cotizacion_pkey;
ALTER TABLE ONLY public.cotizacion_detalle DROP CONSTRAINT cotizacion_detalle_pkey;
ALTER TABLE ONLY public.compra DROP CONSTRAINT compra_pkey;
ALTER TABLE ONLY public.compra_detalle DROP CONSTRAINT compra_detalle_pkey;
ALTER TABLE ONLY public.chat DROP CONSTRAINT chat_pkey;
ALTER TABLE ONLY public.area DROP CONSTRAINT area_pkey;
ALTER TABLE ONLY public.adjuntos DROP CONSTRAINT adjuntos_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
DROP TABLE public.usuario;
DROP TABLE public.tipo;
DROP TABLE public.timeline_sku;
DROP TABLE public.sesion;
DROP TABLE public.seguimiento;
DROP TABLE public.rol_permisos;
DROP TABLE public.rol;
DROP TABLE public.proyecto;
DROP TABLE public.proveedor;
DROP TABLE public.proceso_personalizado;
DROP TABLE public.precios;
DROP TABLE public.permisos;
DROP TABLE public.participantes_chat;
DROP TABLE public.pais;
DROP TABLE public.oferta_producto;
DROP TABLE public.oferta;
DROP TABLE public.notificacion;
DROP TABLE public.mensaje;
DROP TABLE public.licitacion_producto;
DROP TABLE public.licitacion;
DROP TABLE public.justificacion_no_aplica;
DROP TABLE public.historial_fecha_limite;
DROP TABLE public.historial_cotizacion;
DROP TABLE public.estado_producto;
DROP TABLE public.documento_requerido;
DROP TABLE public.documento_adjunto;
DROP TABLE public.departamento;
DROP TABLE public.cotizacion_detalle;
DROP TABLE public.cotizacion;
DROP TABLE public.compra_detalle;
DROP TABLE public.compra;
DROP TABLE public.chat;
DROP TABLE public.area;
DROP TABLE public.adjuntos;
DROP TABLE public._prisma_migrations;
DROP FUNCTION public.generate_sku();
DROP TYPE public.medio_transporte;
DROP TYPE public.estado_cotizacion;
--
-- TOC entry 953 (class 1247 OID 17566)
-- Name: estado_cotizacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cotizacion AS ENUM (
    'PENDIENTE',
    'EN_CONFIGURACION',
    'APROBADA_PARCIAL',
    'APROBADA_COMPLETA',
    'EN_PROCESO',
    'COMPLETADA',
    'CANCELADA'
);


ALTER TYPE public.estado_cotizacion OWNER TO postgres;

--
-- TOC entry 941 (class 1247 OID 17462)
-- Name: medio_transporte; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.medio_transporte AS ENUM (
    'MARITIMO',
    'TERRESTRE',
    'AEREO'
);


ALTER TYPE public.medio_transporte OWNER TO postgres;

--
-- TOC entry 250 (class 1255 OID 17671)
-- Name: generate_sku(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_sku() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_sku TEXT;
  counter INTEGER;
BEGIN
  -- Solo generar si SKU es NULL o vacío
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    -- Obtener el último número secuencial
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(sku FROM 'PROD-([0-9]+)') AS INTEGER)
    ), 0) + 1
    INTO counter
    FROM cotizacion_detalle
    WHERE sku LIKE 'PROD-%';
    
    -- Generar nuevo SKU con padding de 4 dígitos
    new_sku := 'PROD-' || LPAD(counter::TEXT, 4, '0');
    
    -- Asignar al nuevo registro
    NEW.sku := new_sku;
    
    -- Log opcional (comentar si no necesitas)
    RAISE NOTICE 'SKU generado automáticamente: %', new_sku;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_sku() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16385)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17222)
-- Name: adjuntos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adjuntos (
    id uuid NOT NULL,
    mensaje_id uuid NOT NULL,
    direccion_archivo text NOT NULL,
    tipo_archivo text NOT NULL,
    tamanio bigint NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nombre_archivo text,
    preview_url text
);


ALTER TABLE public.adjuntos OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 17070)
-- Name: area; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.area (
    id uuid NOT NULL,
    nombre_area text NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo text NOT NULL,
    icono text
);


ALTER TABLE public.area OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17201)
-- Name: chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat (
    id uuid NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.chat OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17174)
-- Name: compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra (
    id uuid NOT NULL,
    cotizacion_id uuid NOT NULL,
    estado text DEFAULT 'PENDIENTE'::text NOT NULL,
    creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.compra OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17184)
-- Name: compra_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_detalle (
    id uuid NOT NULL,
    compra_id uuid NOT NULL,
    sku text,
    descripcion_producto text NOT NULL,
    cantidad integer NOT NULL,
    tipo_unidad text NOT NULL,
    notas text,
    precio numeric(15,4) NOT NULL,
    proveedor_id uuid NOT NULL,
    estado text DEFAULT 'PRE-COMPRA'::text NOT NULL,
    fecha_compra timestamp(3) without time zone,
    fecha_fabricacion timestamp(3) without time zone,
    fecha_fors timestamp(3) without time zone,
    fecha_cif timestamp(3) without time zone,
    fecha_recibido timestamp(3) without time zone,
    fecha_ultima_actualizacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.compra_detalle OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17148)
-- Name: cotizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cotizacion (
    id uuid NOT NULL,
    tipo_compra text DEFAULT 'NACIONAL'::text NOT NULL,
    tipo_id uuid NOT NULL,
    solicitante_id uuid NOT NULL,
    lugar_entrega text DEFAULT 'ALMACEN'::text NOT NULL,
    comentarios text,
    fecha_solicitud timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_limite timestamp(3) without time zone NOT NULL,
    estado text DEFAULT 'PENDIENTE'::text NOT NULL,
    nombre_cotizacion text NOT NULL,
    proyecto_id uuid,
    fecha_estimada timestamp(3) without time zone NOT NULL,
    aprobada_parcialmente boolean DEFAULT false NOT NULL,
    chat_id uuid,
    fecha_aprobacion timestamp(3) without time zone,
    supervisor_responsable_id uuid,
    todos_productos_aprobados boolean DEFAULT false NOT NULL
);


ALTER TABLE public.cotizacion OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17159)
-- Name: cotizacion_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cotizacion_detalle (
    id uuid NOT NULL,
    cotizacion_id uuid NOT NULL,
    sku text,
    descripcion_producto text NOT NULL,
    cantidad integer NOT NULL,
    tipo_unidad text NOT NULL,
    notas text,
    precios_id uuid
);


ALTER TABLE public.cotizacion_detalle OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 17086)
-- Name: departamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamento (
    id uuid NOT NULL,
    nombre text NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.departamento OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 33019)
-- Name: documento_adjunto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documento_adjunto (
    id uuid NOT NULL,
    estado_producto_id uuid NOT NULL,
    documento_requerido_id uuid,
    estado character varying(50) NOT NULL,
    nombre_documento character varying(255) NOT NULL,
    nombre_archivo character varying(255) NOT NULL,
    url_archivo text NOT NULL,
    tipo_archivo character varying(50),
    tamano_bytes bigint,
    subido_por uuid NOT NULL,
    creado timestamp(3) without time zone DEFAULT now() NOT NULL,
    no_aplica boolean DEFAULT false NOT NULL
);


ALTER TABLE public.documento_adjunto OWNER TO postgres;

--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE documento_adjunto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.documento_adjunto IS 'Archivos adjuntos subidos para cada estado de cada producto';


--
-- TOC entry 243 (class 1259 OID 33002)
-- Name: documento_requerido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documento_requerido (
    id uuid NOT NULL,
    estado character varying(50) NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    obligatorio boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT now() NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documento_requerido OWNER TO postgres;

--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE documento_requerido; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.documento_requerido IS 'Configuración global: qué documentos se requieren en cada estado del proceso de compra';


--
-- TOC entry 236 (class 1259 OID 17401)
-- Name: estado_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_producto (
    id uuid NOT NULL,
    sku character varying(255) NOT NULL,
    descripcion text NOT NULL,
    cotizado boolean DEFAULT false NOT NULL,
    "conDescuento" boolean DEFAULT false NOT NULL,
    comprado boolean DEFAULT false NOT NULL,
    pagado boolean DEFAULT false NOT NULL,
    recibido boolean DEFAULT false NOT NULL,
    proveedor character varying(255),
    responsable character varying(255),
    cantidad integer,
    observaciones text,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "compraDetalleId" uuid,
    "compraId" uuid,
    "conBL" boolean DEFAULT false NOT NULL,
    "cotizacionDetalleId" uuid,
    "cotizacionId" uuid,
    criticidad integer DEFAULT 5 NOT NULL,
    "diasRetrasoActual" integer DEFAULT 0 NOT NULL,
    "enCIF" boolean DEFAULT false NOT NULL,
    "enFOB" boolean DEFAULT false NOT NULL,
    "estadoGeneral" character varying(20) DEFAULT 'warn'::character varying NOT NULL,
    "fechaComprado" timestamp(3) without time zone,
    "fechaConBL" timestamp(3) without time zone,
    "fechaConDescuento" timestamp(3) without time zone,
    "fechaCotizado" timestamp(3) without time zone,
    "fechaEnCIF" timestamp(3) without time zone,
    "fechaEnFOB" timestamp(3) without time zone,
    "fechaLimiteComprado" timestamp(3) without time zone,
    "fechaLimiteConBL" timestamp(3) without time zone,
    "fechaLimiteConDescuento" timestamp(3) without time zone,
    "fechaLimiteCotizado" timestamp(3) without time zone,
    "fechaLimiteEnCIF" timestamp(3) without time zone,
    "fechaLimiteEnFOB" timestamp(3) without time zone,
    "fechaLimitePagado" timestamp(3) without time zone,
    "fechaLimitePrimerSeguimiento" timestamp(3) without time zone,
    "fechaLimiteRecibido" timestamp(3) without time zone,
    "fechaLimiteSegundoSeguimiento" timestamp(3) without time zone,
    "fechaPagado" timestamp(3) without time zone,
    "fechaPrimerSeguimiento" timestamp(3) without time zone,
    "fechaRecibido" timestamp(3) without time zone,
    "fechaSegundoSeguimiento" timestamp(3) without time zone,
    "medioTransporte" public.medio_transporte,
    "nivelCriticidad" text DEFAULT 'MEDIO'::text NOT NULL,
    "paisOrigenId" uuid,
    "precioTotal" numeric(15,4),
    "precioUnitario" numeric(15,4),
    "primerSeguimiento" boolean DEFAULT false NOT NULL,
    "proyectoId" uuid,
    "segundoSeguimiento" boolean DEFAULT false NOT NULL,
    aprobado_por_supervisor boolean DEFAULT false NOT NULL,
    fecha_aprobacion timestamp(3) without time zone,
    fecha_rechazo timestamp(3) without time zone,
    motivo_rechazo text,
    rechazado boolean DEFAULT false NOT NULL,
    "evidenciaCotizado" text,
    "evidenciaConDescuento" text,
    "evidenciaComprado" text,
    "evidenciaPagado" text,
    "evidenciaPrimerSeguimiento" text,
    "evidenciaEnFOB" text,
    "evidenciaConBL" text,
    "evidenciaSegundoSeguimiento" text,
    "evidenciaEnCIF" text,
    "evidenciaRecibido" text,
    tipo_entrega character varying(20),
    "cotizacionFleteInternacional" boolean DEFAULT false NOT NULL,
    "evidenciaCotizacionFleteInternacional" text,
    "fechaCotizacionFleteInternacional" timestamp(3) without time zone,
    "fechaLimiteCotizacionFleteInternacional" timestamp(3) without time zone,
    "aprobacionCompra" boolean DEFAULT false NOT NULL,
    "fechaAprobacionCompra" timestamp(3) without time zone,
    "fechaLimiteAprobacionCompra" timestamp(3) without time zone,
    "evidenciaAprobacionCompra" text,
    "aprobacionPlanos" boolean DEFAULT false NOT NULL,
    "fechaAprobacionPlanos" timestamp(3) without time zone,
    "fechaLimiteAprobacionPlanos" timestamp(3) without time zone,
    "evidenciaAprobacionPlanos" text,
    "fechaRealAprobacionCompra" timestamp(3) without time zone,
    "fechaRealComprado" timestamp(3) without time zone,
    "fechaRealPagado" timestamp(3) without time zone,
    "fechaRealAprobacionPlanos" timestamp(3) without time zone,
    "fechaRealPrimerSeguimiento" timestamp(3) without time zone,
    "fechaRealEnFOB" timestamp(3) without time zone,
    "fechaRealCotizacionFleteInternacional" timestamp(3) without time zone,
    "fechaRealConBL" timestamp(3) without time zone,
    "fechaRealSegundoSeguimiento" timestamp(3) without time zone,
    "fechaRealEnCIF" timestamp(3) without time zone,
    "fechaRealRecibido" timestamp(3) without time zone,
    "noAplicaDocumentosAprobacionCompra" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosComprado" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosPagado" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosAprobacionPlanos" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosPrimerSeguimiento" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosEnFOB" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosCotizacionFleteInternacional" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosConBL" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosSegundoSeguimiento" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosEnCIF" boolean DEFAULT false NOT NULL,
    "noAplicaDocumentosRecibido" boolean DEFAULT false NOT NULL,
    aprobado_compra boolean DEFAULT false NOT NULL,
    aprobado_compra_por_id uuid,
    fecha_aprobado_compra timestamp(3) without time zone,
    responsable_seguimiento_id uuid
);


ALTER TABLE public.estado_producto OWNER TO postgres;

--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaCotizado"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaCotizado" IS 'URL o referencia del archivo de evidencia para estado Cotizado';


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaConDescuento"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaConDescuento" IS 'URL o referencia del archivo de evidencia para estado Con Descuento';


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaComprado"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaComprado" IS 'URL o referencia del archivo de evidencia para estado Comprado';


--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaPagado"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaPagado" IS 'URL o referencia del archivo de evidencia para estado Pagado';


--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaPrimerSeguimiento"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaPrimerSeguimiento" IS 'URL o referencia del archivo de evidencia para 1er Seguimiento';


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaEnFOB"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaEnFOB" IS 'URL o referencia del archivo de evidencia para estado En FOB';


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaConBL"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaConBL" IS 'URL o referencia del archivo de evidencia para estado Con BL';


--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaSegundoSeguimiento"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaSegundoSeguimiento" IS 'URL o referencia del archivo de evidencia para 2do Seguimiento';


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaEnCIF"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaEnCIF" IS 'URL o referencia del archivo de evidencia para estado En CIF';


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaRecibido"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaRecibido" IS 'URL o referencia del archivo de evidencia para estado Recibido';


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto.tipo_entrega; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto.tipo_entrega IS 'Tipo de entrega: FOB o CIF';


--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."aprobacionCompra"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."aprobacionCompra" IS 'Estado: Aprobación de Compra - entre Con Descuento y Comprado';


--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaAprobacionCompra"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaAprobacionCompra" IS 'Fecha en que se completó la aprobación de compra';


--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaLimiteAprobacionCompra"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaLimiteAprobacionCompra" IS 'Fecha límite para completar la aprobación de compra';


--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaAprobacionCompra"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaAprobacionCompra" IS 'Evidencia/comprobante de la aprobación de compra';


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."aprobacionPlanos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."aprobacionPlanos" IS 'Estado: Aprobación de Planos - entre Pagado y 1er Seguimiento';


--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaAprobacionPlanos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaAprobacionPlanos" IS 'Fecha en que se completó la aprobación de planos';


--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaLimiteAprobacionPlanos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaLimiteAprobacionPlanos" IS 'Fecha límite para completar la aprobación de planos';


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."evidenciaAprobacionPlanos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."evidenciaAprobacionPlanos" IS 'Evidencia/comprobante de la aprobación de planos';


--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealAprobacionCompra"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealAprobacionCompra" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealComprado"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealComprado" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealPagado"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealPagado" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealAprobacionPlanos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealAprobacionPlanos" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealPrimerSeguimiento"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealPrimerSeguimiento" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealEnFOB"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealEnFOB" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealCotizacionFleteInternacional"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealCotizacionFleteInternacional" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealConBL"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealConBL" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealSegundoSeguimiento"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealSegundoSeguimiento" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealEnCIF"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealEnCIF" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN estado_producto."fechaRealRecibido"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.estado_producto."fechaRealRecibido" IS 'Fecha real esperada - editable por supervisor';


--
-- TOC entry 240 (class 1259 OID 17585)
-- Name: historial_cotizacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_cotizacion (
    id uuid NOT NULL,
    cotizacion_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    accion text NOT NULL,
    detalles jsonb NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.historial_cotizacion OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 32941)
-- Name: historial_fecha_limite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_fecha_limite (
    id uuid NOT NULL,
    estado_producto_id uuid NOT NULL,
    estado character varying(50) NOT NULL,
    creado_por uuid NOT NULL,
    creado timestamp(3) without time zone DEFAULT now() NOT NULL,
    "fechaAnterior" timestamp(3) without time zone,
    "fechaNueva" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.historial_fecha_limite OWNER TO postgres;

--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE historial_fecha_limite; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.historial_fecha_limite IS 'Historial de cambios en fechas reales de cada estado de producto';


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN historial_fecha_limite.estado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.historial_fecha_limite.estado IS 'Estado al que corresponde el cambio (ej: comprado, pagado, etc.)';


--
-- TOC entry 245 (class 1259 OID 33099)
-- Name: justificacion_no_aplica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.justificacion_no_aplica (
    id uuid NOT NULL,
    estado_producto_id uuid NOT NULL,
    estado character varying(50) NOT NULL,
    justificacion text NOT NULL,
    creado_por uuid NOT NULL,
    creado timestamp(3) without time zone DEFAULT now() NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.justificacion_no_aplica OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 33645)
-- Name: licitacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licitacion (
    id uuid NOT NULL,
    cotizacion_id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    estado character varying(50) DEFAULT 'ACTIVA'::character varying NOT NULL,
    motivo_archivo text,
    fecha_archivo timestamp(3) without time zone,
    archivada_por_id uuid,
    creado timestamp(3) without time zone DEFAULT now() NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.licitacion OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 33669)
-- Name: licitacion_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licitacion_producto (
    id uuid NOT NULL,
    licitacion_id uuid NOT NULL,
    estado_producto_id uuid,
    cotizacion_id uuid,
    sku character varying(255) NOT NULL,
    descripcion text NOT NULL,
    cotizado boolean DEFAULT false NOT NULL,
    con_descuento boolean DEFAULT false NOT NULL,
    aprobacion_compra boolean DEFAULT false NOT NULL,
    comprado boolean DEFAULT false NOT NULL,
    pagado boolean DEFAULT false NOT NULL,
    aprobacion_planos boolean DEFAULT false NOT NULL,
    primer_seguimiento boolean DEFAULT false NOT NULL,
    en_fob boolean DEFAULT false NOT NULL,
    cotizacion_flete_internacional boolean DEFAULT false NOT NULL,
    con_bl boolean DEFAULT false NOT NULL,
    segundo_seguimiento boolean DEFAULT false NOT NULL,
    en_cif boolean DEFAULT false NOT NULL,
    recibido boolean DEFAULT false NOT NULL,
    fecha_cotizado timestamp(3) without time zone,
    fecha_con_descuento timestamp(3) without time zone,
    fecha_aprobacion_compra timestamp(3) without time zone,
    fecha_comprado timestamp(3) without time zone,
    fecha_pagado timestamp(3) without time zone,
    fecha_aprobacion_planos timestamp(3) without time zone,
    fecha_primer_seguimiento timestamp(3) without time zone,
    fecha_en_fob timestamp(3) without time zone,
    fecha_cotizacion_flete_internacional timestamp(3) without time zone,
    fecha_con_bl timestamp(3) without time zone,
    fecha_segundo_seguimiento timestamp(3) without time zone,
    fecha_en_cif timestamp(3) without time zone,
    fecha_recibido timestamp(3) without time zone,
    proveedor character varying(255),
    precio_unitario numeric(15,4),
    precio_total numeric(15,4),
    cantidad integer,
    observaciones text,
    tipo_compra character varying(20) DEFAULT 'NACIONAL'::character varying,
    responsable_id uuid,
    creado timestamp(3) without time zone DEFAULT now() NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.licitacion_producto OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17213)
-- Name: mensaje; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensaje (
    id uuid NOT NULL,
    chat_id uuid NOT NULL,
    emisor_id uuid NOT NULL,
    contenido text NOT NULL,
    tipo_mensaje text DEFAULT 'TEXTO'::text NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mensaje OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17230)
-- Name: notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacion (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    tipo text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    creada timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completada boolean DEFAULT false NOT NULL
);


ALTER TABLE public.notificacion OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 33871)
-- Name: oferta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oferta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cotizacion_id uuid NOT NULL,
    nombre character varying(255) NOT NULL,
    estado character varying(50) DEFAULT 'ACTIVA'::character varying NOT NULL,
    motivo_archivo text,
    fecha_archivo timestamp(3) without time zone,
    archivada_por_id uuid,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.oferta OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 33895)
-- Name: oferta_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oferta_producto (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    oferta_id uuid NOT NULL,
    estado_producto_id uuid,
    cotizacion_id uuid,
    sku character varying(255) NOT NULL,
    descripcion text NOT NULL,
    cotizado boolean DEFAULT false NOT NULL,
    con_descuento boolean DEFAULT false NOT NULL,
    aprobacion_compra boolean DEFAULT false NOT NULL,
    comprado boolean DEFAULT false NOT NULL,
    pagado boolean DEFAULT false NOT NULL,
    aprobacion_planos boolean DEFAULT false NOT NULL,
    primer_seguimiento boolean DEFAULT false NOT NULL,
    en_fob boolean DEFAULT false NOT NULL,
    cotizacion_flete_internacional boolean DEFAULT false NOT NULL,
    con_bl boolean DEFAULT false NOT NULL,
    segundo_seguimiento boolean DEFAULT false NOT NULL,
    en_cif boolean DEFAULT false NOT NULL,
    recibido boolean DEFAULT false NOT NULL,
    fecha_cotizado timestamp(3) without time zone,
    fecha_con_descuento timestamp(3) without time zone,
    fecha_aprobacion_compra timestamp(3) without time zone,
    fecha_comprado timestamp(3) without time zone,
    fecha_pagado timestamp(3) without time zone,
    fecha_aprobacion_planos timestamp(3) without time zone,
    fecha_primer_seguimiento timestamp(3) without time zone,
    fecha_en_fob timestamp(3) without time zone,
    fecha_cotizacion_flete_internacional timestamp(3) without time zone,
    fecha_con_bl timestamp(3) without time zone,
    fecha_segundo_seguimiento timestamp(3) without time zone,
    fecha_en_cif timestamp(3) without time zone,
    fecha_recibido timestamp(3) without time zone,
    proveedor character varying(255),
    precio_unitario numeric(15,4),
    precio_total numeric(15,4),
    cantidad integer,
    observaciones text,
    tipo_compra character varying(20) DEFAULT 'NACIONAL'::character varying,
    responsable_id uuid,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.oferta_producto OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17486)
-- Name: pais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pais (
    id uuid NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(3) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pais OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17208)
-- Name: participantes_chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participantes_chat (
    chat_id uuid NOT NULL,
    user_id uuid NOT NULL,
    ultimo_leido timestamp(3) without time zone
);


ALTER TABLE public.participantes_chat OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17123)
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id uuid NOT NULL,
    modulo text NOT NULL,
    accion text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17166)
-- Name: precios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.precios (
    id uuid NOT NULL,
    cotizacion_detalle_id uuid NOT NULL,
    precio numeric(15,4) NOT NULL,
    precio_descuento numeric(15,4),
    proveedor_id uuid NOT NULL,
    fecha_consulta timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comprobante_descuento text
);


ALTER TABLE public.precios OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17504)
-- Name: proceso_personalizado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proceso_personalizado (
    id uuid NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(50) NOT NULL,
    orden integer NOT NULL,
    "esObligatorio" boolean DEFAULT false NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.proceso_personalizado OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17104)
-- Name: proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedor (
    id uuid NOT NULL,
    nombre text NOT NULL,
    rtn text,
    email text,
    telefono text,
    direccion text,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.proveedor OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17094)
-- Name: proyecto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyecto (
    id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    estado boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    criticidad integer DEFAULT 5 NOT NULL,
    area_id uuid
);


ALTER TABLE public.proyecto OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17113)
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    id uuid NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17132)
-- Name: rol_permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_permisos (
    rol_id uuid NOT NULL,
    permiso_id uuid NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rol_permisos OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17193)
-- Name: seguimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seguimiento (
    id uuid NOT NULL,
    compra_id uuid,
    compra_detalle_id uuid,
    user_id uuid NOT NULL,
    tipo text NOT NULL,
    detalle text NOT NULL,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.seguimiento OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17619)
-- Name: sesion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesion (
    id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    token text NOT NULL,
    jti text NOT NULL,
    refresh_token text,
    user_agent text,
    ip text,
    dispositivo text,
    navegador text,
    expira_en timestamp(3) without time zone NOT NULL,
    refresh_expira_en timestamp(3) without time zone NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    ultimo_acceso timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sesion OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17494)
-- Name: timeline_sku; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timeline_sku (
    id uuid NOT NULL,
    sku character varying(255) NOT NULL,
    "paisOrigenId" uuid,
    "medioTransporte" public.medio_transporte DEFAULT 'MARITIMO'::public.medio_transporte NOT NULL,
    "diasCotizadoADescuento" integer,
    "diasDescuentoAComprado" integer,
    "diasCompradoAPagado" integer,
    "diasPagadoASeguimiento1" integer,
    "diasSeguimiento1AFob" integer,
    "diasFobABl" integer,
    "diasBlASeguimiento2" integer,
    "diasSeguimiento2ACif" integer,
    "diasCifARecibido" integer,
    "diasTotalesEstimados" integer NOT NULL,
    notas text,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "diasCotizacionFleteABl" integer,
    "diasFobACotizacionFlete" integer,
    "diasDescuentoAAprobacionCompra" integer,
    "diasAprobacionCompraAComprado" integer,
    "diasPagadoAAprobacionPlanos" integer,
    "diasAprobacionPlanosASeguimiento1" integer
);


ALTER TABLE public.timeline_sku OWNER TO postgres;

--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN timeline_sku."diasDescuentoAAprobacionCompra"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timeline_sku."diasDescuentoAAprobacionCompra" IS 'Días desde Con Descuento hasta Aprobación de Compra';


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN timeline_sku."diasAprobacionCompraAComprado"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timeline_sku."diasAprobacionCompraAComprado" IS 'Días desde Aprobación de Compra hasta Comprado';


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN timeline_sku."diasPagadoAAprobacionPlanos"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timeline_sku."diasPagadoAAprobacionPlanos" IS 'Días desde Pagado hasta Aprobación de Planos';


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN timeline_sku."diasAprobacionPlanosASeguimiento1"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.timeline_sku."diasAprobacionPlanosASeguimiento1" IS 'Días desde Aprobación de Planos hasta 1er Seguimiento';


--
-- TOC entry 217 (class 1259 OID 17078)
-- Name: tipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo (
    id uuid NOT NULL,
    area_id uuid NOT NULL,
    nombre text NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tipo OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17138)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id uuid NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    rol_id uuid NOT NULL,
    departamento_id uuid NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    requierecambiopassword boolean DEFAULT false NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 3920 (class 0 OID 16385)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c95c3b63-f51d-4133-9cee-0f450837d58d	f601fd2e6b434181ef4cb9cd14fe5b8549c99b3ea7945bf11ba1f840a77533f3	2026-02-04 11:47:59.753578-06	20250925172708_init	\N	\N	2026-02-04 11:47:59.738644-06	1
05068da0-d36c-4015-97fa-7641bf516beb	58d5adeb075332bb1ff74d988b9ade4c6aceb0999cf9f271a11f8c08420ab829	2026-02-04 11:48:00.431336-06	20251126151745_criticidad_y_productos	\N	\N	2026-02-04 11:48:00.426254-06	1
65d3cd44-3df5-423d-a8e2-9daaebb97d85	2a0071720f87772fa6e64621e90cbc743875f38ec696ed346a0829a1e28900d8	2026-02-04 11:47:59.977093-06	20250925212208_init_domain	\N	\N	2026-02-04 11:47:59.755752-06	1
468aec7d-a96c-4f70-8643-a6110117d6ed	c65609c00027150d4186672cfce039fb187190e8d4854865799a9d8827d3c11f	2026-02-04 11:48:00.040351-06	20250929175801_cambios_para_el_manejo_de_las_cotizaciones	\N	\N	2026-02-04 11:47:59.978777-06	1
73d6432a-1296-44d0-b751-4a18e6cd329a	e0b4a67ecec5352e403d518d60eb5e39ed24832ef7d0a25791f5b8d1f8279ba2	2026-02-04 11:48:00.046781-06	20251010145011_add_request_category	\N	\N	2026-02-04 11:48:00.041685-06	1
4f410754-929c-44e5-9bd1-2a1c131ac17a	50ac4db2afad00ed25d23e7aec525354043f107d227103cd00f2f1d7623bdf69	2026-02-04 11:48:00.521252-06	20251126201039_manejo_de_dias_en_productos	\N	\N	2026-02-04 11:48:00.432788-06	1
aa331358-792f-4a6b-8222-fe5331393fe0	ff74f7352a7819bb171b191379491450f0ef229f0de7017cd08f8032f6d8549f	2026-02-04 11:48:00.053855-06	20251013170354_add_unique_location_name	\N	\N	2026-02-04 11:48:00.048216-06	1
f7b3e8cd-7538-4160-b434-6615c05c515b	1bd6901c930bae0991903dc5afa140109d772176800f0a8741d2af478fab33de	2026-02-04 11:48:00.072698-06	20251014213017_add	\N	\N	2026-02-04 11:48:00.055332-06	1
d9e25d26-fd8c-46ea-a3e5-bd6e5a9d10c8	34e3d9d7b4978f04fe6473f9099681b4ffbbd4bbbec5e935105b114193c5518c	2026-02-04 11:48:00.092341-06	20251014232008_add	\N	\N	2026-02-04 11:48:00.074137-06	1
8efe22a2-4694-41fc-ac32-238609bb4d1e	8c0ef480a7cf3af7c8bc3d9b0c75e503c6f1ffc53fb33217a52280ffb0202ae1	2026-02-04 11:48:00.55107-06	20251126205025_sistema_se_seguimientos	\N	\N	2026-02-04 11:48:00.522629-06	1
19fc1bfb-1ecc-4a1f-b5f9-64ac28e82806	d27932fc119115d676b74cdfd4e53fc43ce9e05cef069a76816c4d356d55113d	2026-02-04 11:48:00.111185-06	20251017220701_typenums_follow_status	\N	\N	2026-02-04 11:48:00.093526-06	1
4edb64d0-36b3-4d2f-8cfb-bf793c69d4e1	06c2ac298700ec7f85c5ad426ee18d6ced14e9b9f32f247d666bdd89219f06f4	2026-02-04 11:48:00.117164-06	20251020142756_requester_in_assingment	\N	\N	2026-02-04 11:48:00.112305-06	1
f9bfede5-5198-4a28-890b-013bc32f87de	94cfa07dbcea3b36d46ce5f4073dc8b44c0c182ef651c9f885df1e32c1620401	2026-02-04 11:48:00.12252-06	20251020151417_purchase_request_reference_optional	\N	\N	2026-02-04 11:48:00.118352-06	1
df1d7962-9dfb-46dc-8db1-d77c6c0de309	132ead4dd465e093c2601b6c96590028e8da3dd7aa78ad0815944b5264575eba	2026-02-04 11:48:00.578876-06	20251211173527_manejo_de_sesiones_tabla	\N	\N	2026-02-04 11:48:00.552453-06	1
547e6c18-c8bc-4d93-923f-61deed8f002a	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2026-02-04 11:48:00.126809-06	20251021171454_trigger_fecha	\N	\N	2026-02-04 11:48:00.123731-06	1
8677673b-6057-4afa-9147-bf611703d80e	b5bff4595d475cf98e831494fcb89de9dff92ffd2700db47d115a16da6b460d1	2026-02-04 11:48:00.37357-06	20251118220202_schema_refractor	\N	\N	2026-02-04 11:48:00.128862-06	1
33f299b6-d71f-434b-957d-f25d3ed44132	ff12a9891eba8f0a12fed7ca9f8d076971cfc11a561121fa26c22cdc34bf6e9d	2026-02-04 11:48:00.424833-06	20251126151552_agregar_criticidad_y_estados_productos	\N	\N	2026-02-04 11:48:00.375052-06	1
\.


--
-- TOC entry 3939 (class 0 OID 17222)
-- Dependencies: 234
-- Data for Name: adjuntos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adjuntos (id, mensaje_id, direccion_archivo, tipo_archivo, tamanio, creado, nombre_archivo, preview_url) FROM stdin;
c79fee50-0476-4892-b230-2605f158fa51	58a37bcf-c694-4dae-9c22-570a6afc3635	https://nx88862.your-storageshare.de/s/3sriMJA7MnBxseW	application/pdf	28135	2026-03-12 19:43:44.366	LicitaciÃ³n - TE03373.pdf	\N
a8307141-68a1-4501-ba84-3e83eabe4c2f	652b419e-629a-407b-af89-b85daa2de5f4	https://nx88862.your-storageshare.de/s/z2XPNjdoWZ2DTTD	application/pdf	28135	2026-03-12 19:43:44.373	LicitaciÃ³n - TE03373 (1).pdf	\N
f2cb76ba-5ce3-4911-b044-fd31a9bf573c	9bd547e6-908d-4846-8c33-8dcc9b459831	https://nx88862.your-storageshare.de/s/JqbB68iFM8gaQpb	application/pdf	30134	2026-03-12 19:53:26.92	LicitaciÃ³n - TE03372.pdf	\N
265606f9-93ef-40d6-88a6-29d2da27b5b5	e4faf8ba-1deb-4b26-aa19-edfd6aefb5b0	https://nx88862.your-storageshare.de/s/M8CZW7ePmad6HNC	application/pdf	918792	2026-03-13 21:02:43.536	Placa Generador ELC-U8 (1).pdf	\N
8db37e8b-8624-4cae-b620-45ca8fa0a135	2ea05aeb-5eaa-4c03-b8b2-3c70e7382051	https://nx88862.your-storageshare.de/s/NgoHs7aqWA3Qdwg	application/pdf	179170	2026-03-13 21:16:31.418	PLACA TRAFO.pdf	\N
2c17655f-57a8-42e8-bbec-4dbbde229c15	580ebaf1-4fa7-41e4-82ab-0abd7a7a5862	https://nx88862.your-storageshare.de/s/25eF38mE8XL8989	application/pdf	76963	2026-03-16 20:02:51.439	reseÃ±a.pdf	\N
0bd0d2f6-aff3-4e2f-8bd4-f14152affcd2	6f263114-f4fd-4b94-9761-ace378e7f95e	https://nx88862.your-storageshare.de/s/wKEfG5swzQmsd5q	application/pdf	438759	2026-03-16 21:31:52.273	COT 12606 EPD.pdf	\N
9decd060-083f-41e1-b4ab-0a27978aff73	48cdfafc-b3c3-436a-b5af-a25c4175769d	https://nx88862.your-storageshare.de/s/MEgFqg9pd3qz5EN	image/png	102202	2026-03-16 21:43:23.54	Captura de pantalla 2026-03-16.png	https://nx88862.your-storageshare.de/apps/files_sharing/publicpreview/mQW68BkCJ4WAFCe?file=/&fileId=224974
e9f1c420-3062-4752-b97e-5c25af2b5825	2fcd460b-ce13-4087-aa7f-cca200a87721	https://nx88862.your-storageshare.de/s/Sn79L7nTkrgaH9D	application/pdf	438759	2026-03-16 22:09:21.362	COT 12606 EPD.pdf	\N
324281c2-2181-46d1-a4c4-de508101a66d	3c7a4345-9fe6-4540-9ce3-499b7e1bd00b	https://nx88862.your-storageshare.de/s/qmtxyxND7qeTKAA	image/png	119008	2026-03-18 21:12:40.089	Screenshot 2026-03-18 131843.png	https://nx88862.your-storageshare.de/apps/files_sharing/publicpreview/kLjJ3TnGJ2co7LX?file=/&fileId=226399
0b6ac601-6a45-4696-bfb8-ba1228a8595c	db018271-0235-4401-9eb4-b11a76c810ca	https://nx88862.your-storageshare.de/s/eNJppKQx733TpPi	image/png	438771	2026-03-18 21:12:40.105	Screenshot 2026-03-18 150506.png	https://nx88862.your-storageshare.de/apps/files_sharing/publicpreview/R3xok4sEH4SYsHr?file=/&fileId=226402
93c8ab00-4021-4911-9ef1-c88028397f11	a716df1d-d295-4ee1-a862-9c3ce82bbcfa	https://nx88862.your-storageshare.de/s/BXHzmjqCCp8NAYc	image/png	29978	2026-03-19 15:56:40.187	Especificaciones relÃ©s - PVII (1).png	https://nx88862.your-storageshare.de/apps/files_sharing/publicpreview/NoXFPeXiSPLaCGX?file=/&fileId=226576
a23c238a-b9e6-41c9-aac7-7202383c6acf	9cb22ea2-20fb-416f-9e19-9a529a88dfe0	https://nx88862.your-storageshare.de/s/asDM43WfABkxztJ	image/jpeg	25000	2026-03-19 16:30:44.914	WhatsApp Image 2026-03-17 at 10.01.18 AM (1).jpeg	https://nx88862.your-storageshare.de/apps/files_sharing/publicpreview/gfZdcw6ZBqqDTAR?file=/&fileId=226621
438f6798-c6ae-4403-a3cd-57219b8e946d	1d60b60d-525c-4513-a064-a73b7173a6c0	https://nx88862.your-storageshare.de/s/oGxjKZefHr5CAjs	application/pdf	585730	2026-03-23 16:36:10.88	Placas de datos - Equipo Combinado y Medidores.pdf	\N
f7d3dc5e-d440-4d26-bb09-b87c5e98db37	1a613d84-ec23-41cd-92f3-5e5ae2afe878	https://nx88862.your-storageshare.de/s/HEJQYYNMdERmrCy	application/pdf	351111	2026-03-25 15:04:01.195	Diagrama Trifilar M1-M2.pdf	\N
69e443b8-2001-45c7-9ac2-e5a1777c97c5	f47c39be-0e6f-4952-a01c-2a72a46277e4	https://nx88862.your-storageshare.de/s/2Aa4xT3BZs7JiDR	application/pdf	3810958	2026-03-25 15:04:02.153	400G_DS_20220523 1.pdf	\N
4cf12a48-a741-4b67-9f26-30b0ab35c697	63dba00e-7b99-4bd2-8474-4d1617c92c46	https://nx88862.your-storageshare.de/s/ycdGJoD8LHfqcL3	application/pdf	578257	2026-03-25 22:13:24.459	FICHA TECNICA OLFLEX CLASSIC 110.pdf	\N
d3e721e6-9fcb-41ae-82f5-61af747c01ba	a8c10788-fb7d-41a6-949b-31ef01fe4458	https://nx88862.your-storageshare.de/s/kfbR5RP75rt5kKq	application/pdf	652317	2026-03-25 22:13:38.589	COT- HN-ETC-0000729 OFERTA CABLE LAPP (1).pdf	\N
ffc95a4b-ec09-41b1-9582-69e851601a21	718a4d93-18be-40cf-8fdf-fe35ecffccf7	https://nx88862.your-storageshare.de/s/7BMSpSCSYiaT6jD	application/pdf	155543	2026-03-25 22:17:40.349	CotizaciÃ³n RyD 70912 - Energia Potencia Y Desarrollos S.A De C.V..pdf	\N
ac082983-2161-4074-bdc1-fb69e620c2f0	e349d86b-b978-4632-9d55-4f4cb28a8912	https://nx88862.your-storageshare.de/s/MKZeb3yFJSLJK8Q	application/pdf	211003	2026-03-25 22:46:34.789	COTIZACION ENERGIA PD No.8712.pdf	\N
d9327775-9854-4dc0-a7eb-fbd507873384	77ca3bd2-3151-4fa3-9ecd-42bfe7d58549	https://nx88862.your-storageshare.de/s/jiRFxGDQPa8rpTp	application/pdf	113015	2026-03-25 22:48:10.812	44976.pdf	\N
5e659690-ca08-40d3-bad2-9ddac6d2370d	80389952-fd52-4884-b88f-6b9077245e8c	https://nx88862.your-storageshare.de/s/WAASsg6ar8AbHPa	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet	16863	2026-03-25 23:49:03.302	Comparacion Ofertas ACERO POSTES METALICOS_R1.xlsx	\N
76e9cec3-5fea-40c3-953a-075b1182c1ff	e73ec314-df7a-4e29-bc02-8af0dcfa8691	https://nx88862.your-storageshare.de/s/yfF99Sbq4wp6oNF	application/pdf	831972	2026-03-25 23:49:03.491	AJL_STEEL POLE PROJECT HONDURAS_20260325.pdf	\N
aa115ece-2b5d-40a2-baec-8e2022653be0	b1e23abf-0923-4064-80bf-d2ab89059e63	https://nx88862.your-storageshare.de/s/q8AfXoG5FtoS88K	application/vnd.rar	1695574	2026-03-25 23:49:04.263	Cotizaciones Postes Metalicos.rar	\N
4319b8d1-a2ef-42ff-9648-6a55a580e0d8	a66f81ee-b0c7-4cba-9cce-5d8cf1c7af8d	https://nx88862.your-storageshare.de/s/GoDDGCHGHcwLwwb	application/vnd.rar	4391814	2026-03-25 23:49:06.248	Planos de Postes Metalicos LT LAMANI.rar	\N
b70be064-bd81-4cbd-b4ac-282471c0bda4	6c0c5309-26a9-40fe-bdb5-26ca75bc1b9e	https://nx88862.your-storageshare.de/s/CR2JpYwp4ZLDeXW	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet	10677	2026-03-26 14:38:04.52	Listado de materiales para sistema de VAISALA portatil_Rev0.xlsx	\N
\.


--
-- TOC entry 3921 (class 0 OID 17070)
-- Dependencies: 216
-- Data for Name: area; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.area (id, nombre_area, creado, tipo, icono) FROM stdin;
9dbd6206-8f42-49f0-af91-8dded16da58b	Proyectos	2026-02-04 21:48:10.564	proyectos	🏗️
8700d5ed-2c72-478a-a1dd-aa494253bbf0	Comercial	2026-02-04 21:48:10.574	comercial	💼
7bffbfd8-eb90-4798-b418-9ae58a4242f5	Operativa	2026-02-04 21:48:10.555	operativa	🏢
a815a7cd-1e40-45b7-9544-1af8bd20da1c	Técnica	2026-02-20 13:48:00.527	tecnica	⚙️
\.


--
-- TOC entry 3936 (class 0 OID 17201)
-- Dependencies: 231
-- Data for Name: chat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat (id, creado, actualizado) FROM stdin;
76f03478-9b50-4b75-9a47-40f9205fa1cd	2026-02-25 22:20:56.966	2026-02-25 22:20:56.966
744d45d9-cf5b-4316-b074-2b7e0c0acb1b	2026-02-25 22:41:00.757	2026-02-25 22:41:00.757
c82a8944-fd3b-4eee-bc13-23ddcbb9c606	2026-02-25 22:55:27.8	2026-02-25 22:57:08.868
ac3de887-8302-4bf7-91b0-aa8055fc17b9	2026-03-19 16:30:42.034	2026-03-25 22:18:12.444
6b2c08ec-bfb3-4615-a6cf-3ad3f9922c68	2026-03-03 21:35:36.727	2026-03-03 21:38:51.248
00a780cc-d465-4234-8362-ec81831fc063	2026-03-24 14:35:20.62	2026-03-25 22:48:10.813
38b84f7b-42de-4bb8-93f4-65dc2a885c3c	2026-03-04 21:54:22.367	2026-03-04 21:54:22.367
18f73a95-144f-4261-83ac-645bbc44a08e	2026-03-12 13:49:33.079	2026-03-12 13:49:33.079
09344940-5796-41ce-b672-9da1e32ba2d7	2026-03-12 13:56:06.135	2026-03-12 13:56:06.135
48fd22f8-e8ae-4f25-b2ea-369ceb889c97	2026-03-12 14:15:53.505	2026-03-12 14:17:05.488
1393bc09-a2aa-46d7-8d07-905e4d4da2b6	2026-03-25 23:49:00.24	2026-03-25 23:49:06.249
f2d5c623-7ff3-4ac7-b33c-4f4cd081e6bf	2026-03-26 14:38:02.283	2026-03-26 14:38:04.521
42cb472a-68a7-40b5-b25a-023854c46336	2026-03-12 19:43:41.651	2026-03-12 19:53:35.74
a15891a4-5750-47c8-a971-3a1b0efbe757	2026-03-12 20:06:51.511	2026-03-12 20:06:51.511
9ba73af8-846b-46ec-858e-7de49643bf44	2026-03-26 15:03:44.81	2026-03-26 15:03:44.81
adf444c5-4c3d-4759-ba6a-073b6eef70e0	2026-03-26 15:26:53.509	2026-03-26 15:26:53.509
2fd8d740-c50e-4b03-9a8e-875592f638ea	2026-03-25 15:03:57.175	2026-03-26 15:27:25.239
b75b69fa-c30e-4814-93db-fb739c9d0369	2026-03-13 21:02:38.306	2026-03-13 21:02:43.537
c17d6370-f83a-4589-8210-c35f535e448b	2026-03-13 21:12:46.799	2026-03-13 21:16:31.419
9a080ae0-283b-4035-b00c-2d6b72b2ea32	2026-03-16 20:02:48.192	2026-03-16 20:02:51.441
83318a38-fc81-4fa3-8a2c-aa03cc5ac281	2026-03-12 14:28:10.072	2026-03-16 20:43:30.793
bcac2c7c-b195-4a59-b29c-6f9a670f44c9	2026-03-04 15:49:53.299	2026-03-16 21:31:52.275
915877a2-1363-4f48-bab5-fb69a536223e	2026-03-12 13:53:03.781	2026-03-16 22:09:21.363
910fd6e3-d9a9-498b-8135-4e04a8313f77	2026-03-12 13:47:36.569	2026-03-17 21:01:30.76
a160e11d-575c-4651-b100-14c641a7162a	2026-03-17 21:06:50.168	2026-03-17 21:06:50.168
6288bd5e-1c5b-4a25-8f18-4cf5511235fe	2026-03-18 21:12:36.802	2026-03-18 21:12:40.106
1d40e5ef-7107-4879-8a52-389dfa5777ac	2026-03-19 15:56:35.951	2026-03-19 15:56:40.189
97e53135-3c40-4b9e-ba16-223e990a3bf4	2026-03-17 21:09:04.511	2026-03-19 19:47:12.808
7194631d-33ed-4faa-b07f-edf2c23d420a	2026-03-23 16:36:07.427	2026-03-23 16:50:00.413
085f0cfc-fe8d-422a-b4b5-a30144389b8e	2026-03-24 14:57:13.375	2026-03-24 14:57:13.375
db29302f-6488-498e-9b55-c3b2e70d1402	2026-03-24 15:08:29.832	2026-03-24 15:08:29.832
\.


--
-- TOC entry 3933 (class 0 OID 17174)
-- Dependencies: 228
-- Data for Name: compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compra (id, cotizacion_id, estado, creacion, actualizado) FROM stdin;
\.


--
-- TOC entry 3934 (class 0 OID 17184)
-- Dependencies: 229
-- Data for Name: compra_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compra_detalle (id, compra_id, sku, descripcion_producto, cantidad, tipo_unidad, notas, precio, proveedor_id, estado, fecha_compra, fecha_fabricacion, fecha_fors, fecha_cif, fecha_recibido, fecha_ultima_actualizacion) FROM stdin;
\.


--
-- TOC entry 3930 (class 0 OID 17148)
-- Dependencies: 225
-- Data for Name: cotizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cotizacion (id, tipo_compra, tipo_id, solicitante_id, lugar_entrega, comentarios, fecha_solicitud, fecha_limite, estado, nombre_cotizacion, proyecto_id, fecha_estimada, aprobada_parcialmente, chat_id, fecha_aprobacion, supervisor_responsable_id, todos_productos_aprobados) FROM stdin;
ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	7b16da9d-1758-4bf9-9960-1ac345362ded	ALMACEN	\N	2026-02-25 22:20:56.971	2026-03-05 06:00:00	APROBADA_COMPLETA	140-26 - Sum Bateria de plomo acido DJ150(2V150Ah) LEOCH	c7c317e3-24b7-402b-ac55-8b23a72dc7cc	2026-03-27 22:20:56.182	f	76f03478-9b50-4b75-9a47-40f9205fa1cd	2026-02-25 22:33:07.077	7b16da9d-1758-4bf9-9960-1ac345362ded	t
14fbd91c-d786-4a5a-bb0f-6543f43632b3	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	7b16da9d-1758-4bf9-9960-1ac345362ded	ALMACEN	\N	2026-02-25 22:41:00.761	2026-03-06 06:00:00	APROBADA_COMPLETA	Laptop ASUS	2f179a62-1e2c-43aa-9877-70b9e2d4cc80	2026-03-27 22:41:00.106	f	744d45d9-cf5b-4316-b074-2b7e0c0acb1b	2026-02-25 22:50:06.075	7b16da9d-1758-4bf9-9960-1ac345362ded	t
ad15394f-efd4-43fc-a50b-6cb2f5b67bba	INTERNACIONAL	e20b476c-8af5-4002-81b6-19a1c585176e	7b16da9d-1758-4bf9-9960-1ac345362ded	ALMACEN	\N	2026-02-25 22:55:27.805	2026-03-13 06:00:00	APROBADA_COMPLETA	CONOS DE ALIVIO	05190288-ad71-4d18-9c73-8e246f78f912	2026-03-27 22:55:27.263	f	c82a8944-fd3b-4eee-bc13-23ddcbb9c606	2026-02-25 22:58:34.011	7b16da9d-1758-4bf9-9960-1ac345362ded	t
d6cf00c6-e39e-48bb-a984-601d348e0d0f	NACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	5cddfc77-b008-4e66-b913-2bdd952e31af	ALMACEN	especificakhdsajhadfasoiñdfkasdgifnwdkg	2026-03-03 21:35:36.732	2026-03-08 06:00:00	APROBADA_COMPLETA	laptop	25599a12-b292-4985-9520-a6c4520ad9e0	2026-04-02 21:35:36.493	f	6b2c08ec-bfb3-4615-a6cf-3ad3f9922c68	2026-03-03 21:42:32.863	5cddfc77-b008-4e66-b913-2bdd952e31af	t
bd3e4b5e-ce17-41c8-8bec-17e1cc7cc055	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	OFICINA	Revisar correo, subiré la ficha técnica	2026-03-04 21:54:22.372	2026-03-09 06:00:00	ENVIADA	226-25 ELCOSA-Suministro , Instalacion, Pruebas y puesta en marcha de AVR Basler	5f2fdd27-8634-4aeb-8686-d2d194d65d65	2026-04-03 21:54:21.563	f	38b84f7b-42de-4bb8-93f4-65dc2a885c3c	\N	\N	f
3d1f461e-70d6-49ae-8b31-b1886fd8e33b	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	correo enviado el 11/03/2026	2026-03-12 13:56:06.14	2026-03-17 06:00:00	ENVIADA	200-26 El Yaguala - Suministro e instalación de TC´s	91da763e-5fd3-4cef-beb0-e3552a278b21	2026-04-11 13:56:05.45	f	09344940-5796-41ce-b672-9da1e32ba2d7	\N	\N	f
a1acfcd8-3190-4be3-8d48-05218137a40d	INTERNACIONAL	e20b476c-8af5-4002-81b6-19a1c585176e	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Buenas tardes envio esta opcion para guiarse en la cotizacion ; https://www.amazon.com/V%C3%A1lvula-solenoide-el%C3%A9ctrica-normalmente-combustible/dp/B07N6246YB/ref=sr_1_1_sspa?__mk_es_US=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=ECKXTJTV8166&dib=eyJ2IjoiMSJ9.leGpKd_uCQ4c-Te8F0rC8pdSOTzw6blrRHQpxxrIKB2YN5sKdRT7uB6Zx_7vrJSvU-uVbk_uyGFoEaWPboDkhEMUUksGdoWlodyWCO7qHOI4VblseE_70nc8ml2a07QfuYd9AIMKNW6XBF-x74__V23-Atd8aeouyb8ZSrzgcNvYxnDfURHz1WPzZ3vHk4ISIg93ggCSK0UKRUR9Q60N88J2zd6w0-xk-HBrOzCdDGU7vvafgScs7FnICuhXN4XaTahJhfJe2TlbPK5xIpLMDVZtT8m4ndWlNp_x2Xbv60k.8ZlIGIp-uDNY1058g-Q6lTCzH7H-pLomCVbOa5gRb8M&dib_tag=se&keywords=valvulas&qid=1773324705&sprefix=valvulas%2Caps%2C158&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1	2026-03-12 14:15:53.51	2026-03-17 06:00:00	APROBADA_COMPLETA	cotizacion de valvulas	1754454b-a699-4263-81b2-49788531f995	2026-04-11 14:15:53.495	f	48fd22f8-e8ae-4f25-b2ea-369ceb889c97	2026-03-12 14:20:01.93	5cddfc77-b008-4e66-b913-2bdd952e31af	t
769ed2eb-ae15-40d4-8318-1c81c4556891	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Ver correo mas detallado, adjunto PDF y FOTO	2026-03-04 15:49:53.304	2026-03-09 06:00:00	EN_CONFIGURACION	165-26 UTCD - Sum Equipos SEL SE Guaymas	85408720-7f79-403e-889e-7a98fb0c4fab	2026-04-03 15:49:52.461	f	bcac2c7c-b195-4a59-b29c-6f9a670f44c9	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
87b5ac3a-1c07-49c7-a3a7-ccb9be32fb00	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	correo enviado el 12-3-2026	2026-03-12 13:47:36.574	2026-03-17 06:00:00	EN_CONFIGURACION	179-26 solicitud-Suministro de reloj satelital	a66ce85d-f881-4e24-8078-5a5b1dddacfc	2026-04-11 13:47:36.124	f	910fd6e3-d9a9-498b-8135-4e04a8313f77	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Ver correo 11-03-2026	2026-03-12 13:53:03.785	2026-03-17 06:00:00	EN_CONFIGURACION	UTCD - 789-25 Suministro Equipos SEL	5bf4a9d7-8049-4625-b4df-c65840d32c04	2026-04-11 13:53:03.135	f	915877a2-1363-4f48-bab5-fb69a536223e	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
99dd13c7-fb3f-4d59-beb2-b9af97db49c2	NACIONAL	8adeab3d-d2d4-4af5-98d1-e2aadfccb96f	5cddfc77-b008-4e66-b913-2bdd952e31af	ALMACEN	\N	2026-03-12 20:06:51.515	2026-03-17 06:00:00	APROBADA_COMPLETA	termo	d06d22de-2c4e-4a2c-bc54-af35dd5f00d9	2026-04-11 20:06:50.837	f	a15891a4-5750-47c8-a971-3a1b0efbe757	2026-03-12 20:08:04.049	5cddfc77-b008-4e66-b913-2bdd952e31af	t
e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	NACIONAL	8adeab3d-d2d4-4af5-98d1-e2aadfccb96f	d25da598-5ab6-4684-967f-40bf7b72f3ae	PROYECTO	ver la cotizacion adjunto	2026-03-12 19:43:41.656	2026-03-17 06:00:00	APROBADA_COMPLETA	banner pàra proyecto x	d06d22de-2c4e-4a2c-bc54-af35dd5f00d9	2026-04-11 19:43:40.989	f	42cb472a-68a7-40b5-b25a-023854c46336	2026-03-12 21:55:00.489	5cddfc77-b008-4e66-b913-2bdd952e31af	t
94b01a3b-e5bd-49f4-a7e5-a584acf1642b	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	VER CORREO\n\nfavor su apoyo con esta cotización, el cliente solicita suministro del generador que tienen actualmente en la planta. Consultan si podemos conseguirles el generador de la misma marca y modelo: generador Leroy-Sommer  (se adjunto foto con placa de datos técnicos).\n\nSin embargo, estan abiertos a ver propuestas de otra marca o tipo de generador que se pueda adaptar para la aplicación en la planta.\n\nINCLUIR: FICHA TECNICA, ADUANA Y FLETE	2026-03-13 21:02:38.312	2026-03-20 06:00:00	ENVIADA	210-26 ELCOSA - Suministro y reemplazo de generador	cf6be4cd-112e-4714-862e-b9e2d414c276	2026-04-12 21:02:37.552	f	b75b69fa-c30e-4814-93db-fb739c9d0369	\N	\N	f
ed0a7109-b62b-4ba9-ac28-5b2b8127c0de	INTERNACIONAL	e20b476c-8af5-4002-81b6-19a1c585176e	d25da598-5ab6-4684-967f-40bf7b72f3ae	PROYECTO	COMPRAR EN AMAZON  VER EL SIGUIENTE LINK: http://89.167.20.163:8080/quotes/new	2026-03-16 20:02:48.197	2026-03-23 06:00:00	APROBADA_COMPLETA	140-85 PRPYECTO X	777cfed2-254c-40f5-90eb-94145d2fbfaf	2026-04-15 20:02:47.495	f	9a080ae0-283b-4035-b00c-2d6b72b2ea32	2026-03-16 21:28:30.478	5cddfc77-b008-4e66-b913-2bdd952e31af	t
8a81c470-8d75-42b1-b969-7f76c5dbceb9	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	OFICINA	Estos son los Pomanique vendió Energía PD a UTCD y se arruinaron. Mismas características.	2026-03-12 14:28:10.076	2026-03-17 06:00:00	EN_CONFIGURACION	185-26 UTCD - Suministro de 2 Reclosers (SPS y Ceiba)	6be53479-068e-47c2-9cdb-69d45db8e90a	2026-04-11 14:28:09.431	f	83318a38-fc81-4fa3-8a2c-aa03cc5ac281	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
d3c64b06-5998-4993-a418-a962dcf1f73e	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	correo enviado 12-03-2026	2026-03-12 13:49:33.083	2026-03-17 06:00:00	EN_CONFIGURACION	201-26 Solicitud - Suministro cargador de baterías	40efc7c8-17b5-4461-aea8-831da0b748b3	2026-04-11 13:49:32.45	f	18f73a95-144f-4261-83ac-645bbc44a08e	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
465c1bfa-1da9-424b-acef-b2c88ccee0b6	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Solicito su apoyo cotizado con CHINT \n\nCliente de El Salvador solicita cotización por suministro de motor de radiador para el trafo de 16MVA\nIndican que tenia ruido raro y lo sacaron de linea.\n\nPor lo tanto no funciona y necesitan cambiarlo.\nAdjunto informe de la visita, foto del trafo foto de la placa y del motor con su placa.\n\nLa idea es cambiar el mismo ya que no tiene garantia el equipo.\n\nLugar de entrega del motor debe ser el mismo: https://maps.app.goo.gl/WuGGn7Ddtiu431Fe8\n\nConsiderar oferta cliente es El Salvador (ISV salvadoreño)\nCualquier consulta al pendiente!	2026-03-13 21:12:46.804	2026-03-20 06:00:00	EN_CONFIGURACION	213-26 INE - Suministro Motor Radiador Trafo 16MVA Chint	708bd955-29f2-407e-b87d-85d032b94291	2026-04-12 21:12:46.013	f	c17d6370-f83a-4589-8210-c35f535e448b	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
dfe1af15-607f-45dd-8da8-d4bafd3f648f	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Me dicen que posiblemente tenemos este suministro en bodega, yo estoy investigando su disponibilidad , pero necesito el precio. \n\nImagen adjunta. \n\nSaludos\nBainca Lopez.	2026-03-19 16:30:42.039	2026-03-26 06:00:00	ENVIADA	223-26 Empacadora San Lorenzo- Suministro de cable de control	55e4c5be-0e67-4eb2-937e-efc72748287f	2026-04-18 16:30:41.34	f	ac3de887-8302-4bf7-91b0-aa8055fc17b9	\N	\N	f
8fa3f8f1-8666-4c17-836f-c3e856857106	INTERNACIONAL	e20b476c-8af5-4002-81b6-19a1c585176e	ab6d9041-7493-45a5-97f5-62ccbb36c59e	OFICINA	Para solarGIS Time series, necesitamos tener datos de TMY bancables, Time series con intervalos de 15 minutos para mayor precision, datos de uncertaintly, que tengan formato P50/P90 y que sea compatible con software PVSyst.	2026-03-18 21:12:36.807	2026-03-25 06:00:00	EN_CONFIGURACION	Adquisición de software solar PVSyst y SolarGIS	d9c7ebdd-0a43-4d9d-87a3-dd249ce809c5	2026-04-17 21:12:36.059	f	6288bd5e-1c5b-4a25-8f18-4cf5511235fe	\N	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	f
fd18e65d-88a0-468d-9af2-e9fd203cdcf2	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Su apoyo con esta oferta, el cliente solicita Suministro de 5 relevadores de protección para PVII, les adjunto imagen con las especificaciones enviadas por el cliente, para que puedan solicitar la cotización del suministro.\n\nEntrega del suministro debe ser en las instalaciones del cliente.	2026-03-19 15:56:35.957	2026-03-26 06:00:00	EN_CONFIGURACION	216-26 Lufussa - Suministro relés de protección PVII	3aad698d-71c9-45c4-af69-457e5f608f44	2026-04-18 15:56:34.706	f	1d40e5ef-7107-4879-8a52-389dfa5777ac	\N	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	f
a7beae9f-dbfb-46a9-9e3a-8683abd30ef9	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	El Ing. Nicolás ha estado viendo la opción con equipo SEL, es un controlador 2414, que se suministró para el Nispero anteriormente y está solicitando a Carla compras que actualice el costo para que podamos ofertarlo junto con la instalación del mismo.\n\nUREGENTE	2026-03-17 21:09:04.514	2026-03-24 06:00:00	EN_CONFIGURACION	169-26 Laeisz / Bermejo - Suministro e instalación de Controlador de Temperatura	e3594efb-9e96-47e9-beee-bd430e9eb597	2026-04-16 21:09:03.947	f	97e53135-3c40-4b9e-ba16-223e990a3bf4	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
99007de4-71b1-44ce-b511-aa4640cc9c98	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	El ing. Nicolas ya te hizo la solicitud y me gustaria saber si ya pudieron actualizar el precio de esste suministro. \n\nEl Ing. Nicolás ha estado viendo la opción con equipo SEL, es un controlador 2414, que se suministró para el Nispero anteriormente y está solicitando a Carla compras que actualice el costo para que podamos ofertarlo junto con la instalación del mismo.	2026-03-17 21:06:50.173	2026-03-24 06:00:00	EN_CONFIGURACION	170-26 Laeisz / La Puerta - Suministro e instalación de Controlador de Temperatura	b78ee3bb-f367-471e-abe7-2be6f0e36e5a	2026-04-16 21:06:49.449	f	a160e11d-575c-4651-b100-14c641a7162a	\N	7b16da9d-1758-4bf9-9960-1ac345362ded	f
6858d5ca-1163-47f4-8ce4-c06a8e0048d6	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	191-26 La Aurora - Reemplazo de Punto de Medición\n\nfavor su apoyo con esta cotización, el cliente requiere Suministro del punto de medición, que incluye lo siguiente:\n\n1. Suministro de equipo combinado y 2 medidores ION8650 (se adjunta documento con las placas del equipo actual, para tomar las especificaciones técnicas y poder cotizar)	2026-03-23 16:36:07.433	2026-03-30 06:00:00	ENVIADA	191-26 La Aurora - Reemplazo de Punto de Medición	a48f0467-2526-4c92-b09d-28a1c2b18b91	2026-04-22 16:36:06.831	f	7194631d-33ed-4faa-b07f-edf2c23d420a	\N	\N	f
a555ddb1-e05e-49a1-9a16-25b441ee6174	NACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Levy le envie un correo con todo los detalles porque es bastante extenso, de igual porfa se lo dejare aqui. \n\nPARARRAYO 27KV PDV-100 HD 0. 10KG              6 UN\nESTRIBO T/ESCOPETA #6-3/0  AHLS-022019E 9 UN\nCONECTOR LINEA VIVA 3/0-4/0                        4 UN\nCRUCETAS DE MADERA  4N.X5N.X8'              12 UN\nGRAPA P/VARILLA POLO A TIERRA 5/8¨ GC        8 UN\nCONECTOR PIN 1/0 ACSR                                      15 UN\nAISLADOR ESPIGA DE 34.5KV                              30 UN\nVARILLA POLO A TIERRA COBRE 5/8¨X6      12 UN\nPERNO ROSCA CORRIDA DE 5/8"X20"              15 UN\nPERNO ROSCA CORRIDA DE  5/8¨ X 22¨              15 UN\nPERNO ROSCA CORRIDA DE 5/8"X14"              15 UN\nPREFORMADO P/CABLE RETENIDA 5/16¨      30 UN\nPERNO DE MAQUINA DE 5/8¨ X 12¨              15 UN\nCINTA BAND-IT 3/4  ROLLO  100FT                        2 ROL\nAISLADOR DE SUSPENSIÓN ANSI 52-9              90 UN\nESPIGA PARA CRUCETE 34.5KV                      20 UN\nCONECTOR COMPRESION ALUM TIPO C YC28A28 25 UN\nCONECTOR COMPRESION 1/0-1/0 CAL.4 25A25        25 UN\nCABLE ALUMINIO ACSR #4                             100 M\nCABLE DE ALUMINIO SIN FORRO ACSR 2    100 TF\nCABLE DE COBRE DESNUDO 4/0 AWG 36 HILOS      100 TF\nESPIGA PUNTA CURVA PARA POSTE 34.5KV       20 UN\nHEBILLA 3/4¨ BAND-IT C256                             50 UN	2026-03-24 14:35:20.625	2026-03-31 06:00:00	ENVIADA	233-26 AZUNOSA- Suministro de equipos y material electrico	ffa00706-0cce-44a0-8c2d-9346aac89c79	2026-04-23 14:35:20.024	f	00a780cc-d465-4234-8362-ec81831fc063	\N	\N	f
c02d91cc-736e-42ff-ba64-5418d36462d4	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	Les envié correo, creo que este suministro lo tenemos en bodega, si es así me pasan precio ya puesto aquí, gracias.	2026-03-24 14:57:13.379	2026-03-31 06:00:00	ENVIADA	215-26 IMPELCO- Sum. de Recloser	99db1c0d-c9b9-42a3-951f-7184162d1c8d	2026-04-23 14:57:12.656	f	085f0cfc-fe8d-422a-b4b5-a30144389b8e	\N	\N	f
a2e60c47-82fb-4fb7-a61c-688b4edceec7	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	d25da598-5ab6-4684-967f-40bf7b72f3ae	ALMACEN	les envié un correo.	2026-03-24 15:08:29.837	2026-03-31 06:00:00	ENVIADA	211-26 Ecovolt - Suministro de transformadores combinado	b421c961-dcb8-44ba-bf59-a7a75c81eeb7	2026-04-23 15:08:29.25	f	db29302f-6488-498e-9b55-c3b2e70d1402	\N	\N	f
6a087248-ab48-47e4-bde2-ab7802bd5490	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	ALMACEN	\N	2026-03-25 15:03:57.178	2026-04-01 06:00:00	ENVIADA	Suministro de relevador SEL 400G	347ae50d-6f33-474b-8831-0fc77385a160	2026-04-24 15:03:56.131	f	2fd8d740-c50e-4b03-9a8e-875592f638ea	\N	\N	f
aa281aa4-c343-40bf-8c54-9d5b702466d3	INTERNACIONAL	e20b476c-8af5-4002-81b6-19a1c585176e	a1a14554-daa0-4458-95ad-905a083aedc8	PROYECTO	Ya el proceso de cotizaciones fue realizado, y se determino la compra con el Fabricante Qingdao AJL\nPunto Importante: Las Pruebas destructivas de los postes se deben manejar como Item Opcional, y no formara parte del monto total de la orden de compra al menos que sea requerido proceder mas adelante con dicho item.	2026-03-25 23:49:00.245	2026-04-01 06:00:00	ENVIADA	Compra de Postes Metalicos Linea de Transmision	164226ad-24fa-4b03-890e-9bada1c0de70	2026-04-24 23:48:59.584	f	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	\N	\N	f
7e9002a1-572b-4a16-8cca-ff437810840f	NACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	ALMACEN	\N	2026-03-26 14:38:02.287	2026-04-03 06:00:00	ENVIADA	Instalación portatil de Vaisala	e097215c-8198-468e-980f-bd1261552b2e	2026-04-25 14:38:01.507	f	f2d5c623-7ff3-4ac7-b33c-4f4cd081e6bf	\N	\N	f
2bc7541d-0998-45fc-ac1b-b1622173ace5	INTERNACIONAL	8adeab3d-d2d4-4af5-98d1-e2aadfccb96f	2d791fa1-940c-45bf-a980-1499bbbe1b2a	ALMACEN	\N	2026-03-26 15:03:44.815	2026-04-02 06:00:00	APROBADA_COMPLETA	Hincadora	0b7e89c9-50e7-47a5-ac29-299710f43e25	2026-04-25 15:03:40.388	f	9ba73af8-846b-46ec-858e-7de49643bf44	2026-03-26 15:17:44.064	2d791fa1-940c-45bf-a980-1499bbbe1b2a	t
1f7125af-3444-4d46-aa7a-ab736e897331	INTERNACIONAL	25dae96a-6888-4a07-b5fa-c9cbb5b391f8	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	ALMACEN	\N	2026-03-26 15:26:53.514	2026-04-02 06:00:00	ENVIADA	Cable 4x8 AWG con apantallamiento metálico	43350327-1a45-4f4d-999f-414067b67418	2026-04-25 15:26:52.777	f	adf444c5-4c3d-4759-ba6a-073b6eef70e0	\N	\N	f
\.


--
-- TOC entry 3931 (class 0 OID 17159)
-- Dependencies: 226
-- Data for Name: cotizacion_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cotizacion_detalle (id, cotizacion_id, sku, descripcion_producto, cantidad, tipo_unidad, notas, precios_id) FROM stdin;
d21715ff-6f2a-4808-a12e-05ea714f4e31	ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	PROD-0001	BATERIA DE PLOMO-ACIDO DJ150(2V150Ah) LEOCH	60	UNIDAD	Se solicita sobre todo marca LEOCH	d5e53ff6-8a17-4418-822b-28d58861517f
67e856a3-57bb-402c-8617-9aeb433f59fe	14fbd91c-d786-4a5a-bb0f-6543f43632b3	PROD-0002	Laptop ASUS 1	1	UNIDAD	\N	6bafe013-8817-4bd2-8059-7999e4184d4f
40ce0780-5256-4fdd-b557-499921d9a030	14fbd91c-d786-4a5a-bb0f-6543f43632b3	PROD-0003	Mouse ASUS	1	UNIDAD	\N	cb009a16-670e-4283-bce7-788ccdf69e9d
a7aef309-1ec5-49b3-a6e2-079cbcb60268	ad15394f-efd4-43fc-a50b-6cb2f5b67bba	PROD-0004	Conos de alivio de 34.5kV	13	UNIDAD	\N	15d43914-eb1d-4210-bc42-fb4644115736
c64351dd-998f-486a-8341-50b2b773922a	d6cf00c6-e39e-48bb-a984-601d348e0d0f	PROD-0006	lapto dell i7	1	UNIDAD	porfavor revisar que el procesador sea 16gb	ff32d5fd-2365-40e7-a54d-e4132289ab28
b797e76d-cd56-4756-8f1a-ed247f0bbe9e	769ed2eb-ae15-40d4-8318-1c81c4556891	PROD-0007	PROTECCIÓN DE ALIMENTADOR 751 # 99 AR	1	UNIDAD	\N	\N
e6c4cd1d-a1c6-4c7a-8158-3c641aa7c5c7	769ed2eb-ae15-40d4-8318-1c81c4556891	PROD-0008	RELÉ DE PROTECCIÓN DE TRANSFORMADOR 787#6JGB	1	UNIDAD	\N	\N
d3f01218-1070-4ed1-b3a1-e9e7ebfcbcf3	769ed2eb-ae15-40d4-8318-1c81c4556891	PROD-0009	SWICH ETHERNET ADMINISTRABLE DE 24 PUERTOS 2730M#7M6C	1	UNIDAD	\N	\N
f9b1b4b3-5dd6-4809-9032-eb37d265112e	769ed2eb-ae15-40d4-8318-1c81c4556891	PROD-0010	MODULO AXION 2240#392L	1	UNIDAD	\N	\N
10b0db6a-55cc-4345-b4be-4f32140308ac	769ed2eb-ae15-40d4-8318-1c81c4556891	PROD-0011	CONTROLADOR SEL-2424#Q4L8	1	UNIDAD	\N	\N
ea34b4a6-17e1-4b8d-8ca7-359681a71ebf	bd3e4b5e-ce17-41c8-8bec-17e1cc7cc055	PROD-0012	DECS-250,DigitalExcitationControlSystemStyle:LP1SN1N	4	UNIDAD	Adjunto cotización, actualizarla.	\N
05fba7ef-f5d5-4310-b4e5-ee597b69790f	87b5ac3a-1c07-49c7-a3a7-ccb9be32fb00	PROD-0013	Reloj satelital SEL2404	1	UNIDAD	Su ayuda cotizando, Reloj satelital SEL2404, y que incluye antena con cable largo de 75 pies para poder instalarla afuera del edificio. SEL-2404, part # : 24041441X, configuration #: 2404#0101  IMPORTANTE: Cliente solicita oferta por el suministro y la instalacion tambien , considerarlo por favor	\N
77b1da24-3f94-4866-b2be-4dc336b51c29	d3c64b06-5998-4993-a418-a962dcf1f73e	PROD-0014	Cargador de baterías.	1	UNIDAD	Características técnicas:  Marca: SBS Modelos No.: AT30130100F208XHXAGLXX	\N
a3699e21-0fd8-4f75-ad67-c7da69abae92	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	PROD-0015	RELEVADOR 751	1	UNIDAD	\N	\N
32d776b1-2990-4aa0-90b0-e3efeca18c44	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	PROD-0016	RELE DIFERENCIAL SEL-787	1	UNIDAD	\N	\N
a80cf4b2-47bb-4aaa-b684-7863f973e73e	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	PROD-0017	SWICHT ETHERNET MANAGED 24 PTO SEL 2730M	1	UNIDAD	\N	\N
da730f73-55d8-430e-98b8-170a100ee6f5	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	PROD-0018	CONTROLADOR SEL-2240	1	UNIDAD	\N	\N
2a94072f-444b-4951-b692-e809bd109493	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	PROD-0019	CONTROLADOR SEL-2414 RELE 90 (RELE 90 - 2414 #Q4LB)	1	UNIDAD	\N	\N
3bd9091b-cbb3-408c-adaf-74d880c9578a	3d1f461e-70d6-49ae-8b31-b1886fd8e33b	PROD-0020	1 juego de TC´s	1	UNIDAD	3 unidad de  TC's = 1 juegos de TC's	\N
cee25caa-4eb9-4dc8-aa64-cc7cf0ebdc6e	a1acfcd8-3190-4be3-8d48-05218137a40d	PROD-0021	valvula	1	UNIDAD	porfavor no cotizar en ebay	87539a3e-c0c5-420a-b441-82bc8909d1c7
326a8dfd-b889-4a8a-b31a-d8b131e2c681	8a81c470-8d75-42b1-b969-7f76c5dbceb9	PROD-0022	reclosers // RESTAURADOR TRIFASICO 34.5kV (KIT)	2	UNIDAD	Estos son los Pomanique vendió Energía PD a UTCD y se arruinaron. Mismas caracteristicas.	\N
8563e572-2757-49ac-979e-224518aa3c58	99dd13c7-fb3f-4d59-beb2-b9af97db49c2	PROD-0025	termo	1	UNIDAD	\N	67e839e9-e91d-485f-b2a9-97f4196ddd38
d0fef1fb-43ca-4358-addd-5cdf815b1b33	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	PROD-0023	salon de evento	1	OTRO	servicios de peluqueria	54f5f4d4-818a-48e2-8bd5-932c91ca4255
dfb92717-441c-4251-8e47-0d6c398f7c30	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	PROD-0024	boquitas del salon	1	CAJA	llamar al proveedor de boquitas dulces	5c329007-4623-4cde-a957-6338adbe0b2f
b5efa63e-7568-4694-8cf1-e2d57b3cff58	94b01a3b-e5bd-49f4-a7e5-a584acf1642b	PROD-0029	GENERADOR 11200 KW	1	UNIDAD	\N	\N
3a1e43b6-62a0-4552-88f6-2ccd42670e6a	465c1bfa-1da9-424b-acef-b2c88ccee0b6	PROD-0030	UNIDAD DE ACCIONAMIENTO DEL MOTOR (motor de radiador para el trafo de 16MVA)	1	UNIDAD	PLACA ADJUNTA	\N
c34c1b38-0a10-41ae-a155-8c10e65ab720	ed0a7109-b62b-4ba9-ac28-5b2b8127c0de	PROD-0031	BATERIAS	10	CAJA	NO FUERAN DE LA MARCA ENERGIZER	cfb47df4-2fe0-45ee-a8fb-82f9c268647c
70b7d7c5-10c3-41ad-a7fa-0c4d3710dcaf	99007de4-71b1-44ce-b511-aa4640cc9c98	PROD-0034	equipo SEL, es un controlador 2414	1	UNIDAD	URGENTE	\N
d858b46c-cade-492c-9b38-3d4d73b5fc7a	a7beae9f-dbfb-46a9-9e3a-8683abd30ef9	PROD-0035	equipo SEL, es un controlador 2414,	1	UNIDAD	URGENTE	\N
f3925f0b-1a3f-4a32-b796-315b95e77a7b	8fa3f8f1-8666-4c17-836f-c3e856857106	PROD-0036	Licencia de PVSyst 8 profesional	1	UNIDAD	Licencia profesional anual, pricing directo en pagina y adjuntado en imagen, necesario realizar cuenta para compra de licencia e ingresar datos de billing. Adjunto Link: https://www.pvsyst.com/en/products/pvsyst-8/	\N
bbf04d7b-b592-4f5b-b8ba-95ca39f61044	8fa3f8f1-8666-4c17-836f-c3e856857106	PROD-0037	Licencia de SolarGIS Time Series	1	UNIDAD	SolarGIS Time series, pricing no disponible en pagina, necesitamos hacer contact us para negociar precio y necesidades descritas. Adjunto Link: https://solargis.com/products/integration/solargis-time-series-api	\N
6341a6a6-df54-4869-a35c-f18ccdcbbfc0	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	PROD-0038	SEL-700G-1-T-W GEERADOR RELAY	2	UNIDAD	0700G11D2X0X77851320	\N
100634de-4027-4bda-a992-85eedf765b23	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	PROD-0039	SEL-751 FEEDER PROTECTION RELAY	4	UNIDAD	7510S1DBD0X7D851DA0	\N
e43e648b-b4e4-45a2-878f-4485cef17130	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	PROD-0040	SEL - 787 -2 -3-4 TRANSF PROTECTION RELAY	1	UNIDAD	\N	\N
8b3c5c80-b326-4f16-8a90-dfa25a859357	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0042	Cable de control 7x14	70	METRO	\N	\N
13c0b6b0-20a0-44e0-96c4-9faf551e9fff	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0043	Cable de control 18x18	70	METRO	\N	\N
04886d8c-14f7-4ed6-a467-eb206246ccb6	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0044	Cable de control 12 x 18	70	METRO	\N	\N
3f218660-f5e9-44dc-91e0-c648bab79bf0	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0045	cable de control 12 x 20	20	METRO	\N	\N
9f290399-17c7-42a6-b4ad-9e4cc32f3e1f	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0046	Cable de control 30 x 20	70	METRO	\N	\N
a363fc78-4c1b-4e4a-ab51-bf22395fdf4e	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0047	Cable de control 2 x 20	160	METRO	\N	\N
37c4f147-6c99-437c-a601-4f082b483823	dfe1af15-607f-45dd-8da8-d4bafd3f648f	PROD-0048	Cable de control 4 x 22	120	METRO	\N	\N
5acf97c7-f0b4-44c6-a9a4-94f44a87b777	6858d5ca-1163-47f4-8ce4-c06a8e0048d6	PROD-0050	IONN8650	2	UNIDAD	\N	\N
fcbf2b3a-acf1-4a5b-a7b0-1eb3bb03e948	6858d5ca-1163-47f4-8ce4-c06a8e0048d6	PROD-0051	Transformador integrado de medición, Relación 200:5,	3	UNIDAD	Si Tenes ofertas actuales de este suministro me ayudas porfa. aqui vamos a estimar un precio más alto.	\N
51111153-4f1b-48fc-8ccc-e9d8c57b2d52	a555ddb1-e05e-49a1-9a16-25b441ee6174	PROD-0052	PARARRAYO 27KV PDV-100 HD 0. 10KG	6	UNIDAD	\N	\N
d28fd77e-27c0-480f-93b0-6ae84d5c6522	c02d91cc-736e-42ff-ba64-5418d36462d4	PROD-0053	Recloser Marca Schnneider U27, 24.9 kv, 630 amp,  Bil 125kV	1	UNIDAD	\N	\N
b49fe24d-39ee-4969-b23b-751621e9db66	c02d91cc-736e-42ff-ba64-5418d36462d4	PROD-0054	tripolares horizontales mecánicas para operar desde piso Aisladores de Polímero Menciona que le coticemos 2 sin loadbreak y una con loadbreak	2	UNIDAD	\N	\N
261ba919-f713-4fd4-81e9-21c1edd50520	a2e60c47-82fb-4fb7-a61c-688b4edceec7	PROD-0055	CVC-110BER and CVC-110BRER 15 kV combination current and voltage transformers	3	UNIDAD	Incluir: ficha técnica,  garantia, flete, tiempo de entrega, y demas.	\N
84b63b59-2de2-48b1-a723-0b0422033e37	6a087248-ab48-47e4-bde2-ab7802bd5490	PROD-0056	SEL 400G	1	UNIDAD	Se requiere un relé de protección de generador tipo SEL-400G, con funciones completas de protección (diferencial de generador, sobrecorriente de fase y neutro, falla a tierra, pérdida de excitación, potencia inversa, desbalance, sobre/subtensión, sobre/subfrecuencia y V/Hz), con al menos 4 entradas de corriente (3 fases + neutro) y 3 entradas de voltaje (120 V). Debe incluir medición eléctrica (potencia, energía, frecuencia), mínimo 16 entradas y 8 salidas digitales para control y disparo, comunicaciones IEC 61850 obligatorias (más Modbus/DNP3), puerto Ethernet dual, registro de eventos y oscilografía, sincronización por IRIG-B o NTP y alimentación en 110–125 VDC. Además, debe ser compatible con integración a SCADA y contar con software de configuración.	\N
bd70600d-cefe-497c-9efe-d4ba45e6eea0	aa281aa4-c343-40bf-8c54-9d5b702466d3	PROD-0057	Poste Metalico Autosoportado de 33 metros Tipo RVDC180_0-45	20	UNIDAD	Se Adjunta Plano del Poste RVDC180_0-45_33M, Peso del Poste: 8.5 Toneladas	\N
f9487d49-9da4-47c0-b209-ea790434da90	aa281aa4-c343-40bf-8c54-9d5b702466d3	PROD-0058	Poste Metalico Autosoportado de 30 metros Tipo RVDC180_0-90	2	UNIDAD	Se Adjunta Plano del Poste RVDC180_0-90_30M, Peso del Poste: 10.15 Toneladas	\N
c0a3513e-2a35-4918-ac75-e9bfc7b64b7f	aa281aa4-c343-40bf-8c54-9d5b702466d3	PROD-0059	Poste Metalico Autosoportado de 30 metros Tipo 2SVII_0-4	60	UNIDAD	Se Adjunta Plano del Poste 2SVII_0-4_30M, Peso del Poste: 3.6 Toneladas	\N
d4e8f3be-30ef-4388-8ef8-ebf830e37d45	aa281aa4-c343-40bf-8c54-9d5b702466d3	PROD-0060	Poste Metalico Autosoportado de 50 metros Tipo AA+2SVII_0-2	2	UNIDAD	Se Adjunta Plano del Poste AA+2SVII_0-2_50M, Peso del Poste: 14.53 Toneladas	\N
221ba3fd-6e3c-4a02-8649-c09c172d36a5	aa281aa4-c343-40bf-8c54-9d5b702466d3	PROD-0061	Opcional Costo de Pruebas Destructivas	1	OTRO	Este Item comprende el costo de hacer prueba destructiva a dos modelos de postes ( Un RVDC180_0-45 y Un AA+2SVII_0-2) El cual es por 23.03 Toneladas en Total.	\N
444cea43-006d-4500-bc2c-4cf3cb79da4e	7e9002a1-572b-4a16-8cca-ff437810840f	PROD-0062	Listado de materiales para instalación de vaisala portatil en plantas LAEISZ	1	UNIDAD	\N	\N
84519fb3-d719-42a2-9666-f0880f582f46	2bc7541d-0998-45fc-ac1b-b1622173ace5	PROD-0063	Hincadora R6	14	UNIDAD	\N	0e1628ca-37ff-43d7-90bb-0c0171d58c71
67b4923c-e442-4093-83d5-7ec7a16da05d	1f7125af-3444-4d46-aa7a-ab736e897331	PROD-0064	Cable 4x8 AWG con apantallamiento metálico	300	METRO	\N	\N
\.


--
-- TOC entry 3923 (class 0 OID 17086)
-- Dependencies: 218
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamento (id, nombre, creado) FROM stdin;
6b1ba0b2-f741-4f93-b8db-475406b6cd96	Administración	2026-02-04 21:48:10.436
37fb9dea-9fb9-461d-839a-5f6852a2a64c	Compras	2026-02-04 21:48:10.437
4a3ad1f2-92a9-4514-a476-d83ab615b57b	Operaciones	2026-02-04 21:48:10.438
a9f29178-a922-4a2d-85e2-8984582f4298	Proyectos	2026-02-04 21:48:10.441
b29c6c4d-6986-491c-a9a4-a5cb096f73ea	IT	2026-02-04 21:48:10.439
4282ca8a-3cdc-4852-afb3-3552d68691c7	Contabilidad	2026-02-04 21:48:10.44
838c0c38-1901-4a97-84de-24a3d9bd57c3	Inteligencia de negocios	2026-02-11 16:40:01.505
6144a0ae-75a8-4ea9-a852-04c8bbf344a3	Recursos Humanos	2026-02-11 16:43:46.385
679295b7-dc46-4657-915a-c77b6f3d9ace	Comercial	2026-02-11 16:43:46.385
096be3f6-90fa-4868-a107-acb5d4fe83e1	Solar	2026-02-11 16:43:46.385
5a8ffc69-a948-476b-8844-68e32a64629d	Gerencia	2026-02-11 16:43:46.385
3b454475-f1a0-4b12-bd1b-503a8cf45e3a	Area tecnica	2026-02-11 16:43:46.385
53fb8973-3376-4ec6-90d9-afa9d8ef508f	ISO	2026-02-11 16:43:46.385
aec857b8-bf0c-42e0-a220-ef5c1bd64242	SYSO	2026-02-11 16:43:46.385
96d3ecd8-e63c-4fdd-a7dd-e0695e9054de	Licitaciones	2026-02-11 16:43:46.385
\.


--
-- TOC entry 3949 (class 0 OID 33019)
-- Dependencies: 244
-- Data for Name: documento_adjunto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documento_adjunto (id, estado_producto_id, documento_requerido_id, estado, nombre_documento, nombre_archivo, url_archivo, tipo_archivo, tamano_bytes, subido_por, creado, no_aplica) FROM stdin;
c4130e6a-9c72-4f47-94b0-350b40f76608	4dbdb7d1-ee07-4e03-b0a4-5915dfc89e57	72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	Catalog-Overhead Conductors  Cables- Xinfeng.pdf	https://nx88862.your-storageshare.de/s/fTHKf23R6QLnXZ7	pdf	1751114	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 22:34:33.279	f
dfd05dad-4daa-420a-91b1-fb4d5d74e832	4dbdb7d1-ee07-4e03-b0a4-5915dfc89e57	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	ISO 14001-EN.jpg	https://nx88862.your-storageshare.de/s/AaBG9BnWmBrxZ7b	jpg	1066934	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 23:00:52.444	f
05634e3a-a6b9-4e7a-8263-18a796d93a55	0c49d0e3-2a41-4aa3-a3fb-9e274e2cd2eb	72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	Informes requeridos Coordinador de Operaciones.pdf	https://nx88862.your-storageshare.de/s/b8L9XtCZJ6CxpR3	pdf	4096478	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-03 21:46:21.445	f
49ce4783-c2d5-4f1c-ad45-8397ef7bb557	0c49d0e3-2a41-4aa3-a3fb-9e274e2cd2eb	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	Informes requeridos Coordinador de Operaciones.pdf	https://nx88862.your-storageshare.de/s/HK8nRmSpkiSgTXb	pdf	4096478	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-03 21:56:28.584	f
3ead1f1b-e0d4-4bf5-a701-bc76ba6729e6	2af0cb14-a909-4d80-b294-20580c936f03	72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	Orden de compra - P18982.pdf	https://nx88862.your-storageshare.de/s/fyCxGE7be7Gd7yH	pdf	322761	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 14:20:52.593	f
ce5bdc16-3c26-4a79-bb33-53d003578af8	2af0cb14-a909-4d80-b294-20580c936f03	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	LicitaciÃ³n - TE03373 (1).pdf	https://nx88862.your-storageshare.de/s/Db5wXiei9mwCbHd	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 16:35:03.689	f
03f038e3-8d8d-45e0-833a-330cb8db1358	2af0cb14-a909-4d80-b294-20580c936f03	ae665a0c-9f8c-400b-9145-bfc57ff61b1f	pagado	Comprobante de Pago	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/NCtNDmpMeeBMSKs	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 19:59:22.97	f
28f8d226-b6b0-4fc4-82c1-635531360b0d	2af0cb14-a909-4d80-b294-20580c936f03	f15857b7-46c6-4a2a-9f26-dfc3a9919db7	pagado	Evidencia de Pago Realizado	LicitaciÃ³n - TE03372.pdf	https://nx88862.your-storageshare.de/s/9t5iWef4bE26ETC	pdf	30134	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 19:59:29.827	f
f0140322-fc72-40a3-b318-766df6de9c80	42655082-0f93-427b-8611-9095c724a75c	72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/r9oRaE3H6TqoxQr	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:55:38.866	f
5aa6526a-5377-4603-8c6d-7b2d058fc398	42655082-0f93-427b-8611-9095c724a75c	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	LicitaciÃ³n - TE03373 (1).pdf	https://nx88862.your-storageshare.de/s/bmHEPNStnrXGoyR	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:55:48.038	f
5ccf2913-3c65-4e01-9916-5107a2f2e83a	42655082-0f93-427b-8611-9095c724a75c	ae665a0c-9f8c-400b-9145-bfc57ff61b1f	pagado	Comprobante de Pago	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/rZG6jCmT2HkAGrA	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:03.364	f
3b93989d-eacb-4b62-94e0-c71e42b52b9c	9cf04fb0-4312-4906-802f-a38b7cba391a	ae665a0c-9f8c-400b-9145-bfc57ff61b1f	pagado	Comprobante de Pago	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/7aJZq9GaYR5TZNK	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:04.87	f
d140cee0-d1c3-4005-8ab9-9f68b0177e9e	42655082-0f93-427b-8611-9095c724a75c	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/Xxe2ReLqN8JWBcH	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:13.876	f
d6a2cf33-ab16-4c0a-9b2c-ac9a8fc158d0	9cf04fb0-4312-4906-802f-a38b7cba391a	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/fFBJd7mGdBCTjtF	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:15.374	f
a66bfe4a-e4e5-4a69-aa27-6004337ad082	42655082-0f93-427b-8611-9095c724a75c	f15857b7-46c6-4a2a-9f26-dfc3a9919db7	pagado	Evidencia de Pago Realizado	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/xFQQ2axPkaRZsmR	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:26.912	f
334e8193-7826-476c-957f-e4e943ef9f7b	9cf04fb0-4312-4906-802f-a38b7cba391a	f15857b7-46c6-4a2a-9f26-dfc3a9919db7	pagado	Evidencia de Pago Realizado	LicitaciÃ³n - TE03373.pdf	https://nx88862.your-storageshare.de/s/2CaN3RsFnTGtrrG	pdf	28135	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:28.421	f
d435e51b-3dc2-49e9-8bd1-de3990d633c2	42655082-0f93-427b-8611-9095c724a75c	0b4a2897-e257-48f0-83aa-4d83ae01cc29	recibido	No aplica	NO_APLICA	NO_APLICA	\N	\N	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:39.808	t
cd25b4d6-41e3-4646-9b56-0ef142c4ac84	9cf04fb0-4312-4906-802f-a38b7cba391a	72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	LicitaciÃ³n - TE03372.pdf	https://nx88862.your-storageshare.de/s/axEoTWXTTECagfQ	pdf	30134	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:58:03.564	f
4127960d-b582-4be1-a6f0-ac3763c79fae	9cf04fb0-4312-4906-802f-a38b7cba391a	0b4a2897-e257-48f0-83aa-4d83ae01cc29	recibido	Evidencia de Recepción	Orden de compra - P18982.pdf	https://nx88862.your-storageshare.de/s/4cjjpMTm6czb6b4	pdf	322761	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 22:00:23.505	f
f2790228-08c5-4b2e-95ef-d35a5e4e44aa	d8e72e18-75ab-43f0-a091-11cd55099d08	72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	P19208 scan and signed.pdf	https://nx88862.your-storageshare.de/s/ZEm5kS2SL6SaeC4	pdf	444208	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:19:08.213	f
a784888c-ac25-45ea-ad96-ada3de1a3bd7	d8e72e18-75ab-43f0-a091-11cd55099d08	a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	P19208 - Solar pile drivers.pdf	https://nx88862.your-storageshare.de/s/rx2f7XiCGbLxp7n	pdf	1213284	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:19:30.51	f
ca175d53-0221-4bf1-8273-b9f10bbc366d	d8e72e18-75ab-43f0-a091-11cd55099d08	ae665a0c-9f8c-400b-9145-bfc57ff61b1f	pagado	Comprobante de Pago	P19208 - 30% downpayment.pdf	https://nx88862.your-storageshare.de/s/GxbybzGFPg9xXyF	pdf	428376	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:19:53.727	f
38c2a610-6949-4619-856d-c3c6cd1e2b58	d8e72e18-75ab-43f0-a091-11cd55099d08	f15857b7-46c6-4a2a-9f26-dfc3a9919db7	pagado	Evidencia de Pago Realizado	P19208 - 30% downpayment.pdf	https://nx88862.your-storageshare.de/s/WrEpGLBMPWbfgtQ	pdf	428376	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:21:54.414	f
7e4456f9-6e42-4d07-bc0f-3528a33def34	d8e72e18-75ab-43f0-a091-11cd55099d08	c00525bc-e693-4410-a3dd-366efd513fa0	aprobacionPlanos	No aplica	NO_APLICA	NO_APLICA	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:22:02.443	t
4d0e4db7-6b5e-4fee-bcd4-1a2910f06890	d8e72e18-75ab-43f0-a091-11cd55099d08	f6fc7185-6b7c-416e-a7ef-2c670fef71c9	primerSeguimiento	No aplica	NO_APLICA	NO_APLICA	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:32:52.3	t
143ac7e6-b488-41c9-8216-b48afb7ac11f	d8e72e18-75ab-43f0-a091-11cd55099d08	3c6a7ae3-9349-4f33-bf1a-ac00b20e0cb0	primerSeguimiento	No aplica	NO_APLICA	NO_APLICA	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:32:56.274	t
b6dcc926-c855-4675-b6ec-56f4c2918935	d8e72e18-75ab-43f0-a091-11cd55099d08	47236384-e94a-4e13-92c3-35ddcccedbd4	primerSeguimiento	Factura Proforma	New Proforma Invoice of R6 Solar Pile Driver  for Elmin.pdf	https://nx88862.your-storageshare.de/s/3GkWE2Gnw9b8YZZ	pdf	882969	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:33:49.674	f
\.


--
-- TOC entry 3948 (class 0 OID 33002)
-- Dependencies: 243
-- Data for Name: documento_requerido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documento_requerido (id, estado, nombre, descripcion, obligatorio, orden, activo, creado, actualizado) FROM stdin;
a197bb98-7fb7-4e93-a296-3474e19891a4	comprado	Orden de Compra	Documento de orden de compra emitida al proveedor	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
ae665a0c-9f8c-400b-9145-bfc57ff61b1f	pagado	Comprobante de Pago	Comprobante bancario o recibo de pago	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
3c6a7ae3-9349-4f33-bf1a-ac00b20e0cb0	primerSeguimiento	Ficha de Importación	Ficha técnica de importación del producto	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
f6fc7185-6b7c-416e-a7ef-2c670fef71c9	primerSeguimiento	Packing List	Lista de empaque del envío	t	2	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
47236384-e94a-4e13-92c3-35ddcccedbd4	primerSeguimiento	Factura Proforma	Factura proforma del proveedor	t	3	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
351bab4e-dd9a-4b77-b2f5-53486d8e112b	enFOB	Ficha de Importación	Ficha de importación actualizada con incoterms	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
f2e50071-18e9-4c47-ab32-2aec59dbe5a4	cotizacionFleteInternacional	Cotizaciones de Flete	Cotizaciones recibidas de empresas de flete	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
f32f8cd7-8dad-49c0-b762-61cfe7d5b127	cotizacionFleteInternacional	Comparativa de Precios	Tabla comparativa de precios de flete	t	2	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
4b7cdec2-8de8-41e8-8f19-013807b6ec94	conBL	Documento de BL	Bill of Lading original	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
7e2c91a7-ad7f-4fe2-a5a7-a3bed470c056	conBL	Póliza de Seguros	Documento de póliza de seguros de carga	t	2	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
495f97b3-01b6-4cdd-b5ce-455631ef68cd	conBL	Factura Comercial	Factura comercial definitiva	t	3	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
37784b23-dc39-4e94-9b08-5d2a73133232	segundoSeguimiento	ETD / ETA	Documento con fechas estimadas de salida y llegada	t	1	t	2026-02-19 10:02:14.489	2026-02-19 10:02:14.489
72059e80-260f-409c-b998-c7c76cebde4a	aprobacionCompra	Evidencia de Aprobación de Compra	Documento que evidencia la aprobación de la compra	t	1	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
f15857b7-46c6-4a2a-9f26-dfc3a9919db7	pagado	Evidencia de Pago Realizado	Comprobante o captura del pago efectuado	t	2	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
c00525bc-e693-4410-a3dd-366efd513fa0	aprobacionPlanos	Evidencia de Planos Aprobados	Documento que evidencia la aprobación de planos técnicos	t	1	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
1079a89f-a155-44d9-a0fe-bc26a646ac70	enFOB	Evidencia de Incoterms	Documento de confirmación de términos de entrega (FOB/CIF)	t	2	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
c4d8f6a3-11f4-44cb-9115-2e61f03800c8	segundoSeguimiento	Evidencia de Tránsito	Documento que evidencia el estado del envío en tránsito	t	2	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
ca675fd6-bf44-4160-8d8a-14058beb401b	enCIF	Documentos de Aduana	Documentación del proceso de aduana e internación	t	1	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
0b4a2897-e257-48f0-83aa-4d83ae01cc29	recibido	Evidencia de Recepción	Documento que evidencia la recepción del producto	t	1	t	2026-02-19 16:21:25.993	2026-02-19 16:21:25.993
\.


--
-- TOC entry 3941 (class 0 OID 17401)
-- Dependencies: 236
-- Data for Name: estado_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_producto (id, sku, descripcion, cotizado, "conDescuento", comprado, pagado, recibido, proveedor, responsable, cantidad, observaciones, creado, actualizado, "compraDetalleId", "compraId", "conBL", "cotizacionDetalleId", "cotizacionId", criticidad, "diasRetrasoActual", "enCIF", "enFOB", "estadoGeneral", "fechaComprado", "fechaConBL", "fechaConDescuento", "fechaCotizado", "fechaEnCIF", "fechaEnFOB", "fechaLimiteComprado", "fechaLimiteConBL", "fechaLimiteConDescuento", "fechaLimiteCotizado", "fechaLimiteEnCIF", "fechaLimiteEnFOB", "fechaLimitePagado", "fechaLimitePrimerSeguimiento", "fechaLimiteRecibido", "fechaLimiteSegundoSeguimiento", "fechaPagado", "fechaPrimerSeguimiento", "fechaRecibido", "fechaSegundoSeguimiento", "medioTransporte", "nivelCriticidad", "paisOrigenId", "precioTotal", "precioUnitario", "primerSeguimiento", "proyectoId", "segundoSeguimiento", aprobado_por_supervisor, fecha_aprobacion, fecha_rechazo, motivo_rechazo, rechazado, "evidenciaCotizado", "evidenciaConDescuento", "evidenciaComprado", "evidenciaPagado", "evidenciaPrimerSeguimiento", "evidenciaEnFOB", "evidenciaConBL", "evidenciaSegundoSeguimiento", "evidenciaEnCIF", "evidenciaRecibido", tipo_entrega, "cotizacionFleteInternacional", "evidenciaCotizacionFleteInternacional", "fechaCotizacionFleteInternacional", "fechaLimiteCotizacionFleteInternacional", "aprobacionCompra", "fechaAprobacionCompra", "fechaLimiteAprobacionCompra", "evidenciaAprobacionCompra", "aprobacionPlanos", "fechaAprobacionPlanos", "fechaLimiteAprobacionPlanos", "evidenciaAprobacionPlanos", "fechaRealAprobacionCompra", "fechaRealComprado", "fechaRealPagado", "fechaRealAprobacionPlanos", "fechaRealPrimerSeguimiento", "fechaRealEnFOB", "fechaRealCotizacionFleteInternacional", "fechaRealConBL", "fechaRealSegundoSeguimiento", "fechaRealEnCIF", "fechaRealRecibido", "noAplicaDocumentosAprobacionCompra", "noAplicaDocumentosComprado", "noAplicaDocumentosPagado", "noAplicaDocumentosAprobacionPlanos", "noAplicaDocumentosPrimerSeguimiento", "noAplicaDocumentosEnFOB", "noAplicaDocumentosCotizacionFleteInternacional", "noAplicaDocumentosConBL", "noAplicaDocumentosSegundoSeguimiento", "noAplicaDocumentosEnCIF", "noAplicaDocumentosRecibido", aprobado_compra, aprobado_compra_por_id, fecha_aprobado_compra, responsable_seguimiento_id) FROM stdin;
0c49d0e3-2a41-4aa3-a3fb-9e274e2cd2eb	PROD-0006	lapto dell i7	t	t	t	f	f	Oficinas y Más	\N	1	\N	2026-03-03 21:42:00.026	2026-03-03 21:57:40.511	\N	\N	f	c64351dd-998f-486a-8341-50b2b773922a	d6cf00c6-e39e-48bb-a984-601d348e0d0f	3	0	f	f	warn	2026-03-03 21:56:46.772	\N	2026-03-03 21:42:32.85	2026-03-03 21:35:36.732	\N	\N	2026-03-08 21:35:36.732	2026-03-18 21:35:36.732	2026-03-05 21:35:36.732	2026-03-03 21:35:36.732	2026-03-20 21:35:36.732	2026-03-12 21:35:36.732	2026-03-10 21:35:36.732	2026-03-11 21:35:36.732	2026-03-21 21:35:36.732	2026-03-19 21:35:36.732	\N	\N	\N	\N	TERRESTRE	BAJO	53b360e4-f5fe-4f27-beba-90bc79390f07	519.9900	519.9900	f	25599a12-b292-4985-9520-a6c4520ad9e0	f	t	2026-03-03 21:42:32.85	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-15 21:35:36.732	t	2026-03-03 21:47:57.583	2026-03-07 21:35:36.732	\N	f	\N	\N	\N	2026-03-07 21:35:36.732	2026-03-08 21:35:36.732	2026-03-20 06:00:00	\N	2026-03-11 21:35:36.732	2026-03-12 21:35:36.732	2026-03-15 21:35:36.732	2026-03-18 21:35:36.732	2026-03-19 21:35:36.732	2026-03-20 21:35:36.732	2026-03-21 21:35:36.732	f	f	f	f	f	f	f	f	f	f	f	t	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-03 21:44:13.71	7b16da9d-1758-4bf9-9960-1ac345362ded
530619f9-dc28-4725-899d-0a5f7d7dca2e	PROD-0004	Conos de alivio de 34.5kV	t	t	f	f	f	Electromotores de SA	\N	13	\N	2026-02-25 22:57:27.314	2026-02-25 23:01:00.407	\N	\N	f	a7aef309-1ec5-49b3-a6e2-079cbcb60268	ad15394f-efd4-43fc-a50b-6cb2f5b67bba	5	0	f	f	warn	\N	\N	2026-02-25 22:58:33.998	2026-02-25 22:55:27.805	\N	\N	2026-03-02 22:55:27.805	2026-03-14 22:55:27.805	2026-02-27 22:55:27.805	2026-02-25 22:55:27.805	\N	\N	2026-03-03 22:55:27.805	2026-03-08 22:55:27.805	2026-03-15 22:55:27.805	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	2600.0000	200.0000	f	05190288-ad71-4d18-9c73-8e246f78f912	f	t	2026-02-25 22:58:33.998	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-11 22:55:27.805	f	\N	2026-03-01 22:55:27.805	\N	f	\N	2026-03-06 22:55:27.805	\N	2026-03-01 22:55:27.805	2026-03-02 22:55:27.805	2026-03-03 22:55:27.805	2026-03-06 22:55:27.805	2026-03-08 22:55:27.805	\N	2026-03-11 22:55:27.805	2026-03-14 22:55:27.805	\N	\N	2026-03-15 22:55:27.805	f	f	f	f	f	f	f	f	f	f	f	t	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 23:01:00.406	\N
38b60a84-a279-483c-a01d-82a1b57628d4	PROD-0003	Mouse ASUS	t	t	f	f	f	Electromotores de SA	\N	1	\N	2026-02-25 22:48:46.292	2026-03-04 16:17:47.188	\N	\N	f	40ce0780-5256-4fdd-b557-499921d9a030	14fbd91c-d786-4a5a-bb0f-6543f43632b3	5	0	f	f	warn	\N	\N	2026-02-25 22:50:06.058	2026-02-25 22:41:00.761	\N	\N	2026-03-02 22:41:00.761	2026-03-18 22:41:00.761	2026-02-27 22:41:00.761	2026-02-25 22:41:00.761	\N	\N	2026-03-07 22:41:00.761	2026-03-12 22:41:00.761	2026-03-21 22:41:00.761	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	50.0000	50.0000	f	2f179a62-1e2c-43aa-9877-70b9e2d4cc80	f	t	2026-02-25 22:50:06.058	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-15 22:41:00.761	f	\N	2026-03-01 22:41:00.761	\N	f	\N	2026-03-10 22:41:00.761	\N	2026-03-01 22:41:00.761	2026-03-02 22:41:00.761	2026-03-07 22:41:00.761	2026-03-10 22:41:00.761	2026-03-12 22:41:00.761	\N	2026-03-15 22:41:00.761	2026-03-18 22:41:00.761	\N	\N	2026-03-21 22:41:00.761	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
4dbdb7d1-ee07-4e03-b0a4-5915dfc89e57	PROD-0001	BATERIA DE PLOMO-ACIDO DJ150(2V150Ah) LEOCH	t	t	t	f	f	Importadora Global	\N	60	\N	2026-02-25 22:31:26.446	2026-02-25 23:01:47.82	\N	\N	f	d21715ff-6f2a-4808-a12e-05ea714f4e31	ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	3	0	f	f	warn	2026-02-25 23:01:27.641	\N	2026-02-25 22:33:07.065	2026-02-25 22:20:56.971	\N	\N	2026-06-06 22:20:56.971	2026-09-29 22:20:56.971	2026-03-03 22:20:56.971	2026-02-25 22:20:56.971	2026-11-28 22:20:56.971	2026-09-16 22:20:56.971	2026-06-08 22:20:56.971	2026-07-28 22:20:56.971	2026-12-05 22:20:56.971	2026-11-18 22:20:56.971	\N	\N	\N	\N	MARITIMO	BAJO	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	9000.0000	150.0000	f	c7c317e3-24b7-402b-ac55-8b23a72dc7cc	f	t	2026-02-25 22:33:07.065	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-09-19 22:20:56.971	t	2026-02-25 22:35:54.002	2026-03-08 22:20:56.971	\N	f	\N	2026-06-18 22:20:56.971	\N	2026-03-08 22:20:56.971	2026-06-06 22:20:56.971	2026-06-18 06:00:00	2026-06-18 22:20:56.971	2026-07-28 22:20:56.971	2026-09-16 22:20:56.971	2026-09-19 22:20:56.971	2026-09-29 22:20:56.971	2026-11-18 22:20:56.971	2026-11-28 22:20:56.971	2026-12-05 22:20:56.971	f	f	f	f	f	f	f	f	f	f	f	t	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 22:35:40.142	2d791fa1-940c-45bf-a980-1499bbbe1b2a
6c60ce8e-d494-41a9-9503-fe9cac870bac	PROD-0002	Laptop ASUS 1	t	t	f	f	f	Electromotores de SA	\N	1	\N	2026-02-25 22:45:45.278	2026-02-25 22:51:03.563	\N	\N	f	67e856a3-57bb-402c-8617-9aeb433f59fe	14fbd91c-d786-4a5a-bb0f-6543f43632b3	5	0	f	f	warn	\N	\N	2026-02-25 22:49:46.397	2026-02-25 22:41:00.761	\N	\N	2026-04-06 22:41:00.761	2026-04-20 22:41:00.761	2026-02-28 22:41:00.761	2026-02-25 22:41:00.761	2026-06-10 22:41:00.761	2026-04-15 22:41:00.761	2026-04-11 22:41:00.761	2026-04-14 22:41:00.761	2026-06-17 22:41:00.761	2026-06-03 22:41:00.761	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	100.0000	100.0000	f	2f179a62-1e2c-43aa-9877-70b9e2d4cc80	f	t	2026-02-25 22:49:46.397	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-18 22:41:00.761	f	\N	2026-03-07 22:41:00.761	\N	f	\N	2026-04-12 22:41:00.761	\N	2026-03-07 22:41:00.761	2026-04-06 22:41:00.761	2026-04-11 22:41:00.761	2026-04-12 22:41:00.761	2026-04-14 22:41:00.761	2026-04-15 22:41:00.761	2026-04-18 22:41:00.761	2026-04-20 22:41:00.761	2026-06-03 22:41:00.761	2026-06-10 22:41:00.761	2026-06-17 22:41:00.761	f	f	f	f	f	f	f	f	f	f	f	t	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 22:51:03.562	7b16da9d-1758-4bf9-9960-1ac345362ded
2af0cb14-a909-4d80-b294-20580c936f03	PROD-0021	valvula	t	t	t	t	f	Importadora Global	\N	1	\N	2026-03-12 14:19:24.236	2026-03-12 19:59:55.617	\N	\N	f	cee25caa-4eb9-4dc8-aa64-cc7cf0ebdc6e	a1acfcd8-3190-4be3-8d48-05218137a40d	3	0	f	f	warn	2026-03-12 16:35:18.832	\N	2026-03-12 14:20:01.917	2026-03-12 14:15:53.51	\N	\N	2026-03-17 14:15:53.51	2026-04-01 14:15:53.51	2026-03-14 14:15:53.51	2026-03-12 14:15:53.51	\N	\N	2026-03-22 14:15:53.51	2026-03-27 14:15:53.51	2026-04-06 14:15:53.51	\N	2026-03-12 19:59:55.617	\N	\N	\N	TERRESTRE	BAJO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	1000.0000	1000.0000	f	1754454b-a699-4263-81b2-49788531f995	f	t	2026-03-12 14:20:01.917	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 14:15:53.51	t	2026-03-12 14:21:18.123	2026-03-16 14:15:53.51	\N	f	\N	2026-03-25 14:15:53.51	\N	2026-03-16 14:15:53.51	2026-03-17 14:15:53.51	2026-03-22 14:15:53.51	2026-03-25 14:15:53.51	2026-03-27 14:15:53.51	\N	2026-03-30 14:15:53.51	2026-04-01 14:15:53.51	\N	\N	2026-04-06 14:15:53.51	f	f	f	f	f	f	f	f	f	f	f	t	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 14:21:08.597	\N
0c947fb7-4293-4202-8e7a-b37739c10823	PROD-0054	tripolares horizontales mecánicas para operar desde piso Aisladores de Polímero Menciona que le coticemos 2 sin loadbreak y una con loadbreak	f	f	f	f	f	\N	\N	2	\N	2026-03-24 15:06:44.884	2026-03-25 19:56:52.883	\N	\N	f	b49fe24d-39ee-4969-b23b-751621e9db66	c02d91cc-736e-42ff-ba64-5418d36462d4	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	99db1c0d-c9b9-42a3-951f-7184162d1c8d	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
f7f088d4-687d-42fb-83dc-7544f7d552f4	PROD-0007	PROTECCIÓN DE ALIMENTADOR 751 # 99 AR	t	f	f	f	f	\N	\N	1	\N	2026-03-12 14:53:01.779	2026-03-12 14:55:49.052	\N	\N	f	b797e76d-cd56-4756-8f1a-ed247f0bbe9e	769ed2eb-ae15-40d4-8318-1c81c4556891	5	0	f	f	warn	\N	\N	\N	2026-03-04 15:49:53.304	\N	\N	2026-03-09 15:49:53.304	2026-04-02 15:49:53.304	2026-03-06 15:49:53.304	2026-03-04 15:49:53.304	2026-04-11 15:49:53.304	2026-03-27 15:49:53.304	2026-03-14 15:49:53.304	2026-03-19 15:49:53.304	2026-04-16 15:49:53.304	2026-04-06 15:49:53.304	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	85408720-7f79-403e-889e-7a98fb0c4fab	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 15:49:53.304	f	\N	2026-03-08 15:49:53.304	\N	f	\N	2026-03-17 15:49:53.304	\N	2026-03-08 15:49:53.304	2026-03-09 15:49:53.304	2026-03-14 15:49:53.304	2026-03-17 15:49:53.304	2026-03-19 15:49:53.304	2026-03-27 15:49:53.304	2026-03-30 15:49:53.304	2026-04-02 15:49:53.304	2026-04-06 15:49:53.304	2026-04-11 15:49:53.304	2026-04-16 15:49:53.304	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
b1923314-0dc9-48d6-9b1d-6fb8327eb350	PROD-0008	RELÉ DE PROTECCIÓN DE TRANSFORMADOR 787#6JGB	t	f	f	f	f	\N	\N	1	\N	2026-03-12 14:53:16.006	2026-03-12 14:55:49.052	\N	\N	f	e6c4cd1d-a1c6-4c7a-8158-3c641aa7c5c7	769ed2eb-ae15-40d4-8318-1c81c4556891	5	0	f	f	warn	\N	\N	\N	2026-03-04 15:49:53.304	\N	\N	2026-03-09 15:49:53.304	2026-03-28 15:49:53.304	2026-03-06 15:49:53.304	2026-03-04 15:49:53.304	2026-04-05 15:49:53.304	2026-03-23 15:49:53.304	2026-03-14 15:49:53.304	2026-03-19 15:49:53.304	2026-04-10 15:49:53.304	2026-04-01 15:49:53.304	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	85408720-7f79-403e-889e-7a98fb0c4fab	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-26 15:49:53.304	f	\N	2026-03-08 15:49:53.304	\N	f	\N	2026-03-17 15:49:53.304	\N	2026-03-08 15:49:53.304	2026-03-09 15:49:53.304	2026-03-14 15:49:53.304	2026-03-17 15:49:53.304	2026-03-19 15:49:53.304	2026-03-23 15:49:53.304	2026-03-26 15:49:53.304	2026-03-28 15:49:53.304	2026-04-01 15:49:53.304	2026-04-05 15:49:53.304	2026-04-10 15:49:53.304	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
9b719d6d-3b33-41cb-89bd-9b2a39ab1b72	PROD-0059	Poste Metalico Autosoportado de 30 metros Tipo 2SVII_0-4	f	f	f	f	f	\N	\N	60	\N	2026-03-26 15:31:23.427	2026-03-26 15:31:27.486	\N	\N	f	c0a3513e-2a35-4918-ac75-e9bfc7b64b7f	aa281aa4-c343-40bf-8c54-9d5b702466d3	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	164226ad-24fa-4b03-890e-9bada1c0de70	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
1ff6aba4-662a-4b70-b14b-81a6f9555e1a	PROD-0060	Poste Metalico Autosoportado de 50 metros Tipo AA+2SVII_0-2	f	f	f	f	f	\N	\N	2	\N	2026-03-26 15:31:23.435	2026-03-26 15:31:27.486	\N	\N	f	d4e8f3be-30ef-4388-8ef8-ebf830e37d45	aa281aa4-c343-40bf-8c54-9d5b702466d3	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	164226ad-24fa-4b03-890e-9bada1c0de70	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
280bc13a-8b96-4983-972d-64555601621c	PROD-0061	Opcional Costo de Pruebas Destructivas	f	f	f	f	f	\N	\N	1	\N	2026-03-26 15:31:23.443	2026-03-26 15:31:27.486	\N	\N	f	221ba3fd-6e3c-4a02-8649-c09c172d36a5	aa281aa4-c343-40bf-8c54-9d5b702466d3	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	164226ad-24fa-4b03-890e-9bada1c0de70	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
bed9be28-af10-4a3e-bd3c-e1b8f6734bb7	PROD-0058	Poste Metalico Autosoportado de 30 metros Tipo RVDC180_0-90	f	f	f	f	f	\N	\N	2	\N	2026-03-26 15:31:23.418	2026-03-26 15:31:27.486	\N	\N	f	f9487d49-9da4-47c0-b209-ea790434da90	aa281aa4-c343-40bf-8c54-9d5b702466d3	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	164226ad-24fa-4b03-890e-9bada1c0de70	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
292112d6-8906-4a37-b15a-fd9f0389de98	PROD-0009	SWICH ETHERNET ADMINISTRABLE DE 24 PUERTOS 2730M#7M6C	t	f	f	f	f	\N	\N	1	\N	2026-03-12 14:53:22.259	2026-03-12 14:55:49.052	\N	\N	f	d3f01218-1070-4ed1-b3a1-e9e7ebfcbcf3	769ed2eb-ae15-40d4-8318-1c81c4556891	5	0	f	f	warn	\N	\N	\N	2026-03-04 15:49:53.304	\N	\N	2026-03-09 15:49:53.304	2026-03-29 15:49:53.304	2026-03-06 15:49:53.304	2026-03-04 15:49:53.304	2026-04-07 15:49:53.304	2026-03-24 15:49:53.304	2026-03-14 15:49:53.304	2026-03-19 15:49:53.304	2026-04-12 15:49:53.304	2026-04-03 15:49:53.304	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	85408720-7f79-403e-889e-7a98fb0c4fab	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-27 15:49:53.304	f	\N	2026-03-08 15:49:53.304	\N	f	\N	2026-03-17 15:49:53.304	\N	2026-03-08 15:49:53.304	2026-03-09 15:49:53.304	2026-03-14 15:49:53.304	2026-03-17 15:49:53.304	2026-03-19 15:49:53.304	2026-03-24 15:49:53.304	2026-03-27 15:49:53.304	2026-03-29 15:49:53.304	2026-04-03 15:49:53.304	2026-04-07 15:49:53.304	2026-04-12 15:49:53.304	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
18ca3b7a-72a4-40a2-ab7e-7f7f5b680d39	PROD-0010	MODULO AXION 2240#392L	t	f	f	f	f	\N	\N	1	\N	2026-03-12 14:53:28.183	2026-03-12 14:55:49.052	\N	\N	f	f9b1b4b3-5dd6-4809-9032-eb37d265112e	769ed2eb-ae15-40d4-8318-1c81c4556891	5	0	f	f	warn	\N	\N	\N	2026-03-04 15:49:53.304	\N	\N	2026-03-09 15:49:53.304	2026-05-30 15:49:53.304	2026-03-06 15:49:53.304	2026-03-04 15:49:53.304	2026-06-07 15:49:53.304	2026-05-25 15:49:53.304	2026-03-11 15:49:53.304	2026-03-16 15:49:53.304	2026-06-15 15:49:53.304	2026-06-03 15:49:53.304	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	85408720-7f79-403e-889e-7a98fb0c4fab	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-05-28 15:49:53.304	f	\N	2026-03-08 15:49:53.304	\N	f	\N	2026-03-14 15:49:53.304	\N	2026-03-08 15:49:53.304	2026-03-09 15:49:53.304	2026-03-11 15:49:53.304	2026-03-14 15:49:53.304	2026-03-16 15:49:53.304	2026-05-25 15:49:53.304	2026-05-28 15:49:53.304	2026-05-30 15:49:53.304	2026-06-03 15:49:53.304	2026-06-07 15:49:53.304	2026-06-15 15:49:53.304	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
bbbfdd79-500f-47a4-a512-3641049f6ae1	PROD-0011	CONTROLADOR SEL-2424#Q4L8	t	f	f	f	f	\N	\N	1	\N	2026-03-12 14:53:34.537	2026-03-12 14:55:49.052	\N	\N	f	10b0db6a-55cc-4345-b4be-4f32140308ac	769ed2eb-ae15-40d4-8318-1c81c4556891	5	0	f	f	warn	\N	\N	\N	2026-03-04 15:49:53.304	\N	\N	2026-03-09 15:49:53.304	2026-03-24 15:49:53.304	2026-03-06 15:49:53.304	2026-03-04 15:49:53.304	\N	\N	2026-03-14 15:49:53.304	2026-03-19 15:49:53.304	2026-03-27 15:49:53.304	\N	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	85408720-7f79-403e-889e-7a98fb0c4fab	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-22 15:49:53.304	f	\N	2026-03-08 15:49:53.304	\N	f	\N	2026-03-17 15:49:53.304	\N	2026-03-08 15:49:53.304	2026-03-09 15:49:53.304	2026-03-14 15:49:53.304	2026-03-17 15:49:53.304	2026-03-19 15:49:53.304	\N	2026-03-22 15:49:53.304	2026-03-24 15:49:53.304	\N	\N	2026-03-27 15:49:53.304	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
2c235361-be58-4bf4-ad7c-7868c7d2f53e	PROD-0013	Reloj satelital SEL2404	t	f	f	f	f	\N	\N	1	\N	2026-03-12 15:05:43.72	2026-03-12 15:05:49.288	\N	\N	f	05fba7ef-f5d5-4310-b4e5-ee597b69790f	87b5ac3a-1c07-49c7-a3a7-ccb9be32fb00	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:47:36.574	\N	\N	2026-03-20 13:47:36.574	2026-04-22 13:47:36.574	2026-03-17 13:47:36.574	2026-03-12 13:47:36.574	2026-05-06 13:47:36.574	2026-04-10 13:47:36.574	2026-03-30 13:47:36.574	2026-04-04 13:47:36.574	2026-05-14 13:47:36.574	2026-04-29 13:47:36.574	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	a66ce85d-f881-4e24-8078-5a5b1dddacfc	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-16 13:47:36.574	f	\N	2026-03-19 13:47:36.574	\N	f	\N	2026-04-02 13:47:36.574	\N	2026-03-19 13:47:36.574	2026-03-20 13:47:36.574	2026-03-30 13:47:36.574	2026-04-02 13:47:36.574	2026-04-04 13:47:36.574	2026-04-10 13:47:36.574	2026-04-16 13:47:36.574	2026-04-22 13:47:36.574	2026-04-29 13:47:36.574	2026-05-06 13:47:36.574	2026-05-14 13:47:36.574	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
25f302da-8089-4a80-99fc-72046dd55c7b	PROD-0015	RELEVADOR 751	t	f	f	f	f	\N	\N	1	\N	2026-03-12 15:07:53.455	2026-03-16 22:42:38.773	\N	\N	f	a3699e21-0fd8-4f75-ad67-c7da69abae92	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:53:03.785	\N	\N	2026-04-17 13:53:03.785	2026-06-28 13:53:03.785	2026-03-24 13:53:03.785	2026-03-12 13:53:03.785	2026-07-22 13:53:03.785	2026-06-04 13:53:03.785	2026-04-29 13:53:03.785	2026-05-23 13:53:03.785	2026-08-03 13:53:03.785	2026-07-10 13:53:03.785	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	5bf4a9d7-8049-4625-b4df-c65840d32c04	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-06-16 13:53:03.785	f	\N	2026-04-05 13:53:03.785	\N	f	\N	2026-05-11 13:53:03.785	\N	2026-04-05 13:53:03.785	2026-04-17 13:53:03.785	2026-04-29 13:53:03.785	2026-05-11 13:53:03.785	2026-05-23 13:53:03.785	2026-06-04 13:53:03.785	2026-06-16 13:53:03.785	2026-06-28 13:53:03.785	2026-07-10 13:53:03.785	2026-07-22 13:53:03.785	2026-08-03 13:53:03.785	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
86746bd2-c023-4b62-bf56-5c47143e0f20	PROD-0025	termo	t	t	f	f	f	Proveedor de prueba	\N	1	\N	2026-03-12 20:07:36.789	2026-03-12 20:08:50.689	\N	\N	f	8563e572-2757-49ac-979e-224518aa3c58	99dd13c7-fb3f-4d59-beb2-b9af97db49c2	5	0	f	f	warn	\N	\N	2026-03-12 20:08:04.037	2026-03-12 20:06:51.515	\N	\N	2026-03-17 20:06:51.515	\N	2026-03-14 20:06:51.515	2026-03-12 20:06:51.515	\N	\N	2026-03-22 20:06:51.515	\N	2026-03-25 20:06:51.515	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	53b360e4-f5fe-4f27-beba-90bc79390f07	1500.0000	1500.0000	f	d06d22de-2c4e-4a2c-bc54-af35dd5f00d9	f	t	2026-03-12 20:08:04.037	2026-03-12 20:08:50.688	esta	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	2026-03-16 20:06:51.515	\N	f	\N	\N	\N	2026-03-16 20:06:51.515	2026-03-17 20:06:51.515	2026-03-22 20:06:51.515	\N	\N	\N	\N	\N	\N	\N	2026-03-25 20:06:51.515	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
bffac1d6-e589-4997-bd74-ece2d66e71f2	PROD-0057	Poste Metalico Autosoportado de 33 metros Tipo RVDC180_0-45	f	f	f	f	f	\N	\N	20	\N	2026-03-26 15:31:23.408	2026-03-26 15:31:27.486	\N	\N	f	bd70600d-cefe-497c-9efe-d4ba45e6eea0	aa281aa4-c343-40bf-8c54-9d5b702466d3	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	164226ad-24fa-4b03-890e-9bada1c0de70	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
42655082-0f93-427b-8611-9095c724a75c	PROD-0024	boquitas del salon	t	t	t	t	t	Oficinas y Más	\N	1	\N	2026-03-12 21:54:41.33	2026-03-12 21:59:19.128	\N	\N	f	dfb92717-441c-4251-8e47-0d6c398f7c30	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	3	0	f	f	warn	2026-03-12 21:59:13.792	\N	2026-03-12 21:55:00.477	2026-03-12 19:43:41.656	\N	\N	2026-03-17 19:43:41.656	\N	2026-03-14 19:43:41.656	2026-03-12 19:43:41.656	\N	\N	2026-03-22 19:43:41.656	\N	2026-03-25 19:43:41.656	\N	2026-03-12 21:59:16.478	\N	2026-03-12 21:59:19.128	\N	TERRESTRE	BAJO	53b360e4-f5fe-4f27-beba-90bc79390f07	150.0000	150.0000	f	d06d22de-2c4e-4a2c-bc54-af35dd5f00d9	f	t	2026-03-12 21:55:00.477	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	t	2026-03-12 21:59:10.984	2026-03-16 19:43:41.656	\N	f	\N	\N	\N	2026-03-16 19:43:41.656	2026-03-17 19:43:41.656	2026-03-22 19:43:41.656	\N	\N	\N	\N	\N	\N	\N	2026-03-25 19:43:41.656	f	f	f	f	f	f	f	f	f	f	f	t	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:58:25.673	\N
9cf04fb0-4312-4906-802f-a38b7cba391a	PROD-0023	salon de evento	t	t	t	t	t	Proveedor de prueba	\N	1	\N	2026-03-12 21:54:37.466	2026-03-12 22:00:35.235	\N	\N	f	d0fef1fb-43ca-4358-addd-5cdf815b1b33	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	3	0	f	f	warn	2026-03-12 21:58:50.823	\N	2026-03-12 21:54:58.319	2026-03-12 19:43:41.656	\N	\N	2026-03-17 19:43:41.656	\N	2026-03-14 19:43:41.656	2026-03-12 19:43:41.656	\N	\N	2026-03-22 19:43:41.656	\N	2026-03-25 19:43:41.656	\N	2026-03-12 21:58:53.662	\N	2026-03-12 22:00:35.235	\N	TERRESTRE	BAJO	53b360e4-f5fe-4f27-beba-90bc79390f07	1500.0000	1500.0000	f	d06d22de-2c4e-4a2c-bc54-af35dd5f00d9	f	t	2026-03-12 21:54:58.319	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	t	2026-03-12 21:58:48.477	2026-03-16 19:43:41.656	\N	f	\N	\N	\N	2026-03-16 19:43:41.656	2026-03-17 19:43:41.656	2026-03-22 19:43:41.656	\N	\N	\N	\N	\N	\N	\N	2026-03-25 19:43:41.656	f	f	f	f	f	f	f	f	f	f	f	t	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:58:28.743	\N
37618072-22c9-46e9-9af9-35ceeb8c64b2	PROD-0017	SWICHT ETHERNET MANAGED 24 PTO SEL 2730M	t	f	f	f	f	\N	\N	1	\N	2026-03-16 22:43:00.875	2026-03-16 22:43:00.883	\N	\N	f	a80cf4b2-47bb-4aaa-b684-7863f973e73e	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:53:03.785	\N	\N	2026-03-17 13:53:03.785	2026-04-01 13:53:03.785	2026-03-14 13:53:03.785	2026-03-12 13:53:03.785	\N	\N	2026-03-22 13:53:03.785	2026-03-27 13:53:03.785	2026-04-06 13:53:03.785	\N	\N	\N	\N	\N	AEREO	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	5bf4a9d7-8049-4625-b4df-c65840d32c04	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 13:53:03.785	f	\N	2026-03-16 13:53:03.785	\N	f	\N	2026-03-25 13:53:03.785	\N	2026-03-16 13:53:03.785	2026-03-17 13:53:03.785	2026-03-22 13:53:03.785	2026-03-25 13:53:03.785	2026-03-27 13:53:03.785	\N	2026-03-30 13:53:03.785	2026-04-01 13:53:03.785	\N	\N	2026-04-06 13:53:03.785	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
2f43a64d-c077-4dc7-8363-6983e7239d69	PROD-0022	reclosers // RESTAURADOR TRIFASICO 34.5kV (KIT)	t	f	f	f	f	\N	\N	2	\N	2026-03-16 21:46:39.496	2026-03-16 21:56:46.809	\N	\N	f	326a8dfd-b889-4a8a-b31a-d8b131e2c681	8a81c470-8d75-42b1-b969-7f76c5dbceb9	5	0	f	f	warn	\N	\N	\N	2026-03-12 14:28:10.076	\N	\N	2026-03-17 14:28:10.076	2026-04-01 14:28:10.076	2026-03-14 14:28:10.076	2026-03-12 14:28:10.076	\N	\N	2026-03-22 14:28:10.076	2026-03-27 14:28:10.076	2026-04-06 14:28:10.076	\N	\N	\N	\N	\N	MARITIMO	MEDIO	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	\N	\N	f	6be53479-068e-47c2-9cdb-69d45db8e90a	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 14:28:10.076	f	\N	2026-03-16 14:28:10.076	\N	f	\N	2026-03-25 14:28:10.076	\N	2026-03-16 14:28:10.076	2026-03-17 14:28:10.076	2026-03-22 14:28:10.076	2026-03-25 14:28:10.076	2026-03-27 14:28:10.076	\N	2026-03-30 14:28:10.076	2026-04-01 14:28:10.076	\N	\N	2026-04-06 14:28:10.076	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
c6c99891-2712-4814-950c-b343bde4ecbb	PROD-0031	BATERIAS	t	t	f	f	f	Importadora Global	\N	10	\N	2026-03-16 21:27:43.477	2026-03-16 21:29:48.98	\N	\N	f	c34c1b38-0a10-41ae-a155-8c10e65ab720	ed0a7109-b62b-4ba9-ac28-5b2b8127c0de	5	0	f	f	warn	\N	\N	2026-03-16 21:28:30.468	2026-03-16 20:02:48.197	\N	\N	2026-03-25 20:02:48.197	2026-04-22 20:02:48.197	2026-03-21 20:02:48.197	2026-03-16 20:02:48.197	\N	2026-04-13 20:02:48.197	2026-03-26 20:02:48.197	2026-04-12 20:02:48.197	2026-04-29 20:02:48.197	2026-04-24 20:02:48.197	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	15000.0000	1500.0000	f	777cfed2-254c-40f5-90eb-94145d2fbfaf	f	t	2026-03-16 21:28:30.468	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-18 20:02:48.197	f	\N	2026-03-23 20:02:48.197	\N	f	\N	2026-04-10 20:02:48.197	\N	2026-03-23 20:02:48.197	2026-03-25 20:02:48.197	2026-03-26 20:02:48.197	2026-04-11 06:00:00	2026-04-12 20:02:48.197	2026-04-13 20:02:48.197	2026-04-18 20:02:48.197	2026-04-22 20:02:48.197	2026-04-24 20:02:48.197	\N	2026-04-29 20:02:48.197	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
eff21c43-6a8d-4470-8c2e-80b9e1d4de85	PROD-0045	cable de control 12 x 20	f	f	f	f	f	\N	\N	20	\N	2026-03-23 17:54:14.128	2026-03-25 20:09:12.481	\N	\N	f	3f218660-f5e9-44dc-91e0-c648bab79bf0	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
dd81913f-65cd-45b4-bf7a-79acc1f0e246	PROD-0016	RELE DIFERENCIAL SEL-787	t	f	f	f	f	\N	\N	1	\N	2026-03-16 22:42:44.699	2026-03-16 22:42:54.736	\N	\N	f	32d776b1-2990-4aa0-90b0-e3efeca18c44	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:53:03.785	\N	\N	2026-03-17 13:53:03.785	2026-04-01 13:53:03.785	2026-03-14 13:53:03.785	2026-03-12 13:53:03.785	\N	\N	2026-03-22 13:53:03.785	2026-03-27 13:53:03.785	2026-04-06 13:53:03.785	\N	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	5bf4a9d7-8049-4625-b4df-c65840d32c04	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 13:53:03.785	f	\N	2026-03-16 13:53:03.785	\N	f	\N	2026-03-25 13:53:03.785	\N	2026-03-16 13:53:03.785	2026-03-17 13:53:03.785	2026-03-22 13:53:03.785	2026-03-25 13:53:03.785	2026-03-27 13:53:03.785	\N	2026-03-30 13:53:03.785	2026-04-01 13:53:03.785	\N	\N	2026-04-06 13:53:03.785	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
230ffe56-7048-4c6c-82c8-6ad1dca23567	PROD-0018	CONTROLADOR SEL-2240	t	f	f	f	f	\N	\N	1	\N	2026-03-16 22:43:05.694	2026-03-16 22:43:05.701	\N	\N	f	da730f73-55d8-430e-98b8-170a100ee6f5	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:53:03.785	\N	\N	2026-03-17 13:53:03.785	2026-04-01 13:53:03.785	2026-03-14 13:53:03.785	2026-03-12 13:53:03.785	\N	\N	2026-03-22 13:53:03.785	2026-03-27 13:53:03.785	2026-04-06 13:53:03.785	\N	\N	\N	\N	\N	AEREO	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	5bf4a9d7-8049-4625-b4df-c65840d32c04	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 13:53:03.785	f	\N	2026-03-16 13:53:03.785	\N	f	\N	2026-03-25 13:53:03.785	\N	2026-03-16 13:53:03.785	2026-03-17 13:53:03.785	2026-03-22 13:53:03.785	2026-03-25 13:53:03.785	2026-03-27 13:53:03.785	\N	2026-03-30 13:53:03.785	2026-04-01 13:53:03.785	\N	\N	2026-04-06 13:53:03.785	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
e5e041e9-0e65-43cb-856f-37d4f505b3af	PROD-0019	CONTROLADOR SEL-2414 RELE 90 (RELE 90 - 2414 #Q4LB)	t	f	f	f	f	\N	\N	1	\N	2026-03-16 22:43:09.798	2026-03-16 22:43:09.806	\N	\N	f	2a94072f-444b-4951-b692-e809bd109493	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:53:03.785	\N	\N	2026-03-17 13:53:03.785	2026-04-01 13:53:03.785	2026-03-14 13:53:03.785	2026-03-12 13:53:03.785	\N	\N	2026-03-22 13:53:03.785	2026-03-27 13:53:03.785	2026-04-06 13:53:03.785	\N	\N	\N	\N	\N	AEREO	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	5bf4a9d7-8049-4625-b4df-c65840d32c04	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-30 13:53:03.785	f	\N	2026-03-16 13:53:03.785	\N	f	\N	2026-03-25 13:53:03.785	\N	2026-03-16 13:53:03.785	2026-03-17 13:53:03.785	2026-03-22 13:53:03.785	2026-03-25 13:53:03.785	2026-03-27 13:53:03.785	\N	2026-03-30 13:53:03.785	2026-04-01 13:53:03.785	\N	\N	2026-04-06 13:53:03.785	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
a08d9000-3593-493b-b8de-09c4c7ee8a89	PROD-0030	UNIDAD DE ACCIONAMIENTO DEL MOTOR (motor de radiador para el trafo de 16MVA)	t	f	f	f	f	\N	\N	1	\N	2026-03-16 23:01:33.017	2026-03-16 23:01:36.4	\N	\N	f	3a1e43b6-62a0-4552-88f6-2ccd42670e6a	465c1bfa-1da9-424b-acef-b2c88ccee0b6	5	0	f	f	warn	\N	\N	\N	2026-03-13 21:12:46.804	\N	\N	2026-03-18 21:12:46.804	2026-04-02 21:12:46.804	2026-03-15 21:12:46.804	2026-03-13 21:12:46.804	\N	\N	2026-03-23 21:12:46.804	2026-03-28 21:12:46.804	2026-04-07 21:12:46.804	\N	\N	\N	\N	\N	MARITIMO	MEDIO	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	\N	\N	f	708bd955-29f2-407e-b87d-85d032b94291	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-03-31 21:12:46.804	f	\N	2026-03-17 21:12:46.804	\N	f	\N	2026-03-26 21:12:46.804	\N	2026-03-17 21:12:46.804	2026-03-18 21:12:46.804	2026-03-23 21:12:46.804	2026-03-26 21:12:46.804	2026-03-28 21:12:46.804	\N	2026-03-31 21:12:46.804	2026-04-02 21:12:46.804	\N	\N	2026-04-07 21:12:46.804	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
372924ee-0b77-4880-b3af-2e378ff3475d	PROD-0046	Cable de control 30 x 20	f	f	f	f	f	\N	\N	70	\N	2026-03-23 17:54:14.134	2026-03-25 20:09:12.481	\N	\N	f	9f290399-17c7-42a6-b4ad-9e4cc32f3e1f	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
0b19e710-3cd7-43b1-a014-be35d01aafbb	PROD-0047	Cable de control 2 x 20	f	f	f	f	f	\N	\N	160	\N	2026-03-23 17:54:14.139	2026-03-25 20:09:12.481	\N	\N	f	a363fc78-4c1b-4e4a-ab51-bf22395fdf4e	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
97768a67-582a-44d2-a96c-ae03692012d1	PROD-0048	Cable de control 4 x 22	f	f	f	f	f	\N	\N	120	\N	2026-03-23 17:54:14.147	2026-03-25 20:09:12.481	\N	\N	f	37c4f147-6c99-437c-a601-4f082b483823	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
13d0901a-b420-44f4-8b6e-4052e9b04cb4	PROD-0039	SEL-751 FEEDER PROTECTION RELAY	t	f	f	f	f	\N	\N	4	\N	2026-03-19 19:44:43.273	2026-03-19 19:44:56.656	\N	\N	f	100634de-4027-4bda-a992-85eedf765b23	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	5	0	f	f	warn	\N	\N	\N	2026-03-19 15:56:35.957	\N	\N	2026-03-24 15:56:35.957	2026-04-08 15:56:35.957	2026-03-21 15:56:35.957	2026-03-19 15:56:35.957	\N	\N	2026-03-29 15:56:35.957	2026-04-03 15:56:35.957	2026-04-13 15:56:35.957	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	3aad698d-71c9-45c4-af69-457e5f608f44	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-06 15:56:35.957	f	\N	2026-03-23 15:56:35.957	\N	f	\N	2026-04-01 15:56:35.957	\N	2026-03-23 15:56:35.957	2026-03-24 15:56:35.957	2026-03-29 15:56:35.957	2026-04-01 15:56:35.957	2026-04-03 15:56:35.957	\N	2026-04-06 15:56:35.957	2026-04-08 15:56:35.957	\N	\N	2026-04-13 15:56:35.957	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
d91f9e8e-3aa7-42cb-b20a-f0eedae5431e	PROD-0038	SEL-700G-1-T-W GEERADOR RELAY	t	f	f	f	f	\N	\N	2	\N	2026-03-19 19:44:28.415	2026-03-19 19:44:56.656	\N	\N	f	6341a6a6-df54-4869-a35c-f18ccdcbbfc0	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	5	0	f	f	warn	\N	\N	\N	2026-03-19 15:56:35.957	\N	\N	2026-03-24 15:56:35.957	2026-04-08 15:56:35.957	2026-03-21 15:56:35.957	2026-03-19 15:56:35.957	\N	\N	2026-03-29 15:56:35.957	2026-04-03 15:56:35.957	2026-04-13 15:56:35.957	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	3aad698d-71c9-45c4-af69-457e5f608f44	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-06 15:56:35.957	f	\N	2026-03-23 15:56:35.957	\N	f	\N	2026-04-01 15:56:35.957	\N	2026-03-23 15:56:35.957	2026-03-24 15:56:35.957	2026-03-29 15:56:35.957	2026-04-01 15:56:35.957	2026-04-03 15:56:35.957	\N	2026-04-06 15:56:35.957	2026-04-08 15:56:35.957	\N	\N	2026-04-13 15:56:35.957	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
df686681-449b-4e05-ac94-be614d25d912	PROD-0040	SEL - 787 -2 -3-4 TRANSF PROTECTION RELAY	t	f	f	f	f	\N	\N	1	\N	2026-03-19 19:44:50.247	2026-03-19 19:44:56.656	\N	\N	f	e43e648b-b4e4-45a2-878f-4485cef17130	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	5	0	f	f	warn	\N	\N	\N	2026-03-19 15:56:35.957	\N	\N	2026-03-24 15:56:35.957	2026-04-08 15:56:35.957	2026-03-21 15:56:35.957	2026-03-19 15:56:35.957	\N	\N	2026-03-29 15:56:35.957	2026-04-03 15:56:35.957	2026-04-13 15:56:35.957	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	3aad698d-71c9-45c4-af69-457e5f608f44	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-06 15:56:35.957	f	\N	2026-03-23 15:56:35.957	\N	f	\N	2026-04-01 15:56:35.957	\N	2026-03-23 15:56:35.957	2026-03-24 15:56:35.957	2026-03-29 15:56:35.957	2026-04-01 15:56:35.957	2026-04-03 15:56:35.957	\N	2026-04-06 15:56:35.957	2026-04-08 15:56:35.957	\N	\N	2026-04-13 15:56:35.957	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
443e7e6c-6307-4867-a412-0ae7ea42c586	PROD-0036	Licencia de PVSyst 8 profesional	t	f	f	f	f	\N	\N	1	\N	2026-03-19 19:43:50.953	2026-03-19 20:03:49.685	\N	\N	f	f3925f0b-1a3f-4a32-b796-315b95e77a7b	8fa3f8f1-8666-4c17-836f-c3e856857106	5	0	f	f	warn	\N	\N	\N	2026-03-18 21:12:36.807	\N	\N	2026-03-23 21:12:36.807	2026-04-07 21:12:36.807	2026-03-20 21:12:36.807	2026-03-18 21:12:36.807	\N	\N	2026-03-28 21:12:36.807	2026-04-02 21:12:36.807	2026-04-12 21:12:36.807	\N	\N	\N	\N	\N	TERRESTRE	MEDIO	a683c3b9-0a60-47d9-9f48-94f3ed311b70	\N	\N	f	d9c7ebdd-0a43-4d9d-87a3-dd249ce809c5	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-05 21:12:36.807	f	\N	2026-03-22 21:12:36.807	\N	f	\N	2026-03-31 21:12:36.807	\N	2026-03-22 21:12:36.807	2026-03-23 21:12:36.807	2026-03-28 21:12:36.807	2026-03-31 21:12:36.807	2026-04-02 21:12:36.807	\N	2026-04-05 21:12:36.807	2026-04-07 21:12:36.807	\N	\N	2026-04-12 21:12:36.807	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
406d288c-7e5c-48a9-9d38-2f3036361802	PROD-0035	equipo SEL, es un controlador 2414,	t	f	f	f	f	\N	\N	1	\N	2026-03-19 20:04:38.456	2026-03-19 20:04:40.775	\N	\N	f	d858b46c-cade-492c-9b38-3d4d73b5fc7a	a7beae9f-dbfb-46a9-9e3a-8683abd30ef9	5	0	f	f	warn	\N	\N	\N	2026-03-17 21:09:04.514	\N	\N	2026-03-22 21:09:04.514	2026-04-06 21:09:04.514	2026-03-19 21:09:04.514	2026-03-17 21:09:04.514	\N	\N	2026-03-27 21:09:04.514	2026-04-01 21:09:04.514	2026-04-11 21:09:04.514	\N	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	e3594efb-9e96-47e9-beee-bd430e9eb597	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-04 21:09:04.514	f	\N	2026-03-21 21:09:04.514	\N	f	\N	2026-03-30 21:09:04.514	\N	2026-03-21 21:09:04.514	2026-03-22 21:09:04.514	2026-03-27 21:09:04.514	2026-03-30 21:09:04.514	2026-04-01 21:09:04.514	\N	2026-04-04 21:09:04.514	2026-04-06 21:09:04.514	\N	\N	2026-04-11 21:09:04.514	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
19a80584-c8d8-4f66-bc3f-1c333e8e08bc	PROD-0034	equipo SEL, es un controlador 2414	t	f	f	f	f	\N	\N	1	\N	2026-03-19 20:04:53.905	2026-03-19 20:04:57.569	\N	\N	f	70b7d7c5-10c3-41ad-a7fa-0c4d3710dcaf	99007de4-71b1-44ce-b511-aa4640cc9c98	5	0	f	f	warn	\N	\N	\N	2026-03-17 21:06:50.173	\N	\N	2026-03-22 21:06:50.173	2026-04-06 21:06:50.173	2026-03-19 21:06:50.173	2026-03-17 21:06:50.173	\N	\N	2026-03-27 21:06:50.173	2026-04-01 21:06:50.173	2026-04-11 21:06:50.173	\N	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	b78ee3bb-f367-471e-abe7-2be6f0e36e5a	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-04-04 21:06:50.173	f	\N	2026-03-21 21:06:50.173	\N	f	\N	2026-03-30 21:06:50.173	\N	2026-03-21 21:06:50.173	2026-03-22 21:06:50.173	2026-03-27 21:06:50.173	2026-03-30 21:06:50.173	2026-04-01 21:06:50.173	\N	2026-04-04 21:06:50.173	2026-04-06 21:06:50.173	\N	\N	2026-04-11 21:06:50.173	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
d7291d1c-15d4-45d7-99e9-6d55277a84e3	PROD-0014	Cargador de baterías.	t	f	f	f	f	\N	\N	1	\N	2026-03-19 20:36:47.782	2026-03-19 20:36:55.644	\N	\N	f	77b1da24-3f94-4866-b2be-4dc336b51c29	d3c64b06-5998-4993-a418-a962dcf1f73e	5	0	f	f	warn	\N	\N	\N	2026-03-12 13:49:33.083	\N	\N	2026-04-18 13:49:33.083	2026-07-07 13:49:33.083	2026-03-24 13:49:33.083	2026-03-12 13:49:33.083	2026-08-02 13:49:33.083	2026-06-12 13:49:33.083	2026-05-04 13:49:33.083	2026-06-02 13:49:33.083	2026-09-22 13:49:33.083	2026-07-17 13:49:33.083	\N	\N	\N	\N	AEREO	MEDIO	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	\N	\N	f	40efc7c8-17b5-4461-aea8-831da0b748b3	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-06-25 13:49:33.083	f	\N	2026-04-07 13:49:33.083	\N	f	\N	2026-05-21 13:49:33.083	\N	2026-04-07 13:49:33.083	2026-04-18 13:49:33.083	2026-05-04 13:49:33.083	2026-05-21 13:49:33.083	2026-06-02 13:49:33.083	2026-06-12 13:49:33.083	2026-06-25 13:49:33.083	2026-07-07 13:49:33.083	2026-07-17 13:49:33.083	2026-08-02 13:49:33.083	2026-09-22 13:49:33.083	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	7b16da9d-1758-4bf9-9960-1ac345362ded
86babfc2-0eaa-47dc-a9d2-3495b696673c	PROD-0053	Recloser Marca Schnneider U27, 24.9 kv, 630 amp,  Bil 125kV	f	f	f	f	f	\N	\N	1	\N	2026-03-24 15:06:44.872	2026-03-25 19:56:52.883	\N	\N	f	d28fd77e-27c0-480f-93b0-6ae84d5c6522	c02d91cc-736e-42ff-ba64-5418d36462d4	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	99db1c0d-c9b9-42a3-951f-7184162d1c8d	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
37d91149-b774-41eb-b742-d43b4b76f83f	PROD-0055	CVC-110BER and CVC-110BRER 15 kV combination current and voltage transformers	f	f	f	f	f	\N	\N	3	\N	2026-03-24 15:25:59.536	2026-03-25 19:57:19.39	\N	\N	f	261ba919-f713-4fd4-81e9-21c1edd50520	a2e60c47-82fb-4fb7-a61c-688b4edceec7	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	b421c961-dcb8-44ba-bf59-a7a75c81eeb7	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
267861e1-384a-4426-8517-cb9fe368e94d	PROD-0050	IONN8650	f	f	f	f	f	\N	\N	2	\N	2026-03-23 17:52:57.606	2026-03-25 19:53:55.859	\N	\N	f	5acf97c7-f0b4-44c6-a9a4-94f44a87b777	6858d5ca-1163-47f4-8ce4-c06a8e0048d6	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	a48f0467-2526-4c92-b09d-28a1c2b18b91	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
94f28734-af4b-470b-8b4c-cba04344b1d2	PROD-0037	Licencia de SolarGIS Time Series	f	f	f	f	f	\N	\N	1	\N	2026-03-23 19:15:44.52	2026-03-23 19:15:44.52	\N	\N	f	bbf04d7b-b592-4f5b-b8ba-95ca39f61044	8fa3f8f1-8666-4c17-836f-c3e856857106	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	d9c7ebdd-0a43-4d9d-87a3-dd249ce809c5	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	\N
8322ef9c-25fc-4b22-9b7c-0ffdf9bde8c9	PROD-0042	Cable de control 7x14	f	f	f	f	f	\N	\N	70	\N	2026-03-23 17:54:14.109	2026-03-25 20:09:12.481	\N	\N	f	8b3c5c80-b326-4f16-8a90-dfa25a859357	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
d8e72e18-75ab-43f0-a091-11cd55099d08	PROD-0063	Hincadora R6	t	t	t	t	f	EverStar	\N	14	\N	2026-03-26 15:04:16.611	2026-03-26 15:30:08.841	\N	\N	f	84519fb3-d719-42a2-9666-f0880f582f46	2bc7541d-0998-45fc-ac1b-b1622173ace5	3	0	f	f	warn	2026-03-26 15:29:49.3	\N	2026-03-26 15:17:44.052	2026-03-26 15:17:44.052	\N	\N	2026-03-29 15:03:44.815	2026-06-03 15:03:44.815	2026-03-27 15:03:44.815	2026-03-26 15:03:44.815	\N	2026-05-29 15:03:44.815	2026-03-30 15:03:44.815	2026-04-29 15:03:44.815	2026-06-08 15:03:44.815	\N	2026-03-26 15:30:03.064	\N	\N	\N	MARITIMO	BAJO	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	445200.0000	31800.0000	f	0b7e89c9-50e7-47a5-ac29-299710f43e25	f	t	2026-03-26 15:17:44.052	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	2026-06-01 15:03:44.815	t	2026-03-26 15:29:28.243	2026-03-28 15:03:44.815	\N	t	2026-03-26 15:30:08.841	\N	\N	2026-03-28 15:03:44.815	2026-03-29 15:03:44.815	2026-03-30 15:03:44.815	\N	2026-04-29 15:03:44.815	2026-05-29 15:03:44.815	2026-06-01 15:03:44.815	2026-06-03 15:03:44.815	\N	\N	2026-06-08 15:03:44.815	f	f	f	f	f	f	f	f	f	f	f	t	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:29:18.231	2d791fa1-940c-45bf-a980-1499bbbe1b2a
dee08f6b-da00-4a41-96c6-2fe55221e2d7	PROD-0064	Cable 4x8 AWG con apantallamiento metálico	f	f	f	f	f	\N	\N	300	\N	2026-03-26 15:29:31.07	2026-03-26 15:29:58.151	\N	\N	f	67b4923c-e442-4093-83d5-7ec7a16da05d	1f7125af-3444-4d46-aa7a-ab736e897331	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	43350327-1a45-4f4d-999f-414067b67418	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
be1654b5-0815-404e-b57d-6dead58de9da	PROD-0029	GENERADOR 11200 KW	f	f	f	f	f	\N	\N	1	\N	2026-03-23 19:16:29.405	2026-03-25 19:23:24.419	\N	\N	f	b5efa63e-7568-4694-8cf1-e2d57b3cff58	94b01a3b-e5bd-49f4-a7e5-a584acf1642b	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	cf6be4cd-112e-4714-862e-b9e2d414c276	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
855a6f94-d425-46d6-b52e-df267cae8321	PROD-0020	1 juego de TC´s	f	f	f	f	f	\N	\N	1	\N	2026-03-23 19:18:02.224	2026-03-25 15:54:44.019	\N	\N	f	3bd9091b-cbb3-408c-adaf-74d880c9578a	3d1f461e-70d6-49ae-8b31-b1886fd8e33b	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	91da763e-5fd3-4cef-beb0-e3552a278b21	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
5df89628-fb7d-4ca1-ab1b-696ddb48c6a3	PROD-0052	PARARRAYO 27KV PDV-100 HD 0. 10KG	f	f	f	f	f	\N	\N	6	\N	2026-03-24 14:39:56.389	2026-03-24 14:40:35.239	\N	\N	f	51111153-4f1b-48fc-8ccc-e9d8c57b2d52	a555ddb1-e05e-49a1-9a16-25b441ee6174	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	ffa00706-0cce-44a0-8c2d-9346aac89c79	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
fcaa1ae5-966e-417f-843f-18000b4acc0e	PROD-0043	Cable de control 18x18	f	f	f	f	f	\N	\N	70	\N	2026-03-23 17:54:14.116	2026-03-25 20:09:12.481	\N	\N	f	13c0b6b0-20a0-44e0-96c4-9faf551e9fff	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
ed6ea414-4a5c-4aeb-a7bc-04347a721322	PROD-0044	Cable de control 12 x 18	f	f	f	f	f	\N	\N	70	\N	2026-03-23 17:54:14.122	2026-03-25 20:09:12.481	\N	\N	f	04886d8c-14f7-4ed6-a467-eb206246ccb6	dfe1af15-607f-45dd-8da8-d4bafd3f648f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	55e4c5be-0e67-4eb2-937e-efc72748287f	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
99d7de42-cc31-4ecd-bfa3-6c8666fc68cf	PROD-0056	SEL 400G	f	f	f	f	f	\N	\N	1	\N	2026-03-25 15:04:23.63	2026-03-25 15:04:31.79	\N	\N	f	84b63b59-2de2-48b1-a723-0b0422033e37	6a087248-ab48-47e4-bde2-ab7802bd5490	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	347ae50d-6f33-474b-8831-0fc77385a160	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
df04e9a1-f8a9-4601-b510-3da3bed18bf9	PROD-0012	DECS-250,DigitalExcitationControlSystemStyle:LP1SN1N	f	f	f	f	f	\N	\N	4	\N	2026-03-23 19:18:30.618	2026-03-25 15:44:20.165	\N	\N	f	ea34b4a6-17e1-4b8d-8ca7-359681a71ebf	bd3e4b5e-ce17-41c8-8bec-17e1cc7cc055	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	5f2fdd27-8634-4aeb-8686-d2d194d65d65	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
fd8f8eda-228b-4520-9387-ffd4f2efd428	PROD-0051	Transformador integrado de medición, Relación 200:5,	f	f	f	f	f	\N	\N	3	\N	2026-03-23 17:52:57.618	2026-03-25 19:53:55.859	\N	\N	f	fcbf2b3a-acf1-4a5b-a7b0-1eb3bb03e948	6858d5ca-1163-47f4-8ce4-c06a8e0048d6	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	a48f0467-2526-4c92-b09d-28a1c2b18b91	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2d791fa1-940c-45bf-a980-1499bbbe1b2a
97ab2ac2-d131-4ab4-8d7b-5fa84fc7f8d7	PROD-0062	Listado de materiales para instalación de vaisala portatil en plantas LAEISZ	f	f	f	f	f	\N	\N	1	\N	2026-03-26 15:30:00.67	2026-03-26 15:30:23.374	\N	\N	f	444cea43-006d-4500-bc2c-4cf3cb79da4e	7e9002a1-572b-4a16-8cca-ff437810840f	5	0	f	f	warn	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	MEDIO	\N	\N	\N	f	e097215c-8198-468e-980f-bd1261552b2e	f	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	f	f	f	f	f	\N	\N	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924
\.


--
-- TOC entry 3945 (class 0 OID 17585)
-- Dependencies: 240
-- Data for Name: historial_cotizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_cotizacion (id, cotizacion_id, usuario_id, accion, detalles, creado) FROM stdin;
4029f43d-799a-4721-bbd5-378ae08ed05d	ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0001"], "productosConfigurados": 1}	2026-02-25 22:31:26.468
75688205-fe6e-483d-b429-b3d656e2e057	ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0001"], "productosConfigurados": 1}	2026-02-25 22:32:47.326
caa9cc21-a77c-4390-89e5-614f89344a7b	ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	7b16da9d-1758-4bf9-9960-1ac345362ded	PRODUCTO_APROBADO	{"sku": "PROD-0001", "productoId": "4dbdb7d1-ee07-4e03-b0a4-5915dfc89e57"}	2026-02-25 22:33:07.074
d6681019-5c48-4fea-a723-438467bb6af8	14fbd91c-d786-4a5a-bb0f-6543f43632b3	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0002"], "productosConfigurados": 1}	2026-02-25 22:45:45.302
717baa30-1dba-479a-bad9-e0a673de8d4f	14fbd91c-d786-4a5a-bb0f-6543f43632b3	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0003"], "productosConfigurados": 1}	2026-02-25 22:48:46.309
f3a5b932-e183-4047-a3fb-eb08425b3aec	14fbd91c-d786-4a5a-bb0f-6543f43632b3	7b16da9d-1758-4bf9-9960-1ac345362ded	PRODUCTO_APROBADO	{"sku": "PROD-0002", "productoId": "6c60ce8e-d494-41a9-9503-fe9cac870bac"}	2026-02-25 22:49:46.406
1d4c5bd0-89bb-4d38-bd62-d4a093980f39	14fbd91c-d786-4a5a-bb0f-6543f43632b3	7b16da9d-1758-4bf9-9960-1ac345362ded	PRODUCTO_APROBADO	{"sku": "PROD-0003", "productoId": "38b60a84-a279-483c-a01d-82a1b57628d4"}	2026-02-25 22:50:06.069
a2b4074d-0c20-4722-be5a-e394e040a513	ad15394f-efd4-43fc-a50b-6cb2f5b67bba	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0004"], "productosConfigurados": 1}	2026-02-25 22:57:27.337
7551fb0c-d2ea-400c-a82e-0b754002894d	ad15394f-efd4-43fc-a50b-6cb2f5b67bba	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0004"], "productosConfigurados": 1}	2026-02-25 22:57:39.819
8f365ea6-e074-49ac-b33e-9283e4be3ee1	ad15394f-efd4-43fc-a50b-6cb2f5b67bba	7b16da9d-1758-4bf9-9960-1ac345362ded	PRODUCTO_APROBADO	{"sku": "PROD-0004", "productoId": "530619f9-dc28-4725-899d-0a5f7d7dca2e"}	2026-02-25 22:58:34.007
87c2c36b-c63d-47e0-918c-f70341c04c57	d6cf00c6-e39e-48bb-a984-601d348e0d0f	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	TIMELINE_CONFIGURADO	{"skus": ["PROD-0006"], "productosConfigurados": 1}	2026-03-03 21:42:00.048
0eb6f06c-c2d0-44de-83c2-a3b69ce58c1f	d6cf00c6-e39e-48bb-a984-601d348e0d0f	5cddfc77-b008-4e66-b913-2bdd952e31af	PRODUCTO_APROBADO	{"sku": "PROD-0006", "productoId": "0c49d0e3-2a41-4aa3-a3fb-9e274e2cd2eb"}	2026-03-03 21:42:32.859
efd63c77-44b5-47b4-a779-883ae98ad07c	a1acfcd8-3190-4be3-8d48-05218137a40d	5cddfc77-b008-4e66-b913-2bdd952e31af	TIMELINE_CONFIGURADO	{"skus": ["PROD-0021"], "productosConfigurados": 1}	2026-03-12 14:19:24.251
28d80f24-8e52-4c9e-be21-15eeb6ed9c0e	a1acfcd8-3190-4be3-8d48-05218137a40d	5cddfc77-b008-4e66-b913-2bdd952e31af	PRODUCTO_APROBADO	{"sku": "PROD-0021", "productoId": "2af0cb14-a909-4d80-b294-20580c936f03"}	2026-03-12 14:20:01.926
36fed4e2-294c-4c2e-ac26-8a4c0463691c	769ed2eb-ae15-40d4-8318-1c81c4556891	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0007"], "productosConfigurados": 1}	2026-03-12 14:53:01.797
13903a16-8064-474e-be27-409a15afbaeb	769ed2eb-ae15-40d4-8318-1c81c4556891	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0008"], "productosConfigurados": 1}	2026-03-12 14:53:16.018
ca8a8d4c-70ef-4ef2-813f-1fec6fa0a179	769ed2eb-ae15-40d4-8318-1c81c4556891	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0009"], "productosConfigurados": 1}	2026-03-12 14:53:22.275
6f67506e-27b8-4f50-b599-214cbbce6a11	769ed2eb-ae15-40d4-8318-1c81c4556891	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0010"], "productosConfigurados": 1}	2026-03-12 14:53:28.195
c2cae3d1-1115-4209-a247-28ceccc4d0d2	769ed2eb-ae15-40d4-8318-1c81c4556891	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0011"], "productosConfigurados": 1}	2026-03-12 14:53:34.552
bf217286-22df-45c1-8132-b7058f15f730	87b5ac3a-1c07-49c7-a3a7-ccb9be32fb00	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0013"], "productosConfigurados": 1}	2026-03-12 15:05:43.741
dbcf80d7-d1e3-4d3a-ada7-070bca402554	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0015"], "productosConfigurados": 1}	2026-03-12 15:07:53.473
572b113a-0378-4095-b89e-fe4351c8ba0b	99dd13c7-fb3f-4d59-beb2-b9af97db49c2	5cddfc77-b008-4e66-b913-2bdd952e31af	TIMELINE_CONFIGURADO	{"skus": ["PROD-0025"], "productosConfigurados": 1}	2026-03-12 20:07:36.806
38b75ac0-a9f1-4356-af9d-9b4d87745f39	99dd13c7-fb3f-4d59-beb2-b9af97db49c2	5cddfc77-b008-4e66-b913-2bdd952e31af	PRODUCTO_APROBADO	{"sku": "PROD-0025", "productoId": "86746bd2-c023-4b62-bf56-5c47143e0f20"}	2026-03-12 20:08:04.045
2b246932-f648-4e31-8638-0280aeca4235	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	5cddfc77-b008-4e66-b913-2bdd952e31af	TIMELINE_CONFIGURADO	{"skus": ["PROD-0023"], "productosConfigurados": 1}	2026-03-12 21:54:37.484
8f4545b7-d4c5-4f01-b364-a90717aa84ce	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	5cddfc77-b008-4e66-b913-2bdd952e31af	TIMELINE_CONFIGURADO	{"skus": ["PROD-0024"], "productosConfigurados": 1}	2026-03-12 21:54:41.346
1161f4d2-b550-47c5-918b-4b080003d705	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	5cddfc77-b008-4e66-b913-2bdd952e31af	PRODUCTO_APROBADO	{"sku": "PROD-0023", "productoId": "9cf04fb0-4312-4906-802f-a38b7cba391a"}	2026-03-12 21:54:58.328
aeca1e1a-cfd5-44bc-943c-97f1163e019d	e4f27e0d-9f2e-4af8-9e82-a9981ca1e612	5cddfc77-b008-4e66-b913-2bdd952e31af	PRODUCTO_APROBADO	{"sku": "PROD-0024", "productoId": "42655082-0f93-427b-8611-9095c724a75c"}	2026-03-12 21:55:00.486
124485cf-5fb9-4bcf-8717-14051f2c34fb	ed0a7109-b62b-4ba9-ac28-5b2b8127c0de	5cddfc77-b008-4e66-b913-2bdd952e31af	TIMELINE_CONFIGURADO	{"skus": ["PROD-0031"], "productosConfigurados": 1}	2026-03-16 21:27:43.496
62c85f4d-7d5f-4aa3-8608-e2ea23c15305	ed0a7109-b62b-4ba9-ac28-5b2b8127c0de	5cddfc77-b008-4e66-b913-2bdd952e31af	PRODUCTO_APROBADO	{"sku": "PROD-0031", "productoId": "c6c99891-2712-4814-950c-b343bde4ecbb"}	2026-03-16 21:28:30.475
332dbe41-8973-4696-98ea-9848674f29a5	8a81c470-8d75-42b1-b969-7f76c5dbceb9	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0022"], "productosConfigurados": 1}	2026-03-16 21:46:39.517
d279fb18-0fb6-4ff4-9aec-c86cd9cf02c8	8a81c470-8d75-42b1-b969-7f76c5dbceb9	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0022"], "productosConfigurados": 1}	2026-03-16 21:56:46.817
9ffd91a4-5f5c-4112-a04d-b52b317587b2	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0015"], "productosConfigurados": 1}	2026-03-16 22:42:38.782
137abad9-9ca6-4d00-9917-6ea4a17a1b0f	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0016"], "productosConfigurados": 1}	2026-03-16 22:42:44.712
59a0fbd8-c1bb-4076-871c-cfe02ce0961d	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0016"], "productosConfigurados": 1}	2026-03-16 22:42:54.742
16abbc59-980b-4bf1-9a4c-ad41b6baaebb	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0017"], "productosConfigurados": 1}	2026-03-16 22:43:00.891
af7139d0-1447-45f7-b6cf-bd1d4eaebe29	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0018"], "productosConfigurados": 1}	2026-03-16 22:43:05.707
b9c650c4-56f6-48dc-a500-65786ee76e14	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0019"], "productosConfigurados": 1}	2026-03-16 22:43:09.812
786a93ad-c95e-4fb7-9973-e4938385acda	465c1bfa-1da9-424b-acef-b2c88ccee0b6	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0030"], "productosConfigurados": 1}	2026-03-16 23:01:33.038
416ae91b-db3f-443f-93e3-05e4e5f43811	8fa3f8f1-8666-4c17-836f-c3e856857106	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	TIMELINE_CONFIGURADO	{"skus": ["PROD-0036"], "productosConfigurados": 1}	2026-03-19 19:43:50.974
cccf2729-66b1-4596-8f92-196fc19469c1	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	TIMELINE_CONFIGURADO	{"skus": ["PROD-0038"], "productosConfigurados": 1}	2026-03-19 19:44:28.435
c093ba07-4aae-49a0-9ce6-9a2d256fa670	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	TIMELINE_CONFIGURADO	{"skus": ["PROD-0039"], "productosConfigurados": 1}	2026-03-19 19:44:43.287
6deef96f-df19-4682-b6bb-959a7f4daf30	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	TIMELINE_CONFIGURADO	{"skus": ["PROD-0040"], "productosConfigurados": 1}	2026-03-19 19:44:50.261
8050ddb8-6bf7-45cb-bc0a-b4696e88a62b	a7beae9f-dbfb-46a9-9e3a-8683abd30ef9	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0035"], "productosConfigurados": 1}	2026-03-19 20:04:38.475
cfa2bf5d-b302-40bb-8c84-5c2fde08d1a3	99007de4-71b1-44ce-b511-aa4640cc9c98	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0034"], "productosConfigurados": 1}	2026-03-19 20:04:53.92
c7e6ea8b-5bb8-494c-994d-38f0fb55559d	d3c64b06-5998-4993-a418-a962dcf1f73e	7b16da9d-1758-4bf9-9960-1ac345362ded	TIMELINE_CONFIGURADO	{"skus": ["PROD-0014"], "productosConfigurados": 1}	2026-03-19 20:36:47.801
f14e70d5-b32f-4ccb-8231-b3a2584a56d1	2bc7541d-0998-45fc-ac1b-b1622173ace5	2d791fa1-940c-45bf-a980-1499bbbe1b2a	TIMELINE_CONFIGURADO	{"skus": ["PROD-0063"], "productosConfigurados": 1}	2026-03-26 15:10:29.219
a81c4a2e-8a89-4b76-a5e1-4c64af627a68	2bc7541d-0998-45fc-ac1b-b1622173ace5	2d791fa1-940c-45bf-a980-1499bbbe1b2a	PRODUCTO_APROBADO	{"sku": "PROD-0063", "productoId": "d8e72e18-75ab-43f0-a091-11cd55099d08"}	2026-03-26 15:17:44.06
\.


--
-- TOC entry 3947 (class 0 OID 32941)
-- Dependencies: 242
-- Data for Name: historial_fecha_limite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_fecha_limite (id, estado_producto_id, estado, creado_por, creado, "fechaAnterior", "fechaNueva") FROM stdin;
6921e68e-d63b-4b2d-aba6-16da68d8d03e	4dbdb7d1-ee07-4e03-b0a4-5915dfc89e57	pagado	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 23:01:47.83	2026-06-08 22:20:56.971	2026-06-18 06:00:00
fdcf7ec4-e205-416b-948c-1235e18b709d	0c49d0e3-2a41-4aa3-a3fb-9e274e2cd2eb	pagado	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-03 21:57:40.52	2026-03-10 21:35:36.732	2026-03-20 06:00:00
9eadb339-3a8d-48bb-a670-6048e2fff8a9	c6c99891-2712-4814-950c-b343bde4ecbb	aprobacionPlanos	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-16 21:29:48.988	2026-04-10 20:02:48.197	2026-04-11 06:00:00
\.


--
-- TOC entry 3950 (class 0 OID 33099)
-- Dependencies: 245
-- Data for Name: justificacion_no_aplica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.justificacion_no_aplica (id, estado_producto_id, estado, justificacion, creado_por, creado, actualizado) FROM stdin;
728871ea-107b-4567-890d-9e2c1acceaaa	42655082-0f93-427b-8611-9095c724a75c	recibido	debido que solo debe enviarlo	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:56:49.154	2026-03-12 21:56:49.154
23ffac82-04d4-4dca-8a5e-e4a798c55abf	d8e72e18-75ab-43f0-a091-11cd55099d08	aprobacionPlanos	Es maquinaria y no hay planos que aprobar	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:22:20.694	2026-03-26 15:22:20.694
\.


--
-- TOC entry 3951 (class 0 OID 33645)
-- Dependencies: 246
-- Data for Name: licitacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licitacion (id, cotizacion_id, nombre, estado, motivo_archivo, fecha_archivo, archivada_por_id, creado, actualizado) FROM stdin;
\.


--
-- TOC entry 3952 (class 0 OID 33669)
-- Dependencies: 247
-- Data for Name: licitacion_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licitacion_producto (id, licitacion_id, estado_producto_id, cotizacion_id, sku, descripcion, cotizado, con_descuento, aprobacion_compra, comprado, pagado, aprobacion_planos, primer_seguimiento, en_fob, cotizacion_flete_internacional, con_bl, segundo_seguimiento, en_cif, recibido, fecha_cotizado, fecha_con_descuento, fecha_aprobacion_compra, fecha_comprado, fecha_pagado, fecha_aprobacion_planos, fecha_primer_seguimiento, fecha_en_fob, fecha_cotizacion_flete_internacional, fecha_con_bl, fecha_segundo_seguimiento, fecha_en_cif, fecha_recibido, proveedor, precio_unitario, precio_total, cantidad, observaciones, tipo_compra, responsable_id, creado, actualizado) FROM stdin;
\.


--
-- TOC entry 3938 (class 0 OID 17213)
-- Dependencies: 233
-- Data for Name: mensaje; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensaje (id, chat_id, emisor_id, contenido, tipo_mensaje, creado) FROM stdin;
635b87e1-b061-4411-adc5-cdd8cdd7102b	76f03478-9b50-4b75-9a47-40f9205fa1cd	7b16da9d-1758-4bf9-9960-1ac345362ded	📋 Detalles para PROD-0001 - BATERIA DE PLOMO-ACIDO DJ150(2V150Ah) LEOCH:\nSe solicita sobre todo marca LEOCH	TEXTO	2026-02-25 22:20:56.988
91d6fed7-b187-4880-a895-e32a75b95087	c82a8944-fd3b-4eee-bc13-23ddcbb9c606	7b16da9d-1758-4bf9-9960-1ac345362ded	carla ya vi lo precios y prefiero mejor  elector	TEXTO	2026-02-25 22:57:08.866
c0aec8eb-5708-4e39-ba1e-b358776ff68b	6b2c08ec-bfb3-4615-a6cf-3ad3f9922c68	5cddfc77-b008-4e66-b913-2bdd952e31af	📋 Detalles para PROD-0006 - lapto dell i7:\nporfavor revisar que el procesador sea 16gb	TEXTO	2026-03-03 21:35:36.746
4bf94b7d-b553-4a7d-a264-f3ff29529fcd	6b2c08ec-bfb3-4615-a6cf-3ad3f9922c68	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	revise los preovvedores	TEXTO	2026-03-03 21:38:51.247
ebdf13b8-262f-48c9-bf10-7ecde0321043	bcac2c7c-b195-4a59-b29c-6f9a670f44c9	d25da598-5ab6-4684-967f-40bf7b72f3ae	hOLA	TEXTO	2026-03-04 15:50:22.282
bca8c7a8-a9f7-42ea-958f-d83b88517564	bcac2c7c-b195-4a59-b29c-6f9a670f44c9	d25da598-5ab6-4684-967f-40bf7b72f3ae	Buen día Carla y Elmin\n\nSu ayuda solicitando cotizaciones con DEICOM, les adjunto las especificaciones de cada equipo en PDF y el listado. \n\nSaludos\nBianca Lopez	TEXTO	2026-03-04 15:57:02.385
3d714f0c-ac17-4951-9b04-54d6fd8767cc	38b84f7b-42de-4bb8-93f4-65dc2a885c3c	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0012 - DECS-250,DigitalExcitationControlSystemStyle:LP1SN1N:\nAdjunto cotización, actualizarla.	TEXTO	2026-03-04 21:54:22.385
c3fb6d62-44bf-447a-b926-b54ad1c17f87	910fd6e3-d9a9-498b-8135-4e04a8313f77	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0013 - Reloj satelital SEL2404:\nSu ayuda cotizando, Reloj satelital SEL2404, y que incluye antena con cable largo de 75 pies para poder instalarla afuera del edificio. SEL-2404, part # : 24041441X, configuration #: 2404#0101  IMPORTANTE: Cliente solicita oferta por el suministro y la instalacion tambien , considerarlo por favor	TEXTO	2026-03-12 13:47:36.587
031c602b-f251-43d9-abcc-0101bb65c92f	18f73a95-144f-4261-83ac-645bbc44a08e	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0014 - Cargador de baterías.:\nCaracterísticas técnicas:  Marca: SBS Modelos No.: AT30130100F208XHXAGLXX	TEXTO	2026-03-12 13:49:33.097
04f5ccbb-0603-4079-974e-1eff9427dbde	09344940-5796-41ce-b672-9da1e32ba2d7	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0020 - 1 juego de TC´s:\n3 unidad de  TC's = 1 juegos de TC's	TEXTO	2026-03-12 13:56:06.153
574e70ce-9188-488f-bed1-ef75c548b9ef	48fd22f8-e8ae-4f25-b2ea-369ceb889c97	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0021 - valvula:\nporfavor no cotizar en ebay	TEXTO	2026-03-12 14:15:53.523
f011ef94-4ab9-4150-8a42-43e0abef34ed	48fd22f8-e8ae-4f25-b2ea-369ceb889c97	5cddfc77-b008-4e66-b913-2bdd952e31af	Hola mire que no encontre valvula 40	TEXTO	2026-03-12 14:17:05.487
a173269a-482a-4392-a79b-12dad3cf9c11	83318a38-fc81-4fa3-8a2c-aa03cc5ac281	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0022 - reclosers // RESTAURADOR TRIFASICO 34.5kV (KIT):\nEstos son los Pomanique vendió Energía PD a UTCD y se arruinaron. Mismas caracteristicas.	TEXTO	2026-03-12 14:28:10.089
8e427f8e-4707-4606-92ff-e66186c5fbc4	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0023 - salon de evento:\nservicios de peluqueria	TEXTO	2026-03-12 19:43:41.67
72b0a146-b964-4d58-8c9d-b56d0d4b073b	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0024 - boquitas del salon:\nllamar al proveedor de boquitas dulces	TEXTO	2026-03-12 19:43:41.67
58a37bcf-c694-4dae-9c22-570a6afc3635	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 LicitaciÃ³n - TE03373.pdf	ARCHIVO	2026-03-12 19:43:44.362
652b419e-629a-407b-af89-b85daa2de5f4	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 LicitaciÃ³n - TE03373 (1).pdf	ARCHIVO	2026-03-12 19:43:44.369
f396351d-dcb7-453f-ab73-24c3ffa49b0c	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	hola	TEXTO	2026-03-12 19:45:26.293
9bd547e6-908d-4846-8c33-8dcc9b459831	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 LicitaciÃ³n - TE03372.pdf	ARCHIVO	2026-03-12 19:53:26.916
97aed54e-937f-46f4-a5b0-ac01d4e0805b	42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	este es el que me interesa	TEXTO	2026-03-12 19:53:35.739
e4faf8ba-1deb-4b26-aa19-edfd6aefb5b0	b75b69fa-c30e-4814-93db-fb739c9d0369	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 Placa Generador ELC-U8 (1).pdf	ARCHIVO	2026-03-13 21:02:43.533
c5207138-ac5e-426d-a4d4-caad42a0568c	c17d6370-f83a-4589-8210-c35f535e448b	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0030 - UNIDAD DE ACCIONAMIENTO DEL MOTOR (motor de radiador para el trafo de 16MVA):\nPLACA ADJUNTA	TEXTO	2026-03-13 21:12:46.82
2ea05aeb-5eaa-4c03-b8b2-3c70e7382051	c17d6370-f83a-4589-8210-c35f535e448b	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 PLACA TRAFO.pdf	ARCHIVO	2026-03-13 21:16:31.415
2ac9ec3f-af28-4fc2-8829-8864be950a00	9a080ae0-283b-4035-b00c-2d6b72b2ea32	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0031 - BATERIAS:\nNO FUERAN DE LA MARCA ENERGIZER	TEXTO	2026-03-16 20:02:48.212
580ebaf1-4fa7-41e4-82ab-0abd7a7a5862	9a080ae0-283b-4035-b00c-2d6b72b2ea32	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 reseÃ±a.pdf	ARCHIVO	2026-03-16 20:02:51.437
6085220c-7242-4d3d-afc1-65af2995bcc0	83318a38-fc81-4fa3-8a2c-aa03cc5ac281	d25da598-5ab6-4684-967f-40bf7b72f3ae	Hola, me dice Andrea que tenemos de este suministro en bodega, solo sería  que me envíen  el costo final (ya puesto en bodega) ficha tecnica y si tenemos garantía.	TEXTO	2026-03-16 20:43:30.792
af57ae2a-26de-4e66-8eca-80ce5eee8ae4	bcac2c7c-b195-4a59-b29c-6f9a670f44c9	7b16da9d-1758-4bf9-9960-1ac345362ded	Cotización. Si el proveedor lo envía al casillero de Miami y se mueve aéreo casillero puede considerar USD 160.00 por  35lbs.    Saludos,	TEXTO	2026-03-16 21:31:20.189
6f263114-f4fd-4b94-9761-ace378e7f95e	bcac2c7c-b195-4a59-b29c-6f9a670f44c9	7b16da9d-1758-4bf9-9960-1ac345362ded	📎 COT 12606 EPD.pdf	ARCHIVO	2026-03-16 21:31:52.27
48cdfafc-b3c3-436a-b5af-a25c4175769d	910fd6e3-d9a9-498b-8135-4e04a8313f77	7b16da9d-1758-4bf9-9960-1ac345362ded	📎 Captura de pantalla 2026-03-16.png	ARCHIVO	2026-03-16 21:43:23.537
98e21d86-94bd-4d8a-ae82-ef8605e77985	910fd6e3-d9a9-498b-8135-4e04a8313f77	7b16da9d-1758-4bf9-9960-1ac345362ded	Como se procede?	TEXTO	2026-03-16 21:43:28.601
60802e4f-c3a9-47d6-ae68-a20801dd3f1a	915877a2-1363-4f48-bab5-fb69a536223e	7b16da9d-1758-4bf9-9960-1ac345362ded	Buenos días te mando cotización y flete	TEXTO	2026-03-16 22:08:13.538
2fcd460b-ce13-4087-aa7f-cca200a87721	915877a2-1363-4f48-bab5-fb69a536223e	7b16da9d-1758-4bf9-9960-1ac345362ded	📎 COT 12606 EPD.pdf	ARCHIVO	2026-03-16 22:09:21.359
39a617ca-726d-4916-a2ae-235643470440	910fd6e3-d9a9-498b-8135-4e04a8313f77	d25da598-5ab6-4684-967f-40bf7b72f3ae	Podes cotizarte este reloj satelital SEL2401	TEXTO	2026-03-17 21:01:30.758
ab929bdb-21f3-4c6e-88f8-5dfcfe6f100a	a160e11d-575c-4651-b100-14c641a7162a	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0034 - equipo SEL, es un controlador 2414:\nURGENTE	TEXTO	2026-03-17 21:06:50.186
e2b0a247-0f6e-4c96-89c6-e181771defd4	97e53135-3c40-4b9e-ba16-223e990a3bf4	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0035 - equipo SEL, es un controlador 2414,:\nURGENTE	TEXTO	2026-03-17 21:09:04.522
f6a54ccf-2e2b-4a7d-9270-ec10be4f67ee	6288bd5e-1c5b-4a25-8f18-4cf5511235fe	ab6d9041-7493-45a5-97f5-62ccbb36c59e	📋 Detalles para PROD-0036 - Licencia de PVSyst 8 profesional:\nLicencia profesional anual, pricing directo en pagina y adjuntado en imagen, necesario realizar cuenta para compra de licencia e ingresar datos de billing. Adjunto Link: https://www.pvsyst.com/en/products/pvsyst-8/	TEXTO	2026-03-18 21:12:36.82
3367e5fb-d0ba-41a8-a828-e43131eaadbb	6288bd5e-1c5b-4a25-8f18-4cf5511235fe	ab6d9041-7493-45a5-97f5-62ccbb36c59e	📋 Detalles para PROD-0037 - Licencia de SolarGIS Time Series:\nSolarGIS Time series, pricing no disponible en pagina, necesitamos hacer contact us para negociar precio y necesidades descritas. Adjunto Link: https://solargis.com/products/integration/solargis-time-series-api	TEXTO	2026-03-18 21:12:36.82
3c7a4345-9fe6-4540-9ce3-499b7e1bd00b	6288bd5e-1c5b-4a25-8f18-4cf5511235fe	ab6d9041-7493-45a5-97f5-62ccbb36c59e	📎 Screenshot 2026-03-18 131843.png	ARCHIVO	2026-03-18 21:12:40.088
db018271-0235-4401-9eb4-b11a76c810ca	6288bd5e-1c5b-4a25-8f18-4cf5511235fe	ab6d9041-7493-45a5-97f5-62ccbb36c59e	📎 Screenshot 2026-03-18 150506.png	ARCHIVO	2026-03-18 21:12:40.104
c842c679-db93-4f0b-b098-3d11d5c345e0	1d40e5ef-7107-4879-8a52-389dfa5777ac	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0038 - SEL-700G-1-T-W GEERADOR RELAY:\n0700G11D2X0X77851320	TEXTO	2026-03-19 15:56:35.972
76b4a78e-61ba-482d-bbc4-39d52c672afe	1d40e5ef-7107-4879-8a52-389dfa5777ac	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0039 - SEL-751 FEEDER PROTECTION RELAY:\n7510S1DBD0X7D851DA0	TEXTO	2026-03-19 15:56:35.972
a716df1d-d295-4ee1-a862-9c3ce82bbcfa	1d40e5ef-7107-4879-8a52-389dfa5777ac	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 Especificaciones relÃ©s - PVII (1).png	ARCHIVO	2026-03-19 15:56:40.184
9cb22ea2-20fb-416f-9e19-9a529a88dfe0	ac3de887-8302-4bf7-91b0-aa8055fc17b9	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 WhatsApp Image 2026-03-17 at 10.01.18 AM (1).jpeg	ARCHIVO	2026-03-19 16:30:44.911
b0f90e85-af58-4758-a1f7-88884fc840ea	97e53135-3c40-4b9e-ba16-223e990a3bf4	7b16da9d-1758-4bf9-9960-1ac345362ded	respuesta por correo	TEXTO	2026-03-19 19:47:12.807
7f87c5de-d015-41b8-92c0-248621bd3976	7194631d-33ed-4faa-b07f-edf2c23d420a	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0051 - Transformador integrado de medición, Relación 200:5,:\nSi Tenes ofertas actuales de este suministro me ayudas porfa. aqui vamos a estimar un precio más alto.	TEXTO	2026-03-23 16:36:07.45
1d60b60d-525c-4513-a064-a73b7173a6c0	7194631d-33ed-4faa-b07f-edf2c23d420a	d25da598-5ab6-4684-967f-40bf7b72f3ae	📎 Placas de datos - Equipo Combinado y Medidores.pdf	ARCHIVO	2026-03-23 16:36:10.876
876138b2-7886-4819-b6ee-6f8df27f9b79	7194631d-33ed-4faa-b07f-edf2c23d420a	7b16da9d-1758-4bf9-9960-1ac345362ded	hey	TEXTO	2026-03-23 16:50:00.411
b8d13545-0589-4e69-95d2-fbf5cbd21c7b	db29302f-6488-498e-9b55-c3b2e70d1402	d25da598-5ab6-4684-967f-40bf7b72f3ae	📋 Detalles para PROD-0055 - CVC-110BER and CVC-110BRER 15 kV combination current and voltage transformers:\nIncluir: ficha técnica,  garantia, flete, tiempo de entrega, y demas.	TEXTO	2026-03-24 15:08:29.852
a302475c-76ff-4c50-9805-c1e9332e9a1a	2fd8d740-c50e-4b03-9a8e-875592f638ea	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	📋 Detalles para PROD-0056 - SEL 400G:\nSe requiere un relé de protección de generador tipo SEL-400G, con funciones completas de protección (diferencial de generador, sobrecorriente de fase y neutro, falla a tierra, pérdida de excitación, potencia inversa, desbalance, sobre/subtensión, sobre/subfrecuencia y V/Hz), con al menos 4 entradas de corriente (3 fases + neutro) y 3 entradas de voltaje (120 V). Debe incluir medición eléctrica (potencia, energía, frecuencia), mínimo 16 entradas y 8 salidas digitales para control y disparo, comunicaciones IEC 61850 obligatorias (más Modbus/DNP3), puerto Ethernet dual, registro de eventos y oscilografía, sincronización por IRIG-B o NTP y alimentación en 110–125 VDC. Además, debe ser compatible con integración a SCADA y contar con software de configuración.	TEXTO	2026-03-25 15:03:57.19
1a613d84-ec23-41cd-92f3-5e5ae2afe878	2fd8d740-c50e-4b03-9a8e-875592f638ea	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	📎 Diagrama Trifilar M1-M2.pdf	ARCHIVO	2026-03-25 15:04:01.193
f47c39be-0e6f-4952-a01c-2a72a46277e4	2fd8d740-c50e-4b03-9a8e-875592f638ea	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	📎 400G_DS_20220523 1.pdf	ARCHIVO	2026-03-25 15:04:02.152
d7150c91-40cf-4715-b5eb-b8bb4dfe73e3	2fd8d740-c50e-4b03-9a8e-875592f638ea	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	ya está?	TEXTO	2026-03-25 15:04:24.415
63dba00e-7b99-4bd2-8474-4d1617c92c46	ac3de887-8302-4bf7-91b0-aa8055fc17b9	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	📎 FICHA TECNICA OLFLEX CLASSIC 110.pdf	ARCHIVO	2026-03-25 22:13:24.456
a8c10788-fb7d-41a6-949b-31ef01fe4458	ac3de887-8302-4bf7-91b0-aa8055fc17b9	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	📎 COT- HN-ETC-0000729 OFERTA CABLE LAPP (1).pdf	ARCHIVO	2026-03-25 22:13:38.586
718a4d93-18be-40cf-8fdf-fe35ecffccf7	ac3de887-8302-4bf7-91b0-aa8055fc17b9	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	📎 CotizaciÃ³n RyD 70912 - Energia Potencia Y Desarrollos S.A De C.V..pdf	ARCHIVO	2026-03-25 22:17:40.348
8ffce739-3703-4cde-9118-851041ce0759	ac3de887-8302-4bf7-91b0-aa8055fc17b9	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	ciertas medidas de cable estan con tiempo de entrega 	TEXTO	2026-03-25 22:18:12.443
e349d86b-b978-4632-9d55-4f4cb28a8912	00a780cc-d465-4234-8362-ec81831fc063	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	📎 COTIZACION ENERGIA PD No.8712.pdf	ARCHIVO	2026-03-25 22:46:34.786
77ca3bd2-3151-4fa3-9ecd-42bfe7d58549	00a780cc-d465-4234-8362-ec81831fc063	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	📎 44976.pdf	ARCHIVO	2026-03-25 22:48:10.809
b151402f-fa54-4d49-960c-8cd73326ace0	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📋 Detalles para PROD-0057 - Poste Metalico Autosoportado de 33 metros Tipo RVDC180_0-45:\nSe Adjunta Plano del Poste RVDC180_0-45_33M, Peso del Poste: 8.5 Toneladas	TEXTO	2026-03-25 23:49:00.262
118a34dc-7689-4761-8234-cddfb2eaf68c	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📋 Detalles para PROD-0058 - Poste Metalico Autosoportado de 30 metros Tipo RVDC180_0-90:\nSe Adjunta Plano del Poste RVDC180_0-90_30M, Peso del Poste: 10.15 Toneladas	TEXTO	2026-03-25 23:49:00.262
8956257f-fc72-4c5e-873e-13d24a5915a9	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📋 Detalles para PROD-0059 - Poste Metalico Autosoportado de 30 metros Tipo 2SVII_0-4:\nSe Adjunta Plano del Poste 2SVII_0-4_30M, Peso del Poste: 3.6 Toneladas	TEXTO	2026-03-25 23:49:00.262
749e8ba1-6de4-4330-81a3-c33e87375e42	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📋 Detalles para PROD-0060 - Poste Metalico Autosoportado de 50 metros Tipo AA+2SVII_0-2:\nSe Adjunta Plano del Poste AA+2SVII_0-2_50M, Peso del Poste: 14.53 Toneladas	TEXTO	2026-03-25 23:49:00.262
311452a4-bd98-4875-9d7c-72c4b4d69294	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📋 Detalles para PROD-0061 - Opcional Costo de Pruebas Destructivas:\nEste Item comprende el costo de hacer prueba destructiva a dos modelos de postes ( Un RVDC180_0-45 y Un AA+2SVII_0-2) El cual es por 23.03 Toneladas en Total.	TEXTO	2026-03-25 23:49:00.262
80389952-fd52-4884-b88f-6b9077245e8c	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📎 Comparacion Ofertas ACERO POSTES METALICOS_R1.xlsx	ARCHIVO	2026-03-25 23:49:03.299
e73ec314-df7a-4e29-bc02-8af0dcfa8691	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📎 AJL_STEEL POLE PROJECT HONDURAS_20260325.pdf	ARCHIVO	2026-03-25 23:49:03.489
b1e23abf-0923-4064-80bf-d2ab89059e63	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📎 Cotizaciones Postes Metalicos.rar	ARCHIVO	2026-03-25 23:49:04.261
a66f81ee-b0c7-4cba-9cce-5d8cf1c7af8d	1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	📎 Planos de Postes Metalicos LT LAMANI.rar	ARCHIVO	2026-03-25 23:49:06.246
6c0c5309-26a9-40fe-bdb5-26ca75bc1b9e	f2d5c623-7ff3-4ac7-b33c-4f4cd081e6bf	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	📎 Listado de materiales para sistema de VAISALA portatil_Rev0.xlsx	ARCHIVO	2026-03-26 14:38:04.517
f45eae36-7d94-4c7a-82b2-76cf431f6608	2fd8d740-c50e-4b03-9a8e-875592f638ea	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	como vamos?	TEXTO	2026-03-26 15:27:25.238
\.


--
-- TOC entry 3940 (class 0 OID 17230)
-- Dependencies: 235
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacion (id, user_id, tipo, titulo, descripcion, creada, completada) FROM stdin;
\.


--
-- TOC entry 3953 (class 0 OID 33871)
-- Dependencies: 248
-- Data for Name: oferta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oferta (id, cotizacion_id, nombre, estado, motivo_archivo, fecha_archivo, archivada_por_id, creado, actualizado) FROM stdin;
5825937e-b600-423e-9a21-af3645043396	ccf5dad2-aadd-4ef6-855c-e4b18faddbcc	140-26 - Sum Bateria de plomo acido DJ150(2V150Ah) LEOCH	ACTIVA	\N	\N	\N	2026-03-24 15:05:51.472	2026-03-24 15:05:51.472
7464d18e-cea3-4b62-aa0f-94652ca3c582	14fbd91c-d786-4a5a-bb0f-6543f43632b3	Laptop ASUS	ACTIVA	\N	\N	\N	2026-03-24 15:05:51.802	2026-03-24 15:05:51.802
763d71c4-bbe2-46e1-baa2-5295c4688268	d6cf00c6-e39e-48bb-a984-601d348e0d0f	laptop	ACTIVA	\N	\N	\N	2026-03-24 15:05:51.968	2026-03-24 15:05:51.968
ac55bce7-231a-4716-9b90-d8324d453991	bd3e4b5e-ce17-41c8-8bec-17e1cc7cc055	226-25 ELCOSA-Suministro , Instalacion, Pruebas y puesta en marcha de AVR Basler	ACTIVA	\N	\N	\N	2026-03-24 15:05:52.133	2026-03-24 15:05:52.133
71cc1dc3-48e8-4f79-808b-36e422fff62f	3d1f461e-70d6-49ae-8b31-b1886fd8e33b	200-26 El Yaguala - Suministro e instalación de TC´s	ACTIVA	\N	\N	\N	2026-03-24 15:05:52.297	2026-03-24 15:05:52.297
95913f04-020c-4060-8383-cafdaae26a53	769ed2eb-ae15-40d4-8318-1c81c4556891	165-26 UTCD - Sum Equipos SEL SE Guaymas	ACTIVA	\N	\N	\N	2026-03-24 15:05:52.463	2026-03-24 15:05:52.463
b18394f1-d949-4a98-a2cc-5cf55f98040a	87b5ac3a-1c07-49c7-a3a7-ccb9be32fb00	179-26 solicitud-Suministro de reloj satelital	ACTIVA	\N	\N	\N	2026-03-24 15:05:52.629	2026-03-24 15:05:52.629
ff02a328-c6a8-4a98-a491-78b648ffa095	c28bb5d6-4fab-4683-ba0c-d4ae8a0ad642	UTCD - 789-25 Suministro Equipos SEL	ACTIVA	\N	\N	\N	2026-03-24 15:05:52.793	2026-03-24 15:05:52.793
20d9999a-456f-433e-ac26-436c607009f2	94b01a3b-e5bd-49f4-a7e5-a584acf1642b	210-26 ELCOSA - Suministro y reemplazo de generador	ACTIVA	\N	\N	\N	2026-03-24 15:05:52.958	2026-03-24 15:05:52.958
793b36f7-c38f-45cf-8bb4-28ecd7e606cf	8a81c470-8d75-42b1-b969-7f76c5dbceb9	185-26 UTCD - Suministro de 2 Reclosers (SPS y Ceiba)	ACTIVA	\N	\N	\N	2026-03-24 15:05:53.123	2026-03-24 15:05:53.123
77c150cc-afb0-461f-b409-2c997ec847e6	d3c64b06-5998-4993-a418-a962dcf1f73e	201-26 Solicitud - Suministro cargador de baterías	ACTIVA	\N	\N	\N	2026-03-24 15:05:53.287	2026-03-24 15:05:53.287
3d1dfd7d-2e7b-455b-b502-df18accf73a5	465c1bfa-1da9-424b-acef-b2c88ccee0b6	213-26 INE - Suministro Motor Radiador Trafo 16MVA Chint	ACTIVA	\N	\N	\N	2026-03-24 15:05:53.456	2026-03-24 15:05:53.456
afa72eb9-012a-41ec-964c-657ee605987f	dfe1af15-607f-45dd-8da8-d4bafd3f648f	223-26 Empacadora San Lorenzo- Suministro de cable de control	ACTIVA	\N	\N	\N	2026-03-24 15:05:53.621	2026-03-24 15:05:53.621
40412b7f-e3c2-4192-b0c1-b35d9a68d391	fd18e65d-88a0-468d-9af2-e9fd203cdcf2	216-26 Lufussa - Suministro relés de protección PVII	ACTIVA	\N	\N	\N	2026-03-24 15:05:53.95	2026-03-24 15:05:53.95
ac3bd654-cbd1-4ed6-92d7-c6429a6e95b8	a7beae9f-dbfb-46a9-9e3a-8683abd30ef9	169-26 Laeisz / Bermejo - Suministro e instalación de Controlador de Temperatura	ACTIVA	\N	\N	\N	2026-03-24 15:05:54.115	2026-03-24 15:05:54.115
e1b92573-2f5e-452c-b8c2-1bdacacd45f2	99007de4-71b1-44ce-b511-aa4640cc9c98	170-26 Laeisz / La Puerta - Suministro e instalación de Controlador de Temperatura	ACTIVA	\N	\N	\N	2026-03-24 15:05:54.281	2026-03-24 15:05:54.281
e34649e0-6b2e-42ce-bf92-81e23e551204	6858d5ca-1163-47f4-8ce4-c06a8e0048d6	191-26 La Aurora - Reemplazo de Punto de Medición	ACTIVA	\N	\N	\N	2026-03-24 15:05:54.445	2026-03-24 15:05:54.445
84e2d9b0-653b-4806-b303-693a7d943c67	a555ddb1-e05e-49a1-9a16-25b441ee6174	233-26 AZUNOSA- Suministro de equipos y material electrico	ACTIVA	\N	\N	\N	2026-03-24 15:05:54.61	2026-03-24 15:05:54.61
efb1db59-ee51-44b1-a420-396302f123aa	c02d91cc-736e-42ff-ba64-5418d36462d4	215-26 IMPELCO- Sum. de Recloser	ACTIVA	\N	\N	\N	2026-03-24 15:05:54.774	2026-03-24 15:05:54.774
7bda3a98-b988-42d5-8d90-048ee4f45103	6a087248-ab48-47e4-bde2-ab7802bd5490	Suministro de relevador SEL 400G	ACTIVA	\N	\N	\N	2026-03-25 15:03:57.188	2026-03-25 15:03:57.188
3c07fdf1-e0c9-45cb-982e-fbf27db7ce91	7e9002a1-572b-4a16-8cca-ff437810840f	Instalación portatil de Vaisala	ACTIVA	\N	\N	\N	2026-03-26 14:38:02.3	2026-03-26 14:38:02.3
bb1cdd5f-fad7-4411-bf04-1fc60ebede5c	1f7125af-3444-4d46-aa7a-ab736e897331	Cable 4x8 AWG con apantallamiento metálico	ACTIVA	\N	\N	\N	2026-03-26 15:26:53.528	2026-03-26 15:26:53.528
\.


--
-- TOC entry 3954 (class 0 OID 33895)
-- Dependencies: 249
-- Data for Name: oferta_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oferta_producto (id, oferta_id, estado_producto_id, cotizacion_id, sku, descripcion, cotizado, con_descuento, aprobacion_compra, comprado, pagado, aprobacion_planos, primer_seguimiento, en_fob, cotizacion_flete_internacional, con_bl, segundo_seguimiento, en_cif, recibido, fecha_cotizado, fecha_con_descuento, fecha_aprobacion_compra, fecha_comprado, fecha_pagado, fecha_aprobacion_planos, fecha_primer_seguimiento, fecha_en_fob, fecha_cotizacion_flete_internacional, fecha_con_bl, fecha_segundo_seguimiento, fecha_en_cif, fecha_recibido, proveedor, precio_unitario, precio_total, cantidad, observaciones, tipo_compra, responsable_id, creado, actualizado) FROM stdin;
\.


--
-- TOC entry 3942 (class 0 OID 17486)
-- Dependencies: 237
-- Data for Name: pais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pais (id, nombre, codigo, activo, creado, actualizado) FROM stdin;
08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	China	CN	t	2026-02-04 11:48:00.435	2026-02-04 11:48:00.435
3c1328e6-ef5b-4c1c-8de0-393de20ee5af	Estados Unidos	US	t	2026-02-04 11:48:00.435	2026-02-04 11:48:00.435
a683c3b9-0a60-47d9-9f48-94f3ed311b70	Alemania	DE	t	2026-02-04 11:48:00.435	2026-02-04 11:48:00.435
aec2710b-7c7a-48f3-a8c4-a21d38d222f3	Japón	JP	t	2026-02-04 11:48:00.435	2026-02-04 11:48:00.435
152442dd-f8bb-4480-9f63-1f7605b67ccb	Corea del Sur	KR	t	2026-02-04 11:48:00.435	2026-02-04 11:48:00.435
53b360e4-f5fe-4f27-beba-90bc79390f07	Honduras	HN	t	2026-02-04 11:48:00.435	2026-02-04 11:48:00.435
\.


--
-- TOC entry 3937 (class 0 OID 17208)
-- Dependencies: 232
-- Data for Name: participantes_chat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participantes_chat (chat_id, user_id, ultimo_leido) FROM stdin;
38b84f7b-42de-4bb8-93f4-65dc2a885c3c	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-10 13:54:12.908
76f03478-9b50-4b75-9a47-40f9205fa1cd	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 22:33:08.131
1d40e5ef-7107-4879-8a52-389dfa5777ac	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-25 20:18:07.815
744d45d9-cf5b-4316-b074-2b7e0c0acb1b	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-25 22:50:07.265
42cb472a-68a7-40b5-b25a-023854c46336	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-17 20:38:28.875
db29302f-6488-498e-9b55-c3b2e70d1402	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 15:08:47.299
6288bd5e-1c5b-4a25-8f18-4cf5511235fe	ab6d9041-7493-45a5-97f5-62ccbb36c59e	2026-03-23 18:22:00.684
c82a8944-fd3b-4eee-bc13-23ddcbb9c606	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-02-26 16:51:18.371
18f73a95-144f-4261-83ac-645bbc44a08e	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:19:31.836
a15891a4-5750-47c8-a971-3a1b0efbe757	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 20:08:04.439
48fd22f8-e8ae-4f25-b2ea-369ceb889c97	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 14:20:02.874
ac3de887-8302-4bf7-91b0-aa8055fc17b9	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:51:31.054
48fd22f8-e8ae-4f25-b2ea-369ceb889c97	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-20 15:01:36.824
09344940-5796-41ce-b672-9da1e32ba2d7	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 14:24:18.103
085f0cfc-fe8d-422a-b4b5-a30144389b8e	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:21:21.309
97e53135-3c40-4b9e-ba16-223e990a3bf4	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:22:05.412
6b2c08ec-bfb3-4615-a6cf-3ad3f9922c68	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-03 21:42:00.799
42cb472a-68a7-40b5-b25a-023854c46336	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-12 21:55:01.141
38b84f7b-42de-4bb8-93f4-65dc2a885c3c	a3f68665-8076-4595-9319-4be43d8e48be	2026-03-23 14:09:37.175
db29302f-6488-498e-9b55-c3b2e70d1402	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:57:12.542
a160e11d-575c-4651-b100-14c641a7162a	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:22:06.158
9a080ae0-283b-4035-b00c-2d6b72b2ea32	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-16 21:28:31.249
bcac2c7c-b195-4a59-b29c-6f9a670f44c9	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-09 22:01:21.481
09344940-5796-41ce-b672-9da1e32ba2d7	a3f68665-8076-4595-9319-4be43d8e48be	2026-03-23 14:09:44.426
6b2c08ec-bfb3-4615-a6cf-3ad3f9922c68	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-24 13:52:00.373
c17d6370-f83a-4589-8210-c35f535e448b	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:22:09.433
bcac2c7c-b195-4a59-b29c-6f9a670f44c9	a3f68665-8076-4595-9319-4be43d8e48be	2026-03-09 22:03:14.586
2fd8d740-c50e-4b03-9a8e-875592f638ea	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-26 15:31:56.902
38b84f7b-42de-4bb8-93f4-65dc2a885c3c	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:30:46.061
915877a2-1363-4f48-bab5-fb69a536223e	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-26 14:48:52.18
c17d6370-f83a-4589-8210-c35f535e448b	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:26:51.239
09344940-5796-41ce-b672-9da1e32ba2d7	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-13 16:40:04.582
83318a38-fc81-4fa3-8a2c-aa03cc5ac281	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-13 16:40:31.095
83318a38-fc81-4fa3-8a2c-aa03cc5ac281	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:08:36.869
bcac2c7c-b195-4a59-b29c-6f9a670f44c9	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 19:52:12.131
910fd6e3-d9a9-498b-8135-4e04a8313f77	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 19:52:14.221
9ba73af8-846b-46ec-858e-7de49643bf44	2d791fa1-940c-45bf-a980-1499bbbe1b2a	2026-03-26 15:17:44.965
18f73a95-144f-4261-83ac-645bbc44a08e	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:13:25.79
915877a2-1363-4f48-bab5-fb69a536223e	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:34:43.467
f2d5c623-7ff3-4ac7-b33c-4f4cd081e6bf	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-26 15:30:06.921
744d45d9-cf5b-4316-b074-2b7e0c0acb1b	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-13 14:30:34.44
c17d6370-f83a-4589-8210-c35f535e448b	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-17 20:24:21.929
00a780cc-d465-4234-8362-ec81831fc063	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 14:35:20.619
adf444c5-4c3d-4759-ba6a-073b6eef70e0	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	2026-03-26 15:26:53.508
c17d6370-f83a-4589-8210-c35f535e448b	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-17 20:25:38.104
7194631d-33ed-4faa-b07f-edf2c23d420a	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 21:41:16.79
9a080ae0-283b-4035-b00c-2d6b72b2ea32	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-17 20:26:39.293
09344940-5796-41ce-b672-9da1e32ba2d7	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-23 19:18:20.277
bcac2c7c-b195-4a59-b29c-6f9a670f44c9	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:17:33.347
7194631d-33ed-4faa-b07f-edf2c23d420a	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 19:58:06.955
7194631d-33ed-4faa-b07f-edf2c23d420a	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-23 16:36:16.275
38b84f7b-42de-4bb8-93f4-65dc2a885c3c	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:18:26.666
915877a2-1363-4f48-bab5-fb69a536223e	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-23 19:18:21.769
00a780cc-d465-4234-8362-ec81831fc063	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:58:08.652
085f0cfc-fe8d-422a-b4b5-a30144389b8e	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:58:12.527
910fd6e3-d9a9-498b-8135-4e04a8313f77	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:21:35.681
a160e11d-575c-4651-b100-14c641a7162a	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:39:56.907
ac3de887-8302-4bf7-91b0-aa8055fc17b9	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-26 15:30:17.541
6288bd5e-1c5b-4a25-8f18-4cf5511235fe	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:42:53.923
7194631d-33ed-4faa-b07f-edf2c23d420a	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:27:21.786
97e53135-3c40-4b9e-ba16-223e990a3bf4	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 16:40:17.878
1d40e5ef-7107-4879-8a52-389dfa5777ac	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 21:41:21.047
97e53135-3c40-4b9e-ba16-223e990a3bf4	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:29:46.566
2fd8d740-c50e-4b03-9a8e-875592f638ea	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:58:33.54
ac3de887-8302-4bf7-91b0-aa8055fc17b9	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-23 17:54:14.851
7194631d-33ed-4faa-b07f-edf2c23d420a	5cddfc77-b008-4e66-b913-2bdd952e31af	2026-03-23 17:54:25.372
00a780cc-d465-4234-8362-ec81831fc063	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:08:30.756
38b84f7b-42de-4bb8-93f4-65dc2a885c3c	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 19:54:36.091
00a780cc-d465-4234-8362-ec81831fc063	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:48:11.207
f2d5c623-7ff3-4ac7-b33c-4f4cd081e6bf	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	2026-03-26 15:30:23.316
ac3de887-8302-4bf7-91b0-aa8055fc17b9	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:09:00.359
a160e11d-575c-4651-b100-14c641a7162a	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-24 14:41:22.351
6288bd5e-1c5b-4a25-8f18-4cf5511235fe	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:29:48.666
18f73a95-144f-4261-83ac-645bbc44a08e	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:45:56.714
b75b69fa-c30e-4814-93db-fb739c9d0369	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:48:48.643
085f0cfc-fe8d-422a-b4b5-a30144389b8e	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-24 14:57:13.374
1d40e5ef-7107-4879-8a52-389dfa5777ac	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:49:03.072
b75b69fa-c30e-4814-93db-fb739c9d0369	d25da598-5ab6-4684-967f-40bf7b72f3ae	2026-03-25 20:48:53.526
ac3de887-8302-4bf7-91b0-aa8055fc17b9	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:40:50.353
83318a38-fc81-4fa3-8a2c-aa03cc5ac281	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-24 15:07:12.599
b75b69fa-c30e-4814-93db-fb739c9d0369	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 21:18:27.408
09344940-5796-41ce-b672-9da1e32ba2d7	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:35:19.686
910fd6e3-d9a9-498b-8135-4e04a8313f77	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:16:21.361
db29302f-6488-498e-9b55-c3b2e70d1402	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:16:30.394
83318a38-fc81-4fa3-8a2c-aa03cc5ac281	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:36:15.381
b75b69fa-c30e-4814-93db-fb739c9d0369	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 19:37:52.76
bcac2c7c-b195-4a59-b29c-6f9a670f44c9	7b16da9d-1758-4bf9-9960-1ac345362ded	2026-03-25 20:17:04.581
2fd8d740-c50e-4b03-9a8e-875592f638ea	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	2026-03-26 15:27:25.45
1d40e5ef-7107-4879-8a52-389dfa5777ac	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-25 20:17:38.705
a160e11d-575c-4651-b100-14c641a7162a	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:42:48.555
adf444c5-4c3d-4759-ba6a-073b6eef70e0	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-26 15:29:31.454
97e53135-3c40-4b9e-ba16-223e990a3bf4	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:43:06.617
2fd8d740-c50e-4b03-9a8e-875592f638ea	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:43:20.544
db29302f-6488-498e-9b55-c3b2e70d1402	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:43:28.847
085f0cfc-fe8d-422a-b4b5-a30144389b8e	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	2026-03-25 22:43:35.701
1393bc09-a2aa-46d7-8d07-905e4d4da2b6	a1a14554-daa0-4458-95ad-905a083aedc8	2026-03-26 15:55:06.026
1393bc09-a2aa-46d7-8d07-905e4d4da2b6	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	2026-03-26 15:31:24.218
\.


--
-- TOC entry 3927 (class 0 OID 17123)
-- Dependencies: 222
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, modulo, accion, descripcion, activo, creado) FROM stdin;
2a8552b2-eaa7-4b5d-a9be-572fc76c7131	cotizaciones	crear	Crear cotizaciones	t	2026-02-04 21:42:35.613
e9edbfd6-69b9-4189-afa3-ca6c9af1ecc0	cotizaciones	ver	Ver cotizaciones	t	2026-02-04 21:42:35.619
89ed7b8a-ca40-47f6-b4d8-f2c11467e49d	cotizaciones	editar	Editar cotizaciones	t	2026-02-04 21:42:35.624
3dcb1d77-e35c-490a-bdaa-195bc4cb2d31	cotizaciones	eliminar	Eliminar cotizaciones	t	2026-02-04 21:42:35.628
e46480d1-dad3-4c08-9a71-cf9c1ee9a195	cotizaciones	aprobar	Aprobar cotizaciones	t	2026-02-04 21:42:35.633
37c8f666-2b33-485d-b3fc-1d25d5e4ac04	compras	crear	Crear órdenes de compra	t	2026-02-04 21:42:35.638
f73c34dd-a36b-447e-ba6e-c4187b8a4698	compras	ver	Ver órdenes de compra	t	2026-02-04 21:42:35.643
bde0b920-317b-411d-abca-ccba2acbd61c	compras	editar	Editar órdenes de compra	t	2026-02-04 21:42:35.647
cd2b18ba-f428-4b83-b730-7d201718334a	usuarios	crear	Crear usuarios	t	2026-02-04 21:42:35.651
cd40f61e-2f1f-48c9-95c8-3ffd635157ab	usuarios	ver	Ver usuarios	t	2026-02-04 21:42:35.655
bc608511-2fc8-4dcb-a33f-b6e79925b16e	usuarios	editar	Editar usuarios	t	2026-02-04 21:42:35.659
4e58feb5-bfaf-4498-b618-d30e0c5fc3fd	usuarios	eliminar	Eliminar usuarios	t	2026-02-04 21:42:35.662
05a67ed5-1fbf-436d-b5cc-2d166f1571a8	catalogos	crear	Crear catálogos	t	2026-02-04 21:42:35.666
2ef46b76-7dca-465a-949c-45c40a08dc1c	catalogos	ver	Ver catálogos	t	2026-02-04 21:42:35.669
009fd49a-6fa4-4bf0-b297-3a754667a847	catalogos	editar	Editar catálogos	t	2026-02-04 21:42:35.673
349876a1-d829-4359-9487-16597f4c15af	reportes	ver	Ver reportes	t	2026-02-04 21:42:35.677
56211f5b-b31b-4bab-b5e3-eae751197ad3	reportes	exportar	Exportar reportes	t	2026-02-04 21:42:35.681
\.


--
-- TOC entry 3932 (class 0 OID 17166)
-- Dependencies: 227
-- Data for Name: precios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.precios (id, cotizacion_detalle_id, precio, precio_descuento, proveedor_id, fecha_consulta, comprobante_descuento) FROM stdin;
af164c59-2039-4e09-925e-8fcf6f1d5dfd	d21715ff-6f2a-4808-a12e-05ea714f4e31	350.0000	350.0000	606fa1b5-695a-44a9-97a6-5e75849606b4	2026-02-25 22:22:14.965	NO_APLICA_1772058204691
d5e53ff6-8a17-4418-822b-28d58861517f	d21715ff-6f2a-4808-a12e-05ea714f4e31	250.0000	150.0000	d9a68116-8f36-4e67-833d-c9e968b67326	2026-02-25 22:23:38.018	https://nx88862.your-storageshare.de/s/X5LKAgfJDQRzTZC
6bafe013-8817-4bd2-8059-7999e4184d4f	67e856a3-57bb-402c-8617-9aeb433f59fe	100.0000	100.0000	606fa1b5-695a-44a9-97a6-5e75849606b4	2026-02-25 22:48:19.151	NO_APLICA_1772059752338
cb009a16-670e-4283-bce7-788ccdf69e9d	40ce0780-5256-4fdd-b557-499921d9a030	50.0000	50.0000	606fa1b5-695a-44a9-97a6-5e75849606b4	2026-02-25 22:48:27.948	NO_APLICA_1772059752659
da9bd48c-5e46-413f-910c-d76ca39388f1	a7aef309-1ec5-49b3-a6e2-079cbcb60268	500.0000	500.0000	d9a68116-8f36-4e67-833d-c9e968b67326	2026-02-25 22:56:09.471	NO_APLICA_1772060177251
15d43914-eb1d-4210-bc42-fb4644115736	a7aef309-1ec5-49b3-a6e2-079cbcb60268	200.0000	200.0000	606fa1b5-695a-44a9-97a6-5e75849606b4	2026-02-25 22:56:01.041	NO_APLICA_1772060304139
ff32d5fd-2365-40e7-a54d-e4132289ab28	c64351dd-998f-486a-8341-50b2b773922a	520.0000	519.9900	e852f9ab-db96-4fae-b4f0-275e8fc5121e	2026-03-03 21:37:15.303	https://nx88862.your-storageshare.de/s/KMGccZXwfTQH8QY
80da2ab8-0f9a-4185-b5ff-1541b45cd3aa	c64351dd-998f-486a-8341-50b2b773922a	620.0000	620.0000	d9a68116-8f36-4e67-833d-c9e968b67326	2026-03-03 21:37:37.374	NO_APLICA_1772573988382
87539a3e-c0c5-420a-b441-82bc8909d1c7	cee25caa-4eb9-4dc8-aa64-cc7cf0ebdc6e	1000.0000	1000.0000	d9a68116-8f36-4e67-833d-c9e968b67326	2026-03-12 14:18:55.555	NO_APLICA_1773325154723
67e839e9-e91d-485f-b2a9-97f4196ddd38	8563e572-2757-49ac-979e-224518aa3c58	1500.0000	1500.0000	3ebd97a8-e672-47db-9a5f-09e1108b6244	2026-03-12 20:07:22.783	NO_APLICA_1773346075216
54f5f4d4-818a-48e2-8bd5-932c91ca4255	d0fef1fb-43ca-4358-addd-5cdf815b1b33	1500.0000	1500.0000	3ebd97a8-e672-47db-9a5f-09e1108b6244	2026-03-12 21:54:05.896	NO_APLICA_1773352456799
5c329007-4623-4cde-a957-6338adbe0b2f	dfb92717-441c-4251-8e47-0d6c398f7c30	150.0000	150.0000	e852f9ab-db96-4fae-b4f0-275e8fc5121e	2026-03-12 21:54:13.11	NO_APLICA_1773352466101
cfb47df4-2fe0-45ee-a8fb-82f9c268647c	c34c1b38-0a10-41ae-a155-8c10e65ab720	1500.0000	1500.0000	d9a68116-8f36-4e67-833d-c9e968b67326	2026-03-16 21:28:12.004	NO_APLICA_1773696495290
ad0410e5-da77-4b76-89ef-4e1287a7a781	b797e76d-cd56-4756-8f1a-ed247f0bbe9e	4242.8900	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-16 21:30:02.92	\N
21b43f6f-cf65-4a1f-963c-35af562097c7	e6c4cd1d-a1c6-4c7a-8158-3c641aa7c5c7	5664.4300	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-16 21:30:16.484	\N
7838b96b-4aa8-4092-bf93-5d34fc84ba50	d3f01218-1070-4ed1-b3a1-e9e7ebfcbcf3	2899.0000	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-16 21:30:29.605	\N
4eaefe97-9cfd-4212-977a-94d4d06bf0da	f9b1b4b3-5dd6-4809-9032-eb37d265112e	5342.1800	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-16 21:30:44.507	\N
48f0b8e8-72f0-4130-9a29-232577e9be3c	10b0db6a-55cc-4345-b4be-4f32140308ac	2847.0600	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-16 21:30:57.202	\N
c87e0d73-9cce-4b11-902d-9064af63a97e	05fba7ef-f5d5-4310-b4e5-ee597b69790f	2892.9100	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-25 15:50:30.662	\N
b4e1d010-5320-4f1b-b91f-6e759404c318	a3699e21-0fd8-4f75-ad67-c7da69abae92	4242.8900	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-25 15:53:15.639	\N
14c4d257-75cb-46c4-b9bd-69f445e4f5af	32d776b1-2990-4aa0-90b0-e3efeca18c44	5664.4300	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-25 15:53:29.558	\N
c055a5ec-cf3f-4e8d-a1f8-99d75c92cfa6	a80cf4b2-47bb-4aaa-b684-7863f973e73e	2899.0000	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-25 15:53:42.124	\N
af7b0db4-e490-4e13-b0b6-a51efa2b4453	da730f73-55d8-430e-98b8-170a100ee6f5	5342.1800	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-25 15:53:54.976	\N
c6e1b6d4-3c9b-42d9-8d97-7c5c584e6d5d	2a94072f-444b-4951-b692-e809bd109493	2847.0600	\N	78ba73eb-d346-4723-bb47-07a3ed452622	2026-03-25 15:54:05.602	\N
45b6c3a7-4a9a-4183-bc06-14983b8f2336	326a8dfd-b889-4a8a-b31a-d8b131e2c681	13545.0000	\N	cd90fb77-dd57-41d9-be1e-181b6a6a95e2	2026-03-25 16:11:31.132	\N
f7614741-c55f-41c7-8dfb-96ec6304817b	37c4f147-6c99-437c-a601-4f082b483823	55.4900	\N	a10792c1-3075-4231-9815-134e7adebd19	2026-03-25 22:36:20.009	\N
7a2cb5cf-5929-4598-b9c7-5998278dff4b	a363fc78-4c1b-4e4a-ab51-bf22395fdf4e	19.9800	\N	a10792c1-3075-4231-9815-134e7adebd19	2026-03-25 22:36:44.169	\N
40474714-a5f9-417e-83f1-0e825627b666	9f290399-17c7-42a6-b4ad-9e4cc32f3e1f	27.1800	\N	a10792c1-3075-4231-9815-134e7adebd19	2026-03-25 22:37:11.983	\N
77be77b3-5fd1-4880-84cc-6d8f2680522d	04886d8c-14f7-4ed6-a467-eb206246ccb6	182.6600	\N	a10792c1-3075-4231-9815-134e7adebd19	2026-03-25 22:37:50.631	\N
f87c41fc-be1f-462c-93fb-7e109e2b98d7	13c0b6b0-20a0-44e0-96c4-9faf551e9fff	266.7800	\N	a10792c1-3075-4231-9815-134e7adebd19	2026-03-25 22:38:14.103	\N
93eb1415-2db8-4799-aff9-717fd510d3c2	8b3c5c80-b326-4f16-8a90-dfa25a859357	253.2400	\N	a10792c1-3075-4231-9815-134e7adebd19	2026-03-25 22:40:27.102	\N
0e1628ca-37ff-43d7-90bb-0c0171d58c71	84519fb3-d719-42a2-9666-f0880f582f46	36000.0000	31800.0000	0cac5b6b-548c-44dd-90eb-e235db7cc5c7	2026-03-26 15:16:03.083	https://nx88862.your-storageshare.de/s/kgByFSPztqsCjee
\.


--
-- TOC entry 3944 (class 0 OID 17504)
-- Dependencies: 239
-- Data for Name: proceso_personalizado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proceso_personalizado (id, nombre, codigo, orden, "esObligatorio", descripcion, activo, creado, actualizado) FROM stdin;
\.


--
-- TOC entry 3925 (class 0 OID 17104)
-- Dependencies: 220
-- Data for Name: proveedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedor (id, nombre, rtn, email, telefono, direccion, activo, creado) FROM stdin;
854fb867-a22d-43b0-af21-1ea517f1e962	TechSupply Honduras	08011234567890	ventas@techsupply.hn	+504 2234-5678	Col. Tepeyac, Tegucigalpa	t	2026-02-04 21:48:10.628
e852f9ab-db96-4fae-b4f0-275e8fc5121e	Oficinas y Más	08019876543210	info@oficinasymas.hn	+504 2234-8888	Blvd. Morazán, Tegucigalpa	t	2026-02-04 21:48:10.631
d9a68116-8f36-4e67-833d-c9e968b67326	Importadora Global	08015555555555	compras@importadoraglobal.com	+504 2234-9999	Zona Industrial, San Pedro Sula	t	2026-02-04 21:48:10.634
606fa1b5-695a-44a9-97a6-5e75849606b4	Electromotores de SA					t	2026-02-20 16:06:29.034
3ebd97a8-e672-47db-9a5f-09e1108b6244	Proveedor de prueba					t	2026-02-20 20:17:52.051
78ba73eb-d346-4723-bb47-07a3ed452622	DEICOM	05019998167909	clarach@deicom.com	+504 99133803	Miami. Florida	t	2026-03-16 21:29:21.445
cd90fb77-dd57-41d9-be1e-181b6a6a95e2	YUEQING POMANIQUE ELECTRIC CO., LTD					t	2026-03-16 21:57:51.441
50ddd6ce-af85-43b5-b82a-fae7e1799fa6	CHINT Electric				3555 Sixian road, Songjiang district, Shanghai, China	t	2026-03-16 22:58:45.034
fb79d703-80ab-49bc-93a1-90ec6b3c9e00	SUMYSELF	05019023499540	ventas.sumyself@gmail.com	3349-9246	Bo. Las Palmas, 20 Calle 8 y 9 Ave, San Pedro Sula Honduras C.A  	t	2026-03-25 22:29:27.867
a10792c1-3075-4231-9815-134e7adebd19	RYD INDUSTRIAL	05019003088167	contabilidad@rydindustrial.com	2558-9313	11 AVE 14-15 CALLE, # 141 BO. PAZ BARAHONA, SAN PEDRO SULA, HONDURAS	t	2026-03-25 22:34:53.44
0cac5b6b-548c-44dd-90eb-e235db7cc5c7	EverStar		everstar008@everstarmachinery.com		Xuzhou City, Jiangsu	t	2026-03-26 15:14:30.879
\.


--
-- TOC entry 3924 (class 0 OID 17094)
-- Dependencies: 219
-- Data for Name: proyecto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proyecto (id, nombre, descripcion, estado, creado, actualizado, criticidad, area_id) FROM stdin;
05190288-ad71-4d18-9c73-8e246f78f912	Proyecto General	Proyecto por defecto para cotizaciones generales	t	2026-02-04 21:48:10.636	2026-02-10 23:06:42.232	5	9dbd6206-8f42-49f0-af91-8dded16da58b
1754454b-a699-4263-81b2-49788531f995	PH JILAMITO	Licitación	t	2026-02-11 16:51:26.835	2026-02-11 16:53:05.9	5	9dbd6206-8f42-49f0-af91-8dded16da58b
eee35a55-c363-414b-9d4e-47a35544dc0c	PM JAMASTRAN		t	2026-02-17 17:02:56.313	2026-02-17 17:04:27.645	5	9dbd6206-8f42-49f0-af91-8dded16da58b
d06d22de-2c4e-4a2c-bc54-af35dd5f00d9	Administracion	\N	t	2026-02-23 14:39:30.685	2026-02-23 14:39:30.685	5	7bffbfd8-eb90-4798-b418-9ae58a4242f5
e8e18a23-0bc6-4e38-9a09-02de28fb2ea8	Proyecto 3 Comercial	\N	t	2026-02-23 15:13:03.964	2026-02-23 15:13:03.964	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
d5c97042-8636-4330-a82b-d76987e258f1	proyecto de area tecnica	\N	t	2026-02-23 15:21:06.16	2026-02-23 15:21:06.16	5	a815a7cd-1e40-45b7-9544-1af8bd20da1c
c7c317e3-24b7-402b-ac55-8b23a72dc7cc	140-26 Sum Bateria Plomo Ácido	\N	t	2026-02-25 22:20:06.869	2026-02-25 22:20:06.869	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
2f179a62-1e2c-43aa-9877-70b9e2d4cc80	140-26	\N	t	2026-02-25 22:38:01.139	2026-02-25 22:38:01.139	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
25599a12-b292-4985-9520-a6c4520ad9e0	140	\N	t	2026-02-25 22:38:54.244	2026-02-25 22:38:54.244	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
e4e7f17c-291e-405e-ad62-19a395ec942e	141-26 Sersa - Suministro Cable Aluminio 34.5KV	\N	t	2026-02-26 16:45:39.397	2026-02-26 16:45:39.397	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
85408720-7f79-403e-889e-7a98fb0c4fab	165-26 UTCD - Sum Equipos SEL SE Guaymas	\N	t	2026-03-04 15:43:59.295	2026-03-04 15:43:59.295	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
5f2fdd27-8634-4aeb-8686-d2d194d65d65	226-25 ELCOSA-Suministro , Instalacion, Pruebas y puesta en marcha de AVR Basler	\N	t	2026-03-04 21:49:44.368	2026-03-04 21:49:44.368	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
a66ce85d-f881-4e24-8078-5a5b1dddacfc	179-26 solicitud-Suministro de reloj satelital	\N	t	2026-03-12 13:46:20.451	2026-03-12 13:46:20.451	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
40efc7c8-17b5-4461-aea8-831da0b748b3	201-26 Solicitud - Suministro cargador de baterías	\N	t	2026-03-12 13:48:30.903	2026-03-12 13:48:30.903	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
5bf4a9d7-8049-4625-b4df-c65840d32c04	Solicitud 789-25 Suministro Equipos SEL	\N	t	2026-03-12 13:50:34.871	2026-03-12 13:50:34.871	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
91da763e-5fd3-4cef-beb0-e3552a278b21	200-26  El Yaguala- Suministro e instalación de TC´s	\N	t	2026-03-12 13:54:41.001	2026-03-12 13:54:41.001	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
1915c881-ad90-4de9-8874-b26006d4c1dc	190-26 Enssur - Suministro e instalación de RTU	\N	t	2026-03-12 14:01:50.304	2026-03-12 14:01:50.304	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
6be53479-068e-47c2-9cdb-69d45db8e90a	185-26 UTCD - Suministro de 2 Reclosers (SPS y Ceiba)	\N	t	2026-03-12 14:22:06.791	2026-03-12 14:22:06.791	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
cf6be4cd-112e-4714-862e-b9e2d414c276	210-26 ELCOSA - Suministro y reemplazo de generador	\N	t	2026-03-13 20:59:11.165	2026-03-13 20:59:11.165	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
708bd955-29f2-407e-b87d-85d032b94291	213-26 INE - Suministro Motor Radiador Trafo 16MVA Chint	\N	t	2026-03-13 21:04:50.942	2026-03-13 21:04:50.942	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
315b16fc-3c0f-45d0-9d59-91d9aa963c1f	PROYECTO X	\N	t	2026-03-16 19:51:56.565	2026-03-16 19:51:56.565	5	9dbd6206-8f42-49f0-af91-8dded16da58b
777cfed2-254c-40f5-90eb-94145d2fbfaf	PROYECTO M	\N	t	2026-03-16 19:59:26.763	2026-03-16 19:59:26.763	5	9dbd6206-8f42-49f0-af91-8dded16da58b
b78ee3bb-f367-471e-abe7-2be6f0e36e5a	170-26 Laeisz / La Puerta - Suministro e instalación de Controlador de Temperatura	\N	t	2026-03-17 21:04:37.246	2026-03-17 21:04:37.246	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
e3594efb-9e96-47e9-beee-bd430e9eb597	169-26 Laeisz / Bermejo - Suministro e instalación de Controlador de Temperatura	\N	t	2026-03-17 21:08:06.571	2026-03-17 21:08:06.571	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
7a609115-c177-42f9-bd3a-bd90410ff081	Proyecto solar Lamani	\N	t	2026-03-18 18:01:12.935	2026-03-18 18:01:12.935	5	9dbd6206-8f42-49f0-af91-8dded16da58b
d9c7ebdd-0a43-4d9d-87a3-dd249ce809c5	PS LAMANI	\N	t	2026-03-18 18:01:37.819	2026-03-18 18:01:37.819	5	9dbd6206-8f42-49f0-af91-8dded16da58b
3aad698d-71c9-45c4-af69-457e5f608f44	216-26 Lufussa - Suministro relés de protección PVII	\N	t	2026-03-19 15:50:42.405	2026-03-19 15:50:42.405	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
55e4c5be-0e67-4eb2-937e-efc72748287f	223-26 Empacadora San Lorenzo- Suministro de cable de control	\N	t	2026-03-19 16:18:20.614	2026-03-19 16:18:20.614	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
5b0db7bb-0862-4ab2-913e-8913c1a9d9cd	226-26 Aceros Alfa- Sum Cuchilla cortocircuito	\N	t	2026-03-19 16:52:59.485	2026-03-19 16:52:59.485	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
a48f0467-2526-4c92-b09d-28a1c2b18b91	191-26 La Aurora - Reemplazo de Punto de Medición	\N	t	2026-03-23 16:28:57.061	2026-03-23 16:28:57.061	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
ffa00706-0cce-44a0-8c2d-9346aac89c79	233-26 AZUNOSA- Suministro de equipos y material electrico	\N	t	2026-03-24 14:32:19.31	2026-03-24 14:32:19.31	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
99db1c0d-c9b9-42a3-951f-7184162d1c8d	215-26 IMPELCO- Sum. de Recloser	\N	t	2026-03-24 14:54:54.925	2026-03-24 14:54:54.925	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
b421c961-dcb8-44ba-bf59-a7a75c81eeb7	211-26 Ecovolt - Suministro de transformadores combinado	\N	t	2026-03-24 15:02:44.82	2026-03-24 15:02:44.82	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
347ae50d-6f33-474b-8831-0fc77385a160	247-26 Ing. Global Guatemala-Suministro e Instalacion de rele	\N	t	2026-03-25 15:00:34.501	2026-03-25 15:00:34.501	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
164226ad-24fa-4b03-890e-9bada1c0de70	248-26 LAEISZ-L.T. Proyecto Solar	\N	t	2026-03-25 23:29:29.457	2026-03-25 23:29:29.457	5	9dbd6206-8f42-49f0-af91-8dded16da58b
e097215c-8198-468e-980f-bd1261552b2e	297-25 Laeisz - Modificación de trafos para Instalación de Vaisala OPT100	\N	t	2026-03-26 14:36:40.664	2026-03-26 14:36:40.664	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
0b7e89c9-50e7-47a5-ac29-299710f43e25	ACTIVO/INVENTARIO ENERGIAPD	\N	t	2026-03-26 15:02:31.305	2026-03-26 15:02:31.305	5	7bffbfd8-eb90-4798-b418-9ae58a4242f5
43350327-1a45-4f4d-999f-414067b67418	200-26 El Yaguala - Suministro e instalación de TC´s	\N	t	2026-03-26 15:25:29.635	2026-03-26 15:25:29.635	5	8700d5ed-2c72-478a-a1dd-aa494253bbf0
\.


--
-- TOC entry 3926 (class 0 OID 17113)
-- Dependencies: 221
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol (id, nombre, descripcion, activo, creado, actualizado) FROM stdin;
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	ADMIN	Administrador del sistema con acceso completo	t	2026-02-04 21:42:35.597	2026-02-04 21:42:35.597
18f6b9ad-7bb2-4551-a120-5208b0e991e9	SUPERVISOR	Supervisor de cotizaciones y compras	t	2026-02-04 21:42:35.605	2026-02-04 21:42:35.605
5c211408-cd26-4007-af15-3cefb77780df	USUARIO	Usuario estándar del sistema	t	2026-02-04 21:42:35.609	2026-02-04 21:42:35.609
\.


--
-- TOC entry 3928 (class 0 OID 17132)
-- Dependencies: 223
-- Data for Name: rol_permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol_permisos (rol_id, permiso_id, creado) FROM stdin;
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	2a8552b2-eaa7-4b5d-a9be-572fc76c7131	2026-02-04 21:42:35.687
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	e9edbfd6-69b9-4189-afa3-ca6c9af1ecc0	2026-02-04 21:42:35.693
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	89ed7b8a-ca40-47f6-b4d8-f2c11467e49d	2026-02-04 21:42:35.697
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	3dcb1d77-e35c-490a-bdaa-195bc4cb2d31	2026-02-04 21:42:35.7
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	e46480d1-dad3-4c08-9a71-cf9c1ee9a195	2026-02-04 21:42:35.703
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	37c8f666-2b33-485d-b3fc-1d25d5e4ac04	2026-02-04 21:42:35.706
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	f73c34dd-a36b-447e-ba6e-c4187b8a4698	2026-02-04 21:42:35.709
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	bde0b920-317b-411d-abca-ccba2acbd61c	2026-02-04 21:42:35.712
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	cd2b18ba-f428-4b83-b730-7d201718334a	2026-02-04 21:42:35.715
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	cd40f61e-2f1f-48c9-95c8-3ffd635157ab	2026-02-04 21:42:35.719
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	bc608511-2fc8-4dcb-a33f-b6e79925b16e	2026-02-04 21:42:35.723
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	4e58feb5-bfaf-4498-b618-d30e0c5fc3fd	2026-02-04 21:42:35.726
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	05a67ed5-1fbf-436d-b5cc-2d166f1571a8	2026-02-04 21:42:35.73
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	2ef46b76-7dca-465a-949c-45c40a08dc1c	2026-02-04 21:42:35.733
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	009fd49a-6fa4-4bf0-b297-3a754667a847	2026-02-04 21:42:35.737
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	349876a1-d829-4359-9487-16597f4c15af	2026-02-04 21:42:35.74
f1e54605-24fe-4cd0-b288-50dca7ab8c8f	56211f5b-b31b-4bab-b5e3-eae751197ad3	2026-02-04 21:42:35.744
18f6b9ad-7bb2-4551-a120-5208b0e991e9	2a8552b2-eaa7-4b5d-a9be-572fc76c7131	2026-02-04 21:42:35.75
18f6b9ad-7bb2-4551-a120-5208b0e991e9	e9edbfd6-69b9-4189-afa3-ca6c9af1ecc0	2026-02-04 21:42:35.753
18f6b9ad-7bb2-4551-a120-5208b0e991e9	89ed7b8a-ca40-47f6-b4d8-f2c11467e49d	2026-02-04 21:42:35.757
18f6b9ad-7bb2-4551-a120-5208b0e991e9	3dcb1d77-e35c-490a-bdaa-195bc4cb2d31	2026-02-04 21:42:35.761
18f6b9ad-7bb2-4551-a120-5208b0e991e9	e46480d1-dad3-4c08-9a71-cf9c1ee9a195	2026-02-04 21:42:35.764
18f6b9ad-7bb2-4551-a120-5208b0e991e9	37c8f666-2b33-485d-b3fc-1d25d5e4ac04	2026-02-04 21:42:35.767
18f6b9ad-7bb2-4551-a120-5208b0e991e9	f73c34dd-a36b-447e-ba6e-c4187b8a4698	2026-02-04 21:42:35.771
18f6b9ad-7bb2-4551-a120-5208b0e991e9	bde0b920-317b-411d-abca-ccba2acbd61c	2026-02-04 21:42:35.774
18f6b9ad-7bb2-4551-a120-5208b0e991e9	2ef46b76-7dca-465a-949c-45c40a08dc1c	2026-02-04 21:42:35.778
18f6b9ad-7bb2-4551-a120-5208b0e991e9	349876a1-d829-4359-9487-16597f4c15af	2026-02-04 21:42:35.782
18f6b9ad-7bb2-4551-a120-5208b0e991e9	56211f5b-b31b-4bab-b5e3-eae751197ad3	2026-02-04 21:42:35.786
5c211408-cd26-4007-af15-3cefb77780df	2a8552b2-eaa7-4b5d-a9be-572fc76c7131	2026-02-04 21:42:35.793
5c211408-cd26-4007-af15-3cefb77780df	e9edbfd6-69b9-4189-afa3-ca6c9af1ecc0	2026-02-04 21:42:35.797
5c211408-cd26-4007-af15-3cefb77780df	2ef46b76-7dca-465a-949c-45c40a08dc1c	2026-02-04 21:42:35.801
\.


--
-- TOC entry 3935 (class 0 OID 17193)
-- Dependencies: 230
-- Data for Name: seguimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seguimiento (id, compra_id, compra_detalle_id, user_id, tipo, detalle, fecha) FROM stdin;
\.


--
-- TOC entry 3946 (class 0 OID 17619)
-- Dependencies: 241
-- Data for Name: sesion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sesion (id, usuario_id, token, jti, refresh_token, user_agent, ip, dispositivo, navegador, expira_en, refresh_expira_en, activa, ultimo_acceso, creado, actualizado) FROM stdin;
de82c6fa-545c-4329-b22b-1c3dc014c25d	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiNzI5OGYwZGMtYjgyZS00YmIyLWFlNTUtNTUyMzAyYjk4ZTEwIiwiaWF0IjoxNzcyMTI0ODcxLCJleHAiOjE3NzIyMTEyNzF9.H7oiPk801kY753-WmU8j6eGNv9FWJmFEv6BsnqbDh9w	7298f0dc-b82e-4bb2-ae55-552302b98e10	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJhZGM1M2RmMC0yODI2LTQwZDktOWI3ZC1hYThjZjU2NTU1NWUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjEyNDg3MSwiZXhwIjoxNzcyNzI5NjcxfQ.tW2LI6B50INgqT_plWCjzREGtEQqhn45AsDJ_MOHC9k	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-02-27 16:54:31.222	2026-03-05 16:54:31.222	f	2026-02-26 16:54:33.108	2026-02-26 16:54:31.226	2026-02-27 17:00:00.034
3df33dcd-05ae-4823-88a5-3186648cb063	c147a496-79b8-40ae-9d9d-baeb07528b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJlbWFpbCI6ImFkbWluQHNpc3RlbWEuY29tIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsInJvbGUiOiJBRE1JTiIsImp0aSI6ImQ0ZWZmOTBiLTBiYmEtNGY5My05YzQ4LWUxOWZiNjIwODU1OCIsImlhdCI6MTc3MjEyMzcyMSwiZXhwIjoxNzcyMjEwMTIxfQ.e7evBAq4NgSD5FrSgCVF7jHdO8F8thIIwa0SGgNaXRQ	d4eff90b-0bba-4f93-9c48-e19fb6208558	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJqdGkiOiJmNWM2YTVmMy00OTg2LTRmOTItOGNiYi05N2NmZGViMjZhMmIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjEyMzcyMSwiZXhwIjoxNzcyNzI4NTIxfQ.0lRzdxYYA-YUEa7kdIu99lMiMxG_6Ndk98aYgWAO3Xc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-02-27 16:35:21.11	2026-03-05 16:35:21.11	f	2026-02-26 16:49:33.769	2026-02-26 16:35:21.113	2026-02-27 17:00:00.034
a4926bb1-7f82-41f1-9a36-6c7903b585b4	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiY2Q4NjU2OWMtYThmNS00MTY3LWI4ODEtZTg3NmQzYmM3NDM2IiwiaWF0IjoxNzczNjkwNjMwLCJleHAiOjE3NzM3NzcwMzB9.T364ueM8rIaZEphsUPr1sIC4oUpv3a5ff7wB-_BTYm4	cd86569c-a8f5-4167-b881-e876d3bc7436	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJiZGM2MGE1OS04NDYxLTQ2NWQtOTIzZC1kZWY0N2Y1ZGI5ODUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY5MDYzMCwiZXhwIjoxNzc0Mjk1NDMwfQ.0BXu_jIThVvxrcxr847izlBlaiRj7gmWz_z6TeW6ESg	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-17 19:50:30.605	2026-03-23 19:50:30.605	f	2026-03-16 19:57:07.753	2026-03-16 19:50:30.608	2026-03-16 19:57:07.754
1b8b6c71-ddae-4f73-9417-36423363a281	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiYTBlNWNmNzYtODA5Ny00NTU4LTgyZDctMDM1YmY2OWZlYjM5IiwiaWF0IjoxNzczOTI4NTg4LCJleHAiOjE3NzQwMTQ5ODh9.-LtwuO9UoecADtn9kAhAzDeRJaOU6r9AeByhC3SWnp8	a0e5cf76-8097-4558-82d7-035bf69feb39	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiI4NDZkOTRkOC1jNTdkLTQwZDctYWJjNy1kZjgzZTU2MWY4N2QiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzkyODU4OCwiZXhwIjoxNzc0NTMzMzg4fQ.NNNGnfxDV33C2t4xsUvAXjvrOEXKGoT45zUMN7Gye-g	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-20 13:56:28.308	2026-03-26 13:56:28.308	f	2026-03-19 20:36:55.643	2026-03-19 13:56:28.311	2026-03-20 14:00:00.026
758f3a00-9979-4aaf-85c4-8f0064a7a5f7	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiYTcxOGZlMDYtYTEzMy00Y2E1LTliM2YtYmNiZmVjY2Q3MmFiIiwiaWF0IjoxNzcyMTI0MTk4LCJleHAiOjE3NzIyMTA1OTh9.sksIBMLRiNs80Pd5Ek4pLsuKF0Ddv0x8lafbhxsZbbo	a718fe06-a133-4ca5-9b3f-bcbfeccd72ab	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI1MWU0ZmM3My0zMzRjLTQ4NmQtODZiNS05YjRjNmY1ZTc4MGEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjEyNDE5OCwiZXhwIjoxNzcyNzI4OTk4fQ.IxuELGDH4EQRvxyCCL_KEkp9cqINpNUnOtnn5zV2QmU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-02-27 16:43:18.914	2026-03-05 16:43:18.914	f	2026-02-26 16:53:30.718	2026-02-26 16:43:18.919	2026-02-27 17:00:00.034
634d58e3-e664-4e92-b0c6-7a8c14ea7b13	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiNGJkYjk0NzEtM2MyNC00YWRkLWFiNGItYTAyODViOGI1ODVkIiwiaWF0IjoxNzcyMDU3NzEwLCJleHAiOjE3NzIxNDQxMTB9.bJ23aAFkzkkWXSEGKXMjurm6Wds-uBLEIIyauhQpweQ	4bdb9471-3c24-4add-ab4b-a0285b8b585d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI4ZTA3M2I0Yy05ZjIwLTQ2YTktOTcyMi01OWY2NWQ0MjllMmYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjA1NzcxMCwiZXhwIjoxNzcyNjYyNTEwfQ.biyXrQXzh4wCdNRXsRIL5nYnZ6BaJVUKmVd2SBTHViE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-02-26 22:15:10.088	2026-03-04 22:15:10.088	f	2026-02-25 22:39:31.596	2026-02-25 22:15:10.091	2026-02-26 23:00:00.02
596ef196-1065-405d-977a-df1bb14bee17	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMDJlZmJkYWItZGJhOS00YmQ4LThkMTAtOThjMjE5NTdkM2U5IiwiaWF0IjoxNzcyMDU3Nzk4LCJleHAiOjE3NzIxNDQxOTh9.FjEITgmo2ZAj3LjDEuoTBY5_nJ7JINTRKn2vsuCZKXE	02efbdab-dba9-4bd8-8d10-98c21957d3e9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiI1ZTlhYzhmOC1hYmEyLTQ0ODEtYjFkZS02ODYxMDJhNDg5ZGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjA1Nzc5OCwiZXhwIjoxNzcyNjYyNTk4fQ.Doy6LmXnbd7xFCsaq-pv1Bdy5oOddI6m-c3vgVCT9II	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-02-26 22:16:38.269	2026-03-04 22:16:38.269	f	2026-02-26 16:54:13.437	2026-02-25 22:16:38.272	2026-02-26 23:00:00.02
ed6b320a-0db2-4c5f-b048-cdf06c2075f7	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6Ijk1MzY4NTRhLTVhZTItNDRhNy1hNmU1LTU5NzBhYjFlZGNjMiIsImlhdCI6MTc3NDM2MjYyMSwiZXhwIjoxNzc0NDQ5MDIxfQ.MXJ_HzVxiF8nhr7HQ7oUfVYtKo6H9oskznY90pTsavo	9536854a-5ae2-44a7-a6e5-5970ab1edcc2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiI1MGNkZjQ3NC1mNDBlLTQ5ZDctOTI2ZS1mYjg5NWM3MjQ2YjQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDM2MjYyMSwiZXhwIjoxNzc0OTY3NDIxfQ.7cGwUualj1ofgTX8-OrpITlbNa4GFaTbXYcp1MLbsrg	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-25 14:30:21.013	2026-03-31 14:30:21.013	f	2026-03-24 23:42:28.081	2026-03-24 14:30:21.016	2026-03-24 23:42:28.083
4c59b013-10a2-46d9-bf65-f2342f95ab9c	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiMGZhOTU3NDYtZTdhMC00Y2M3LWFlODItNjU5MDkyMmMxNGQ3IiwiaWF0IjoxNzczNjkxMDk1LCJleHAiOjE3NzM3Nzc0OTV9.scoJlI1bQX_inu2QVkq-i1jhjKlRKWdieYtAZnnSAO8	0fa95746-e7a0-4cc7-ae82-6590922c14d7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI0N2ZiYjFjOS0wNWM3LTRmMjYtOWI1NS01NTc2MGFkZjU2ZTUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY5MTA5NSwiZXhwIjoxNzc0Mjk1ODk1fQ.I18snzIrL4u-cxcw63cLPNWqCtzNoMCcUNIakUMSt9E	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-17 19:58:15.164	2026-03-23 19:58:15.164	f	2026-03-17 19:33:24.067	2026-03-16 19:58:15.166	2026-03-17 19:33:24.069
ca2c0fac-fa19-47bf-a59d-8477cd0140bd	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZDc5ODQ2ODctMjZhNi00YWJhLWJlOWItM2Q4YWRjZWM0YjZkIiwiaWF0IjoxNzczOTM1MzgwLCJleHAiOjE3NzQwMjE3ODB9.kh-IqBIJegiSCFbMh7E6uvvV95SboakrlnKlV00XkoQ	d7984687-26a6-4aba-be9b-3d8adcec4b6d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIwYzI3YzI5YS1kMTY4LTQyOWQtYmFiMi1jZjMwNzJjYzYzMWQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzkzNTM4MCwiZXhwIjoxNzc0NTQwMTgwfQ.resrzrYWj0hALLdz3M9fbMU9uFG8Z0YWzfEYLspkTuA	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-20 15:49:40.686	2026-03-26 15:49:40.686	f	2026-03-20 15:02:08.743	2026-03-19 15:49:40.689	2026-03-20 16:00:00.021
a08aad4e-578c-424a-8ef9-9d86205131e8	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMjQ0YTc2NmUtYjg1Yi00YWY1LWFiNjEtZTk0YmRjMGUzYjVhIiwiaWF0IjoxNzc0NDQ3NjI4LCJleHAiOjE3NzQ1MzQwMjh9.cY_0vnV6917iFgyrYLI0ASusJRUIiRwkwz0Vs-8k9-E	244a766e-b85b-4af5-ab61-e94bdc0e3b5a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI0NTk0OTkxNi1mMzg0LTQwOWYtYTg0MS02NTAyNmM3MWRjMjAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ0NzYyOCwiZXhwIjoxNzc1MDUyNDI4fQ.EpYhv7vIJpFQ6qEDQL0KeocJZLcnEEOMU8QpppJ97mQ	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 14:07:08.35	2026-04-01 14:07:08.35	f	2026-03-25 19:10:19.573	2026-03-25 14:07:08.354	2026-03-25 19:10:19.575
f0bbe70d-ff1c-464f-be68-f3a7269daef1	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6ImJjMjc2MzA3LWY2ZDQtNGU1Ny04Y2UxLTc4YjAyMjc3MGY4NCIsImlhdCI6MTc3MzY3ODU5NCwiZXhwIjoxNzczNzY0OTk0fQ.jMN8_kqmWarTscAsll-a_NQjPdP_I-fXCUYkjV-ahWI	bc276307-f6d4-4e57-8ce1-78b022770f84	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiIzNzc0MGYwYS1jYWM3LTQ2NjgtOGQxNS00NmRhN2E3MmUxZGUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY3ODU5NCwiZXhwIjoxNzc0MjgzMzk0fQ.GyYgQLUOV_UhvIeZHHiHdlT4Y_IRonwaeg3Sf60s8dI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-17 16:29:54.267	2026-03-23 16:29:54.267	f	2026-03-16 16:31:25.793	2026-03-16 16:29:54.27	2026-03-17 17:00:00.02
7aeb3d0e-95dc-41dd-895e-55f932bb9a7c	e631a960-c715-4613-8d40-72f667540218	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNjMxYTk2MC1jNzE1LTQ2MTMtOGQ0MC03MmY2Njc1NDAyMTgiLCJlbWFpbCI6ImRtZWxlbmRlekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiRGF5YW5hIE1lbGVuZGV6Iiwicm9sZSI6IlVTVUFSSU8iLCJqdGkiOiJjMmZiNzkwZi1lNmY2LTQxMDgtOGZkZi03ZDE5YWNjMTBiNTgiLCJpYXQiOjE3NzQ0NTA0MTcsImV4cCI6MTc3NDUzNjgxN30.9uGlLaX-nqnFIEpAGg_YjAzvx7RYzKnoZfWJupXty20	c2fb790f-e6f6-4108-8fdf-7d19acc10b58	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNjMxYTk2MC1jNzE1LTQ2MTMtOGQ0MC03MmY2Njc1NDAyMTgiLCJqdGkiOiJkYTk1NDIxMi00MDUzLTRlNzUtODJiNy0yMThmODM5MDdiODAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ1MDQxNywiZXhwIjoxNzc1MDU1MjE3fQ.S5IEGbad3eTZ9ShbePUfoZTa17MrRpaoiQt9kdYMheI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 14:53:37.604	2026-04-01 14:53:37.604	f	2026-03-25 14:56:04.082	2026-03-25 14:53:37.607	2026-03-26 15:00:00.016
688f7ca8-af83-40e2-b0f3-38d3cd471f4b	c147a496-79b8-40ae-9d9d-baeb07528b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJlbWFpbCI6ImFkbWluQHNpc3RlbWEuY29tIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsInJvbGUiOiJBRE1JTiIsImp0aSI6IjE0YjQxM2VmLWI3NzctNGNmZi04MDYwLWZiYzBhMDVkZDE5YyIsImlhdCI6MTc3NDQ2NTgyNiwiZXhwIjoxNzc0NTUyMjI2fQ.NEqpA1BPNULgphXuKN_czSocyqI9BC8ORokZjzpYQdY	14b413ef-b777-4cff-8060-fbc0a05dd19c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJqdGkiOiJkZTdjNjFmYS05NTQ1LTRjYTQtOTljZC0wOTZhOWViZWMyMWQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ2NTgyNiwiZXhwIjoxNzc1MDcwNjI2fQ.Mbfc1qUsHs_4Kvsw1_Ds4SlBfH8RHd95ldA_MxCIwVU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 19:10:26.243	2026-04-01 19:10:26.243	t	2026-03-26 16:03:04.475	2026-03-25 19:10:26.246	2026-03-26 16:03:04.477
619e3ff0-dafe-4217-b84d-45e10fb072f8	c147a496-79b8-40ae-9d9d-baeb07528b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJlbWFpbCI6ImFkbWluQHNpc3RlbWEuY29tIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsInJvbGUiOiJBRE1JTiIsImp0aSI6IjZlNWUzMzZiLTkxZDktNDQ5Yi1hZjNjLTU2OGNkM2RkNGQwYiIsImlhdCI6MTc3Mzk1NTgyMywiZXhwIjoxNzc0MDQyMjIzfQ.JGFA4NIK7eJYVse_lZ3ryWl5czQLardajPGgJJMc-w0	6e5e336b-91d9-449b-af3c-568cd3dd4d0b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJqdGkiOiI5ZWMyZTgzMy0yYmYyLTQwZjMtOThjMS0wMGJkMTYxNjhkYmEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzk1NTgyMywiZXhwIjoxNzc0NTYwNjIzfQ.UzLWjJ9I0peGgxYStHYHtqOBVtc0HuhhhTsR5GkHoyU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-20 21:30:23.458	2026-03-26 21:30:23.458	f	2026-03-20 14:39:42.653	2026-03-19 21:30:23.46	2026-03-20 14:39:42.655
a6a4df02-9529-4d03-ae37-4030180fabdb	a1a14554-daa0-4458-95ad-905a083aedc8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWExNDU1NC1kYWEwLTQ0NTgtOTVhZC05MDVhMDgzYWVkYzgiLCJlbWFpbCI6ImpoYXNidW5AZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6Ikpvc3VlIEhhc2J1biIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiODAwYmE4ODAtOWUyNi00Yjc2LWJlYTEtZmJiZGY5YmRkOGJjIiwiaWF0IjoxNzc0NDgxMjIxLCJleHAiOjE3NzQ1Njc2MjF9.newhUWC8pZbulSdgUmfRUUfc9kuHnIB4SaxQyEMYtD4	800ba880-9e26-4b76-bea1-fbbdf9bdd8bc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWExNDU1NC1kYWEwLTQ0NTgtOTVhZC05MDVhMDgzYWVkYzgiLCJqdGkiOiI3OWFmZGY4OS01ZTBkLTQwMWYtOTE4Yi1kNTBmZjE4MDRlMDQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ4MTIyMSwiZXhwIjoxNzc1MDg2MDIxfQ.RyluMfRT1BrfmS1idUKnTbqXrr-30FuTfan5nL0aOmg	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 23:27:01.032	2026-04-01 23:27:01.032	t	2026-03-26 15:55:06.017	2026-03-25 23:27:01.035	2026-03-26 15:55:06.018
b0f15ac5-5269-4b45-b263-0b490804aeb6	2d791fa1-940c-45bf-a980-1499bbbe1b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJlbWFpbCI6ImVlbWVqaWFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkVsbWluIE1lamlhIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiJjZjVkMDViOC1lNGJlLTQ1Y2EtYTk5YS1jMTQ5N2ExZDlhYmUiLCJpYXQiOjE3NzQzOTU1NTEsImV4cCI6MTc3NDQ4MTk1MX0.XNUnVuHJU6N431tS1PasVSKcK-9RigwS9aMlNfXM5OE	cf5d05b8-e4be-45ca-a99a-c1497a1d9abe	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJqdGkiOiIwMmJiZmI5MC1mMTM3LTRmNzEtODI5Yy1mYTg3YzIzOWE4NmYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDM5NTU1MSwiZXhwIjoxNzc1MDAwMzUxfQ.FFvtYDxRB4gnRYgk7Uw2uq-bp4s0WpAlUSok04DUopM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-25 23:39:11.495	2026-03-31 23:39:11.495	f	2026-03-25 19:29:54.196	2026-03-24 23:39:11.497	2026-03-26 00:00:00.024
2511b7e8-bdcf-4286-aec1-da7da7f1d895	ab6d9041-7493-45a5-97f5-62ccbb36c59e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjZkOTA0MS03NDkzLTQ1YTUtOTdmNS02MmNjYmIzNmM1OWUiLCJlbWFpbCI6InNvbGFyZGVzaWduQGVuZXJnaWFwZC5jb20iLCJub21icmUiOiJHYWJyaWVsIE1vbmNhZGEiLCJyb2xlIjoiVVNVQVJJTyIsImp0aSI6ImVhN2I2ZjVkLTRhMGYtNDViNi04N2ExLTYwMGE4ZDU1YjY5NyIsImlhdCI6MTc3Mzk2MjY1NCwiZXhwIjoxNzc0MDQ5MDU0fQ.hBulR4oscrxEEAGbr8rdJbOgSx0K6SHMAylBfvZydrc	ea7b6f5d-4a0f-45b6-87a1-600a8d55b697	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjZkOTA0MS03NDkzLTQ1YTUtOTdmNS02MmNjYmIzNmM1OWUiLCJqdGkiOiI5NDlhMWJkNi1jNjEwLTQzM2YtYjVjZC1jMmRkMGFjN2Y4ODQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzk2MjY1NCwiZXhwIjoxNzc0NTY3NDU0fQ.xwRAwoyjRMZk0GAAl2OW-UNl-b8QHCJ2G4bX2b7sPuc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-20 23:24:14.77	2026-03-26 23:24:14.77	f	2026-03-19 23:24:22.242	2026-03-19 23:24:14.773	2026-03-21 00:00:00.023
5fed4aaf-2dd6-4bcf-b40a-efb32ca225ff	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZDEzZWQ2MDMtNTQyMi00MTk4LWE0NDItZTgwYjY4Y2E3Y2MxIiwiaWF0IjoxNzc0NDY2NDcwLCJleHAiOjE3NzQ1NTI4NzB9.6Hj-kEZ13IwifxfktLTVnkfzoMhvkdqTOgTv1f40fbE	d13ed603-5422-4198-a442-e80b68ca7cc1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiIxNDZiNmFlNy00NDIzLTQ3MzctYjY4ZC1iZWY4NDU0ZTE5ZDgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ2NjQ3MCwiZXhwIjoxNzc1MDcxMjcwfQ.2pwIQIK3DV0swmcamD-kSm4rAuDlvIxdUm9OZ0MG6lI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 19:21:10.555	2026-04-01 19:21:10.555	f	2026-03-25 21:08:44.274	2026-03-25 19:21:10.558	2026-03-25 21:08:44.275
873728f6-2bae-43e1-926d-2a9c0c6b4dc6	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTkxYjY3ZS0yYjNjLTRhMGUtOWU3NS0wMjI5MmMyY2RkOTciLCJlbWFpbCI6ImptZWppYUBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiSmFtaWwgTWVqaWEiLCJyb2xlIjoiVVNVQVJJTyIsImp0aSI6IjY4NmNhZmJhLTJkYTQtNGZkZC05OWEyLTZiOTM1YjkwNmM4NCIsImlhdCI6MTc3NDQ1MDczNiwiZXhwIjoxNzc0NTM3MTM2fQ.U5l5JF574xT35xCiu1ZDGiDoC10IjeXKm9NX8QEYGGw	686cafba-2da4-4fdd-99a2-6b935b906c84	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTkxYjY3ZS0yYjNjLTRhMGUtOWU3NS0wMjI5MmMyY2RkOTciLCJqdGkiOiIxNmExYTY4OC1iN2IwLTQwOTUtOTU2Yi0wNTFhNGQ4ODM0YzYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ1MDczNiwiZXhwIjoxNzc1MDU1NTM2fQ.xt9QpILVUbpnTDQ8-jGFKqOWZYPHSVz2ElSE9pHa7Xc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 14:58:56.573	2026-04-01 14:58:56.573	f	2026-03-26 14:34:32.611	2026-03-25 14:58:56.575	2026-03-26 15:00:00.016
1762f0f8-5f89-497a-a657-87f60e7088b4	9b6b69c0-24ae-42fc-9ddc-b8d4d3a016ac	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjZiNjljMC0yNGFlLTQyZmMtOWRkYy1iOGQ0ZDNhMDE2YWMiLCJlbWFpbCI6Im9mcmFuY29AZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6Ik9zdmluIEZyYW5jbyIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZDMzOWQwZWMtNjU2MC00ZjJhLWE5YzEtMDUwZGE2MmYyZTFiIiwiaWF0IjoxNzc0NDA3NDE1LCJleHAiOjE3NzQ0OTM4MTV9.i4RMLXdEwAkdEXpW5s4ce7SJCNWlLC09mc9Qort3On4	d339d0ec-6560-4f2a-a9c1-050da62f2e1b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjZiNjljMC0yNGFlLTQyZmMtOWRkYy1iOGQ0ZDNhMDE2YWMiLCJqdGkiOiIzZjIzZjlmYi1kYjM3LTRhMDYtOGM1ZC1hOWRjOGE3YzZiMDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQwNzQxNSwiZXhwIjoxNzc1MDEyMjE1fQ.BYVicHVqXdHwT5qNCGppELPsFUb_9E-_dSSBrH5GVw4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 02:56:55.343	2026-04-01 02:56:55.343	f	2026-03-25 13:19:39.551	2026-03-25 02:56:55.346	2026-03-26 03:00:00.012
9833d094-dd3f-453b-8720-ac8b83145606	6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTkxYjY3ZS0yYjNjLTRhMGUtOWU3NS0wMjI5MmMyY2RkOTciLCJlbWFpbCI6ImptZWppYUBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiSmFtaWwgTWVqaWEiLCJyb2xlIjoiVVNVQVJJTyIsImp0aSI6ImMyYWExOTZmLWViM2MtNGZlNi1iZmVhLTE0NmY2MTVmMmU0MSIsImlhdCI6MTc3NDUzNTcyNSwiZXhwIjoxNzc0NjIyMTI1fQ.wJYMX4MbDxFcT6JF2GGfHxrgPfDRvdX7maWZugzjM84	c2aa196f-eb3c-4fe6-bfea-146f615f2e41	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTkxYjY3ZS0yYjNjLTRhMGUtOWU3NS0wMjI5MmMyY2RkOTciLCJqdGkiOiJhZjJlOGExOS05OTg0LTQ4NWUtYTE0OS00ZjFiNmFkNTc5OWYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDUzNTcyNSwiZXhwIjoxNzc1MTQwNTI1fQ.dRuKwZG0TVY_ov4zJsYYXfXPqd7ngu87_Eobzv6EFDA	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-27 14:35:25.117	2026-04-02 14:35:25.117	t	2026-03-26 15:30:23.31	2026-03-26 14:35:25.12	2026-03-26 15:30:23.311
f06d1f62-6e57-4efc-a0c0-2f0b09f4f669	a3f68665-8076-4595-9319-4be43d8e48be	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJlbWFpbCI6InNvbHVjaW9uZXN0ZWNub2xvZ2ljYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkdlcnNvbiBNdXJpbGxvIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiI5OGRlMTBkMS0wYWYzLTQzYTMtOTUwZC0wM2I2ZTUxMmRhM2EiLCJpYXQiOjE3NzQzNjI3NjEsImV4cCI6MTc3NDQ0OTE2MX0.zx7cOcSbdXOHkLrG-cCBfiNa8HUU9hdWfItkZgmBUmw	98de10d1-0af3-43a3-950d-03b6e512da3a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJqdGkiOiI5MWJmYjY4Ni0xMTE0LTQ1ZTctYTA1NS1iN2QzNzI3ZDY4MDUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDI3NDkxMywiZXhwIjoxNzc0ODc5NzEzfQ.pFggyU7z323YBHpygUWzxoCjLoHzSBIfujbDWj0CjTM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-25 14:32:41.946	2026-03-30 14:08:33.581	f	2026-03-24 14:32:42.122	2026-03-23 14:08:33.584	2026-03-25 15:00:00.012
bf6f6f35-60aa-4340-9084-6b87e229c1e2	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6IjAxZDM2YjIzLTA1ZjQtNDY0MS04OWM3LTBkZjY2MGU2N2IyNSIsImlhdCI6MTc3NDQ1MDkyNywiZXhwIjoxNzc0NTM3MzI3fQ.k6metck-UJfYrCWzmPnDyDS7TG6n55yzeCFB_dHGxB4	01d36b23-05f4-4641-89c7-0df660e67b25	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiJlMjIzMjI5NC05MWU2LTQyNDUtODBmMi1iZDJiYTczNDYyODUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ1MDkyNywiZXhwIjoxNzc1MDU1NzI3fQ.AWD3uI47nCGmc4EBsnt0ccdFtq-JxGOPozlw0uQ-m-4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 15:02:07.878	2026-04-01 15:02:07.878	f	2026-03-25 23:12:13.277	2026-03-25 15:02:07.881	2026-03-25 23:12:13.278
4671cf77-66bb-409a-ab85-8273c4aebccd	ab7afc4e-1daf-4bf8-a3b9-0ca77a4da243	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjdhZmM0ZS0xZGFmLTRiZjgtYTNiOS0wY2E3N2E0ZGEyNDMiLCJlbWFpbCI6ImVwZXJkb21vQGVuZXJnaWFwZC5jb20iLCJub21icmUiOiJFZHdpbiBQZXJkb21vIiwicm9sZSI6IlVTVUFSSU8iLCJqdGkiOiJkZDUwZTkzNy0yMzY4LTRjNDAtYmU2ZC04MTZhOTRkMzQxMDciLCJpYXQiOjE3NzQ0MDgyMzAsImV4cCI6MTc3NDQ5NDYzMH0.YaygqotRJW2t_j6Jo8ko8NNarZ-fG0uwkefHktf1z4Y	dd50e937-2368-4c40-be6d-816a94d34107	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjdhZmM0ZS0xZGFmLTRiZjgtYTNiOS0wY2E3N2E0ZGEyNDMiLCJqdGkiOiIyMWRjYzEzOS1kYTk0LTRjY2ItODJiZC01YmU1MzkwYzNlMTciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQwODIzMCwiZXhwIjoxNzc1MDEzMDMwfQ.Zlt9UuvMjEduaPy5m0vCnSDwRR7Y7BSJyXeW_-IvzdI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 03:10:30.596	2026-04-01 03:10:30.596	f	2026-03-25 03:11:57.662	2026-03-25 03:10:30.598	2026-03-26 04:00:00.009
e693fda0-c1c0-49e8-b9e3-c596f6c1e46c	2d791fa1-940c-45bf-a980-1499bbbe1b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJlbWFpbCI6ImVlbWVqaWFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkVsbWluIE1lamlhIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiIyOTdlZDNjMS03OWU1LTRkNzItYmM1Yi1jZjdkM2ZkMWVmYjciLCJpYXQiOjE3NzQ1MzcyMjUsImV4cCI6MTc3NDYyMzYyNX0.8tpY8E7xTtxqxYOs8BntfjwA4DLFYG90XnzFj2ADFak	297ed3c1-79e5-4d72-bc5b-cf7d3fd1efb7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJqdGkiOiIxNjBjZWE1Yi03OGQ3LTQ5NWItYmI4Ni0yMzg0OGRmNGViMjciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDUzNzIyNSwiZXhwIjoxNzc1MTQyMDI1fQ.PxlPxXXre_H9ykZdVGobeCtJugYTwnEOuAk4SSa4oe4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-27 15:00:25.923	2026-04-02 15:00:25.923	t	2026-03-26 15:42:18.207	2026-03-26 15:00:25.926	2026-03-26 15:42:18.208
f8334732-d487-4bf4-923d-5ce3cda554b4	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiMTYzNzQ5MzgtZDIzNy00MjM3LTg5NDYtNDU1NmRiYjBkZDE2IiwiaWF0IjoxNzc0NDY5ODc0LCJleHAiOjE3NzQ1NTYyNzR9.FlRL12dQipqXxczYICUmxmlZSj-fttGEZUCmC0Ji0GE	16374938-d237-4237-8946-4556dbb0dd16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJhNTNhODhlNS05YmFjLTQ2NGItYjkzNi02YzM1ZTdlZmRiN2QiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ2OTg3NCwiZXhwIjoxNzc1MDc0Njc0fQ.phXnajmThwS0t3eSAaES4fk580XwjiRDO6S-C508CH8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 20:17:54.484	2026-04-01 20:17:54.484	t	2026-03-26 15:30:17.533	2026-03-25 20:17:54.487	2026-03-26 15:30:17.534
e46973ae-2e32-49c7-ad30-79cb0af95064	2d791fa1-940c-45bf-a980-1499bbbe1b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJlbWFpbCI6ImVlbWVqaWFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkVsbWluIE1lamlhIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiIxZTcxMTQyYS0wMjc4LTQwY2ItYTllMC0wNzZmMDMwMmNjM2QiLCJpYXQiOjE3NzIyMTE5OTYsImV4cCI6MTc3MjI5ODM5Nn0.t9Qme-JgwoOQQZDiGFfXdB1IXf6Ni08RkCqDdo6jlpA	1e71142a-0278-40cb-a9e0-076f0302cc3d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJqdGkiOiIwZDg3MmQwZC01MTFlLTRiN2EtODZiNS04NmM2ZjM1YjVmYzMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjIxMTk5NiwiZXhwIjoxNzcyODE2Nzk2fQ.JWg8SYqHVUc54xBwIpRpWPDSuD8kKkEuzZyEG0derWM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-02-28 17:06:36.031	2026-03-06 17:06:36.031	f	2026-02-27 19:09:42.257	2026-02-27 17:06:36.035	2026-02-28 18:00:00.014
4db129ba-356e-4f05-be43-9277d8e00834	a3f68665-8076-4595-9319-4be43d8e48be	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJlbWFpbCI6InNvbHVjaW9uZXN0ZWNub2xvZ2ljYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkdlcnNvbiBNdXJpbGxvIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiJkOGU0MGIxNi04NGI2LTQ2ZGUtYWQ0OS1iZmNkNTJlNGI2OGUiLCJpYXQiOjE3NzI1NzE0NjgsImV4cCI6MTc3MjY1Nzg2OH0.ZVoGlPHE_SztQ0UhXja_sgmpIhEShne_l3q0KtCzfUE	d8e40b16-84b6-46de-ad49-bfcd52e4b68e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJqdGkiOiIxMTdkYTUxMy0zMTg3LTRhZTgtYTcwMS1mOThlNjBjNmJkZDMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjU3MTQ2OCwiZXhwIjoxNzczMTc2MjY4fQ.FX72dRGcAsyaqdhP_zf5WwK7m7C9b93ymyZuonahhC8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-04 20:57:48.595	2026-03-10 20:57:48.595	f	2026-03-03 20:57:56.271	2026-03-03 20:57:48.598	2026-03-03 20:57:56.273
11025c58-42e7-4d2c-86e6-220297c11dd1	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZGNhMjdlYzQtY2I5NS00YzRmLWI2MzYtMzk5NzIyYmUzZjU1IiwiaWF0IjoxNzczNzY3NzEzLCJleHAiOjE3NzM4NTQxMTN9.aFy8qMYBbbsKNVPlIT43NPwiz-YQ6Mgh4j_2tG-JAxQ	dca27ec4-cb95-4c4f-b636-399722be3f55	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiJmOWQ0MjE4Zi1lMmZmLTRhNDEtYTU3ZS0yYzE2NjI0M2M0NDQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzc2NzcxMywiZXhwIjoxNzc0MzcyNTEzfQ.zZYK0fpWZXvUzqgByP-6nQo2zSXBHANJwIZdB_oLfxI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-18 17:15:13.725	2026-03-24 17:15:13.725	f	2026-03-18 16:58:42.49	2026-03-17 17:15:13.728	2026-03-18 18:00:00.031
198c1ba5-f6ae-42ef-b011-c2f6a137d9e0	c147a496-79b8-40ae-9d9d-baeb07528b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJlbWFpbCI6ImFkbWluQHNpc3RlbWEuY29tIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsInJvbGUiOiJBRE1JTiIsImp0aSI6ImY4ZmI2ZTQ1LTVkNTItNDIzNS1hYmYyLTE2NTFlZDQwNGQzYSIsImlhdCI6MTc3MjU3MTU2MywiZXhwIjoxNzcyNjU3OTYzfQ.6uEM7VSiB_wNKqjGG-YAjMYNo6EQMfP8GICXQlGJzqU	f8fb6e45-5d52-4235-abf2-1651ed404d3a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJqdGkiOiI4M2FkYmUzZS05M2YwLTQzY2QtYTJkZS0xNjNiYjY4Mzg5MGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjU3MTU2MywiZXhwIjoxNzczMTc2MzYzfQ.T4-6nI40GiWmzZsslMfa59Ds1QqR35kTrYt3qU4rFzA	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-04 20:59:23.359	2026-03-10 20:59:23.359	f	2026-03-03 21:01:57.226	2026-03-03 20:59:23.363	2026-03-03 21:01:57.228
200c5bc9-6aae-4f11-8d31-61b52a7d2cb3	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiNzMyNDJiYjQtY2NmOS00ZWQ0LTg3NzEtZDBkM2U0YzI1YmVmIiwiaWF0IjoxNzcyNDg3MTQ1LCJleHAiOjE3NzI1NzM1NDV9.nbgf0m3TidtpbL2geLg65G1WoUWRNRnORrnHXE5GMJE	73242bb4-ccf9-4ed4-8771-d0d3e4c25bef	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI2ZjljMmVkMC1lOTAzLTQ5OWEtYWFlMy00ZmVmYjVkZTc1OGYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjQ4NzE0NSwiZXhwIjoxNzczMDkxOTQ1fQ.jdnqDtPEfmp3GqEYx1pMdRSHZKIBoy2ryntR8VrVd_E	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-03 21:32:25.465	2026-03-09 21:32:25.465	f	2026-03-02 21:34:11.078	2026-03-02 21:32:25.47	2026-03-03 22:00:00.014
02c80419-4c23-4311-aaf9-8308d59041e9	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6IjA3ZGQ1NDEyLTVjNGItNDdjOS05NTQxLTVmNzU1ZTA0MTNmMiIsImlhdCI6MTc3MjU3MjI2NCwiZXhwIjoxNzcyNjU4NjY0fQ.uw3UdGR3i164C3Bqkf-GHbg83B93FFuLEpUFggx5EQI	07dd5412-5c4b-47c9-9541-5f755e0413f2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiI2MDJlNDAyZS1hODI2LTRkMjItOGNiMC02ODRhMTgxZTdlOWYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjU3MjI2NCwiZXhwIjoxNzczMTc3MDY0fQ.-x2-GufdOk8qoyA7lgMMC-waHAEDvPQnKoNKTFemxqY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-04 21:11:04.716	2026-03-10 21:11:04.716	f	2026-03-03 21:21:47.487	2026-03-03 21:11:04.72	2026-03-04 22:00:00.02
f9261b43-c8ee-4aa5-8b7d-3467447adb9c	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiMDVkNTQyYzctMzczNy00NjRiLTliMzYtNThjMTJmN2Y2YmI0IiwiaWF0IjoxNzczNzc2MDU2LCJleHAiOjE3NzM4NjI0NTZ9.2eSlQ9a8_UC0zoAspXFF3RkZwKEVe0yQhrUBVshoRsk	05d542c7-3737-464b-9b36-58c12f7f6bb4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI2NzIzMWUzMC0zZjE3LTQyZjktOWU1NS04ZDdjMTk5Y2UyNDQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzc3NjA1NiwiZXhwIjoxNzc0MzgwODU2fQ.N6tr6oI5WIllsXWwQx9C5dSiCz5c3aKJdnUkpi8rK_M	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-18 19:34:16.878	2026-03-24 19:34:16.878	f	2026-03-17 19:35:43.026	2026-03-17 19:34:16.881	2026-03-17 19:35:43.029
770ee2dc-9fe5-4449-9df0-1f1cefe45dcd	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiYzAxM2FiNjgtYTlmYS00NzNjLWEyMDMtOTg5ODZmNzdkNTExIiwiaWF0IjoxNzcyNTczNjg0LCJleHAiOjE3NzI2NjAwODR9.3uDhyafvooYn90pyvY88SBc_emNO-sZkgDEGU-Sfwsc	c013ab68-a9fa-473c-a203-98986f77d511	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiIwNzIwZDJjMS0xNDVjLTRjNGItYTgxMC1mMWFhY2MzNDRlYjQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjU3MzY4NCwiZXhwIjoxNzczMTc4NDg0fQ.zbwbsPYIOc8lYgxbgbZCjJLiG_t2Erhz1Pfdt3V37ig	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-04 21:34:44.097	2026-03-10 21:34:44.097	f	2026-03-03 21:42:33.782	2026-03-03 21:34:44.101	2026-03-04 22:00:00.02
31cf9640-bb34-422e-b306-600e963e0bdb	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6IjJkMDZhNzZjLTExMTctNDM2Yy04OWUyLThlZDY4MTk3ZGQ1NSIsImlhdCI6MTc3MjU3Mjk2OSwiZXhwIjoxNzcyNjU5MzY5fQ.VbHo4fjz6nPQDnTRsIpGEaQboULjr-x1xMp18NKR9Tg	2d06a76c-1117-436c-89e2-8ed68197dd55	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiIzNDczODAzOC1hOGFiLTQ2MWEtYWE3MC02NDk4MGIyNmRiNDQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjU3Mjk2OSwiZXhwIjoxNzczMTc3NzY5fQ.iARvGC9MLBvqocg2K3XFgSAG6tR0yh9FgAE56fr_uZM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-04 21:22:49.562	2026-03-10 21:22:49.562	f	2026-03-03 22:01:14.565	2026-03-03 21:22:49.565	2026-03-04 22:00:00.02
c6b13f9c-ed60-4378-bb74-c10482095f4e	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMmE4MmNjY2QtNjFmOS00Y2JkLWFlNjUtMzU2ZWE4NTRlMmU1IiwiaWF0IjoxNzcyNjQwODg2LCJleHAiOjE3NzI3MjcyODZ9.WO3gKhH6gGM8A4ssuWkPSf72lxr5kgumtvRGsJI5R4c	2a82cccd-61f9-4cbd-ae65-356ea854e2e5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiIyMTI2ODkxNi1kYjI1LTQ4MjAtOTIyZS1hMWY4NGE1NDI0MjIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjY0MDg4NiwiZXhwIjoxNzczMjQ1Njg2fQ.5-5cFkI8EAod7FHPwJwLf2OZFtRGklPO07FSi00bFq4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-05 16:14:46.383	2026-03-11 16:14:46.383	f	2026-03-04 20:33:29.401	2026-03-04 16:14:46.386	2026-03-05 17:00:00.01
e83aebfe-2d52-4a8a-97ff-095549264a72	a3f68665-8076-4595-9319-4be43d8e48be	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJlbWFpbCI6InNvbHVjaW9uZXN0ZWNub2xvZ2ljYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkdlcnNvbiBNdXJpbGxvIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiIxZDQ5MDcwNy0xYzNjLTRkZWQtOGJlZi04NmQ3NTkzZDRjMzIiLCJpYXQiOjE3NzI4MTI3MTIsImV4cCI6MTc3Mjg5OTExMn0.hOeHPkAeLAWkTWRrmABUDqcQbYT_yIujKA5XTEbR60Y	1d490707-1c3c-4ded-8bef-86d7593d4c32	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJqdGkiOiJjZGE4M2UyZC1jNmI4LTQxZWMtYWFkMS01ODcyNGFhYTdjZGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjgxMjcxMiwiZXhwIjoxNzczNDE3NTEyfQ.m_TZ97nT9WtaR1X4BSZjJJXz3anEeNeHq6tPeh8bXss	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-07 15:58:32.933	2026-03-13 15:58:32.933	f	2026-03-06 19:39:38.027	2026-03-06 15:58:32.936	2026-03-07 16:00:00.017
61107d31-5c41-4992-b05e-aab94a30ac49	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZDdkODQ1MGUtODFhMy00NGMzLWE1OWItMDczOWQ5YTgyZjQ1IiwiaWF0IjoxNzcyNjM4OTUxLCJleHAiOjE3NzI3MjUzNTF9.NOEOxCWMPMonD2e79k9dxvv3GB9Yl_SLrHJ44MYW-bw	d7d8450e-81a3-44c3-a59b-0739d9a82f45	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIxYjJhYTMzNC1mYTBhLTQ4MGMtOGQwNC00MTNjY2Q5NWE2ZWEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjYzODk1MSwiZXhwIjoxNzczMjQzNzUxfQ.91k6n190TGv6PtRcwpJuc7OIoFBt4IynLLUkRlgpSGw	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-05 15:42:31.563	2026-03-11 15:42:31.563	f	2026-03-05 14:26:24.679	2026-03-04 15:42:31.566	2026-03-05 16:00:00.026
05e5ea9b-41dc-4e79-8150-d79674985f71	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiOWVlYjYzZGUtZmQwYS00MmJjLWIwZWYtMjRiY2RiNzdkYjEzIiwiaWF0IjoxNzcyNzIzMjg2LCJleHAiOjE3NzI4MDk2ODZ9.dDnrMQkDMi2Eki0eikjHQwNfHHEWca9CEQzRKUhZw_A	9eeb63de-fd0a-42bc-b0ef-24bcdb77db13	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiJhM2I1YmQxYy00N2ZlLTRiNjYtODBlNC01MGZiZmYxM2M4NjAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjcyMzI4NiwiZXhwIjoxNzczMzI4MDg2fQ.huE87kTBGiF-efNcg1RiSJK-b_Q1vlv0oAGEGDZjkng	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-06 15:08:06.665	2026-03-12 15:08:06.665	f	2026-03-05 15:08:48.807	2026-03-05 15:08:06.667	2026-03-06 16:00:00.017
227070ef-20ee-4425-bd63-1fb6dba86da5	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMWQ5NzJkM2ItMTkzYy00MTU3LThmNGYtODU5Njg1YTVmMDIyIiwiaWF0IjoxNzczMTgxOTg0LCJleHAiOjE3NzMyNjgzODR9.RMMVrI0smhfc7vuiPS8bl2JjeBng8Pu29PPZMWm2eTE	1d972d3b-193c-4157-8f4f-859685a5f022	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiIwYmIyZjQxNC0xYzU0LTRjY2UtOTJhZi01MTAzMmIxMzQzMmUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzA5MzYxNywiZXhwIjoxNzczNjk4NDE3fQ.Xad90_y9OJWNhxSUXcxxTdkdn6JFQW2CORFFVFjqtaA	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-11 22:33:04.831	2026-03-16 22:00:17.731	f	2026-03-10 22:33:05.099	2026-03-09 22:00:17.735	2026-03-11 23:00:00.012
cfdd7998-eb13-4fac-b8c6-928ad33b0749	a3f68665-8076-4595-9319-4be43d8e48be	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJlbWFpbCI6InNvbHVjaW9uZXN0ZWNub2xvZ2ljYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkdlcnNvbiBNdXJpbGxvIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiIyZmQ3ZGJiZi1lYzhjLTQ0YTktOGMxOC1mZjkwNWFlZDQ1Y2IiLCJpYXQiOjE3NzMwNjcyNzQsImV4cCI6MTc3MzE1MzY3NH0.8bDpP_4zL0QhCvGCuM_WRlnnwA3jkr3Ev5wq9cyJDRg	2fd7dbbf-ec8c-44a9-8c18-ff905aed45cb	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJqdGkiOiJjZGQ4NjczNS00MjExLTRiNWYtYjg3ZC04MmUxOWRlYzIzMGMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzA2NzI3NCwiZXhwIjoxNzczNjcyMDc0fQ.VzdXFe2MGfcs-IBnrG9aDYN0kLd-hrPkgOlezvlYQNI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:190.4.12.11	web	Chrome	2026-03-10 14:41:14.411	2026-03-16 14:41:14.411	f	2026-03-09 14:41:29.23	2026-03-09 14:41:14.413	2026-03-09 14:41:29.232
f4836bc1-5669-4952-8dd6-00c815fb5177	a3f68665-8076-4595-9319-4be43d8e48be	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJlbWFpbCI6InNvbHVjaW9uZXN0ZWNub2xvZ2ljYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkdlcnNvbiBNdXJpbGxvIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiJiYjMyZTNjYy1hOWYwLTQ3MDItYjM1ZC1kOTUwMTNiYWFjN2EiLCJpYXQiOjE3NzMwNjcyOTIsImV4cCI6MTc3MzE1MzY5Mn0.6Jwm6lrQtL2LrQFkVdfFFAkJ9aKY1m4J91_tjn8qBBo	bb32e3cc-a9f0-4702-b35d-d95013baac7a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJqdGkiOiIyNjczMGY2OC1kOTJjLTQyZWUtOWQzOS01OGU0ZWRkYTJlY2IiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzA2NzI5MiwiZXhwIjoxNzczNjcyMDkyfQ.eXn7mSIiBg7oeY6KplZZrGHrZ4Kxml6gQEl1_TIsFjg	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:190.4.12.11	web	Chrome	2026-03-10 14:41:32.652	2026-03-16 14:41:32.652	f	2026-03-09 15:37:10.782	2026-03-09 14:41:32.654	2026-03-09 17:04:01.508
de71ed53-aed8-40bc-ba06-815f0bb1cf3d	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6IjQ5YWQyZjU0LTI1YjktNGUyOC04ZmY2LTI2ZTRjMGQ5Y2YwZSIsImlhdCI6MTc3MjgxMjA3MCwiZXhwIjoxNzcyODk4NDcwfQ.HiiqdJmzt1Av33p9iurcGcdKJNU8fpdM9jjbwJjPC6k	49ad2f54-25b9-4e28-8ff6-26e4c0d9cf0e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiJkMTI2NDJmNS1kYTAwLTRmNGYtYmNmMC1kMWE1NDJlMTkxN2EiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MjgxMjA3MCwiZXhwIjoxNzczNDE2ODcwfQ.d_g4MPJ93fLfkAkQxqYQYa40ZZfe72BKi3WSZfOXC2Q	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-07 15:47:50.291	2026-03-13 15:47:50.291	f	2026-03-06 19:10:11.973	2026-03-06 15:47:50.294	2026-03-07 16:00:00.017
87f58ec4-f60b-4441-9a97-d9e1b3f7743b	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMDI3M2FlMjEtYjk5OC00OTExLTk2NTktYmQ0OWRmZmZhMTgwIiwiaWF0IjoxNzczMDc4NzEzLCJleHAiOjE3NzMxNjUxMTN9.g8MKlpQ4gtdHAjLBmY-pF5bA-JAdDtiZIihsE7-DDHE	0273ae21-b998-4911-9659-bd49dfffa180	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI5NDUzZjAxOS1hNzA1LTRiMzAtOTM4ZC01ZjZjYjU5YzBmZDgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzA3ODcxMywiZXhwIjoxNzczNjgzNTEzfQ.CvuaTmU46V35W5bg_3whro12SVShx8SxR5b_FZh1Xuk	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-10 17:51:53.192	2026-03-16 17:51:53.192	f	2026-03-09 22:00:13.726	2026-03-09 17:51:53.195	2026-03-09 22:00:13.728
d78104b3-a3a3-4c35-831f-1f1e41933817	a3f68665-8076-4595-9319-4be43d8e48be	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJlbWFpbCI6InNvbHVjaW9uZXN0ZWNub2xvZ2ljYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkdlcnNvbiBNdXJpbGxvIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiI4ZjI0Y2JhNS0xOTdlLTQ4OGMtOGQ3OS0wZDBiYTFmYWE1ZGYiLCJpYXQiOjE3NzMwNzU4NDEsImV4cCI6MTc3MzE2MjI0MX0.veGUj1dGUIVgUwBJXjAJVBO70cefZlhV8BNPPn2XOM8	8f24cba5-197e-488c-8d79-0d0ba1faa5df	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2Y2ODY2NS04MDc2LTQ1OTUtOTMxOS00YmU0M2Q4ZTQ4YmUiLCJqdGkiOiI2M2ExNTFlYy1lYzljLTRhZDctOTZmYy01MjE0YmM2OWVmNmUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzA3NTg0MSwiZXhwIjoxNzczNjgwNjQxfQ.ahvTRXE7zqd-Sm3hjfx-paFeHFmUTUAuwgXh61Bp9OU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-10 17:04:01.512	2026-03-16 17:04:01.512	f	2026-03-09 22:03:15.964	2026-03-09 17:04:01.516	2026-03-10 18:00:00.012
99153964-4726-4f6e-b55e-665d30bb11bb	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiOWZmMjFlZjctMGRmMS00ZWM5LTk2NDItZDk5YjE2OGIzODJmIiwiaWF0IjoxNzczMzIzMTMxLCJleHAiOjE3NzM0MDk1MzF9.r267hLfUPj6sQGpKJsP2BUhpYl_Cd_d2hPcDkxKgEto	9ff21ef7-0df1-4ec9-9642-d99b168b382f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIwY2NhZjE3YS0zMWMxLTRlYmYtYjM5YS1mNzZjMmQ4NDY2ODYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyMzEzMSwiZXhwIjoxNzczOTI3OTMxfQ.18raozM6Td9lOzGs8bTscu0m0mBPDGU2AMHKAo2zEYo	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 13:45:31.216	2026-03-19 13:45:31.216	f	2026-03-12 14:01:50.49	2026-03-12 13:45:31.218	2026-03-12 14:10:48.729
eccfb595-f209-47c9-90ac-b1dbfe63b7ca	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiNmViZDc1ODQtNzY2Yy00YmU2LWIzMzgtNDI1ZTJlYzUyY2VkIiwiaWF0IjoxNzczNzc2NTkwLCJleHAiOjE3NzM4NjI5OTB9.YdkDe7haN7INr4Sy7xmahqLvMvnA1TGSnExoF4nzGQ8	6ebd7584-766c-4be6-b338-425e2ec52ced	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI4NjhlZTMyNC00ZTA3LTQ4N2MtODI3NS1kYzJkYWM1Zjk0NmMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzc3NjU5MCwiZXhwIjoxNzc0MzgxMzkwfQ.0koN4YviWMZdpPfWGPPxhNy_j0Adn7sWDo3ZbpXplaw	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-18 19:43:10.739	2026-03-24 19:43:10.739	f	2026-03-17 20:38:28.866	2026-03-17 19:43:10.741	2026-03-17 20:59:23.846
405cfc2c-fd5a-421d-afe4-d6ee5a34af06	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZjZlZWQ1NDgtNThkMS00MDU0LWEwMjQtMTczMjczNTc0NDRkIiwiaWF0IjoxNzczMzI1Mjg3LCJleHAiOjE3NzM0MTE2ODd9.Xb3NNRG-OyfizJ0Wc_7RUXaKlAPzetVzZ4kyRz-O8r4	f6eed548-58d1-4054-a024-17327357444d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIxNDkzZDFmNy1lYjRlLTRmY2MtYmU3Yy0zNGY3YzQ5NGZlOGEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTI4NywiZXhwIjoxNzczOTMwMDg3fQ.0Vu_4D2J6TZ5tFhGk2DpwVERPzRezcatLzoaIhJ3lPQ	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:21:27.421	2026-03-19 14:21:27.421	f	2026-03-12 14:21:37.256	2026-03-12 14:21:27.424	2026-03-12 14:21:53.806
9ab09f4b-5323-42b1-8cc5-1a4abc7cbf85	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiNzllNTdkZjctOTE1My00NGNlLWI5MDEtMTRhODdkNWQzMjhmIiwiaWF0IjoxNzczMzI1MDU0LCJleHAiOjE3NzM0MTE0NTR9.y2MqLtQZpI8Ysp_ipUt5SXox4MqaATipmhi0B_P3tXI	79e57df7-9153-44ce-b901-14a87d5d328f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI3MTVlZGQ3Ny0zYTJkLTQ1ZjQtYWUwMC00YjEzNWUyNmNjNzAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTA1NCwiZXhwIjoxNzczOTI5ODU0fQ.GM0BL7autuNmkEhzNZOhO72ySafuyHQN0OcWigBqom4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:17:34.374	2026-03-19 14:17:34.374	f	2026-03-12 14:20:17.34	2026-03-12 14:17:34.376	2026-03-12 14:20:23.584
412fc129-4b36-4c5a-b589-fdd6c060811d	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZGMwNTM3N2ItMTJlMi00MTRmLTkxMTItZDYxOWEzZGU5NDNmIiwiaWF0IjoxNzczMzI0NTg4LCJleHAiOjE3NzM0MTA5ODh9.nA7LgGcaTwDyuMZaLPVnEdFB9pIW3ZY-seaOODilsuw	dc05377b-12e2-414f-9112-d619a3de943f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiIwMjcyZDMwZi03YjdhLTRlMDItODA0Yy0wM2Y3MjUxM2E4OTMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNDU4OCwiZXhwIjoxNzczOTI5Mzg4fQ.d6CoEAf5JhMcvFJFwEMaSopTDOsWYp2boAhGf_rJx_s	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:09:48.944	2026-03-19 14:09:48.944	f	2026-03-12 14:10:22.491	2026-03-12 14:09:48.947	2026-03-12 14:10:22.493
89f6a2ce-6f31-452b-8864-615c37ee1999	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiODU3YjdkZTktMGYzYi00YjgyLTlkOTYtYWI3ZGJiYjNmMmFhIiwiaWF0IjoxNzczMzI0NjQ4LCJleHAiOjE3NzM0MTEwNDh9.mrkJLGC2XMTuLkIRPkykHCyVUfPSbROyPFjtI13-EkA	857b7de9-0f3b-4b82-9d96-ab7dbbb3f2aa	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI0YTI1ZGIzOC03MDM3LTRjYWYtOTgwNS0xNDE0NjdiOGJkZjEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNDY0OCwiZXhwIjoxNzczOTI5NDQ4fQ.sTRwgyLxccuma3JRetST_p1thyR0rb8uPrln15c2MY4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:10:48.732	2026-03-19 14:10:48.732	f	2026-03-12 14:11:06.291	2026-03-12 14:10:48.733	2026-03-12 14:11:06.292
9366fd64-3433-4f3e-805d-661e03198a3b	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiM2Q2NTY1YzktNjhjMS00YTJiLTk1MDktNzdjMWNiNzMwZWVmIiwiaWF0IjoxNzczMzI0NjcwLCJleHAiOjE3NzM0MTEwNzB9.bJo-IuD9KMQwYK4HTrNnArIau3LKsygg4-WdX-z_PjE	3d6565c9-68c1-4a2b-9509-77c1cb730eef	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI3ZDgyODAyMy1hODI4LTRkN2MtOTg4Ny00MDBkZWIwNjYwMjkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNDY3MCwiZXhwIjoxNzczOTI5NDcwfQ.8__UaKy5VBfny4PYy_ssMb209V1r3Jwtalw7p4ZKVyE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:11:10.757	2026-03-19 14:11:10.757	f	2026-03-12 14:17:31.433	2026-03-12 14:11:10.759	2026-03-12 14:17:31.434
1f99ea35-7d19-44bb-af88-237d63fe89f1	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiNDhkMmRhOWItNzg4OC00MGI2LWJjMTQtOWM4MmQxMTUwZTRlIiwiaWF0IjoxNzczMzI1MjIzLCJleHAiOjE3NzM0MTE2MjN9.jm4R1L6zQi9NM8ootgqhcPwATNsTUyQYASUuX5X0qpM	48d2da9b-7888-40b6-bc14-9c82d1150e4e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIxN2RhMGExYS0xNjgwLTQxODItOTc3Ny1jYmU5MzZhYTRhMWEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTIyMywiZXhwIjoxNzczOTMwMDIzfQ.gRyUooeBajdSpvAbM1mkoR4irHs96jy4TAsMZwS1ewo	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:20:23.587	2026-03-19 14:20:23.587	f	2026-03-12 14:20:24.347	2026-03-12 14:20:23.589	2026-03-12 14:21:27.416
d8714a5c-127a-4d47-aeaa-56b9517578bd	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiYmZlMTc1YWMtODlhZi00YzI3LWI1ODEtM2FkOTA3ODJlYzNjIiwiaWF0IjoxNzc0MzcwMzc4LCJleHAiOjE3NzQ0NTY3Nzh9.ibW8LJL1fnsbasfvY36XVJcNvSP0K7PYrt1A13WcHig	bfe175ac-89af-4c27-b581-3ad90782ec3c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJmMGYxM2M1NS0xN2U0LTQzZDMtOGMwZS03MGU5MmRjY2IzZmEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDI4MzI2MCwiZXhwIjoxNzc0ODg4MDYwfQ.Cm-WodrMvQOpQVTfRiEOdkyxwpU_hthdASiRJKlDRYM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-25 16:39:38.328	2026-03-30 16:27:40.766	f	2026-03-24 16:40:17.87	2026-03-23 16:27:40.769	2026-03-25 17:00:00.016
9f30ca42-99be-4618-9f67-bb6cc16a5501	4e77f023-4805-4b5a-b8db-f6ad9583ea36	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ZTc3ZjAyMy00ODA1LTRiNWEtYjhkYi1mNmFkOTU4M2VhMzYiLCJlbWFpbCI6InN1cGVydmlzb3IubWVjYW5pY28tZXh0QGVuZXJnaWFwZC5jb20iLCJub21icmUiOiJKb2ZmcmUgQWxjaWRlcyIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZDVjYTk3YmYtMTQxZi00NWUwLWJhMGMtODc5MDczYjQ4OTUxIiwiaWF0IjoxNzc0NDQ1ODE1LCJleHAiOjE3NzQ1MzIyMTV9.IohYyj71aBwMVx5Mlz-4Egz_-_dpCH_YlqJE-YsFmkA	d5ca97bf-141f-45e0-ba0c-879073b48951	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ZTc3ZjAyMy00ODA1LTRiNWEtYjhkYi1mNmFkOTU4M2VhMzYiLCJqdGkiOiJiZTgzNDI4MC0yODBlLTRjNGQtOGRlMi1jMTQ5ZmFlMDFlMGIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ0NTgxNSwiZXhwIjoxNzc1MDUwNjE1fQ._B3v7kpItEmCMuI4Pi6go8fVH500iAJqN8GxwXZWwgI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 13:36:55.94	2026-04-01 13:36:55.94	f	2026-03-25 15:32:47.877	2026-03-25 13:36:55.943	2026-03-26 14:00:00.012
80b9e7f0-722c-43a0-bd36-f2f9c9d89484	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiOTk4ZDU5MTctMDExNS00OGZjLTk5MjktYTI1MDQ0Y2M0ODFmIiwiaWF0IjoxNzczMzI1MzQ2LCJleHAiOjE3NzM0MTE3NDZ9.hYRnaGW9oEK1zX2ZUbSde7TPBudh6IuGLn3y48EC3yE	998d5917-0115-48fc-9929-a25044cc481f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIyMmEwOGM2Yy02NmYxLTQwZGMtYTE5Mi03M2U3N2MxM2FmYWEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTM0NiwiZXhwIjoxNzczOTMwMTQ2fQ.lJ7wdjeqHFtM5OmGPVs9NhcbrkV8ijsf9hd2MPFG1Y4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:22:26.879	2026-03-19 14:22:26.879	f	2026-03-12 14:23:23.131	2026-03-12 14:22:26.881	2026-03-12 14:26:15.694
d790574f-ab6e-424a-b62e-0281abce8ed9	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiNmRhYWU5ZTYtMmVkMS00NDE5LTkwMGMtZDdmMGJkOWE0MjI0IiwiaWF0IjoxNzczNzgxMTYzLCJleHAiOjE3NzM4Njc1NjN9.FQHZA_piuvRFNkFuqkIq1gjid8NJ-V6Jqvul_3HYYwQ	6daae9e6-2ed1-4419-900c-d7f0bd9a4224	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJlNGY5YTM5MC1iMTA1LTQ0MTYtOTU2My04ODBkMGZkMzhiYjYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzc4MTE2MywiZXhwIjoxNzc0Mzg1OTYzfQ.DSsZLoIRjF60nT1yytDCzjgzF0Hwgov2tKbw5ncioYs	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-18 20:59:23.852	2026-03-24 20:59:23.852	f	2026-03-17 21:09:06.996	2026-03-17 20:59:23.855	2026-03-18 21:00:00.009
1ba87d1d-2e8c-47ca-932e-292486c20c85	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZWI5YzdjYWItNzBkYy00MjcyLWJiZGUtZjA0YzFjYzExNGE0IiwiaWF0IjoxNzczMzI1MzEzLCJleHAiOjE3NzM0MTE3MTN9.nVBFjFqCMvaQCgGUf_rS5bWAp8wj1TexYLs_Y0RfMGU	eb9c7cab-70dc-4272-bbde-f04c1cc114a4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIzMzhiMjJkYi1mMjRlLTQ1NmEtYWE1Ny03N2E3YmJjZDEzZGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTMxMywiZXhwIjoxNzczOTMwMTEzfQ.KjJu25YZBM1W8J2Dhxvga-0cIA8W62ti1SunuK0E0mk	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:21:53.81	2026-03-19 14:21:53.81	f	2026-03-12 14:22:06.977	2026-03-12 14:21:53.813	2026-03-12 14:22:26.876
ebe9b776-9630-430d-a2ec-e7f6ee1b69c8	ab6d9041-7493-45a5-97f5-62ccbb36c59e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjZkOTA0MS03NDkzLTQ1YTUtOTdmNS02MmNjYmIzNmM1OWUiLCJlbWFpbCI6InNvbGFyZGVzaWduQGVuZXJnaWFwZC5jb20iLCJub21icmUiOiJHYWJyaWVsIE1vbmNhZGEiLCJyb2xlIjoiVVNVQVJJTyIsImp0aSI6IjZkNjFhY2NiLTUyMWMtNDFmZC1hYzhkLTcwMzU4ODRkNzE4MiIsImlhdCI6MTc3NDI4MzU3NiwiZXhwIjoxNzc0MzY5OTc2fQ.TnklTT3UB5AJh5_jNxEh2j1y_khIFLokHl4ORGdr_7Q	6d61accb-521c-41fd-ac8d-7035884d7182	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjZkOTA0MS03NDkzLTQ1YTUtOTdmNS02MmNjYmIzNmM1OWUiLCJqdGkiOiIzNzUzZWU3Yy05MWNmLTQ5YWYtYTZkMS1kODc2NGE3ZTViMTUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDI4MzU3NiwiZXhwIjoxNzc0ODg4Mzc2fQ.e8eRdFwbpo37YunIAM2YEYOLISB8RDzUX6rCTmVqZuM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-24 16:32:56.697	2026-03-30 16:32:56.697	f	2026-03-23 18:22:00.673	2026-03-23 16:32:56.7	2026-03-24 17:00:00.018
b9800da5-d336-43d3-859c-bc68d5b60829	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMGU1NmEzNzMtMDkxZC00YTMwLTgwOTUtODZmY2ViZjc5MDBlIiwiaWF0IjoxNzczMzI1MTE4LCJleHAiOjE3NzM0MTE1MTh9.YfwYkFT1_H64VinWNbbj9zq1iXyy2jCtTwhB6pNWX6E	0e56a373-091d-4a30-8095-86fcebf7900e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI0ZDBiYzViMS0wYjE2LTRhYzctODBhOC0yYWM4Y2ExODRlZDIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTExOCwiZXhwIjoxNzczOTI5OTE4fQ.ROyCLMj_mH2oiqRn3H399mDZhxK8Pr664WKCuEvQS7s	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:18:38.513	2026-03-19 14:18:38.513	f	2026-03-12 19:32:38.72	2026-03-12 14:18:38.516	2026-03-12 19:32:38.722
cf9eccb9-65ef-4b42-bf22-bdcc7b0faf2c	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiOWZjZWQxMzUtZGFlYS00Yzk1LWEzMDQtYzNhM2JkOGJmYWRjIiwiaWF0IjoxNzczMzI1NTc1LCJleHAiOjE3NzM0MTE5NzV9.-RNrkU0MGNtlyzeuFeWON5aLcqVjQPD4TOOu6OD9nvo	9fced135-daea-4c95-a304-c3a3bd8bfadc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI2ZGE1MTMzZi05NDhhLTQ5MGMtYjBkYi1iMDhlZmNiZDJjZWMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTU3NSwiZXhwIjoxNzczOTMwMzc1fQ.zuHkKBuZExzAm7NWf6G4bp2QcGt5iQLdIBcIyWmll2A	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:26:15.699	2026-03-19 14:26:15.699	f	2026-03-12 14:48:05.154	2026-03-12 14:26:15.701	2026-03-12 16:31:35.667
5248e373-ca1f-47eb-a720-1df9268b34f2	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZWYzOWYwNjQtMDA0NS00Mjk5LTk0ODEtMTI5NGM0NGJiZDk1IiwiaWF0IjoxNzczMzMzMDk1LCJleHAiOjE3NzM0MTk0OTV9.QmzhmJuhKg71jWwPj7zT65IWb28sLHfuy1zxBhnAHhA	ef39f064-0045-4299-9481-1294c44bbd95	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJjNGM4YzBiOC0yOTIwLTQzZGUtOTVhOS1mMTZjZjM0MDhjMGIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMzMzA5NSwiZXhwIjoxNzczOTM3ODk1fQ.l85j4XwpSOe1-nfTaNoP2wcpYYbcBq9Oaa7jx4TwJNA	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 16:31:35.673	2026-03-19 16:31:35.673	f	2026-03-12 19:28:31.606	2026-03-12 16:31:35.677	2026-03-12 19:28:31.608
ffb176c5-1c84-4f30-a9d4-bdb0ef97bb8d	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiMmI1YmRlZGItYTA1Zi00OTJmLWE0NmItMmMxNDMyZTBlZGJhIiwiaWF0IjoxNzczMzQ0MDMwLCJleHAiOjE3NzM0MzA0MzB9.yAB3zku1V57dKzhVIHPI7AfCd2abO5CC5MF6TZ8BLy4	2b5bdedb-a05f-492f-a46b-2c1432e0edba	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiIwNzdjNjdlZC01NTc0LTQzOTItYWVmNy1hMDk0NjMyNzc1M2UiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzM0NDAzMCwiZXhwIjoxNzczOTQ4ODMwfQ.gqEtwmGgriW1f0uzmYkIQVX0HLoOGmmoiMeeVeHdv4c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 19:33:50.61	2026-03-19 19:33:50.61	f	2026-03-12 20:05:56.215	2026-03-12 19:33:50.614	2026-03-12 20:05:56.216
c9370ca8-d333-4256-aca6-2d05e5924bf9	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMjgxNDVjZjYtYWI4OC00MTQ5LTljNzgtYWQzNjlkYjUwNGU2IiwiaWF0IjoxNzczMzI1ODAxLCJleHAiOjE3NzM0MTIyMDF9.68kslrA70dY8P1FNmeuibPd18EG5r-S5vtb1O3WyPh0	28145cf6-ab88-4149-9c78-ad369db504e6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiJmYTQ1ZDAxZi00ZjY4LTQzZDEtOTBjYi01OGQwNjE2Y2FiMjgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzMyNTgwMSwiZXhwIjoxNzczOTMwNjAxfQ.wNUE2vlKeIAtpbJsPbphRq2EnFXEODpvLWZGXj8Xb1Q	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-13 14:30:01.351	2026-03-19 14:30:01.351	f	2026-03-12 22:33:28.251	2026-03-12 14:30:01.354	2026-03-13 15:00:00.026
9c8f20ab-8127-4a7f-abe2-3a399b094a8f	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZWM2NmE4MGQtNzdlMy00YWQyLWIxNGEtNWZmMGM5Nzc3OTE4IiwiaWF0IjoxNzczMzQ1NDg4LCJleHAiOjE3NzM0MzE4ODh9.5KdyL2746GktOfneyn_39dOmgKSCYrpVIlS11F7U2is	ec66a80d-77e3-4ad2-b14a-5ff0c9777918	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI1OGM2ODhmNC03MTQ4LTRkMTktYTcyMi1jMTRkMGY0YTJmZTUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzM0NTQ4OCwiZXhwIjoxNzczOTUwMjg4fQ.Mq4qIw8VmIgZMBJfENPZhtfrRLbEZHleBHQwDjqT_Ro	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-13 19:58:08.511	2026-03-19 19:58:08.511	f	2026-03-13 14:01:57.02	2026-03-12 19:58:08.514	2026-03-13 14:01:57.021
6518815b-51c3-4011-b745-75a128e49075	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiMzdiZjY1NTItZjQ2Yi00MDZmLThmMjQtOWFhNTg1MjQwMDZmIiwiaWF0IjoxNzczNjc5MzQwLCJleHAiOjE3NzM3NjU3NDB9.2pbnNixtfsvhTyb-lfTBDaM1mS2K_FGdb9qGEosERTg	37bf6552-f46b-406f-8f24-9aa58524006f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiI5NzU0NzZhNy1mMDljLTQ0YWMtOWJhZi04MjlhYzRhOGFlZDIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY3OTM0MCwiZXhwIjoxNzc0Mjg0MTQwfQ.GMsWSgdzgWPFoVXp6Hj01mGcrgaFcRqR49_7quTpgHE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-17 16:42:20.487	2026-03-23 16:42:20.487	f	2026-03-17 15:38:37.749	2026-03-16 16:42:20.489	2026-03-17 17:00:00.02
27840da0-dc2a-4302-a784-9fa057d6fdf1	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZjRkZmJmMmEtMjRjMS00NDIyLWEwZDQtN2RhOWE1ZTIzOTU3IiwiaWF0IjoxNzczODU1MzQ5LCJleHAiOjE3NzM5NDE3NDl9.uzeUZe1cFSxhk6cJyFZSqlhmVJsTKknJys33WhHE6NM	f4dfbf2a-24c1-4422-a0d4-7da9a5e23957	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI1NjVhZGFhYS00YzcxLTRlMGQtYjVkZC0wMWVjNmYwZjM0M2IiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzg1NTM0OSwiZXhwIjoxNzc0NDYwMTQ5fQ.CpRXExyoZtHaj_8X0W7S3DfP9ceO5HUi1wCfAZ6zRxM	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-19 17:35:49.567	2026-03-25 17:35:49.567	f	2026-03-18 17:39:27.394	2026-03-18 17:35:49.569	2026-03-18 17:39:27.395
4773d24f-b495-4e15-b6be-94d08288542b	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZTFjY2VlY2QtZDcxZC00YTQ2LTgwNWYtYzkxZDdlNzNmOWNjIiwiaWF0IjoxNzczMzQ1OTcwLCJleHAiOjE3NzM0MzIzNzB9.4uFJb_5IEjs0U1QwSswzD3c4bvxYJ8PhefwVZXd6rGQ	e1cceecd-d71d-4a46-805f-c91d7e73f9cc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiJkMzM2ZTQ5Ni1jNTg0LTRjNTEtYmEwYi1hOWFiYjJjMDYzNGUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzM0NTk3MCwiZXhwIjoxNzczOTUwNzcwfQ.4FkHGIacRkq0YtAXcoTKyl5bZY8yiHiWbfJ4dl-Z9C0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 20:06:10.17	2026-03-19 20:06:10.17	f	2026-03-12 21:52:40.498	2026-03-12 20:06:10.173	2026-03-12 21:52:40.5
7e62fb8f-a0a4-4e3c-8139-1b3afb197b46	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMDI2N2M0MDYtZTNkZi00ZmZjLWI2OGMtNGVhNzAyM2UzMWI3IiwiaWF0IjoxNzczNDE1MzYzLCJleHAiOjE3NzM1MDE3NjN9.dYjWVW29nfdA6cK2HV8fCRQ0j0WcLw_eaqdOwPwJRhM	0267c406-e3df-4ffc-b68c-4ea7023e31b7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiIzNWY3NGY1MS1hNzhiLTQ2NDUtYjI2MC03OWEwODVkYjQyMGYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzQxNTM2MywiZXhwIjoxNzc0MDIwMTYzfQ.hkr10UCiTt60QqlOg8JX-LEMj0uaVd3hM80ekrqwGt0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-14 15:22:43.421	2026-03-20 15:22:43.421	f	2026-03-13 22:19:25.284	2026-03-13 15:22:43.425	2026-03-14 16:00:00.018
f6402f3e-1b2d-4d39-852c-30c1092a957e	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiZjAzMDYzMDctMTg0Yi00NzQ0LWJkYTktMzUwYzg2MWU3MTI5IiwiaWF0IjoxNzczNDEyMTgxLCJleHAiOjE3NzM0OTg1ODF9.JlmylYQ27SAQ4lbkuSJc4cBbp-0GyQcwCeTTNjbfSRQ	f0306307-184b-4744-bda9-350c861e7129	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiJjZjQwMjYyYy1kM2NkLTQ2ZGQtOGUzOC0wOTVjYjQ0ZDZjMmMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzQxMjE4MSwiZXhwIjoxNzc0MDE2OTgxfQ.9G4w0QccsWCNGgWJf8HnSjjXaC0bB71Q93G-6iQtCaI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-14 14:29:41.066	2026-03-20 14:29:41.066	f	2026-03-13 15:08:20.242	2026-03-13 14:29:41.07	2026-03-13 15:08:20.254
63a1e346-5a0e-4ac2-ab16-d79642b2b3c0	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiYjM1NzIwNGQtNDRjNy00NTM0LThmNDctNTQ0YzQxMTJjNzFjIiwiaWF0IjoxNzczNDM1NDEyLCJleHAiOjE3NzM1MjE4MTJ9.Z17jNhBzc1wfrIH9Z-0kHCbjebQm6E1DHDQZ49DOJKA	b357204d-44c7-4534-8f47-544c4112c71c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJjYmNlNzMwNy1iZWFmLTRmM2QtOWJiNS0xYTdkOThhOWZmMGEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzQzNTQxMiwiZXhwIjoxNzc0MDQwMjEyfQ.XYsji3mC_B2R5W0j7tmj41N6CPLl9GvOPPBdZ4m1lVc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-14 20:56:52.999	2026-03-20 20:56:52.999	f	2026-03-13 21:16:31.855	2026-03-13 20:56:53.002	2026-03-14 21:00:00.012
6e68c21e-ed5a-4a4d-a4eb-6d47ccec1023	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiY2JkNzdlZmUtOTg3Zi00ZDUxLTg5NzAtZTMxMzY4YTAxNDUyIiwiaWF0IjoxNzczMzUyMzc4LCJleHAiOjE3NzM0Mzg3Nzh9.n_dOhiRIgNO3JOrlnQpF-L4g6SdN8y2_GokdsDIS4nc	cbd77efe-987f-4d51-8970-e31368a01452	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJlNDU5OTQ3ZC00MDc3LTQ5ZTctYjMxZC02NThlYTE3NDA1NzUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzM1MjM3OCwiZXhwIjoxNzczOTU3MTc4fQ.kPtTbpE4N7oaJ9paQpFFqYJuSH0DGGPnOmDYEBDwKVo	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-13 21:52:58.185	2026-03-19 21:52:58.185	f	2026-03-13 16:56:49.892	2026-03-12 21:52:58.187	2026-03-13 20:56:52.991
ceb144e2-d4af-40b5-b35c-e1950e6be2a3	c147a496-79b8-40ae-9d9d-baeb07528b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJlbWFpbCI6ImFkbWluQHNpc3RlbWEuY29tIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsInJvbGUiOiJBRE1JTiIsImp0aSI6IjJkZThmYjc1LWNlYzEtNGNhMy1hYWIyLTQ5MjllNmMxOGRlZiIsImlhdCI6MTc3Mzg1NTU3NywiZXhwIjoxNzczOTQxOTc3fQ.eXrjSbtD-M6ZrwXo3RO9ApwJxLKeY6CM1KliIXYxUHk	2de8fb75-cec1-4ca3-aab2-4929e6c18def	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMTQ3YTQ5Ni03OWI4LTQwYWUtOWQ5ZC1iYWViMDc1MjhiMmEiLCJqdGkiOiI1Y2U0OGVhZC1hMmY4LTQzYTctOTRiMi0wOWI2ZWQ2Yjk5MzgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzg1NTU3NywiZXhwIjoxNzc0NDYwMzc3fQ.rYz1BDWz8HV5E6EMN9iboTb2Oarp42TCOsPta_Rerbw	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-19 17:39:37.959	2026-03-25 17:39:37.959	f	2026-03-18 17:41:28.107	2026-03-18 17:39:37.961	2026-03-19 18:00:00.02
11082f65-b0f7-471d-a3ea-f81d1343d550	d5cdf0ca-2b98-43be-8e54-d867a896bcea	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNWNkZjBjYS0yYjk4LTQzYmUtOGU1NC1kODY3YTg5NmJjZWEiLCJlbWFpbCI6ImttZWxnYXJAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IktleWRpIE1lbGdhciIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiOTUyNGY2ZWYtMDk1Ny00N2U5LWE4ODctNzE2ZDg4NTgzOGI4IiwiaWF0IjoxNzc0NDQ2MTY0LCJleHAiOjE3NzQ1MzI1NjR9.oSjZkQgRSjyRcHw-Dpck3yZIkVfVLjJRuK808emGst4	9524f6ef-0957-47e9-a887-716d885838b8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNWNkZjBjYS0yYjk4LTQzYmUtOGU1NC1kODY3YTg5NmJjZWEiLCJqdGkiOiIxMTgxZTRmNy1iYTYyLTQ4NDUtYmJiMy01MWRhYzEyNjlhOTYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ0NjE2NCwiZXhwIjoxNzc1MDUwOTY0fQ.IdRQTFJtiRbWT1CO4h0nq3lbwKQ_o4OW933V04pWmUE	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 13:42:44.535	2026-04-01 13:42:44.535	f	2026-03-25 13:43:37.163	2026-03-25 13:42:44.538	2026-03-26 14:00:00.012
37e81c37-a777-4007-a9cd-d31ce1d9621a	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiYjdhNGY5ZmQtYjU0OC00NDI2LWFjMGMtNTRjMGQ4Mzk2ZjNiIiwiaWF0IjoxNzc0Mjg4MzM5LCJleHAiOjE3NzQzNzQ3Mzl9.tcHqhLO4C7hcUz5N-B-ItRBhLv8-DCXdgBPk_Sq_VbQ	b7a4f9fd-b548-4426-ac0c-54c0d8396f3b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiI5Yjg1Mjk5Mi1hZTA5LTQ5MjYtOTI5OS00ZGQ2NjI4YzRkNjgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDI4ODMzOSwiZXhwIjoxNzc0ODkzMTM5fQ.IxTr05kPbNvQMwGDPTV_S_2BJhu7z1Q6KunxMtVdOyY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-24 17:52:19.995	2026-03-30 17:52:19.995	f	2026-03-24 14:29:58.856	2026-03-23 17:52:20	2026-03-24 18:00:00.018
a21ae12b-151e-4b47-b81f-63e71a3aee9b	187458d6-d2bf-4b16-962a-815708475919	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxODc0NThkNi1kMmJmLTRiMTYtOTYyYS04MTU3MDg0NzU5MTkiLCJlbWFpbCI6InJlY2VwY2lvbkBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiU3RoZWZhbnkgUGluZWRhIiwicm9sZSI6IlVTVUFSSU8iLCJqdGkiOiIzNTZmYzA4Yy02NmE4LTRkZmUtOGU0Yy0yZjZiNDM1NjdiMjEiLCJpYXQiOjE3NzQ0NTM2NzUsImV4cCI6MTc3NDU0MDA3NX0.lUckU8W9zYzqYbzTh8FD9JkDR_xoK--G5wKas3RKHhc	356fc08c-66a8-4dfe-8e4c-2f6b43567b21	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxODc0NThkNi1kMmJmLTRiMTYtOTYyYS04MTU3MDg0NzU5MTkiLCJqdGkiOiJjZDQwNWIzNS1hZjhkLTQxODEtYWY3Yi1iNmQ3MzVlMmY3MTciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ1MzY3NSwiZXhwIjoxNzc1MDU4NDc1fQ.cd7Ondv6QWab4By4ZRpeAyJZ8k9jK0BNFzpXn3OPLpQ	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 15:47:55.865	2026-04-01 15:47:55.865	f	2026-03-25 15:47:57.41	2026-03-25 15:47:55.868	2026-03-26 16:00:00.013
1d95168a-dc44-42d6-8b34-280514290967	2d791fa1-940c-45bf-a980-1499bbbe1b2a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJlbWFpbCI6ImVlbWVqaWFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkVsbWluIE1lamlhIiwicm9sZSI6IlNVUEVSVklTT1IiLCJqdGkiOiI0Y2ZmZGJiNC1hM2EzLTQwODYtYTlmYy1jNjIxNDRjYmQ0YmQiLCJpYXQiOjE3NzQ1Mzg5MjIsImV4cCI6MTc3NDYyNTMyMn0.7Lyjkxo4wA2EmZ0lA8YlkRc6nraBKx17wfnPUvOsWfk	4cffdbb4-a3a3-4086-a9fc-c62144cbd4bd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZDc5MWZhMS05NDBjLTQ1YmYtYTk4MC0xNDk5YmJiZTFiMmEiLCJqdGkiOiJiNGUzNDMzYy1hMTgwLTQyMDItYWFiYS03MGUxNjFlOWRkNjYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDUzODkyMiwiZXhwIjoxNzc1MTQzNzIyfQ.Ic2Cm-fXMsJlXbmUQt8tqZX8EQazyKVkOEBb7gFNzkY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-27 15:28:42.699	2026-04-02 15:28:42.699	t	2026-03-26 15:33:50.034	2026-03-26 15:28:42.701	2026-03-26 15:33:50.035
06a4f5ec-181d-4459-910e-1d7ceef0c9ca	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiM2ZiNmM4OTgtYjFiZi00Zjk0LThjODItZWJmN2JiNGE0MGY1IiwiaWF0IjoxNzc0NDczMTUzLCJleHAiOjE3NzQ1NTk1NTN9.O7WO9ywQiHuNhzsKnp5NAOyIia3o5YQyWgF6rxRasVs	3fb6c898-b1bf-4f94-8c82-ebf7bb4a40f5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiI0NmQwYmU4ZS05YjM2LTRhMTQtODhkZC03NzcxNGE4ZTA1OGIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ3MzE1MywiZXhwIjoxNzc1MDc3OTUzfQ.Ye0o75IAS0Xy7vwqzBFNzmqIeYKwNUSfUDYjEFVqLW8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 21:12:33.376	2026-04-01 21:12:33.376	t	2026-03-25 22:23:52.668	2026-03-25 21:12:33.379	2026-03-25 22:23:52.669
8302b3ba-bc5b-4695-b3f4-c48d118a2554	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6ImM5MmFmNWZhLTBiNzItNGVkZC05NDlmLTE5ZmVjNWFkYWE2YyIsImlhdCI6MTc3NDI5Mjk3NCwiZXhwIjoxNzc0Mzc5Mzc0fQ.Gj-GJ6XFw0PMmrGizuf0HkZXrj8W1m8kEFZMN3JEZpw	c92af5fa-0b72-4edd-949f-19fec5adaa6c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiI0NGZhYjgyMi1lZmYwLTRmOWYtYjk4ZS04NWExN2QyYjQ4Y2QiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDI5Mjk3NCwiZXhwIjoxNzc0ODk3Nzc0fQ.AeiX91kjNdQ6bVx-SKAYU-fVs-shFMBIXzoBVK6uRnY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-24 19:09:34.445	2026-03-30 19:09:34.445	f	2026-03-24 14:00:41.627	2026-03-23 19:09:34.448	2026-03-24 14:00:41.628
d5f753d7-fa49-48f9-a524-4656bde243a8	ab6d9041-7493-45a5-97f5-62ccbb36c59e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjZkOTA0MS03NDkzLTQ1YTUtOTdmNS02MmNjYmIzNmM1OWUiLCJlbWFpbCI6InNvbGFyZGVzaWduQGVuZXJnaWFwZC5jb20iLCJub21icmUiOiJHYWJyaWVsIE1vbmNhZGEiLCJyb2xlIjoiVVNVQVJJTyIsImp0aSI6ImIzYzdkMmYyLWZmYzUtNGZlMC04Y2Q1LWMzM2ZmMmI0Njc2YSIsImlhdCI6MTc3Mzg1NjM3OCwiZXhwIjoxNzczOTQyNzc4fQ.oNynMSd7-VFcYWdHODrAUOP0HG2QrGO342rpuXSS--Y	b3c7d2f2-ffc5-4fe0-8cd5-c33ff2b4676a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYjZkOTA0MS03NDkzLTQ1YTUtOTdmNS02MmNjYmIzNmM1OWUiLCJqdGkiOiI3OTVhYmFkNS1hYjhlLTQ1MmUtYTFmNy1iZGFhYzYzYmQyNzUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzg1NjM3OCwiZXhwIjoxNzc0NDYxMTc4fQ.7nS6VMnUrwLIdpZ5tPyd3Tmu_Mh5ICpSmQvHnMAvmcU	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-19 17:52:58.149	2026-03-25 17:52:58.149	f	2026-03-19 14:57:27.461	2026-03-18 17:52:58.151	2026-03-19 18:00:00.02
f5f1ead8-2484-4a8b-b300-4bf8fc33bb58	2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZTYxMTlhMC1kYzljLTRlM2MtYTMxZC1kOGQ2M2ViYjI5MjQiLCJlbWFpbCI6ImNvbXByYXNAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkxldmkgQ3J1eiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiMzU2MjBhZGQtZTY5My00MjIzLWEwODItMjQxNGViNmYzMjc1IiwiaWF0IjoxNzc0NDczMzIyLCJleHAiOjE3NzQ1NTk3MjJ9.RZGa69o0u-YObA4MfFM5zCzkjDncZguN1gufeZFwG2Y	35620add-e693-4223-a082-2414eb6f3275	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZTYxMTlhMC1kYzljLTRlM2MtYTMxZC1kOGQ2M2ViYjI5MjQiLCJqdGkiOiJiZmQ3N2E0NC03ODE0LTQwNzItODBjYS1hNjk0MjY3OTgwMzciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ3MzMyMiwiZXhwIjoxNzc1MDc4MTIyfQ.5uknPIuJL4MSmh89X0Uo0tqXCy7GUngvuFFKWqc-Bs8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 21:15:22.08	2026-04-01 21:15:22.08	t	2026-03-25 22:48:11.199	2026-03-25 21:15:22.083	2026-03-25 22:48:11.2
049df925-ab9b-407c-8376-753e1ee15e24	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiODRlZjhlOGEtNTM4OS00MWY4LWE3OTAtZTgwNzhjMDFhMzc5IiwiaWF0IjoxNzc0MzcxNTgxLCJleHAiOjE3NzQ0NTc5ODF9.fTXI0c7XV8H6MUzl65eO4eKBKv-cY6dburPpCrNySU8	84ef8e8a-5389-41f8-a790-e8078c01a379	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiIwMjQ3ZTUwNC0yYTAzLTRhZDMtYTMwMS0zNzM3NmM5OGQ4YmYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDI4MjM3NiwiZXhwIjoxNzc0ODg3MTc2fQ.OfnKRXnMbRmX46otHMpAk80wK7ioFu51QZDw2-EJ3EY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-25 16:59:41.588	2026-03-30 16:12:56.833	f	2026-03-25 16:11:31.632	2026-03-23 16:12:56.837	2026-03-25 17:00:00.016
56b48beb-63a3-445f-b2ff-50b1beb50a5f	1f74a520-e2ef-4d84-84c7-9584223c60a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZjc0YTUyMC1lMmVmLTRkODQtODRjNy05NTg0MjIzYzYwYTUiLCJlbWFpbCI6Im9maWNpYWxpc29AZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IlNhbXVlbCBBdmlsYSIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiZTA3OTZjMjgtMWRhOC00ZDFjLThjMjktMjIwNGQzZjQ4ZTI5IiwiaWF0IjoxNzc0NDQ2NjIyLCJleHAiOjE3NzQ1MzMwMjJ9.BDkGyb_pNiFDcKFHFgGehrDYaQy9N2xyTj6gHh5Vl7A	e0796c28-1da8-4d1c-8c29-2204d3f48e29	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZjc0YTUyMC1lMmVmLTRkODQtODRjNy05NTg0MjIzYzYwYTUiLCJqdGkiOiJlY2Y1YWJjNC0wYTc2LTQzNmEtODYzNi1lMDc3NzIyMzI2MjgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ0NjYyMiwiZXhwIjoxNzc1MDUxNDIyfQ.29HwR7oip0GNlh4f0pL7L28Y0Uxb4YqR8hoUYZOglyI	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-26 13:50:22.714	2026-04-01 13:50:22.714	f	2026-03-25 15:55:34.6	2026-03-25 13:50:22.716	2026-03-26 14:00:00.012
468470cf-0c3b-4575-bedd-c95fc7d2927d	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6IjIxYjU3YjRjLWM2OTctNDczYS04NjY3LTczYzg4ZDIzZGJhZSIsImlhdCI6MTc3NDUzODk1NywiZXhwIjoxNzc0NjI1MzU3fQ.ZtSD9rfuyesA8U86I9zpVozEH-WIcsmGruWubN2eK7I	21b57b4c-c697-473a-8667-73c88d23dbae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiJkYWIyOTdiOC0wMjE4LTQ4ODMtYjFhOS0zMTA0N2RmZWY4ZjkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDUzODk1NywiZXhwIjoxNzc1MTQzNzU3fQ.Vr_L9TuoTanixGke6al6uPhpnVIHTLNBOtqMCRcQMz0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-27 15:29:17.08	2026-04-02 15:29:17.08	t	2026-03-26 15:32:13.545	2026-03-26 15:29:17.083	2026-03-26 15:32:13.546
9f4f9f93-2910-452a-895b-3a2f4ac26421	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6IjVkZDI4YTAxLWYzMmUtNGMzYi04ZGU5LTY1M2ZhYjU1Y2VlYSIsImlhdCI6MTc3Mzg3ODQxNiwiZXhwIjoxNzczOTY0ODE2fQ.ixLOtn4HaFnffTrSqy6QIHz7pgsmHvKUAOTwDJDpRxU	5dd28a01-f32e-4c3b-8de9-653fab55ceea	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiI4YmRhYjMyMS05MzY5LTQyNTQtOWI2Zi0yMmMwMWI4YWEwZDgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3Mzg3ODQxNiwiZXhwIjoxNzc0NDgzMjE2fQ.MJ0F9YFfcd-5xdXXPrpiu0O-V9icpj9OrxVumi1OTYY	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-20 00:00:16.655	2026-03-26 00:00:16.655	f	2026-03-19 20:04:01.336	2026-03-19 00:00:16.658	2026-03-20 01:00:00.022
dde115c9-1dad-4ae6-b8f6-42ac7b7e9760	7b16da9d-1758-4bf9-9960-1ac345362ded	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJlbWFpbCI6Imdlc3Byb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ2FybGEgU2FuY2hleiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiNDgyMWNkM2YtM2ViNy00MWRlLThjODQtMWQ0NjdlNzJkYjE2IiwiaWF0IjoxNzczNjc5NDU0LCJleHAiOjE3NzM3NjU4NTR9.f87n7E6veOlBsvCkWTVsO1P4Ll-J8-o8jjnUQ4soYWA	4821cd3f-3eb7-41de-8c84-1d467e72db16	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjE2ZGE5ZC0xNzU4LTRiZjktOTk2MC0xYWMzNDUzNjJkZWQiLCJqdGkiOiJiNmMwYjhlNy0wY2MzLTQ3M2YtOWU2Zi0xYWUzMGY4NDNhYmMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY3OTQ1NCwiZXhwIjoxNzc0Mjg0MjU0fQ.v4b6C5P3mNEZrOHxyrsdHW84bKbALa8tMNL5hsCtsFg	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-17 16:44:14.343	2026-03-23 16:44:14.343	f	2026-03-16 23:01:36.399	2026-03-16 16:44:14.345	2026-03-17 17:00:00.02
2eb2f055-3fc7-413a-b5d6-dc9c90355ca7	d25da598-5ab6-4684-967f-40bf7b72f3ae	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJlbWFpbCI6InByZXN1cHVlc3RvczFAZW5lcmdpYXBkLmNvbSIsIm5vbWJyZSI6IkJpYW5jYSBMb3BleiIsInJvbGUiOiJVU1VBUklPIiwianRpIjoiYmEyNWFiNTktOTgyMy00M2QzLTk3YjgtNDFmN2EzNmZmYzgwIiwiaWF0IjoxNzczNjg5NTQ5LCJleHAiOjE3NzM3NzU5NDl9.GBGPBDue1sewK-nENkiNsIeI0Z2fzrc57bTe9bx-3H8	ba25ab59-9823-43d3-97b8-41f7a36ffc80	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMjVkYTU5OC01YWI2LTQ2ODQtOTY3Zi00MGJmN2I3MmYzYWUiLCJqdGkiOiJlMTM3OWNmZC01NjdhLTQxZmEtOTNiYS02YTlhN2JlZGZiZjkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY4OTU0OSwiZXhwIjoxNzc0Mjk0MzQ5fQ.nsvmwrlJ7aT-R1jr6Ny8BLy4i30lKoR_Nak5VYjCl04	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-17 19:32:29.067	2026-03-23 19:32:29.067	f	2026-03-16 19:46:26.649	2026-03-16 19:32:29.07	2026-03-16 19:46:26.651
d734f6d0-10de-4d61-a61a-a1069bc4725a	0dbcb577-3b04-48a2-bca5-c8835b00ce5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJlbWFpbCI6ImxtYXJ0aW5lekBlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiTG9hbnkgTWFydGluZXoiLCJyb2xlIjoiU1VQRVJWSVNPUiIsImp0aSI6ImI2MzA2ZTNlLWQ5ZWEtNDZmMy04MTMyLTIzZWE3YWQ2Yjg3YSIsImlhdCI6MTc3NDM2MDg0NSwiZXhwIjoxNzc0NDQ3MjQ1fQ.6M1r6sBJeYlrF5L2i9sZpY8tW8EFAhkHlseJOpCcDwI	b6306e3e-d9ea-46f3-8132-23ea7ad6b87a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGJjYjU3Ny0zYjA0LTQ4YTItYmNhNS1jODgzNWIwMGNlNWUiLCJqdGkiOiI4ZjhlYmRhNi01ZmRmLTRlZWMtYjFhMi1lNDE5NzljNzYzYzAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDM2MDg0NSwiZXhwIjoxNzc0OTY1NjQ1fQ.c6ZN6KO98WaeGPhK7efar76ug4bn2jgHwF-iIrAkGLw	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	::ffff:172.18.0.4	web	Chrome	2026-03-25 14:00:45.581	2026-03-31 14:00:45.581	f	2026-03-24 14:30:17.08	2026-03-24 14:00:45.584	2026-03-24 14:30:17.082
be6c1524-57bc-4262-8618-4ac7749db988	5cddfc77-b008-4e66-b913-2bdd952e31af	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJlbWFpbCI6ImFuYWxpc3RhZGVuZWdvY2lvc0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQnJlbmVkeSBNYXJ0aW5leiIsInJvbGUiOiJTVVBFUlZJU09SIiwianRpIjoiNDNjMjA5NDYtYzEzMS00OWY4LTg1ZTQtNDIwNjk5ODVlMzZhIiwiaWF0IjoxNzczNzc1OTc0LCJleHAiOjE3NzM4NjIzNzR9.Z3fEJoObTMMaoiDkHENOwiAsVZXvm4s5shD67n_YQP4	43c20946-c131-49f8-85e4-42069985e36a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2RkZmM3Ny1iMDA4LTRlNjYtYjkxMy0yYmRkOTUyZTMxYWYiLCJqdGkiOiIwMWJlYmJhNS1jNWUwLTQ3ZmEtOWUwOC1hMjk0MGJkNThlMzciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3MzY4OTUxNiwiZXhwIjoxNzc0Mjk0MzE2fQ.YSvwNi3qL5YOjK0wgPlS-9H2cBr-bERQEJorXtLSCOw	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-18 19:32:54.867	2026-03-23 19:31:56.327	f	2026-03-17 20:25:38.098	2026-03-16 19:31:56.33	2026-03-18 20:00:00.009
9c1913a1-8f25-45e3-87f5-035b9fb680a8	59f1ff36-f443-499b-8b5f-c8f8d87e497c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OWYxZmYzNi1mNDQzLTQ5OWItOGI1Zi1jOGY4ZDg3ZTQ5N2MiLCJlbWFpbCI6ImNidXN0aWxsb0BlbmVyZ2lhcGQuY29tIiwibm9tYnJlIjoiQ3Jpc3RoaWFuIEJ1c3RpbGxvIiwicm9sZSI6IlVTVUFSSU8iLCJqdGkiOiI1YzQwNWYwYS1jM2MzLTQ0NWEtYTEwNC05NGIxZDVjZTMzOTUiLCJpYXQiOjE3NzQ0NDY3MTQsImV4cCI6MTc3NDUzMzExNH0.zAsNbTbQELMKzXnffrCJduuFwRVGKsTdoRDB8CQw90o	5c405f0a-c3c3-445a-a104-94b1d5ce3395	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OWYxZmYzNi1mNDQzLTQ5OWItOGI1Zi1jOGY4ZDg3ZTQ5N2MiLCJqdGkiOiI4YmNmMDAwMy1lNWJmLTQ2YzgtYmI1NC0wMWNlNDZiYjhhM2QiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NDQ0NjcxNCwiZXhwIjoxNzc1MDUxNTE0fQ.n1joCIqdfgyZ-nP_poOoFDR-YM1qDMK1TyZvy6HKvGo	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	::ffff:172.18.0.4	web	Chrome	2026-03-26 13:51:54.944	2026-04-01 13:51:54.944	f	2026-03-25 13:51:56.444	2026-03-25 13:51:54.947	2026-03-26 14:00:00.012
\.


--
-- TOC entry 3943 (class 0 OID 17494)
-- Dependencies: 238
-- Data for Name: timeline_sku; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timeline_sku (id, sku, "paisOrigenId", "medioTransporte", "diasCotizadoADescuento", "diasDescuentoAComprado", "diasCompradoAPagado", "diasPagadoASeguimiento1", "diasSeguimiento1AFob", "diasFobABl", "diasBlASeguimiento2", "diasSeguimiento2ACif", "diasCifARecibido", "diasTotalesEstimados", notas, creado, actualizado, "diasCotizacionFleteABl", "diasFobACotizacionFlete", "diasDescuentoAAprobacionCompra", "diasAprobacionCompraAComprado", "diasPagadoAAprobacionPlanos", "diasAprobacionPlanosASeguimiento1") FROM stdin;
27fe3dde-50fc-4f0c-9c96-b0b17b8e8a5e	PROD-0017	a683c3b9-0a60-47d9-9f48-94f3ed311b70	AEREO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-16 22:43:00.866	2026-03-16 22:43:00.866	2	3	2	1	3	2
791efa96-76d7-4249-aab5-ea45cdbe6e57	PROD-0018	a683c3b9-0a60-47d9-9f48-94f3ed311b70	AEREO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-16 22:43:05.683	2026-03-16 22:43:05.683	2	3	2	1	3	2
a225d00f-5b64-4c34-9fea-3495621b0aa3	PROD-0019	a683c3b9-0a60-47d9-9f48-94f3ed311b70	AEREO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-16 22:43:09.787	2026-03-16 22:43:09.787	2	3	2	1	3	2
9201d0e4-122c-405a-a6b5-f9bd6bba65f7	PROD-0030	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	MARITIMO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-16 23:01:33.003	2026-03-16 23:01:33.003	2	3	2	1	3	2
7aff9f29-965c-4b7e-befe-a8c4aacb515d	PROD-0005	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	MARITIMO	2	3	5	20	10	9	10	10	5	74		2026-02-11 16:29:12.407	2026-02-11 16:29:12.407	3	3	\N	\N	\N	\N
9556e479-8d8e-494e-b4d9-c57ea4a14c5a	PROD-0036	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-19 19:43:50.939	2026-03-19 19:43:50.939	2	3	2	1	3	2
11de2469-63b3-4e76-81f3-ae0efa6124c4	PROD-0038	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-19 19:44:28.404	2026-03-19 19:44:28.404	2	3	2	1	3	2
5ed57f18-a39a-4874-b9c6-d7fd9193278b	PROD-0039	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-19 19:44:43.262	2026-03-19 19:44:43.262	2	3	2	1	3	2
14b2ec07-a686-4241-959c-8a8c9789e002	PROD-0040	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-19 19:44:50.233	2026-03-19 19:44:50.233	2	3	2	1	3	2
c18e7bf5-d91a-47a0-a189-a1c5401e49d7	PROD-0035	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-19 20:04:38.441	2026-03-19 20:04:38.441	2	3	2	1	3	2
5f162e5c-86eb-4db1-b26f-b89ca31665de	PROD-0001	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	MARITIMO	6	\N	2	\N	50	\N	50	10	7	283		2026-02-23 14:43:52.929	2026-02-25 22:32:47.295	10	3	5	90	10	40
3ace9855-6a28-4ba4-b347-7c98ea2ca373	PROD-0002	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	3	\N	5	\N	1	\N	44	7	7	112		2026-02-23 17:45:12.414	2026-02-25 22:45:45.261	2	3	7	30	1	2
8bee4fe8-9f79-4d45-8483-9fd978b9327e	PROD-0034	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-19 20:04:53.894	2026-03-19 20:04:53.894	2	3	2	1	3	2
869402b5-8f0c-4c09-a059-0806e21394f5	PROD-0003	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	3	5	\N	\N	\N	\N	\N	3	24		2026-02-09 21:47:06.656	2026-02-25 22:48:46.278	3	3	2	1	3	2
fe81828d-02c0-4e14-84fc-c7a029653b3f	PROD-0014	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	12	\N	16	\N	10	\N	10	16	51	194		2026-02-18 21:39:57.679	2026-03-19 20:36:47.77	12	13	14	11	17	12
51348e10-302b-403e-bf58-30c5e985dc72	PROD-0004	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	1	1	\N	\N	\N	\N	\N	1	18		2026-02-11 16:16:58.841	2026-02-25 22:57:39.787	3	3	2	1	3	2
27453552-d7a7-4581-969a-1835980ba4d4	PROD-0006	53b360e4-f5fe-4f27-beba-90bc79390f07	TERRESTRE	2	3	2	1	1	1	1	1	1	8		2026-02-11 16:39:44.398	2026-03-03 21:42:00.011	3	3	2	1	\N	\N
8aea55eb-6e49-43f1-a919-1d856ffc5bf1	PROD-0063	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	MARITIMO	1	\N	1	\N	30	\N	\N	\N	5	74		2026-03-26 15:10:29.178	2026-03-26 15:10:29.178	2	3	1	1	0	30
d8fa3824-299f-4085-ad6f-a57d35e2841d	PROD-0021	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-12 14:19:24.22	2026-03-12 14:19:24.22	2	3	2	1	3	2
72e9b895-3739-4732-8a5c-69402c9373ba	PROD-0012	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	2	3	5	5	3	\N	2	4	5	34		2026-02-18 16:22:21.677	2026-02-18 16:22:21.677	2	3	\N	\N	\N	\N
ead8444d-ff58-4651-bb21-946e3537e3bd	PROD-0007	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	3	5	30	8	\N	4	5	5	43		2026-02-16 20:27:42.404	2026-03-12 14:53:01.764	3	3	2	1	3	2
79fcf716-eabc-45fc-b944-76dfc054eec1	PROD-0008	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	3	5	4	4	\N	4	4	5	37		2026-02-17 15:11:22.978	2026-03-12 14:53:15.995	2	3	2	1	3	2
e9133b39-9f02-48c6-b55b-b35f1f05f511	PROD-0009	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	3	5	6	5	\N	5	4	5	39		2026-02-17 15:38:15.897	2026-03-12 14:53:22.248	2	3	2	1	3	2
7b2f2561-3a04-4c77-ad5d-412644948b61	PROD-0010	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	3	2	5	70	\N	4	4	8	103		2026-02-17 19:41:32.48	2026-03-12 14:53:28.174	2	3	2	1	3	2
fe4b9703-c38a-41b6-ad97-7f0d00d6fad4	PROD-0011	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	3	5	\N	\N	\N	\N	\N	3	23		2026-02-18 14:21:09.109	2026-03-12 14:53:34.527	2	3	2	1	3	2
cbc1357b-aeae-4ad8-b816-c658442956bc	PROD-0013	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	5	\N	10	\N	6	\N	7	7	8	63		2026-02-18 21:03:36.202	2026-03-12 15:05:43.708	6	6	2	1	3	2
224e48d4-cf77-4fdd-9337-99932836a0bd	PROD-0025	53b360e4-f5fe-4f27-beba-90bc79390f07	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	3	13		2026-03-12 20:07:36.777	2026-03-12 20:07:36.777	\N	\N	2	1	\N	\N
96725271-9569-45bc-ba04-a2e1e5cf9b52	PROD-0023	53b360e4-f5fe-4f27-beba-90bc79390f07	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	3	13		2026-03-12 21:54:37.452	2026-03-12 21:54:37.452	\N	\N	2	1	\N	\N
30910e78-8c21-4572-84a4-d9a3b50ce33b	PROD-0024	53b360e4-f5fe-4f27-beba-90bc79390f07	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	3	13		2026-03-12 21:54:41.319	2026-03-12 21:54:41.319	\N	\N	2	1	\N	\N
91147ff5-ff15-449b-bcbc-034fde0fbef0	PROD-0028	53b360e4-f5fe-4f27-beba-90bc79390f07	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	3	13		2026-03-13 16:27:49.786	2026-03-13 16:27:49.786	\N	\N	2	1	\N	\N
5befa797-e636-4b8d-ae55-9baabd6b879a	PROD-0027	53b360e4-f5fe-4f27-beba-90bc79390f07	TERRESTRE	2	\N	5	\N	\N	\N	\N	\N	3	13		2026-03-13 16:28:45.491	2026-03-13 16:28:45.491	\N	\N	2	1	\N	\N
a3beea0f-9e76-4b16-9b75-619abdf4fa5e	PROD-0031	a683c3b9-0a60-47d9-9f48-94f3ed311b70	TERRESTRE	5	\N	1	\N	1	\N	2	\N	5	44		2026-03-16 21:27:43.464	2026-03-16 21:27:43.464	4	5	2	2	15	2
1c429242-059f-4067-89a2-1ce79271c31c	PROD-0022	08dc06d9-e90b-40d2-8bd1-6b3f1c4d100f	MARITIMO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-16 21:46:39.48	2026-03-16 21:56:46.784	2	3	2	1	3	2
33e2d059-322a-46ae-9884-8e003a823fef	PROD-0015	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	12	\N	12	\N	12	\N	12	12	12	144		2026-02-20 14:54:48.909	2026-03-16 22:42:38.748	12	12	12	12	12	12
0643af09-383c-4b67-a14b-219645f3f6a0	PROD-0016	3c1328e6-ef5b-4c1c-8de0-393de20ee5af	AEREO	2	\N	5	\N	\N	\N	\N	\N	5	25		2026-03-16 22:42:44.689	2026-03-16 22:42:54.719	2	3	2	1	3	2
\.


--
-- TOC entry 3922 (class 0 OID 17078)
-- Dependencies: 217
-- Data for Name: tipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo (id, area_id, nombre, creado) FROM stdin;
8adeab3d-d2d4-4af5-98d1-e2aadfccb96f	7bffbfd8-eb90-4798-b418-9ae58a4242f5	Area operativa	2026-02-04 21:48:10.551
e20b476c-8af5-4002-81b6-19a1c585176e	9dbd6206-8f42-49f0-af91-8dded16da58b	Proyectos	2026-02-04 21:48:10.546
25dae96a-6888-4a07-b5fa-c9cbb5b391f8	8700d5ed-2c72-478a-a1dd-aa494253bbf0	Ofertas	2026-02-04 21:48:10.553
552548ae-4fb7-45a5-88f6-d02b8af0dfdd	8700d5ed-2c72-478a-a1dd-aa494253bbf0	Licitaciones	2026-02-04 21:48:10.556
01df3243-e582-4cad-b13a-2baf5dbd3af2	a815a7cd-1e40-45b7-9544-1af8bd20da1c	Area tecnica	2026-02-04 21:48:10.549
\.


--
-- TOC entry 3929 (class 0 OID 17138)
-- Dependencies: 224
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, nombre, email, password_hash, rol_id, departamento_id, activo, creado, actualizado, requierecambiopassword) FROM stdin;
2d791fa1-940c-45bf-a980-1499bbbe1b2a	Elmin Mejia	eemejia@energiapd.com	$2b$10$lnbjQ9eUc.HyMXIs2kx/g.KaMQs/2KKGUI32WsrdZeMmeBDbmRi5i	18f6b9ad-7bb2-4551-a120-5208b0e991e9	37fb9dea-9fb9-461d-839a-5f6852a2a64c	t	2026-02-11 16:05:57.164	2026-02-11 16:05:57.164	f
7b16da9d-1758-4bf9-9960-1ac345362ded	Carla Sanchez	gespro@energiapd.com	$2b$10$EnkVyJf4d5NRTVPEjZxXXeQ22Qg4PEPGJlmmgqDE0ppDLtaFTz7o.	18f6b9ad-7bb2-4551-a120-5208b0e991e9	37fb9dea-9fb9-461d-839a-5f6852a2a64c	t	2026-02-11 16:07:28.497	2026-02-11 16:07:28.497	f
b63f5622-6285-43cd-93cb-266e7918b37e	Cristian Lainez	ingenieroused@energiapd.com	$2b$10$OzKvlUxXz.N19XpSo4UpzuvN1rCzLU3CSm5hEnn/GwbBXfRf5C1iS	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:30:32.866	2026-03-19 22:30:32.866	f
c430e3c5-4152-4a77-b7fc-af3844f9a5f8	Abner Enamorado	automatizacion4@energiapd.com	$2b$10$Dc1Qteg6lLFNCyi3vAxj/Or3S23WJ.FwDFMGRoKbDWcotKSoG/iv2	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:31:02.129	2026-03-19 22:31:02.129	f
ab7afc4e-1daf-4bf8-a3b9-0ca77a4da243	Edwin Perdomo	eperdomo@energiapd.com	$2b$10$rnjwwZNq5Zw6t2ub8nihd.1U1fr7KXBnks9eCfL9k88TRzK.OQYHy	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:31:40.038	2026-03-19 22:31:40.038	f
9b6b69c0-24ae-42fc-9ddc-b8d4d3a016ac	Osvin Franco	ofranco@energiapd.com	$2b$10$.1rKN2hLJOoSLUgLAh0JTOLRP7smmlZlzb5L92KZDcNjCZd.EsOzC	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:32:07.42	2026-03-19 22:32:07.42	f
5cddfc77-b008-4e66-b913-2bdd952e31af	Brenedy Martinez	analistadenegocios@energiapd.com	$2b$10$bTNQWjk6W5m.HA0IDMGdCu6Uorj2jBUYXXUrEcEuN1VWHgdnes72W	18f6b9ad-7bb2-4551-a120-5208b0e991e9	b29c6c4d-6986-491c-a9a4-a5cb096f73ea	t	2026-02-04 22:18:57.406	2026-02-04 22:18:57.406	f
a3f68665-8076-4595-9319-4be43d8e48be	Gerson Murillo	solucionestecnologicas@energiapd.com	$2b$10$JvDC6gfnlbeTuzyY1s5QUuUdRGwv255g0TxETNmcsQvkbH9ar5ppW	18f6b9ad-7bb2-4551-a120-5208b0e991e9	b29c6c4d-6986-491c-a9a4-a5cb096f73ea	t	2026-02-04 22:17:42.736	2026-02-12 22:39:08.135	f
c147a496-79b8-40ae-9d9d-baeb07528b2a	Administrador	admin@sistema.com	$2b$10$JvDC6gfnlbeTuzyY1s5QUuUdRGwv255g0TxETNmcsQvkbH9ar5ppW	f1e54605-24fe-4cd0-b288-50dca7ab8c8f	6b1ba0b2-f741-4f93-b8db-475406b6cd96	t	2026-02-04 21:48:10.535	2026-02-04 21:48:10.535	f
2e6119a0-dc9c-4e3c-a31d-d8d63ebb2924	Levi Cruz	compras@energiapd.com	$2b$10$rSEtsEaW1X5aU39v8evcMu46pHWWuNTLa92Kewv68syvHZ0F4rite	18f6b9ad-7bb2-4551-a120-5208b0e991e9	37fb9dea-9fb9-461d-839a-5f6852a2a64c	t	2026-02-23 14:34:16.634	2026-02-23 14:34:16.634	f
c14e0c95-c26b-427c-b500-d61e09ce0f59	Test	test@energiapd.com	$2b$10$peCPdRtgqdEqIskRt6Lf4eR/5DkDvSdrQHIzTDi3s.mwMjbIzQzaG	18f6b9ad-7bb2-4551-a120-5208b0e991e9	b29c6c4d-6986-491c-a9a4-a5cb096f73ea	f	2026-02-11 16:43:40.113	2026-02-11 16:43:40.113	f
10e730e7-be69-4f67-b4dd-23429dc0a490	Gelber Trejo	ingeniero.residente@energiapd.com	$2b$10$OJ0P6k7GpulQIGNvZ9COL.ejAkcc54FqSFdjftiSutW7pX/EvoK3O	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:32:32.843	2026-03-19 22:32:32.843	f
4e77f023-4805-4b5a-b8db-f6ad9583ea36	Joffre Alcides	supervisor.mecanico-ext@energiapd.com	$2b$10$97XwvEYu6fJFsqxIx74VWOZa./FMiiq/NLrJXXA93.aoLw7bMue7S	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:34:17.085	2026-03-19 22:34:17.085	f
a1a14554-daa0-4458-95ad-905a083aedc8	Josue Hasbun	jhasbun@energiapd.com	$2b$10$5FaEWOGXyUKcT2Uq6p.AX.e.BsdX7c9fWQ4SDLHzMkAoiJJIPpV96	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:34:43.219	2026-03-19 22:34:43.219	f
ab92a2bb-a4df-4c8e-bc6f-b88ed86ed912	Christopher Matute	oficialtecnicolicitaciones@energiapd.com	$2b$10$5YpjKm3B.jY/NnB452SN2embKvW3uoOBFytHZb5FwP0Af5EnsNkQi	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-02-26 16:37:25.519	2026-02-26 16:37:25.519	f
d25da598-5ab6-4684-967f-40bf7b72f3ae	Bianca Lopez	presupuestos1@energiapd.com	$2b$10$APdzlL/dU2WLZZafnxoqjei.0h8B/dc59Udq1uNsbJOyUyBuVFXka	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-02-26 16:36:17.037	2026-02-26 16:36:17.037	f
0dbcb577-3b04-48a2-bca5-c8835b00ce5e	Loany Martinez	lmartinez@energiapd.com	$2b$10$yqzc6.A65CFLVuEkxHyDnuDgRp1Y8SYSWBQ9/szW7pQUrui8fsYP6	18f6b9ad-7bb2-4551-a120-5208b0e991e9	5a8ffc69-a948-476b-8844-68e32a64629d	t	2026-02-23 14:35:52.484	2026-02-23 14:35:52.484	f
ab6d9041-7493-45a5-97f5-62ccbb36c59e	Gabriel Moncada	solardesign@energiapd.com	$2b$10$PKdNYAgjfuWxnYrJqThc/us5o.DWrGv5i1UR46C2eypjwv61tmSum	5c211408-cd26-4007-af15-3cefb77780df	096be3f6-90fa-4868-a107-acb5d4fe83e1	t	2026-03-18 17:41:27.429	2026-03-18 17:41:27.429	f
46c51e6e-2349-4779-907a-a37e89eb5549	Denis Romero	dromero@energiapd.com	$2b$10$JspoSPOzFEkA.jDLy2FkM.B0txVQpxsZriXA/RwlBTRKH8GY7HPgG	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 21:31:12.536	2026-03-19 21:31:12.536	f
048a1d2b-f0ce-4b40-8dc2-318d176072fc	Marlon Solis	msolis@energiapd.com	$2b$10$GAeTmDrVB6iabOLV.F6aI.7P8REIbPjpYL7ZyYndrPJMPcNdSU9mq	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 21:32:14.878	2026-03-19 21:32:14.878	f
210438c3-c102-4d63-8932-a7e0e94922cd	Jose Rivera	residentecivil@energiapd.com	$2b$10$avxfpAf6XR.Qblruk.FRleTNOPrzQLrcyn2q7eQNin03IW5IqY4Eu	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:35:48.466	2026-03-19 22:35:48.466	f
bf02a248-75b7-415d-81aa-43194ede8e7b	Hector Suazo	ingsupervisorused@energiapd.com	$2b$10$0Fa2TLcy1QykKQxFH59wIuNO1TdDG0FIShwPs2IKjHmdxEOwU1YUq	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 21:38:17.599	2026-03-19 21:38:17.599	f
6418f7f2-e259-4878-b90e-736dc129c811	Maxwell Lopez	supervisorude@energiapd.com	$2b$10$oaLxjBAtWgvWw0GxRqNrH.lY3fT7VMCaT.f01h1lMzCRqhZs9NC82	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:27:50.126	2026-03-19 22:27:50.126	f
f49e2975-b4e3-4baf-ad47-ad337c83c629	Tulio Guzman	tguzman@energiapd.com	$2b$10$7hXXV2Yp644nZpdFFMbxN.Eu3uqKIAVyq4muEU3IkJtHMJv7t2pou	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:28:28.497	2026-03-19 22:28:28.497	f
1dd86be6-480c-433d-bbaa-d5a6c5519ca6	Karla Alfaro	pcm_cad2@energiapd.com	$2b$10$VQiMpocpRyoO2sg5s0ugfenGXHCnfeIf90whc4rrx5mk8b.7ItfjK	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:29:04.13	2026-03-19 22:29:04.13	f
3e9f8772-5e8a-471f-a198-02e9cad3376a	Andres Alvarado	automatizacion1@energiapd.com	$2b$10$v3oXYP5h/uIl.q8iPz2o1ORxaPN.dCTNEVMnIkW7rW0n9IbnzU6v.	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:29:41.88	2026-03-19 22:29:41.88	f
8ebd593d-8467-4e85-ae91-a59701b8b167	Fernando Alonso	protecciones1@energiapd.com	$2b$10$T.i90MRbyNhxIYsMlWZn/uG3U0s2AjAHYeSISW8cifR9DkHDUjHHu	5c211408-cd26-4007-af15-3cefb77780df	3b454475-f1a0-4b12-bd1b-503a8cf45e3a	t	2026-03-19 22:30:09.548	2026-03-19 22:30:09.548	f
7ea565f6-20cb-434f-8d6e-cccce407d328	Jorge Campos	jcampos@energiapd.com	$2b$10$2bU21BrL8JpB.Hny6N1lZuMwG.0VytgL/t/YNkcnvsLRXoSqfWmoG	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:36:15.202	2026-03-19 22:36:15.202	f
fc1df5fd-ee94-4478-bf39-7b8ece83f1e9	Juan Mazier	ingeniero.civil@energiapd.com	$2b$10$DD24ZN9Y4Qi2zQtCk3EnoOZ2X.xlfRErvmf2AQFUtvcG3edpoICLG	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:36:40.026	2026-03-19 22:36:40.026	f
e894f044-67af-400a-ba3d-d05dc263e484	Yunior Murillo	ymurillo@energiapd.com	$2b$10$0A./EjMEWDSLTu3lYOtjxe7SMkFzFz.WynK83.kynve/RjHrygbvy	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-19 22:37:19.91	2026-03-19 22:37:19.91	f
f0ecf8cb-b704-4a08-a4ed-346f1ee51d8f	Arleny Cáceres 	disenoelectrico@energiapd.com	$2b$10$saV16e4iRgHcfJmhJucjbefcJ6V1dFVPEmpdi756CTUjEtkZZ.6SW	5c211408-cd26-4007-af15-3cefb77780df	096be3f6-90fa-4868-a107-acb5d4fe83e1	t	2026-03-19 22:37:45.507	2026-03-19 22:37:45.507	f
b3dc10d9-0fbb-4f3a-b535-8beca0168a05	Gylma Saldivar	disenografico@energiapd.com	$2b$10$EV7a8LyycA1eFJrcP86vcOJKwLzPXwPU5hhh4drAlK9Z4TkbS9QeK	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-03-19 22:38:32.748	2026-03-19 22:38:32.748	f
fc218dbb-81c2-4378-82ae-113eca60ee2e	Jeyson Mejia	jeysonm@energiapd.com	$2b$10$xfgiDAtpiyynGaxYVlllqOXk7uIHidghfCdzJ4FDmOdaHCARQMl4K	5c211408-cd26-4007-af15-3cefb77780df	5a8ffc69-a948-476b-8844-68e32a64629d	t	2026-03-19 22:39:49.03	2026-03-19 22:39:49.03	f
187458d6-d2bf-4b16-962a-815708475919	Sthefany Pineda	recepcion@energiapd.com	$2b$10$j1NI.C4RMyuczZxoAw9R7umZfd9t4o.1Tt5VmW1Nz73EAFoEsZqEy	5c211408-cd26-4007-af15-3cefb77780df	6144a0ae-75a8-4ea9-a852-04c8bbf344a3	t	2026-03-19 22:40:50.94	2026-03-19 22:40:50.94	f
3a86cfac-7925-4129-9451-6683730d448b	Cindy Ayala	recursoshumanos@energiapd.com	$2b$10$YmH2V.ThwT.2wahoQ7B2Hu6Tj1JgHX0tlaFSXgye3XJMEZuOuMB..	5c211408-cd26-4007-af15-3cefb77780df	6144a0ae-75a8-4ea9-a852-04c8bbf344a3	t	2026-03-19 22:44:56.172	2026-03-19 22:44:56.172	f
94119df6-0f9f-45ae-94d7-1c3c7f270a39	Marisol Rodriguez	reclutamiento@energiapd.com	$2b$10$ithi1Je9jf2A09rlbRhOC.BcgqNXpucvfhuXhXetlXbOoN8yA/jsm	5c211408-cd26-4007-af15-3cefb77780df	6144a0ae-75a8-4ea9-a852-04c8bbf344a3	t	2026-03-19 22:45:22.134	2026-03-19 22:45:22.134	f
84697d74-d810-444c-8403-873664537605	Nestor Mendoza	it@energiapd.com	$2b$10$uPKdhnOkTLDz3MWIFcTcluAsXJEzVTxQVl0H5BfEA330046YhJUoO	5c211408-cd26-4007-af15-3cefb77780df	b29c6c4d-6986-491c-a9a4-a5cb096f73ea	t	2026-02-09 21:22:45.315	2026-02-25 15:12:18.303	f
1f74a520-e2ef-4d84-84c7-9584223c60a5	Samuel Avila	oficialiso@energiapd.com	$2b$10$cW5G4pzqXjSY7.9MqwGZ4OzNTDsJ.qXoPtFBl2SjS4kgCeyyPKhz.	5c211408-cd26-4007-af15-3cefb77780df	6144a0ae-75a8-4ea9-a852-04c8bbf344a3	t	2026-03-19 22:45:46.584	2026-03-19 22:45:46.584	f
b4986c5e-fdfd-48f4-b209-26a236638b66	Denisse Cerros	auxiliaradministrativo@energiapd.com	$2b$10$GhvZ.SNXWSXGFLHTwYVKNuk0pOOi.50jgvDs9SDh0ejbK9U0umbkS	5c211408-cd26-4007-af15-3cefb77780df	4282ca8a-3cdc-4852-afb3-3552d68691c7	t	2026-03-19 22:46:26.492	2026-03-19 22:46:26.492	f
30475fd2-4f8f-4bb2-a8eb-36327bd5d42d	Oscar Leiva	oleiva@energiapd.com	$2b$10$D8MkdZqBUxc0FnUJrQHjB.WnWu2WofgffgREukt8wmjIJG5uys1pW	5c211408-cd26-4007-af15-3cefb77780df	4282ca8a-3cdc-4852-afb3-3552d68691c7	t	2026-03-19 22:46:57.437	2026-03-19 22:46:57.437	f
6a91b67e-2b3c-4a0e-9e75-02292c2cdd97	Jamil Mejia	jmejia@energiapd.com	$2b$10$ma/gOwa5LIBL0UEAiCK/JOIM8G0BF2RP7Reqf88gLHoZF2hLyMNQa	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-03-19 22:48:36.476	2026-03-19 22:48:36.476	f
ae23f0cc-e858-49e7-88bf-de48fd276901	Christopher Matute	licitaciones@energiapd.com	$2b$10$PpnAr8..dnhcVPurg5YZdeBRWjsyA.WRbSq/LsJ1/d2Cq25hWoW4G	5c211408-cd26-4007-af15-3cefb77780df	96d3ecd8-e63c-4fdd-a7dd-e0695e9054de	t	2026-03-19 22:49:14.392	2026-03-19 22:49:14.392	f
9d74fd66-8c1f-48da-9d2a-9d67b5dd21c0	Marvin Villalta	gestorsyso@energiapd.com	$2b$10$H9WBXDndvyVXJSZal8iEie/6XrJk6u6KWSn3p41amXplVRE8EyTLi	5c211408-cd26-4007-af15-3cefb77780df	aec857b8-bf0c-42e0-a220-ef5c1bd64242	t	2026-03-19 22:52:27.712	2026-03-19 22:52:27.712	f
13cda7d2-4d74-499f-ae58-7f0bbcd0b304	Erick Majano	emajano@energiapd.com	$2b$10$v8ZMQTyz7..HPrUyyacyV.Tj.J1blP7IXP8BsD93h5RPXR4gWsCBm	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-20 14:15:35.987	2026-03-20 14:15:35.987	f
59f1ff36-f443-499b-8b5f-c8f8d87e497c	Cristhian Bustillo	cbustillo@energiapd.com	$2b$10$N1dLXat0dW6bUMPmN3WniOPjcSisaNthgk/LPkwd5peOXKAgku7b6	5c211408-cd26-4007-af15-3cefb77780df	a9f29178-a922-4a2d-85e2-8984582f4298	t	2026-03-20 14:16:22.27	2026-03-20 14:16:22.27	f
42b893a5-cfec-48f4-840c-669a99cdc93b	Mariela Zuniga	marketing@energiapd.com	$2b$10$8gKzLwF79kodwQl3M3oAEOTssB7HlizXvH5iz3/T0d0W1/TEh6MuC	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-03-20 14:33:21.193	2026-03-20 14:33:21.193	f
ea1d09cd-d1d0-44f8-87ce-f21517a8cc34	Isabel Matute	gprocesos@energiapd.com	$2b$10$1U90f6JEN5uPdQW6Xr8oVude1KcXad7O7QrtVj8t7pAv.qCdd4y8i	5c211408-cd26-4007-af15-3cefb77780df	53fb8973-3376-4ec6-90d9-afa9d8ef508f	t	2026-03-20 14:34:05.044	2026-03-20 14:34:05.044	f
e039ad91-084f-46bc-82b4-87ca719b0536	Erick Alvarez	ealvarez@energiapd.com	$2b$10$lMZVddWH9suP5RY8sxWj8eh8q0YL0Y6FvA8gYpTnmQxEgl8LkYjSq	5c211408-cd26-4007-af15-3cefb77780df	4282ca8a-3cdc-4852-afb3-3552d68691c7	t	2026-03-20 14:34:43.34	2026-03-20 14:34:43.34	f
2db0de74-22c5-4690-88cd-2ff4a36cb3a5	Andrea Mejia	amejia@energiapd.com	$2b$10$7ppxYh7qb/zpuiOSr2kp1uROwY6hOgrNVX5PRexw9UPO9JLWvP8lS	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-03-20 14:35:10.11	2026-03-20 14:35:10.11	f
2445535d-d28c-4565-9105-1a03f911d652	Sindy Bustillo	auxiliaroperaciones@energiapd.com	$2b$10$TrZr.DcFn0Mors29DtRih.6jpxb8QIxOVUzhWmSpSmscVWBbDHEPy	5c211408-cd26-4007-af15-3cefb77780df	37fb9dea-9fb9-461d-839a-5f6852a2a64c	t	2026-03-20 14:37:14.02	2026-03-20 14:37:14.02	f
1d18fdc3-0e4f-40ea-9350-f4ba38e99bbb	Dilcia Nuñez	importexport@energiapd.com	$2b$10$jUIQ/AcYPfBTjRhLQq4yr.4xJ7eeYvv7U5Kem9SY9BOlIQQRLn3bm	5c211408-cd26-4007-af15-3cefb77780df	37fb9dea-9fb9-461d-839a-5f6852a2a64c	t	2026-03-20 14:37:52.861	2026-03-20 14:37:52.861	f
d5cdf0ca-2b98-43be-8e54-d867a896bcea	Keydi Melgar	kmelgar@energiapd.com	$2b$10$.bpzQP.k84B1qMJFzJXNkuWNsDGZGFBGkVHw1zt5Uh66.SmjY57Ti	5c211408-cd26-4007-af15-3cefb77780df	6144a0ae-75a8-4ea9-a852-04c8bbf344a3	t	2026-03-19 22:40:11.35	2026-03-25 13:43:28.383	f
e631a960-c715-4613-8d40-72f667540218	Dayana Melendez	dmelendez@energiapd.com	$2b$10$s0zKZt06zKiDybmRj3UShef2HjxX0Ddbmr1lIYaG.PtEzBdpczIwa	5c211408-cd26-4007-af15-3cefb77780df	679295b7-dc46-4657-915a-c77b6f3d9ace	t	2026-03-19 22:49:47.186	2026-03-25 14:56:04.194	f
b496cc68-c436-4fb7-b68c-ebb45d56d3a7	Manuel Canales	auxiliarit@energiapd.com	$2b$10$H68GpNeAMmEnva6V7uRaD.FM89mGo2IPRB.878ZkK1vlGCWAA/DNG	5c211408-cd26-4007-af15-3cefb77780df	b29c6c4d-6986-491c-a9a4-a5cb096f73ea	t	2026-03-25 19:13:03.662	2026-03-25 19:13:03.662	f
03b4b26a-6583-4421-ba84-d887ddefec84	Marco Hernandez	encargadoflotavehicular@energiapd.com	$2b$10$JCqXLLcbkCjKgoRwaV5HF.Q5KEEdd7gWd9hGWIVgaXENcAXjcxGSy	5c211408-cd26-4007-af15-3cefb77780df	53fb8973-3376-4ec6-90d9-afa9d8ef508f	t	2026-03-25 22:04:04.84	2026-03-25 22:04:04.84	f
a4bcf716-fef7-48a6-b064-c62931b2e5ce	Reinaldo Villatoro	site.manager.solar@energiapd.com	$2b$10$Qvc3KIrRwXyU8iCcpoKnr.verUwAkW.N56nl4pwvrvtD6tn3xS6.m	5c211408-cd26-4007-af15-3cefb77780df	096be3f6-90fa-4868-a107-acb5d4fe83e1	t	2026-03-25 22:56:15.039	2026-03-25 22:56:15.039	f
\.


--
-- TOC entry 3549 (class 2606 OID 16393)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3635 (class 2606 OID 17229)
-- Name: adjuntos adjuntos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adjuntos
    ADD CONSTRAINT adjuntos_pkey PRIMARY KEY (id);


--
-- TOC entry 3552 (class 2606 OID 17077)
-- Name: area area_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT area_pkey PRIMARY KEY (id);


--
-- TOC entry 3623 (class 2606 OID 17207)
-- Name: chat chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


--
-- TOC entry 3613 (class 2606 OID 17192)
-- Name: compra_detalle compra_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalle
    ADD CONSTRAINT compra_detalle_pkey PRIMARY KEY (id);


--
-- TOC entry 3609 (class 2606 OID 17183)
-- Name: compra compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_pkey PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 17165)
-- Name: cotizacion_detalle cotizacion_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion_detalle
    ADD CONSTRAINT cotizacion_detalle_pkey PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 17158)
-- Name: cotizacion cotizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_pkey PRIMARY KEY (id);


--
-- TOC entry 3561 (class 2606 OID 17093)
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id);


--
-- TOC entry 3696 (class 2606 OID 33027)
-- Name: documento_adjunto documento_adjunto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_adjunto
    ADD CONSTRAINT documento_adjunto_pkey PRIMARY KEY (id);


--
-- TOC entry 3689 (class 2606 OID 33016)
-- Name: documento_requerido documento_requerido_estado_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_requerido
    ADD CONSTRAINT documento_requerido_estado_nombre_key UNIQUE (estado, nombre);


--
-- TOC entry 3691 (class 2606 OID 33014)
-- Name: documento_requerido documento_requerido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_requerido
    ADD CONSTRAINT documento_requerido_pkey PRIMARY KEY (id);


--
-- TOC entry 3647 (class 2606 OID 17420)
-- Name: estado_producto estado_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT estado_producto_pkey PRIMARY KEY (id);


--
-- TOC entry 3669 (class 2606 OID 17592)
-- Name: historial_cotizacion historial_cotizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cotizacion
    ADD CONSTRAINT historial_cotizacion_pkey PRIMARY KEY (id);


--
-- TOC entry 3685 (class 2606 OID 32947)
-- Name: historial_fecha_limite historial_fecha_limite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_fecha_limite
    ADD CONSTRAINT historial_fecha_limite_pkey PRIMARY KEY (id);


--
-- TOC entry 3700 (class 2606 OID 33110)
-- Name: justificacion_no_aplica justificacion_no_aplica_estado_producto_id_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.justificacion_no_aplica
    ADD CONSTRAINT justificacion_no_aplica_estado_producto_id_estado_key UNIQUE (estado_producto_id, estado);


--
-- TOC entry 3703 (class 2606 OID 33108)
-- Name: justificacion_no_aplica justificacion_no_aplica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.justificacion_no_aplica
    ADD CONSTRAINT justificacion_no_aplica_pkey PRIMARY KEY (id);


--
-- TOC entry 3705 (class 2606 OID 33657)
-- Name: licitacion licitacion_cotizacion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion
    ADD CONSTRAINT licitacion_cotizacion_id_key UNIQUE (cotizacion_id);


--
-- TOC entry 3708 (class 2606 OID 33655)
-- Name: licitacion licitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion
    ADD CONSTRAINT licitacion_pkey PRIMARY KEY (id);


--
-- TOC entry 3711 (class 2606 OID 33692)
-- Name: licitacion_producto licitacion_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion_producto
    ADD CONSTRAINT licitacion_producto_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 17221)
-- Name: mensaje mensaje_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_pkey PRIMARY KEY (id);


--
-- TOC entry 3639 (class 2606 OID 17238)
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id);


--
-- TOC entry 3713 (class 2606 OID 33883)
-- Name: oferta oferta_cotizacion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta
    ADD CONSTRAINT oferta_cotizacion_id_key UNIQUE (cotizacion_id);


--
-- TOC entry 3716 (class 2606 OID 33881)
-- Name: oferta oferta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta
    ADD CONSTRAINT oferta_pkey PRIMARY KEY (id);


--
-- TOC entry 3719 (class 2606 OID 33918)
-- Name: oferta_producto oferta_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_producto
    ADD CONSTRAINT oferta_producto_pkey PRIMARY KEY (id);


--
-- TOC entry 3655 (class 2606 OID 17493)
-- Name: pais pais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pais
    ADD CONSTRAINT pais_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 17212)
-- Name: participantes_chat participantes_chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_chat
    ADD CONSTRAINT participantes_chat_pkey PRIMARY KEY (chat_id, user_id);


--
-- TOC entry 3578 (class 2606 OID 17131)
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- TOC entry 3604 (class 2606 OID 17173)
-- Name: precios precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios
    ADD CONSTRAINT precios_pkey PRIMARY KEY (id);


--
-- TOC entry 3665 (class 2606 OID 17514)
-- Name: proceso_personalizado proceso_personalizado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proceso_personalizado
    ADD CONSTRAINT proceso_personalizado_pkey PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 17112)
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id);


--
-- TOC entry 3566 (class 2606 OID 17103)
-- Name: proyecto proyecto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto
    ADD CONSTRAINT proyecto_pkey PRIMARY KEY (id);


--
-- TOC entry 3581 (class 2606 OID 17137)
-- Name: rol_permisos rol_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- TOC entry 3573 (class 2606 OID 17122)
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id);


--
-- TOC entry 3620 (class 2606 OID 17200)
-- Name: seguimiento seguimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguimiento
    ADD CONSTRAINT seguimiento_pkey PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 17629)
-- Name: sesion sesion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesion
    ADD CONSTRAINT sesion_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 17503)
-- Name: timeline_sku timeline_sku_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeline_sku
    ADD CONSTRAINT timeline_sku_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 17085)
-- Name: tipo tipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo
    ADD CONSTRAINT tipo_pkey PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 17147)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 1259 OID 17274)
-- Name: adjuntos_mensaje_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX adjuntos_mensaje_id_idx ON public.adjuntos USING btree (mensaje_id);


--
-- TOC entry 3550 (class 1259 OID 22683)
-- Name: area_nombre_area_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX area_nombre_area_key ON public.area USING btree (nombre_area);


--
-- TOC entry 3553 (class 1259 OID 17460)
-- Name: area_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX area_tipo_idx ON public.area USING btree (tipo);


--
-- TOC entry 3606 (class 1259 OID 17259)
-- Name: compra_cotizacion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compra_cotizacion_id_idx ON public.compra USING btree (cotizacion_id);


--
-- TOC entry 3610 (class 1259 OID 17261)
-- Name: compra_detalle_compra_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compra_detalle_compra_id_idx ON public.compra_detalle USING btree (compra_id);


--
-- TOC entry 3611 (class 1259 OID 17263)
-- Name: compra_detalle_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compra_detalle_estado_idx ON public.compra_detalle USING btree (estado);


--
-- TOC entry 3614 (class 1259 OID 17262)
-- Name: compra_detalle_proveedor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compra_detalle_proveedor_id_idx ON public.compra_detalle USING btree (proveedor_id);


--
-- TOC entry 3615 (class 1259 OID 17264)
-- Name: compra_detalle_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compra_detalle_sku_idx ON public.compra_detalle USING btree (sku);


--
-- TOC entry 3607 (class 1259 OID 17260)
-- Name: compra_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compra_estado_idx ON public.compra USING btree (estado);


--
-- TOC entry 3589 (class 1259 OID 17598)
-- Name: cotizacion_chat_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_chat_id_idx ON public.cotizacion USING btree (chat_id);


--
-- TOC entry 3590 (class 1259 OID 17596)
-- Name: cotizacion_chat_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cotizacion_chat_id_key ON public.cotizacion USING btree (chat_id);


--
-- TOC entry 3598 (class 1259 OID 17255)
-- Name: cotizacion_detalle_cotizacion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_detalle_cotizacion_id_idx ON public.cotizacion_detalle USING btree (cotizacion_id);


--
-- TOC entry 3601 (class 1259 OID 17256)
-- Name: cotizacion_detalle_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_detalle_sku_idx ON public.cotizacion_detalle USING btree (sku);


--
-- TOC entry 3591 (class 1259 OID 17252)
-- Name: cotizacion_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_estado_idx ON public.cotizacion USING btree (estado);


--
-- TOC entry 3592 (class 1259 OID 17254)
-- Name: cotizacion_fecha_solicitud_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_fecha_solicitud_idx ON public.cotizacion USING btree (fecha_solicitud);


--
-- TOC entry 3595 (class 1259 OID 17253)
-- Name: cotizacion_proyecto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_proyecto_id_idx ON public.cotizacion USING btree (proyecto_id);


--
-- TOC entry 3596 (class 1259 OID 17251)
-- Name: cotizacion_solicitante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_solicitante_id_idx ON public.cotizacion USING btree (solicitante_id);


--
-- TOC entry 3597 (class 1259 OID 17597)
-- Name: cotizacion_supervisor_responsable_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cotizacion_supervisor_responsable_id_idx ON public.cotizacion USING btree (supervisor_responsable_id);


--
-- TOC entry 3559 (class 1259 OID 22684)
-- Name: departamento_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX departamento_nombre_key ON public.departamento USING btree (nombre);


--
-- TOC entry 3692 (class 1259 OID 33044)
-- Name: documento_adjunto_documento_requerido_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documento_adjunto_documento_requerido_id_idx ON public.documento_adjunto USING btree (documento_requerido_id);


--
-- TOC entry 3693 (class 1259 OID 33045)
-- Name: documento_adjunto_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documento_adjunto_estado_idx ON public.documento_adjunto USING btree (estado);


--
-- TOC entry 3694 (class 1259 OID 33043)
-- Name: documento_adjunto_estado_producto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documento_adjunto_estado_producto_id_idx ON public.documento_adjunto USING btree (estado_producto_id);


--
-- TOC entry 3697 (class 1259 OID 33046)
-- Name: documento_adjunto_subido_por_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documento_adjunto_subido_por_idx ON public.documento_adjunto USING btree (subido_por);


--
-- TOC entry 3686 (class 1259 OID 33018)
-- Name: documento_requerido_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documento_requerido_activo_idx ON public.documento_requerido USING btree (activo);


--
-- TOC entry 3687 (class 1259 OID 33017)
-- Name: documento_requerido_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documento_requerido_estado_idx ON public.documento_requerido USING btree (estado);


--
-- TOC entry 3641 (class 1259 OID 17525)
-- Name: estado_producto_cotizacionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "estado_producto_cotizacionId_idx" ON public.estado_producto USING btree ("cotizacionId");


--
-- TOC entry 3642 (class 1259 OID 17526)
-- Name: estado_producto_criticidad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX estado_producto_criticidad_idx ON public.estado_producto USING btree (criticidad);


--
-- TOC entry 3643 (class 1259 OID 17529)
-- Name: estado_producto_medioTransporte_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "estado_producto_medioTransporte_idx" ON public.estado_producto USING btree ("medioTransporte");


--
-- TOC entry 3644 (class 1259 OID 17527)
-- Name: estado_producto_nivelCriticidad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "estado_producto_nivelCriticidad_idx" ON public.estado_producto USING btree ("nivelCriticidad");


--
-- TOC entry 3645 (class 1259 OID 17528)
-- Name: estado_producto_paisOrigenId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "estado_producto_paisOrigenId_idx" ON public.estado_producto USING btree ("paisOrigenId");


--
-- TOC entry 3648 (class 1259 OID 17524)
-- Name: estado_producto_proyectoId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "estado_producto_proyectoId_idx" ON public.estado_producto USING btree ("proyectoId");


--
-- TOC entry 3649 (class 1259 OID 17469)
-- Name: estado_producto_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX estado_producto_sku_idx ON public.estado_producto USING btree (sku);


--
-- TOC entry 3666 (class 1259 OID 17593)
-- Name: historial_cotizacion_cotizacion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_cotizacion_cotizacion_id_idx ON public.historial_cotizacion USING btree (cotizacion_id);


--
-- TOC entry 3667 (class 1259 OID 17595)
-- Name: historial_cotizacion_creado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_cotizacion_creado_idx ON public.historial_cotizacion USING btree (creado);


--
-- TOC entry 3670 (class 1259 OID 17594)
-- Name: historial_cotizacion_usuario_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_cotizacion_usuario_id_idx ON public.historial_cotizacion USING btree (usuario_id);


--
-- TOC entry 3680 (class 1259 OID 32976)
-- Name: historial_fecha_limite_creado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_fecha_limite_creado_idx ON public.historial_fecha_limite USING btree (creado);


--
-- TOC entry 3681 (class 1259 OID 32961)
-- Name: historial_fecha_limite_creado_por_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_fecha_limite_creado_por_idx ON public.historial_fecha_limite USING btree (creado_por);


--
-- TOC entry 3682 (class 1259 OID 32959)
-- Name: historial_fecha_limite_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_fecha_limite_estado_idx ON public.historial_fecha_limite USING btree (estado);


--
-- TOC entry 3683 (class 1259 OID 32958)
-- Name: historial_fecha_limite_estado_producto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_fecha_limite_estado_producto_id_idx ON public.historial_fecha_limite USING btree (estado_producto_id);


--
-- TOC entry 3554 (class 1259 OID 17459)
-- Name: idx_area_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_area_tipo ON public.area USING btree (tipo);


--
-- TOC entry 3650 (class 1259 OID 33171)
-- Name: idx_estado_producto_aprobado_compra; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_estado_producto_aprobado_compra ON public.estado_producto USING btree (aprobado_compra) WHERE (aprobado_compra = false);


--
-- TOC entry 3698 (class 1259 OID 33122)
-- Name: justificacion_no_aplica_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX justificacion_no_aplica_estado_idx ON public.justificacion_no_aplica USING btree (estado);


--
-- TOC entry 3701 (class 1259 OID 33121)
-- Name: justificacion_no_aplica_estado_producto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX justificacion_no_aplica_estado_producto_id_idx ON public.justificacion_no_aplica USING btree (estado_producto_id);


--
-- TOC entry 3706 (class 1259 OID 33668)
-- Name: licitacion_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX licitacion_estado_idx ON public.licitacion USING btree (estado);


--
-- TOC entry 3709 (class 1259 OID 33713)
-- Name: licitacion_producto_licitacion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX licitacion_producto_licitacion_id_idx ON public.licitacion_producto USING btree (licitacion_id);


--
-- TOC entry 3628 (class 1259 OID 17271)
-- Name: mensaje_chat_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensaje_chat_id_idx ON public.mensaje USING btree (chat_id);


--
-- TOC entry 3629 (class 1259 OID 17273)
-- Name: mensaje_creado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensaje_creado_idx ON public.mensaje USING btree (creado);


--
-- TOC entry 3630 (class 1259 OID 17272)
-- Name: mensaje_emisor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensaje_emisor_id_idx ON public.mensaje USING btree (emisor_id);


--
-- TOC entry 3636 (class 1259 OID 17276)
-- Name: notificacion_completada_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificacion_completada_idx ON public.notificacion USING btree (completada);


--
-- TOC entry 3637 (class 1259 OID 17277)
-- Name: notificacion_creada_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificacion_creada_idx ON public.notificacion USING btree (creada);


--
-- TOC entry 3640 (class 1259 OID 17275)
-- Name: notificacion_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificacion_user_id_idx ON public.notificacion USING btree (user_id);


--
-- TOC entry 3714 (class 1259 OID 33894)
-- Name: oferta_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX oferta_estado_idx ON public.oferta USING btree (estado);


--
-- TOC entry 3717 (class 1259 OID 33934)
-- Name: oferta_producto_oferta_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX oferta_producto_oferta_id_idx ON public.oferta_producto USING btree (oferta_id);


--
-- TOC entry 3651 (class 1259 OID 17517)
-- Name: pais_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pais_activo_idx ON public.pais USING btree (activo);


--
-- TOC entry 3652 (class 1259 OID 17516)
-- Name: pais_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pais_codigo_key ON public.pais USING btree (codigo);


--
-- TOC entry 3653 (class 1259 OID 17515)
-- Name: pais_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pais_nombre_key ON public.pais USING btree (nombre);


--
-- TOC entry 3624 (class 1259 OID 17269)
-- Name: participantes_chat_chat_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participantes_chat_chat_id_idx ON public.participantes_chat USING btree (chat_id);


--
-- TOC entry 3627 (class 1259 OID 17270)
-- Name: participantes_chat_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participantes_chat_user_id_idx ON public.participantes_chat USING btree (user_id);


--
-- TOC entry 3574 (class 1259 OID 17243)
-- Name: permisos_accion_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permisos_accion_idx ON public.permisos USING btree (accion);


--
-- TOC entry 3575 (class 1259 OID 17244)
-- Name: permisos_modulo_accion_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permisos_modulo_accion_key ON public.permisos USING btree (modulo, accion);


--
-- TOC entry 3576 (class 1259 OID 17242)
-- Name: permisos_modulo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permisos_modulo_idx ON public.permisos USING btree (modulo);


--
-- TOC entry 3602 (class 1259 OID 17257)
-- Name: precios_cotizacion_detalle_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX precios_cotizacion_detalle_id_idx ON public.precios USING btree (cotizacion_detalle_id);


--
-- TOC entry 3605 (class 1259 OID 17258)
-- Name: precios_proveedor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX precios_proveedor_id_idx ON public.precios USING btree (proveedor_id);


--
-- TOC entry 3661 (class 1259 OID 17522)
-- Name: proceso_personalizado_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proceso_personalizado_activo_idx ON public.proceso_personalizado USING btree (activo);


--
-- TOC entry 3662 (class 1259 OID 17521)
-- Name: proceso_personalizado_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX proceso_personalizado_codigo_key ON public.proceso_personalizado USING btree (codigo);


--
-- TOC entry 3663 (class 1259 OID 17523)
-- Name: proceso_personalizado_orden_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proceso_personalizado_orden_idx ON public.proceso_personalizado USING btree (orden);


--
-- TOC entry 3567 (class 1259 OID 17240)
-- Name: proveedor_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proveedor_activo_idx ON public.proveedor USING btree (activo);


--
-- TOC entry 3568 (class 1259 OID 22685)
-- Name: proveedor_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX proveedor_nombre_key ON public.proveedor USING btree (nombre);


--
-- TOC entry 3562 (class 1259 OID 17432)
-- Name: proyecto_criticidad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proyecto_criticidad_idx ON public.proyecto USING btree (criticidad);


--
-- TOC entry 3563 (class 1259 OID 17433)
-- Name: proyecto_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proyecto_estado_idx ON public.proyecto USING btree (estado);


--
-- TOC entry 3564 (class 1259 OID 22686)
-- Name: proyecto_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX proyecto_nombre_key ON public.proyecto USING btree (nombre);


--
-- TOC entry 3571 (class 1259 OID 17241)
-- Name: rol_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rol_nombre_key ON public.rol USING btree (nombre);


--
-- TOC entry 3579 (class 1259 OID 17246)
-- Name: rol_permisos_permiso_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rol_permisos_permiso_id_idx ON public.rol_permisos USING btree (permiso_id);


--
-- TOC entry 3582 (class 1259 OID 17245)
-- Name: rol_permisos_rol_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rol_permisos_rol_id_idx ON public.rol_permisos USING btree (rol_id);


--
-- TOC entry 3616 (class 1259 OID 17266)
-- Name: seguimiento_compra_detalle_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seguimiento_compra_detalle_id_idx ON public.seguimiento USING btree (compra_detalle_id);


--
-- TOC entry 3617 (class 1259 OID 17265)
-- Name: seguimiento_compra_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seguimiento_compra_id_idx ON public.seguimiento USING btree (compra_id);


--
-- TOC entry 3618 (class 1259 OID 17268)
-- Name: seguimiento_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seguimiento_fecha_idx ON public.seguimiento USING btree (fecha);


--
-- TOC entry 3621 (class 1259 OID 17267)
-- Name: seguimiento_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seguimiento_user_id_idx ON public.seguimiento USING btree (user_id);


--
-- TOC entry 3671 (class 1259 OID 17635)
-- Name: sesion_activa_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sesion_activa_idx ON public.sesion USING btree (activa);


--
-- TOC entry 3672 (class 1259 OID 17636)
-- Name: sesion_expira_en_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sesion_expira_en_idx ON public.sesion USING btree (expira_en);


--
-- TOC entry 3673 (class 1259 OID 17634)
-- Name: sesion_jti_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sesion_jti_idx ON public.sesion USING btree (jti);


--
-- TOC entry 3674 (class 1259 OID 17631)
-- Name: sesion_jti_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sesion_jti_key ON public.sesion USING btree (jti);


--
-- TOC entry 3677 (class 1259 OID 17632)
-- Name: sesion_refresh_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sesion_refresh_token_key ON public.sesion USING btree (refresh_token);


--
-- TOC entry 3678 (class 1259 OID 17630)
-- Name: sesion_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sesion_token_key ON public.sesion USING btree (token);


--
-- TOC entry 3679 (class 1259 OID 17633)
-- Name: sesion_usuario_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sesion_usuario_id_idx ON public.sesion USING btree (usuario_id);


--
-- TOC entry 3656 (class 1259 OID 17519)
-- Name: timeline_sku_paisOrigenId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "timeline_sku_paisOrigenId_idx" ON public.timeline_sku USING btree ("paisOrigenId");


--
-- TOC entry 3659 (class 1259 OID 17518)
-- Name: timeline_sku_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX timeline_sku_sku_idx ON public.timeline_sku USING btree (sku);


--
-- TOC entry 3660 (class 1259 OID 17520)
-- Name: timeline_sku_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX timeline_sku_sku_key ON public.timeline_sku USING btree (sku);


--
-- TOC entry 3555 (class 1259 OID 17239)
-- Name: tipo_area_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tipo_area_id_idx ON public.tipo USING btree (area_id);


--
-- TOC entry 3556 (class 1259 OID 22687)
-- Name: tipo_area_id_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tipo_area_id_nombre_key ON public.tipo USING btree (area_id, nombre);


--
-- TOC entry 3583 (class 1259 OID 17250)
-- Name: usuario_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuario_activo_idx ON public.usuario USING btree (activo);


--
-- TOC entry 3584 (class 1259 OID 17248)
-- Name: usuario_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuario_email_idx ON public.usuario USING btree (email);


--
-- TOC entry 3585 (class 1259 OID 17247)
-- Name: usuario_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuario_email_key ON public.usuario USING btree (email);


--
-- TOC entry 3588 (class 1259 OID 17249)
-- Name: usuario_rol_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuario_rol_id_idx ON public.usuario USING btree (rol_id);


--
-- TOC entry 3776 (class 2620 OID 17672)
-- Name: cotizacion_detalle trigger_generate_sku; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_generate_sku BEFORE INSERT ON public.cotizacion_detalle FOR EACH ROW EXECUTE FUNCTION public.generate_sku();


--
-- TOC entry 3745 (class 2606 OID 17388)
-- Name: adjuntos adjuntos_mensaje_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adjuntos
    ADD CONSTRAINT adjuntos_mensaje_id_fkey FOREIGN KEY (mensaje_id) REFERENCES public.mensaje(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3735 (class 2606 OID 17338)
-- Name: compra compra_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3736 (class 2606 OID 17343)
-- Name: compra_detalle compra_detalle_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalle
    ADD CONSTRAINT compra_detalle_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compra(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3737 (class 2606 OID 17348)
-- Name: compra_detalle compra_detalle_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalle
    ADD CONSTRAINT compra_detalle_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3726 (class 2606 OID 17604)
-- Name: cotizacion cotizacion_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3731 (class 2606 OID 17318)
-- Name: cotizacion_detalle cotizacion_detalle_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion_detalle
    ADD CONSTRAINT cotizacion_detalle_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3732 (class 2606 OID 17323)
-- Name: cotizacion_detalle cotizacion_detalle_precios_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion_detalle
    ADD CONSTRAINT cotizacion_detalle_precios_id_fkey FOREIGN KEY (precios_id) REFERENCES public.precios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3727 (class 2606 OID 17313)
-- Name: cotizacion cotizacion_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyecto(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3728 (class 2606 OID 17308)
-- Name: cotizacion cotizacion_solicitante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3729 (class 2606 OID 17599)
-- Name: cotizacion cotizacion_supervisor_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_supervisor_responsable_id_fkey FOREIGN KEY (supervisor_responsable_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3730 (class 2606 OID 17303)
-- Name: cotizacion cotizacion_tipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_tipo_id_fkey FOREIGN KEY (tipo_id) REFERENCES public.tipo(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3761 (class 2606 OID 33085)
-- Name: documento_adjunto documento_adjunto_documento_requerido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_adjunto
    ADD CONSTRAINT documento_adjunto_documento_requerido_id_fkey FOREIGN KEY (documento_requerido_id) REFERENCES public.documento_requerido(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3762 (class 2606 OID 33080)
-- Name: documento_adjunto documento_adjunto_estado_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_adjunto
    ADD CONSTRAINT documento_adjunto_estado_producto_id_fkey FOREIGN KEY (estado_producto_id) REFERENCES public.estado_producto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3763 (class 2606 OID 33090)
-- Name: documento_adjunto documento_adjunto_subido_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documento_adjunto
    ADD CONSTRAINT documento_adjunto_subido_por_fkey FOREIGN KEY (subido_por) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3747 (class 2606 OID 33186)
-- Name: estado_producto estado_producto_aprobado_compra_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT estado_producto_aprobado_compra_por_id_fkey FOREIGN KEY (aprobado_compra_por_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3748 (class 2606 OID 17560)
-- Name: estado_producto estado_producto_compraDetalleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT "estado_producto_compraDetalleId_fkey" FOREIGN KEY ("compraDetalleId") REFERENCES public.compra_detalle(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3749 (class 2606 OID 17555)
-- Name: estado_producto estado_producto_compraId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT "estado_producto_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES public.compra(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3750 (class 2606 OID 17550)
-- Name: estado_producto estado_producto_cotizacionDetalleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT "estado_producto_cotizacionDetalleId_fkey" FOREIGN KEY ("cotizacionDetalleId") REFERENCES public.cotizacion_detalle(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3751 (class 2606 OID 17545)
-- Name: estado_producto estado_producto_cotizacionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT "estado_producto_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES public.cotizacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3752 (class 2606 OID 17535)
-- Name: estado_producto estado_producto_paisOrigenId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT "estado_producto_paisOrigenId_fkey" FOREIGN KEY ("paisOrigenId") REFERENCES public.pais(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3753 (class 2606 OID 17540)
-- Name: estado_producto estado_producto_proyectoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT "estado_producto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES public.proyecto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3754 (class 2606 OID 33201)
-- Name: estado_producto estado_producto_responsable_seguimiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_producto
    ADD CONSTRAINT estado_producto_responsable_seguimiento_id_fkey FOREIGN KEY (responsable_seguimiento_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3756 (class 2606 OID 17609)
-- Name: historial_cotizacion historial_cotizacion_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cotizacion
    ADD CONSTRAINT historial_cotizacion_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3757 (class 2606 OID 17614)
-- Name: historial_cotizacion historial_cotizacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cotizacion
    ADD CONSTRAINT historial_cotizacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3759 (class 2606 OID 32990)
-- Name: historial_fecha_limite historial_fecha_limite_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_fecha_limite
    ADD CONSTRAINT historial_fecha_limite_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3760 (class 2606 OID 32985)
-- Name: historial_fecha_limite historial_fecha_limite_estado_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_fecha_limite
    ADD CONSTRAINT historial_fecha_limite_estado_producto_id_fkey FOREIGN KEY (estado_producto_id) REFERENCES public.estado_producto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3764 (class 2606 OID 33139)
-- Name: justificacion_no_aplica justificacion_no_aplica_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.justificacion_no_aplica
    ADD CONSTRAINT justificacion_no_aplica_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3765 (class 2606 OID 33134)
-- Name: justificacion_no_aplica justificacion_no_aplica_estado_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.justificacion_no_aplica
    ADD CONSTRAINT justificacion_no_aplica_estado_producto_id_fkey FOREIGN KEY (estado_producto_id) REFERENCES public.estado_producto(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3766 (class 2606 OID 33738)
-- Name: licitacion licitacion_archivada_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion
    ADD CONSTRAINT licitacion_archivada_por_id_fkey FOREIGN KEY (archivada_por_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3767 (class 2606 OID 33733)
-- Name: licitacion licitacion_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion
    ADD CONSTRAINT licitacion_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3768 (class 2606 OID 33748)
-- Name: licitacion_producto licitacion_producto_estado_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion_producto
    ADD CONSTRAINT licitacion_producto_estado_producto_id_fkey FOREIGN KEY (estado_producto_id) REFERENCES public.estado_producto(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3769 (class 2606 OID 33743)
-- Name: licitacion_producto licitacion_producto_licitacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion_producto
    ADD CONSTRAINT licitacion_producto_licitacion_id_fkey FOREIGN KEY (licitacion_id) REFERENCES public.licitacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3770 (class 2606 OID 33753)
-- Name: licitacion_producto licitacion_producto_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licitacion_producto
    ADD CONSTRAINT licitacion_producto_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3743 (class 2606 OID 17378)
-- Name: mensaje mensaje_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3744 (class 2606 OID 17383)
-- Name: mensaje mensaje_emisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensaje
    ADD CONSTRAINT mensaje_emisor_id_fkey FOREIGN KEY (emisor_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3746 (class 2606 OID 17393)
-- Name: notificacion notificacion_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3771 (class 2606 OID 33944)
-- Name: oferta oferta_archivada_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta
    ADD CONSTRAINT oferta_archivada_por_id_fkey FOREIGN KEY (archivada_por_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3772 (class 2606 OID 33939)
-- Name: oferta oferta_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta
    ADD CONSTRAINT oferta_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3773 (class 2606 OID 33954)
-- Name: oferta_producto oferta_producto_estado_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_producto
    ADD CONSTRAINT oferta_producto_estado_producto_id_fkey FOREIGN KEY (estado_producto_id) REFERENCES public.estado_producto(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3774 (class 2606 OID 33949)
-- Name: oferta_producto oferta_producto_oferta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_producto
    ADD CONSTRAINT oferta_producto_oferta_id_fkey FOREIGN KEY (oferta_id) REFERENCES public.oferta(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3775 (class 2606 OID 33959)
-- Name: oferta_producto oferta_producto_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferta_producto
    ADD CONSTRAINT oferta_producto_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3741 (class 2606 OID 17368)
-- Name: participantes_chat participantes_chat_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_chat
    ADD CONSTRAINT participantes_chat_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chat(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3742 (class 2606 OID 17373)
-- Name: participantes_chat participantes_chat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_chat
    ADD CONSTRAINT participantes_chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3733 (class 2606 OID 17328)
-- Name: precios precios_cotizacion_detalle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios
    ADD CONSTRAINT precios_cotizacion_detalle_id_fkey FOREIGN KEY (cotizacion_detalle_id) REFERENCES public.cotizacion_detalle(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3734 (class 2606 OID 17333)
-- Name: precios precios_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios
    ADD CONSTRAINT precios_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3721 (class 2606 OID 33215)
-- Name: proyecto proyecto_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto
    ADD CONSTRAINT proyecto_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.area(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3722 (class 2606 OID 17288)
-- Name: rol_permisos rol_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3723 (class 2606 OID 17283)
-- Name: rol_permisos rol_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.rol(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3738 (class 2606 OID 17358)
-- Name: seguimiento seguimiento_compra_detalle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguimiento
    ADD CONSTRAINT seguimiento_compra_detalle_id_fkey FOREIGN KEY (compra_detalle_id) REFERENCES public.compra_detalle(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3739 (class 2606 OID 17353)
-- Name: seguimiento seguimiento_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguimiento
    ADD CONSTRAINT seguimiento_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compra(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3740 (class 2606 OID 17363)
-- Name: seguimiento seguimiento_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguimiento
    ADD CONSTRAINT seguimiento_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3758 (class 2606 OID 17637)
-- Name: sesion sesion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesion
    ADD CONSTRAINT sesion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3755 (class 2606 OID 17530)
-- Name: timeline_sku timeline_sku_paisOrigenId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timeline_sku
    ADD CONSTRAINT "timeline_sku_paisOrigenId_fkey" FOREIGN KEY ("paisOrigenId") REFERENCES public.pais(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3720 (class 2606 OID 17278)
-- Name: tipo tipo_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo
    ADD CONSTRAINT tipo_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.area(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3724 (class 2606 OID 17298)
-- Name: usuario usuario_departamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3725 (class 2606 OID 17293)
-- Name: usuario usuario_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.rol(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-03-26 10:05:19

--
-- PostgreSQL database dump complete
--

\unrestrict 98lA1j3OKBP8EgvZeeEPRpNtNLj1ijPZOvqsa6BfdV5jQQL1Kbu7eeMBV94PXgC

