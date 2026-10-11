import { z } from 'zod';

/** Mehrsprachiger Text: Deutsch Pflicht, Türkisch/Englisch optional (ADR 0002). */
export const mehrsprachig = (max = 500) =>
  z.object({ de: z.string().trim().min(1).max(max), tr: z.string().trim().max(max).optional(), en: z.string().trim().max(max).optional() });

/** Mehrsprachiger Text, auch Deutsch darf leer sein. */
export const mehrsprachigOptional = (max = 500) =>
  z.object({ de: z.string().trim().max(max), tr: z.string().trim().max(max).optional(), en: z.string().trim().max(max).optional() });
