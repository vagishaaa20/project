--
-- TrustVault 3.0 — PostgreSQL Schema
-- Generated: 2026-06-03
-- Run this on your Render (or any) PostgreSQL instance to set up the database
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- ── Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- ── Tables ────────────────────────────────────────────────

CREATE TABLE public.users (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    name        character varying(100)  NOT NULL,
    email       character varying(150)  NOT NULL,
    password    character varying(255)  NOT NULL,
    role        character varying(20)   NOT NULL DEFAULT 'viewer',
    last_login  timestamp with time zone,
    created_at  timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey       PRIMARY KEY (id),
    CONSTRAINT users_email_key  UNIQUE (email),
    CONSTRAINT users_role_check CHECK (
        (role)::text = ANY (ARRAY['admin','officer','viewer']::text[])
    )
);

CREATE TABLE public.cases (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    case_number character varying(50)  NOT NULL,
    title       character varying(255) NOT NULL,
    description text,
    status      character varying(20)  NOT NULL DEFAULT 'open',
    created_by  uuid,
    assigned_to uuid,
    created_at  timestamp with time zone DEFAULT now(),
    updated_at  timestamp with time zone DEFAULT now(),
    CONSTRAINT cases_pkey            PRIMARY KEY (id),
    CONSTRAINT cases_case_number_key UNIQUE (case_number),
    CONSTRAINT cases_status_check    CHECK (
        (status)::text = ANY (ARRAY['open','closed','pending']::text[])
    )
);

CREATE TABLE public.evidence_metadata (
    id                   uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id              character varying(100) NOT NULL,
    evidence_id          character varying(100) NOT NULL,
    file_path            text                   NOT NULL,
    file_hash            character varying(64)  NOT NULL,
    avg_probability      double precision,
    prediction           character varying(50),
    deepfake_analyzed_at timestamp with time zone,
    uploaded_by          uuid,
    created_at           timestamp with time zone DEFAULT now(),
    cloud_url            text,
    cloud_public_id      text,
    CONSTRAINT evidence_metadata_pkey PRIMARY KEY (id),
    CONSTRAINT uq_case_evidence       UNIQUE (case_id, evidence_id)
);

CREATE TABLE public.notifications (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid,
    title      character varying(100) NOT NULL,
    message    text                   NOT NULL,
    type       character varying(20)  NOT NULL DEFAULT 'info',
    entity     character varying(50),
    entity_id  character varying(255),
    read       boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.audit_log (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid,
    action     character varying(100) NOT NULL,
    entity     character varying(50),
    entity_id  character varying(255),
    detail     text,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);

CREATE TABLE public.password_reset_tokens (
    id         uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id    uuid,
    token      text                     NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    used       boolean DEFAULT false,
    CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id)
);

-- ── Foreign Keys ──────────────────────────────────────────

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_created_by_fkey
        FOREIGN KEY (created_by)  REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_assigned_to_fkey
        FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.evidence_metadata
    ADD CONSTRAINT evidence_metadata_uploaded_by_fkey
        FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey
        FOREIGN KEY (user_id)     REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey
        FOREIGN KEY (user_id)     REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey
        FOREIGN KEY (user_id)     REFERENCES public.users(id) ON DELETE CASCADE;

-- ── Indexes ───────────────────────────────────────────────

CREATE INDEX idx_users_email          ON public.users           USING btree (email);
CREATE INDEX idx_cases_status         ON public.cases           USING btree (status);
CREATE INDEX idx_cases_created_by     ON public.cases           USING btree (created_by);
CREATE INDEX idx_evidence_case_id     ON public.evidence_metadata USING btree (case_id);
CREATE INDEX idx_evidence_uploaded_by ON public.evidence_metadata USING btree (uploaded_by);
CREATE INDEX idx_notifications_user_id ON public.notifications  USING btree (user_id);
CREATE INDEX idx_notifications_read   ON public.notifications   USING btree (read);
CREATE INDEX idx_audit_user_id        ON public.audit_log       USING btree (user_id);
CREATE INDEX idx_audit_created_at     ON public.audit_log       USING btree (created_at DESC);