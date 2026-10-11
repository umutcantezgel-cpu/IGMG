/** FormData → Rohobjekt für Zod (Mehrfachfelder als Liste; Schutzfelder und interne Felder ausgenommen). */
export function rohwerte(fd: FormData, mehrfach: readonly string[] = []): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== 'string' || k.startsWith('$ACTION') || k === 'website' || k === 'altcha') continue;
    if (mehrfach.includes(k)) (roh[k] = (roh[k] as string[] | undefined) ?? []).push(v);
    else roh[k] = v;
  }
  return roh;
}

/** Zod-Fehler → Feldfehler (erster Fehler je Feld, nur Schlüssel-Texte; sonst „ungueltig“). */
export function feldFehler(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  const aus: Record<string, string> = {};
  for (const f of issues) {
    const feld = f.path.map(String).join('.') || 'formular';
    aus[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 40 ? f.message : 'ungueltig';
  }
  return aus;
}
