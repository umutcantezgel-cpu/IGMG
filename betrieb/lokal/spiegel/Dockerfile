# Medienspiegel (ADR 0036): Vercel-Blob-Dateien täglich lokal spiegeln, mit Prüfsummen.
FROM node:24.11.1-alpine
WORKDIR /spiegel
COPY package.json spiegel.mjs ./
RUN npm install --omit=dev --no-audit --no-fund
CMD ["node", "spiegel.mjs"]
