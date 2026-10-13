import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { FolienFormular } from '@/components/verwaltung/anzeige/FolienFormular';
import { FreigabeFormular } from '@/components/verwaltung/anzeige/FreigabeFormular';
import { KARTE } from '@/components/verwaltung/anzeige/stil';
import { folienName, FolienStand, zeitplanText } from '@/components/verwaltung/anzeige/Teile';
import { verlangeAnzeigeZugang } from '@/components/verwaltung/anzeige/zugang';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { FolienAnsicht } from '@/components/website/anzeige/FolienAnsicht';
import { istReligioes } from '@/lib/anzeige/folien';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { folienWerte } from '@/lib/validierung/anzeige';
import { folienFreigabe, loescheFolie, setzeFolienStatus, speichereFolie } from '@/server/actions/anzeige';
import { loeseFolien } from '@/server/queries/anzeige';
import { ladeFolie, ladeFolienVerlauf } from '@/server/queries/verwaltung/anzeige';
import { ladeBildAuswahl } from '@/server/queries/verwaltung/medien';

/**
 * Verwaltung › Anzeige › Folie: Sichtbarkeit (sichtbar schalten, zurückziehen, löschen), religiöse Freigabe für Vers
 * und Hadith (Vier-Augen-Prinzip, Verlauf), Vorschau wie auf dem Bildschirm (deutsche Fassung) und das Formular.
 * Die religiöse Prüfung (ohne `anzeige.bearbeiten`) sieht Vorschau und Freigabe, aber kein Formular.
 */
export default async function FolieBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/anzeige/[id]'>) {
  const { a, bearbeiten, pruefen } = await verlangeAnzeigeZugang();
  const [{ id }, suche] = await Promise.all([params, searchParams]);
  const f = /^[0-9a-f-]{36}$/i.test(id) ? await ladeFolie(id) : null;
  if (!f) notFound();
  const religioes = istReligioes(f.art);
  const [t, tg, tz, bilder, verlauf, [vorschau]] = await Promise.all([
    getTranslations('verwaltung.anzeige'),
    getTranslations('verwaltung.shell'),
    getTranslations('anzeige'),
    bearbeiten ? ladeBildAuswahl() : Promise.resolve([]),
    religioes ? ladeFolienVerlauf(f.id) : Promise.resolve([]),
    loeseFolien([f]),
  ]);
  const jetzt = new Date();
  const titel = folienName(f, t);
  const zeitpunkt = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  const schritt = (s: 'veroeffentlichen' | 'zurueckziehen', variante: 'default' | 'outline') => (
    <form action={setzeFolienStatus}>
      <input type="hidden" name="id" value={f.id} />
      <input type="hidden" name="schritt" value={s} />
      <Button type="submit" variant={variante}>
        {s === 'veroeffentlichen' ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
        {t(`aktion.${s}`)}
      </Button>
    </form>
  );

  return (
    <>
      <NextLink
        href="/verwaltung/anzeige"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={titel} kennung={`${tg('gruppe.inhalte')} · ${t(`art.${f.art}`)}`} />
      {suche.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}

      <section aria-labelledby="folie-zustand" className={KARTE}>
        <h2 id="folie-zustand" className="font-display text-24 font-semibold">
          {t('detail.zustandTitel')}
        </h2>
        <FolienStand f={f} t={t} />
        <p className="text-16 text-tinte-2">
          {f.status === 'entwurf'
            ? t('detail.entwurfText')
            : religioes && f.freigabe !== 'geprueft'
              ? t('detail.wartetText')
              : t('detail.sichtbarText')}{' '}
          {zeitplanText(f, t, jetzt)}
        </p>
        {bearbeiten ? (
          <div className="flex flex-wrap items-center gap-3">
            {f.status === 'entwurf' ? schritt('veroeffentlichen', 'default') : schritt('zurueckziehen', 'outline')}
            <LoeschenBestaetigen
              id={f.id}
              aktion={loescheFolie}
              texte={{
                ausloeser: t('aktion.loeschen'),
                titel: t('aktion.loeschenTitel'),
                text: t('aktion.loeschenText'),
                bestaetigen: t('aktion.loeschen'),
                abbrechen: t('aktion.abbrechen'),
              }}
            />
          </div>
        ) : null}
      </section>

      {religioes ? (
        <section aria-labelledby="folie-freigabe" className={KARTE}>
          <h2 id="folie-freigabe" className="font-display text-24 font-semibold">
            {t('detail.freigabeTitel')}
          </h2>
          <p className="max-w-einleitung text-16 text-tinte-2">{t('detail.freigabeText')}</p>
          <ul className="flex flex-col gap-1 text-16">
            <li>{f.verfasstVonName ? t('detail.verfasst', { name: f.verfasstVonName }) : t('detail.verfasstUnbekannt')}</li>
            {f.freigabe === 'geprueft' && f.geprueftVonName && f.geprueftAm ? (
              <li>{t('detail.geprueft', { name: f.geprueftVonName, datum: zeitpunkt(f.geprueftAm) })}</li>
            ) : null}
          </ul>
          <FreigabeFormular
            aktion={folienFreigabe}
            id={f.id}
            freigabe={f.freigabe}
            darfEinreichen={bearbeiten}
            darfPruefen={pruefen}
            eigen={f.verfasstVon === a.benutzerId}
          />
          <details className="text-16">
            <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('detail.verlauf')}</summary>
            {verlauf.length ? (
              <ol className="flex flex-col gap-1 pl-1">
                {verlauf.map((v, i) => (
                  <li key={i}>
                    {t('detail.verlaufZeile', { status: t(`freigabe.${v.status}`), datum: zeitpunkt(v.am), name: v.von ?? '–' })}
                    {v.kommentar ? <span className="text-tinte-2"> – {v.kommentar}</span> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-tinte-2">{t('detail.verlaufLeer')}</p>
            )}
          </details>
        </section>
      ) : null}

      <section aria-labelledby="folie-vorschau" className={KARTE}>
        <h2 id="folie-vorschau" className="font-display text-24 font-semibold">
          {t('detail.vorschau')}
        </h2>
        <p className="max-w-einleitung text-16 text-tinte-2">{t('detail.vorschauHinweis')}</p>
        {vorschau ? (
          <>
            <div className="@container flex aspect-video max-h-120 flex-col overflow-hidden rounded-lg bg-gruen-950 p-6 text-weiss">
              <FolienAnsicht
                folie={vorschau}
                sprache="de"
                // Vorlagen mit Platzhaltern roh übergeben (die Ansicht füllt sie selbst, wie auf der Anzeige)
                texte={{
                  versQuelle: tz.raw('versQuelle') as string,
                  hadithQuelle: tz.raw('hadithQuelle') as string,
                  uebersetzung: tz.raw('uebersetzung') as string,
                }}
              />
            </div>
            {(vorschau.art === 'vers' || vorschau.art === 'hadith') && !vorschau.uebersetzung.de ? (
              <p className="text-16 text-tinte-2">{t('detail.keineUebersetzung')}</p>
            ) : null}
          </>
        ) : (
          <Meldung art="info">{t('detail.vorschauFehlt')}</Meldung>
        )}
      </section>

      {bearbeiten ? (
        <FolienFormular aktion={speichereFolie} startwerte={{ ...folienWerte(f), id: f.id }} modus="bearbeiten" bilder={bilder} />
      ) : null}
    </>
  );
}
