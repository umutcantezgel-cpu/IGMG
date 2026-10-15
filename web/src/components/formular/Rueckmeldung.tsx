import { CircleAlert } from 'lucide-react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { feldId } from './Felder';

/**
 * Rückmeldung nach dem Absenden (K-07, FormWizard.dc.html), auf dem Server gerendert (E-028): Fehler-Zusammenfassung
 * mit Sprungverweisen bzw. Erfolg. `data-fokus` – `FormularInsel` setzt den Fokus nach jeder Antwort dorthin.
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
      className="flex items-start gap-3 rounded-lg border-2 border-fehler bg-fehler-toenung px-5 py-4 outline-none"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-6 shrink-0 text-fehler" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-bold text-fehler">{texte.fehler[fehler] ?? texte.zusammenfassung}</p>
        {liste.length ? (
          <ul className="list-disc pl-5 text-16">
            {liste.map(([feld, schluessel]) => {
              const name = feld.split('.')[0];
              return (
                <li key={feld}>
                  <a href={`#${feldId(name)}`} className="text-tinte underline">
                    {felder[name] ?? name}: {texte.fehler[schluessel] ?? texte.fehler.ungueltig}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** Kurze Erfolgsmeldung (einstufige Formulare, z. B. Veranstaltungsanmeldung in der Seitenspalte). */
export function Erfolg({ text }: { text: string }) {
  return (
    <div
      data-fokus
      tabIndex={-1}
      role="status"
      className="tritt-auf flex items-center gap-3 rounded-md border border-gruen-700 bg-gruen-50 px-4 py-3 font-bold text-gruen-800 outline-none"
    >
      <Zustandsgrafik art="erfolg" groesse={64} />
      <p>{text}</p>
    </div>
  );
}

/**
 * Erfolgsansicht mehrstufiger Formulare (FormWizard.dc.html:16–24): Rahmen grün, Zustandsgrafik „erfolg“ (B-11,
 * tritt mit `tritt-auf` auf), Überschrift, Text, optional „So geht es weiter“ und Verweise (erster gefüllt, weitere
 * umrandet). Die Fehlerzusammenfassung dagegen bewegt sich nicht.
 */
export function ErfolgsAnsicht({
  titel,
  text,
  weiter,
  verweise = [],
}: {
  titel: string;
  text: string;
  weiter?: { titel: string; schritte: string[] };
  verweise?: { href: string; label: string }[];
}) {
  return (
    <section
      data-fokus
      tabIndex={-1}
      role="status"
      aria-labelledby="formular-erfolg"
      className="tritt-auf flex flex-col items-start gap-4 rounded-lg border-2 border-gruen-700 bg-weiss p-6 outline-none md:p-12"
    >
      <Zustandsgrafik art="erfolg" />
      <h2 id="formular-erfolg" className="text-30 text-gruen-800 md:text-36">
        {titel}
      </h2>
      <p className="max-w-text text-20">{text}</p>
      {weiter ? (
        <div className="max-w-text rounded-md bg-sand px-5 py-4">
          <h3 className="mb-2 font-text text-18 font-bold tracking-normal">{weiter.titel}</h3>
          <ol className="flex list-decimal flex-col gap-1 pl-6">
            {weiter.schritte.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {verweise.length ? (
        <div className="flex flex-wrap gap-3">
          {verweise.map((v, i) => (
            <a
              key={v.href}
              href={v.href}
              className={
                i === 0
                  ? 'inline-flex min-h-12 druck items-center rounded-md border-2 border-gruen-700 bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss'
                  : 'inline-flex min-h-12 druck items-center rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800'
              }
            >
              {v.label}
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
