import type { Sprache } from '../kurse';

/**
 * Stimmen der Sprachausgabe je Zielsprache (KERN 4.0 §4, L3-E10/L3-E10a, ADR 0045 Nr. 11 mit Fortschreibung S3): je Sprache
 * genau eine freigegebene synthetische Stimme oder keine. Ohne Stimme bleibt es bei „Audio folgt“ (bis eigene Aufnahmen bzw.
 * eine eigene Stimme die Prüfkette bestehen) – `pnpm lernapp:audio-liste` liefert dann nichts.
 *
 * - **de:** Coqui-VITS Thorsten, erzeugt über den eigenen ONNX-Export (`_lernapp/werkzeuge/tts/`, Beleg S3). Gewichte
 *   Apache-2.0 (Thorsten Müller, trainiert mit Coqui TTS), Trainingsdaten CC0 (Thorsten-Voice). Die Kennung trägt die ersten
 *   16 Hex-Zeichen des SHA-256 der ONNX-Datei; ein neuer Export ist eine neue Stimme (alle Clips werden neu erzeugt).
 * - **tr:** keine (glow-tts zurückgestellt bis zur Bestätigung der Datenrechte, LM-24; Chatterbox kein Übergang).
 * - **ar:** keine (Chatterbox hat den Vokalisierungstest nicht bestanden; eigene Stimme bzw. Aufnahmen, LM-25/LM-26).
 *
 * Sprachneutrale Angaben (Eigennamen, Lizenzkennungen, Adressen); die Oberflächentexte stehen in den Nachrichtendateien.
 */
export type Stimme = {
  /** Kennung im Audio-Manifest und in `lernapp_audio.stimme`: `tts:<name>@<sha16 des Modells>` */
  id: string;
  art: 'sprachausgabe';
  /** Name der Stimme (Eigenname) */
  bezeichnung: string;
  /** Sprecher der Trainingsdaten bzw. Urheber der Gewichte, wie die Quelle sie nennt */
  urheber: string;
  /** Erzeugung (nur lokal, nie im Bau oder Browser) */
  engine: string;
  /** Lizenz der Gewichte bzw. der Trainingsdaten (SPDX) */
  modellLizenz: 'Apache-2.0';
  datenLizenz: 'CC0-1.0';
  /** Namensnennung (Quelle und Lizenz), wie im Manifest und in den Paketen */
  namensnennung: string;
  /** Herkunft der Gewichte und der Daten (Adressen als Text) */
  modellAdresse: string;
  datenAdresse: string;
  /** Prüfsummen der Kette: Quelldatei der Gewichte und ONNX-Export */
  quelle: { modell: string; sha256: string; onnxSha256: string };
  /** Wasserzeichen des Modells (offenzulegen, ADR 0039 Nr. 9) */
  wasserzeichen: false;
};

export const THORSTEN: Stimme = {
  id: 'tts:coqui-vits-thorsten-onnx@d09293d41bc9427e',
  art: 'sprachausgabe',
  bezeichnung: 'Coqui-TTS VITS „Thorsten“ (ONNX)',
  urheber: 'Thorsten Müller (Thorsten-Voice)',
  engine: 'onnxruntime 1.30.0 mit gruut 2.4.0; ONNX-Export aus coqui-tts 0.27.5',
  modellLizenz: 'Apache-2.0',
  datenLizenz: 'CC0-1.0',
  namensnennung: 'Stimme: Thorsten Müller (Thorsten-Voice, CC0); Modell: Coqui-TTS-VITS, Apache-2.0',
  modellAdresse: 'https://huggingface.co/Thorsten-Voice/VITS',
  datenAdresse: 'https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full',
  quelle: {
    modell: 'Thorsten-Voice/VITS@54f782a5e798cb4597fdac2e866ac8318143e0fb',
    sha256: 'ebb3792e89e261c92857ad1977f726bbaadfdf00d1b857dce4c44c393043de66',
    onnxSha256: 'd09293d41bc9427e30c7c3befd2ca44533ac9b847e860797140dbc3b8cf0a35f',
  },
  wasserzeichen: false,
};

/** Freigegebene Stimme je Zielsprache (`null`: keine – „Audio folgt“). */
export const STIMMEN: Readonly<Record<Sprache, Stimme | null>> = { de: THORSTEN, tr: null, ar: null };

/** Alle freigegebenen Stimmen (für Quellen und Prüfer). */
export const ALLE_STIMMEN: readonly Stimme[] = Object.values(STIMMEN).filter((s): s is Stimme => s !== null);

/** Stimme einer Zielsprache. */
export const stimmeFuer = (sprache: Sprache): Stimme | null => STIMMEN[sprache];

/** Eintrag der Stimme im Audio-Manifest (`audio-manifest/<sprache>.json`, Feld `stimmen`). */
export function manifestStimme(s: Stimme) {
  return {
    id: s.id,
    art: s.art,
    bezeichnung: s.bezeichnung,
    engine: s.engine,
    modellLizenz: s.modellLizenz,
    datenLizenz: s.datenLizenz,
    namensnennung: s.namensnennung,
    wasserzeichen: s.wasserzeichen,
  };
}
