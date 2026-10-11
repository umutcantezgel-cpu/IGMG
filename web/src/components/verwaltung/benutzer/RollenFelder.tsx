import { CircleAlert } from 'lucide-react';
import { ORGANISATION_KUERZEL, ROLLEN } from '@/lib/rechte/matrix';

type Texte = {
  rollen: string;
  rollenHinweis: string;
  organisationen: string;
  organisationenHinweis: string;
  rolle: (r: (typeof ROLLEN)[number]) => string;
  beschreibung: (r: (typeof ROLLEN)[number]) => string;
  organisation: (o: (typeof ORGANISATION_KUERZEL)[number]) => string;
};

const haken = 'mt-1 size-5 shrink-0 accent-gruen-700';
const zeile = 'flex min-h-12 cursor-pointer items-start gap-3 rounded-md border border-linie bg-weiss px-3 py-2';

/** Rollen und Organisationen als Häkchen (C12, K-06); Fehler am Feldsatz mit aria-describedby. */
export function RollenFelder({
  texte,
  rollen,
  organisationen,
  fehlerRollen,
  fehlerOrganisationen,
}: {
  texte: Texte;
  rollen: readonly string[];
  organisationen: readonly string[];
  fehlerRollen?: string;
  fehlerOrganisationen?: string;
}) {
  return (
    <>
      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={['rollen-hinweis', fehlerRollen ? 'rollen-fehler' : ''].filter(Boolean).join(' ')}
      >
        <legend className="font-bold">{texte.rollen}</legend>
        <p id="rollen-hinweis" className="text-16 text-tinte-2">
          {texte.rollenHinweis}
        </p>
        {fehlerRollen ? (
          <p id="rollen-fehler" className="flex items-start gap-1.5 text-16 font-bold text-fehler">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            {fehlerRollen}
          </p>
        ) : null}
        {ROLLEN.map((r) => (
          <label key={r} className={zeile}>
            <input type="checkbox" name="rollen" value={r} defaultChecked={rollen.includes(r)} className={haken} />
            <span className="flex flex-col font-bold">
              {texte.rolle(r)}
              <span className="text-16 font-normal text-tinte-2">{texte.beschreibung(r)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={['organisationen-hinweis', fehlerOrganisationen ? 'organisationen-fehler' : ''].filter(Boolean).join(' ')}
      >
        <legend className="font-bold">{texte.organisationen}</legend>
        <p id="organisationen-hinweis" className="text-16 text-tinte-2">
          {texte.organisationenHinweis}
        </p>
        {fehlerOrganisationen ? (
          <p id="organisationen-fehler" className="flex items-start gap-1.5 text-16 font-bold text-fehler">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            {fehlerOrganisationen}
          </p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          {ORGANISATION_KUERZEL.map((o) => (
            <label key={o} className={zeile}>
              <input type="checkbox" name="organisationen" value={o} defaultChecked={organisationen.includes(o)} className={haken} />
              <span lang="tr">{texte.organisation(o)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
