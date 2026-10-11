# IGMG Wetzlar – Produktions-Image (K-19): Next.js standalone, Node 24 LTS, ohne Root-Rechte.
# Bau: docker compose build app · Start: docker compose --profile betrieb up -d

FROM node:24-alpine AS basis
ENV NEXT_TELEMETRY_DISABLED=1 COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

FROM basis AS abhaengigkeiten
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM basis AS bau
COPY --from=abhaengigkeiten /app/node_modules ./node_modules
COPY . .
# ADR 0017: Bau gegen eine PGlite-Bau-Datenbank (Migrationen + Seeds), nicht gegen die Produktion
RUN pnpm db:bau-vorbereiten
ENV NODE_ENV=production BAU_PGLITE=1 PGLITE_VERZEICHNIS=/app/.pglite-bau DATABASE_URL=
RUN pnpm build

FROM node:24-alpine AS laufzeit
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    MIGRATION_BEIM_START=1 \
    CACHE_ERNEUERN_BEIM_START=1 \
    MEDIEN_VERZEICHNIS=/app/.medien
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/.medien && chown app:app /app/.medien
COPY --from=bau --chown=app:app /app/.next/standalone ./
COPY --from=bau --chown=app:app /app/.next/static ./.next/static
COPY --from=bau --chown=app:app /app/public ./public
COPY --from=bau --chown=app:app /app/drizzle/migrations ./drizzle/migrations
USER app
EXPOSE 3000
CMD ["node", "server.js"]
