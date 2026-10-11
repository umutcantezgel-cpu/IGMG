import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { MediumTextFormular } from '@/components/verwaltung/medien/MedienFormulare';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { endgueltigLoeschen, inPapierkorb, wiederherstellen } from '@/server/actions/medien';
import { ladeMedium, verwendungVon } from '@/server/queries/verwaltung/medien';

const karte = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
const PFAD = { veranstaltung: '/verwaltung/veranstaltungen', nachricht: '/verwaltung/neuigkeiten', kurs: '/verwaltung/kurse' } as const;

/** Verwaltung › Medium (C11): Vorschau, Angaben, Alt-Text, Verwendung, Papierkorb und endgültiges Löschen. */
export default async function MediumBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/medien/[id]'>) {
  const a = await verlangeSeitenRecht('medium.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const m = await ladeMedium(id);
  if (!m) notFound();
  const [t, verwendung] = await Promise.all([getTranslations('verwaltung.medien'), verwendungVon(m.id)]);
  const loeschen = darf(a.rollen, 'medium.loeschen');
  const url = `/medien/${m.schluessel}`;
  return (
    <>
      <NextLink
        href={m.imPapierkorbSeit ? '/verwaltung/medien?ansicht=papierkorb' : '/verwaltung/medien'}
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('detail.zurueck')}
      </NextLink>
      <h1 className="text-30 break-all md:text-36">{m.dateiname ?? m.alt.de}</h1>
      {sp.meldung === 'hochgeladen' ? <Meldung art="erfolg">{t('meldung.hochgeladen')}</Meldung> : null}
      {sp.fehler === 'verwendet' ? <Meldung art="fehler">{t('fehler.verwendet')}</Meldung> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          {m.typ.startsWith('image/') && !m.imPapierkorbSeit ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={m.alt.de}
              width={m.breite ?? undefined}
              height={m.hoehe ?? undefined}
              className="h-auto max-h-[60vh] w-full rounded-lg border border-linie bg-sand object-contain"
            />
          ) : null}
          <section aria-labelledby="medium-text" className={karte}>
            <h2 id="medium-text" className="text-24">
              {t('detail.angaben')}
            </h2>
            <MediumTextFormular
              id={m.id}
              darf={darf(a.rollen, 'medium.hochladen')}
              start={{ altDe: m.alt.de, altTr: m.alt.tr ?? '', altEn: m.alt.en ?? '', bildrechte: m.bildrechte ?? '' }}
            />
          </section>
        </div>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="medium-daten" className={karte}>
            <h2 id="medium-daten" className="text-24">
              {t('detail.typ')}
            </h2>
            <dl className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-4 gap-y-2">
              <dt className="font-bold">{t('detail.typ')}</dt>
              <dd>{m.typ}</dd>
              <dt className="font-bold">{t('detail.groesse')}</dt>
              <dd>{(m.groesse / 1024).toLocaleString('de-DE', { maximumFractionDigits: 0 })} kB</dd>
              {m.breite && m.hoehe ? (
                <>
                  <dt className="font-bold">{t('detail.masse')}</dt>
                  <dd>
                    {m.breite} × {m.hoehe} px
                  </dd>
                </>
              ) : null}
              <dt className="font-bold">{t('detail.hochgeladen')}</dt>
              <dd>
                {datumLang(m.erstelltAm, 'de')}, {uhrzeit(m.erstelltAm, 'de')}
              </dd>
              <dt className="font-bold">{t('detail.adresse')}</dt>
              <dd className="font-mono text-16 break-all">{url}</dd>
            </dl>
            {!m.imPapierkorbSeit ? (
              <a href={url} target="_blank" rel="noopener" className="font-bold">
                {t('detail.oeffnen')}
              </a>
            ) : null}
          </section>
          <section aria-labelledby="medium-verwendung" className={karte}>
            <h2 id="medium-verwendung" className="text-24">
              {t('detail.verwendung')}
            </h2>
            {verwendung.length ? (
              <>
                <ul className="flex flex-col gap-1">
                  {verwendung.map((v) => (
                    <li key={`${v.art}-${v.id}`}>
                      <NextLink href={`${PFAD[v.art]}/${v.id}`} className="font-bold">
                        {t(`detail.art.${v.art}`)}: {v.titel}
                      </NextLink>
                    </li>
                  ))}
                </ul>
                <p className="text-16 text-tinte-2">{t('detail.verwendetHinweis')}</p>
              </>
            ) : (
              <p className="text-tinte-2">{t('detail.keineVerwendung')}</p>
            )}
            {loeschen && !verwendung.length ? (
              m.imPapierkorbSeit ? (
                <div className="flex flex-wrap gap-3">
                  <form action={wiederherstellen}>
                    <input type="hidden" name="id" value={m.id} />
                    <Button type="submit" variant="outline">
                      {t('detail.wiederherstellen')}
                    </Button>
                  </form>
                  <LoeschenBestaetigen
                    id={m.id}
                    aktion={endgueltigLoeschen}
                    texte={{
                      ausloeser: t('detail.loeschen'),
                      titel: t('detail.loeschenTitel'),
                      text: t('detail.loeschenText'),
                      bestaetigen: t('detail.loeschenBestaetigen'),
                      abbrechen: t('detail.abbrechen'),
                    }}
                  />
                </div>
              ) : (
                <form action={inPapierkorb}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button type="submit" variant="outline">
                    {t('detail.inPapierkorb')}
                  </Button>
                </form>
              )
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
