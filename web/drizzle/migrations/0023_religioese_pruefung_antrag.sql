-- Stufe C N2 (Z-L02/Z-L10): Die Rolle „religiöse Prüfung“ ist Schutzrolle – Vergabe nur noch per Antrag und Bestätigung
-- durch eine zweite Person (Leitung oder Kinderschutz, ohne Administration). Bestehende Zuweisungen bleiben; ein Konto mit
-- Administration und religiöser Prüfung zählt nie als religiöse Freigabe (lib/lernapp/freigabe.ts).
ALTER TABLE "rollen_antrag" DROP CONSTRAINT "rollen_antrag_schutzrolle";--> statement-breakpoint
ALTER TABLE "rollen_antrag" ADD CONSTRAINT "rollen_antrag_schutzrolle" CHECK ("rollen_antrag"."rolle" in ('leitung', 'kinderschutz', 'religioese_pruefung'));
