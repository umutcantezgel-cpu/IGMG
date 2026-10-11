import { defineConfig } from 'drizzle-kit';
export default defineConfig({ dialect: 'postgresql', driver: 'pglite', schema: './schema.ts', out: './drizzle', dbCredentials: { url: './.pglite' } });
