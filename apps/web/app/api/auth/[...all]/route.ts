/**
 * Better Auth API Route Handler
 * 
 * Handles all authentication endpoints via /api/auth/*
 * @see https://www.better-auth.com/docs/integrations/next
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
