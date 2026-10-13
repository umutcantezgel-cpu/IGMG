import { Printer } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { DruckKnopf } from '@/components/website/gebetszeiten/DruckKnopf';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { type Kennzahl, ladeKennzahlen } from '@/lib/leitung/kennzahlen';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

const ZEITRAEUME = [30, 90, 365] as const;
const ARTEN = ['kontakt', 'veranstaltungsanmeldung', 'voranmeldung', 'mitgliedsantrag', 'moschee_anfrage'] as const;
const KARTE = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 shadow-s1 break-inside-avoid';

/**
 * Verwaltung › Gemeinde im Blick (AUFTRAG 3.10, H-K06): Kennzahlen ohne Personendaten für die Leitung, Werte 1–4 als
 * „< 5“, Anwesenheitsquote erst ab 20 Einträgen. Statisches SVG-Diagramm, keine hochzählenden Zahlen; druckbar als
 * Monatsbericht. Recht `leitung.lesen`.
 */
export default async function GemeindeImBlick({ searchParams }: PageProps<'/[locale]/verwaltung/gemeinde-im-blick'>) {
  await verlangeSeitenRecht('leitung.lesen');
  const roh = Number((await searchParams).tage);
  const tage = ZEITRAEUME.find((z) => z === roh) ?? 30;
  const [t, k] = await Promise.all([getTranslations('verwaltung.gemeindeImBlick'), ladeKennzahlen(tage)]);
  const wert = (z: Kennzahl | undefined) => (z === undefined ? 0 : z === '< 5' ? t('kleinerFuenf') : z.toLocaleString('de-DE'));
  const anfragen = ARTEN.map((art) => ({ art, wert: k.eingaenge[art] ?? 0 })).filter((a) => a.wert !== 0);
  const groesster = Math.max(5, ...anfragen.map((a) => (typeof a.wert === 'number' ? a.wert : 4)));
  const stand = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(new Date());

  const kachel = (titel: string, inhalt: string, hinweis?: string) => (
    <div className="flex flex-col gap-1 rounded-md border border-linie bg-papier p-4">
      <dt className="text-16 text-tinte-2">{titel}</dt>
      <dd className="font-display text-30 leading-tight font-semibold tabular-nums">{inhalt}</dd>
      {hinweis ? <dd className="text-16 text-tinte-2">{hinweis}</dd> : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <VerwaltungsKopf
        kennung={t('kennung')}
        titel={t('titel')}
        einleitung={t('einleitung')}
        aktion={
          <DruckKnopf>
            <Printer aria-hidden className="size-5" />
            {t('drucken')}
          </DruckKnopf>
        }
      />
      <form method="get" className="flex flex-wrap items-end gap-3 print:hidden">
        <label className="flex flex-col gap-1.5 font-bold">
          {t('zeitraum')}
          <select
            name="tage"
            defaultValue={String(tage)}
            className="min-h-12 rounded-md border border-rand bg-weiss px-3.5 text-18 font-normal text-tinte"
          >
            {ZEITRAEUME.map((z) => (
              <option key={z} value={z}>
                {t('zeitraumTage', { tage: z })}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="outline">
          {t('anzeigen')}
        </Button>
      </form>
      <p className="text-16 text-tinte-2">
        {t('zeitraumTage', { tage })} · {t('stand', { datum: stand })}
      </p>

      <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-2">
        <section aria-labelledby="gib-anfragen" className={KARTE}>
          <h2 id="gib-anfragen" className="text-24 font-bold">
            {t('bereiche.anfragen')}
          </h2>
          {anfragen.length ? (
            <figure className="flex flex-col gap-2">
              <svg role="img" aria-label={t('diagramm')} viewBox={`0 0 320 ${anfragen.length * 40}`} className="w-full">
                {anfragen.map((a, i) => {
                  const breite = Math.max(4, Math.round(((typeof a.wert === 'number' ? a.wert : 4) / groesster) * 200));
                  return (
                    <g key={a.art} transform={`translate(0 ${i * 40})`}>
                      <rect
                        x="0"
                        y="8"
                        width={breite}
                        height="24"
                        rx="4"
                        className={a.wert === '< 5' ? 'fill-gruen-100' : 'fill-gruen-700'}
                      />
                      <text x={breite + 8} y="26" className="fill-tinte text-16 font-bold tabular-nums">
                        {wert(a.wert)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <figcaption>
                <dl className="grid gap-1">
                  {anfragen.map((a) => (
                    <div key={a.art} className="flex justify-between gap-4 border-b border-linie py-1 last:border-b-0">
                      <dt>{t(`art.${a.art}`)}</dt>
                      <dd className="font-bold tabular-nums">{wert(a.wert)}</dd>
                    </div>
                  ))}
                </dl>
              </figcaption>
            </figure>
          ) : (
            <p className="text-tinte-2">{t('keineAnfragen')}</p>
          )}
        </section>

        <section aria-labelledby="gib-lernen" className={KARTE}>
          <h2 id="gib-lernen" className="text-24 font-bold">
            {t('bereiche.lernen')}
          </h2>
          <dl className="grid grid-cols-2 gap-3">
            {kachel(t('kachel.lernende'), String(wert(k.lernende)))}
            {kachel(t('kachel.gruppen'), String(wert(k.gruppen)))}
            {kachel(t('kachel.unterrichtstermine'), String(wert(k.unterrichtstermine)))}
            {k.anwesenheitsquote === null
              ? kachel(t('kachel.anwesenheit'), t('kachel.anwesenheitWenig'), t('kachel.anwesenheitHinweis'))
              : kachel(t('kachel.anwesenheit'), t('kachel.anwesenheitWert', { prozent: k.anwesenheitsquote }))}
          </dl>
        </section>

        <section aria-labelledby="gib-gemeinschaft" className={KARTE}>
          <h2 id="gib-gemeinschaft" className="text-24 font-bold">
            {t('bereiche.gemeinschaft')}
          </h2>
          <dl className="grid grid-cols-2 gap-3">
            {kachel(t('kachel.konten'), String(wert(k.konten)))}
            {kachel(t('kachel.pushAbos'), String(wert(k.pushAbos)))}
            {kachel(t('kachel.newsletter'), String(wert(k.newsletter)))}
            {kachel(t('kachel.hatimGelesen'), String(wert(k.hatimGelesen)))}
          </dl>
        </section>

        <section aria-labelledby="gib-inhalte" className={KARTE}>
          <h2 id="gib-inhalte" className="text-24 font-bold">
            {t('bereiche.inhalte')}
          </h2>
          <dl className="grid grid-cols-2 gap-3">
            {kachel(t('kachel.veroeffentlichteNachrichten'), String(wert(k.veroeffentlichteNachrichten)))}
          </dl>
        </section>
      </div>
      <p className="text-16 text-tinte-2">{t('fussnote')}</p>
    </div>
  );
}
