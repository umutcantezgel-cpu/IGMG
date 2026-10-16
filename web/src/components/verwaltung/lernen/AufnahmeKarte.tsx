import { UserCheck } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { gruppeFuerKurs } from '@/lib/lernen/verwaltung';
import { aufnehmen } from '@/server/actions/lernende';
import { ladeGruppenAuswahl } from '@/server/queries/verwaltung/gruppen';
import { ladeAufnahme } from '@/server/queries/verwaltung/lernende';
import { feldKlein, karte } from './stil';

const MELDUNGEN = ['angelegt', 'vorhanden', 'keineVoranmeldung', 'datenFehlen', 'gruppeUnbekannt', 'nichtGefunden'] as const;

/**
 * „Aufnehmen“ bei einer Voranmeldung (O-L01): legt die Lernende an, ordnet sie optional einer Gruppe zu und lädt die
 * Eltern ein. Nach der Aufnahme zeigt die Karte den Stand (ohne doppeltes Anlegen). Die Seite prüft Recht und Schalter.
 * Kam die Voranmeldung über „Für diesen Kurs voranmelden“ (F-44), nennt die Karte den Kurs und belegt die erste aktive
 * Gruppe dieses Kurses vor; ohne passende Gruppe bleibt „später zuordnen“ mit einem Hinweis.
 */
export async function AufnahmeKarte({
  eingangId,
  daten,
  meldung,
  einladungen,
  kontenAn,
  lernendeSehen,
  kurs = null,
}: {
  eingangId: string;
  /** Gewünschter Kurs der Voranmeldung (`eingang.bezug_id`), falls es ihn gibt. */
  kurs?: { id: string; titel: string } | null;
  daten: Record<string, unknown>;
  meldung?: string;
  einladungen?: string;
  kontenAn: boolean;
  lernendeSehen: boolean;
}) {
  const t = await getTranslations('verwaltung.aufnahme');
  const [stand, gruppen] = await Promise.all([ladeAufnahme(eingangId), ladeGruppenAuswahl()]);
  const m = MELDUNGEN.find((x) => x === meldung);
  const anzahl = Number(einladungen ?? 0) || 0;
  const eltern = ([1, 2] as const)
    .map((n) => ({ n, name: String(daten[`eltern${n}Name`] ?? '').trim(), email: String(daten[`eltern${n}Email`] ?? '').trim() }))
    .filter((e) => e.name && e.email);
  const zaehle = (s: string) => stand?.einladungen.filter((e) => e.stand === s).length ?? 0;
  const vorbelegt = gruppeFuerKurs(gruppen, kurs?.id) ?? '';
  return (
    <section id="aufnahme" aria-labelledby="aufnahme-titel" className={karte}>
      <h2 id="aufnahme-titel" className="text-24">
        {t('titel')}
      </h2>
      {m === 'angelegt' ? (
        <Meldung art="erfolg">{t('meldung.angelegt', { anzahl })}</Meldung>
      ) : m === 'vorhanden' ? (
        <Meldung art="info">{t('meldung.vorhanden')}</Meldung>
      ) : m ? (
        <Meldung art="fehler">{t(`meldung.${m}`)}</Meldung>
      ) : null}
      {kurs ? <p className="font-bold">{t('kurs', { titel: kurs.titel })}</p> : null}
      {stand ? (
        <>
          <p>{t('aufgenommenAls', { name: stand.anzeigename })}</p>
          <ul className="flex flex-col gap-1 text-16 text-tinte-2">
            <li>{t('standEinladungen', { offen: zaehle('offen'), angenommen: zaehle('angenommen'), abgelaufen: zaehle('abgelaufen') })}</li>
            <li>{t('standEltern', { anzahl: stand.elternKonten })}</li>
          </ul>
          {lernendeSehen ? (
            <Button asChild variant="outline" className="self-start">
              <NextLink href={`/verwaltung/lernende/${stand.lernendeId}`}>{t('zurLernenden')}</NextLink>
            </Button>
          ) : null}
        </>
      ) : (
        <form action={aufnehmen} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={eingangId} />
          <p className="text-16 text-tinte-2">{t('text')}</p>
          <label className="flex min-w-0 flex-col gap-1 font-bold">
            {t('gruppe')}
            <select
              name="gruppeId"
              defaultValue={vorbelegt}
              className={feldKlein}
              aria-describedby={kurs ? 'aufnahme-gruppe-hinweis' : undefined}
            >
              <option value="">{t('spaeterZuordnen')}</option>
              {gruppen.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          {kurs ? (
            <p id="aufnahme-gruppe-hinweis" className="text-16 text-tinte-2">
              {vorbelegt ? t('gruppeVorbelegt') : t('keineGruppeZumKurs')}
            </p>
          ) : null}
          {kontenAn ? (
            eltern.length ? (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 font-bold">{t('elternEinladen')}</legend>
                {eltern.map((e) => (
                  <label key={e.n} className="grid min-h-12 cursor-pointer raster-symbol content-start gap-x-3">
                    <input
                      type="checkbox"
                      name={`eltern${e.n}`}
                      value="ja"
                      defaultChecked={e.n === 1}
                      className="row-span-2 mt-1 size-5 accent-gruen-700"
                    />
                    <span className="font-bold">{e.name}</span>
                    <span className="text-16 break-all text-tinte-2">{e.email}</span>
                  </label>
                ))}
                <p className="text-16 text-tinte-2">{t('elternHinweis')}</p>
              </fieldset>
            ) : (
              <p className="text-16 text-tinte-2">{t('keineElternAdresse')}</p>
            )
          ) : (
            <Meldung art="info">{t('kontenAus')}</Meldung>
          )}
          <Button type="submit" className="self-start">
            <UserCheck aria-hidden />
            {t('aufnehmen')}
          </Button>
        </form>
      )}
    </section>
  );
}
