import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Feld } from '@/components/verwaltung/Feld';

/** Auswahlfeld wie im Veranstaltungsformular (48 px, Rand #8C857C über Tokens). */
const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-2 aria-invalid:border-fehler disabled:bg-sand';

export type Auswahl = { wert: string; label: string };

export type FilterWerte = { von: string; bis: string; aktion: string; zielTyp: string; benutzer: string };

export type FilterTexte = {
  von: string;
  bis: string;
  aktion: string;
  zielTyp: string;
  benutzer: string;
  alle: string;
  absenden: string;
  zuruecksetzen: string;
};

/**
 * Filterleiste des Audit-Logs als GET-Formular: ohne Script nutzbar, die Adresse trägt die Filter. Mit Absendeknopf
 * statt Sofortfilter, weil eine Auswahl die Seite nicht von selbst wechseln soll (WCAG 3.2.2).
 */
export function AuditFilter({
  werte,
  fehler,
  aktionen,
  ziele,
  benutzer,
  texte,
}: {
  werte: FilterWerte;
  fehler: { von?: string; bis?: string };
  aktionen: Auswahl[];
  ziele: Auswahl[];
  benutzer: Auswahl[];
  texte: FilterTexte;
}) {
  return (
    <form method="get" action="/verwaltung/audit" className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Feld id="audit-von" name="von" type="date" label={texte.von} defaultValue={werte.von} fehler={fehler.von} />
        <Feld id="audit-bis" name="bis" type="date" label={texte.bis} defaultValue={werte.bis} fehler={fehler.bis} />
        <AuswahlFeld id="audit-aktion" name="aktion" label={texte.aktion} optionen={aktionen} wert={werte.aktion} alle={texte.alle} />
        <AuswahlFeld id="audit-ziel" name="zielTyp" label={texte.zielTyp} optionen={ziele} wert={werte.zielTyp} alle={texte.alle} />
        <AuswahlFeld
          id="audit-benutzer"
          name="benutzer"
          label={texte.benutzer}
          optionen={benutzer}
          wert={werte.benutzer}
          alle={texte.alle}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{texte.absenden}</Button>
        <Button asChild variant="outline">
          <NextLink href="/verwaltung/audit">{texte.zuruecksetzen}</NextLink>
        </Button>
      </div>
    </form>
  );
}

function AuswahlFeld({
  id,
  name,
  label,
  optionen,
  wert,
  alle,
}: {
  id: string;
  name: string;
  label: string;
  optionen: Auswahl[];
  wert: string;
  alle: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} name={name} defaultValue={wert} className={eingabe}>
        <option value="">{alle}</option>
        {optionen.map((o) => (
          <option key={o.wert} value={o.wert}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
