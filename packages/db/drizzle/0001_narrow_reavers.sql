CREATE TYPE "public"."client_type" AS ENUM('produtor', 'afiliado', 'comprador', 'agencia');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('cpf', 'cnpj');--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "client_type" "client_type";--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "document_type" "document_type";