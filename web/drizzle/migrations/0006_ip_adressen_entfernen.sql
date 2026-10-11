-- Tor B/C M6 (E-041): Better Auth speichert keine IP-Adressen mehr (disableIpTracking). Vorhandene Werte entfernen.
UPDATE "session" SET "ip_address" = NULL;--> statement-breakpoint
DELETE FROM "rate_limit";
