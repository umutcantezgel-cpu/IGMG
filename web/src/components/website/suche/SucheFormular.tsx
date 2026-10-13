import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/** Bereichsfilter der Suche (Feld `bereich`), z. B. „Allen Bereichen“ | „Hadith“; ohne JavaScript Teil des GET-Formulars. */
export type SuchFilter = { legende: string; aktiv: string; optionen: { wert: string; label: string }[]; hinweis?: string };

/**
 * Suchformular (GET, Feld `q`): lädt die Seite mit dem Begriff in der Adresse neu, ohne JavaScript nutzbar.
 * Fokus kommt global (B-02), der Knopf quittiert mit Farbe und Druck (B-01, REFERENZ §2). Mit `filter` steht darunter
 * eine Auswahl der Bereiche als Optionsfelder (Klickziel 48 px, Zustand nicht nur über Farbe: Rahmen und Punkt).
 */
export async function SucheFormular({ begriff, filter }: { begriff: string; filter?: SuchFilter }) {
  const t = await getTranslations('suche');
  return (
    <form method="get" role="search" className="flex w-full max-w-text flex-col gap-2">
      <label htmlFor="suche-feld" className="font-bold">
        {t('feld')}
      </label>
      <p id="suche-hinweis" className="text-16 text-tinte-2">
        {t('hinweis')}
        {filter?.hinweis ? ` ${filter.hinweis}` : null}
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          id="suche-feld"
          type="search"
          name="q"
          defaultValue={begriff}
          minLength={2}
          maxLength={100}
          aria-describedby="suche-hinweis"
          className="min-h-12 min-w-0 flex-1 rounded-md border border-rand bg-weiss px-3.5 text-18 transition duration-(--dauer-rueckmeldung) hover:border-tinte-2"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98"
        >
          <Search aria-hidden="true" className="size-5" />
          {t('absenden')}
        </button>
      </div>
      {filter ? (
        <fieldset className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <legend className="float-left me-1 text-16 font-bold">{filter.legende}</legend>
          {filter.optionen.map((o) => (
            <label
              key={o.wert}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-pill border border-rand bg-weiss px-4 text-16 font-bold transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 has-checked:border-2 has-checked:border-gruen-700 has-checked:bg-gruen-50 has-checked:text-gruen-800"
            >
              <input
                type="radio"
                name="bereich"
                value={o.wert}
                defaultChecked={o.wert === filter.aktiv}
                className="size-4 accent-gruen-700"
              />
              {o.label}
            </label>
          ))}
        </fieldset>
      ) : null}
    </form>
  );
}
