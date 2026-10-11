import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/**
 * Suchformular (GET, Feld `q`): lädt die Seite mit dem Begriff in der Adresse neu, ohne JavaScript nutzbar.
 * Fokus kommt global (B-02), der Knopf quittiert mit Farbe und Druck (B-01, REFERENZ §2).
 */
export async function SucheFormular({ begriff }: { begriff: string }) {
  const t = await getTranslations('suche');
  return (
    <form method="get" role="search" className="flex w-full max-w-text flex-col gap-2">
      <label htmlFor="suche-feld" className="font-bold">
        {t('feld')}
      </label>
      <p id="suche-hinweis" className="text-16 text-tinte-2">
        {t('hinweis')}
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
    </form>
  );
}
