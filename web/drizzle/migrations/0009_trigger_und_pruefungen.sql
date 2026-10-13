-- Lauf Gemeinde-Plattform: Datenbank-Sicherungen, die nicht im Anwendungscode allein stehen dürfen.

-- Kinderschutz S-10: Das Moderationsprotokoll ist unveränderlich. UPDATE und DELETE sind gesperrt,
-- außer im Löschlauf (Fristen, S-12), der vorher `set local igmg.loeschlauf = '1'` setzt.
CREATE OR REPLACE FUNCTION moderationsprotokoll_unveraenderlich() RETURNS trigger AS $$
BEGIN
  IF coalesce(current_setting('igmg.loeschlauf', true), '') = '1' AND TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'moderationsprotokoll ist unveränderlich';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER moderationsprotokoll_schutz
  BEFORE UPDATE OR DELETE ON moderationsprotokoll
  FOR EACH ROW EXECUTE FUNCTION moderationsprotokoll_unveraenderlich();
--> statement-breakpoint
-- Chat S-05: höchstens 500 Zeichen sichert die Anwendung vor dem Verschlüsseln; die Datenbank begrenzt die
-- verschlüsselte Länge großzügig (Schutz gegen Missbrauch als Datenablage).
ALTER TABLE chat_nachricht ADD CONSTRAINT chat_nachricht_laenge CHECK (octet_length(text_verschluesselt) <= 4096);
--> statement-breakpoint
-- Hatim: Cüz 1–30.
ALTER TABLE hatim_teil ADD CONSTRAINT hatim_teil_cuz CHECK (cuz BETWEEN 1 AND 30);
--> statement-breakpoint
-- Hifz: gültige Versbereiche, Bewertung 1–5.
ALTER TABLE hifz_eintrag ADD CONSTRAINT hifz_bereich CHECK (sure BETWEEN 1 AND 114 AND von_vers >= 1 AND bis_vers >= von_vers);
--> statement-breakpoint
ALTER TABLE hifz_eintrag ADD CONSTRAINT hifz_bewertung CHECK (bewertung IS NULL OR bewertung BETWEEN 1 AND 5);
--> statement-breakpoint
-- Push: Minuten vor dem Gebet 0–60.
ALTER TABLE push_abo ADD CONSTRAINT push_abo_minuten CHECK (minuten_vorher BETWEEN 0 AND 60);
