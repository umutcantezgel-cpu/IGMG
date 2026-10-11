import { CircleAlert, CircleCheck } from 'lucide-react';
import { feldId } from './Felder';

/**
 * Rückmeldung nach dem Absenden (K-07), auf dem Server gerendert (E-028): Fehler-Zusammenfassung mit
 * Sprungverweisen bzw. Erfolg. `data-fokus` – `FormularInsel` setzt den Fokus nach jeder Antwort dorthin.
 * `felder` ordnet Feldnamen ihre Beschriftung zu, `texte.fehler` übersetzt Fehlerschlüssel.
 */
export function FehlerZusammenfassung({
  fehler,
  feldFehler,
  felder,
  texte,
}: {
  fehler: string;
  feldFehler?: Record<string, string>;
  felder: Record<string, string>;
  texte: { fehler: Record<string, string>; zusammenfassung: string };
}) {
  const liste = Object.entries(feldFehler ?? {});
  return (
    <div
      data-fokus
      tabIndex={-1}
      role="alert"
      className="flex flex-col gap-2 rounded-md border border-fehler bg-fehler-toenung px-4 py-3 text-fehler outline-none"
    >
      <p className="flex items-start gap-2 font-bold">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        {texte.fehler[fehler] ?? texte.zusammenfassung}
      </p>
      {liste.length ? (
        <ul className="list-disc pl-7">
          {liste.map(([feld, schluessel]) => (
            <li key={feld}>
              <a href={`#${feldId(feld)}`} className="text-fehler underline">
                {felder[feld] ?? feld}: {texte.fehler[schluessel] ?? texte.fehler.ungueltig}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Erfolg({ text }: { text: string }) {
  return (
    <div
      data-fokus
      tabIndex={-1}
      role="status"
      className="flex items-start gap-2 rounded-md border border-gruen-700 bg-gruen-50 px-4 py-3 font-bold text-gruen-800 outline-none"
    >
      <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>{text}</p>
    </div>
  );
}
