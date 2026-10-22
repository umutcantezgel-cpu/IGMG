import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { ReligioesesUrteilFormular } from '@/components/verwaltung/lernapp/ReligioesesUrteil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { belegHaken, istReligioeserBaustein, type ReligioeserBausteinTyp } from '@/lib/lernapp/freigabe';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { cn } from '@/lib/utils';
import { religioesPruefen } from '@/server/actions/lernapp-religioes';
import { type BelegFundstelle, ladeReligioesenBaustein } from '@/server/queries/lernapp/religioes';

const STAND_FARBE = ['bg-sand text-tinte-2', 'bg-info-toenung text-info', 'bg-gruen-50 text-gruen-800'] as const;

/** `<typ>-<uuid>` aus der Adresse (z. B. `aussage-…`, `koran_bedeutung-…`). */
function zerlege(segment: string): { typ: ReligioeserBausteinTyp; id: string } | null {
  const m = /^([a-z_]+)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.exec(decodeURIComponent(segment));
  return m && istReligioeserBaustein(m[1]) ? { typ: m[1], id: m[2]! } : null;
}

/**
 * Verwaltung › Lern-App › Religiöse Prüfung › Baustein (L6-03, ADR 0040 Nr. 5 und Fortschreibung S8 Nr. 2, PLAN §6.7 Nr. 6):
 * Stand „n/2“, der Inhalt und daneben die Fundstellen (Werk › Kitab/Bab/Fasl, Ausgabe, Band und Seite, Passage, OpenITI-URI;
 * kein Quelltext, LM-04), dann das Urteil mit Haken je Beleg. Wer den Stand verfasst hat, sieht kein Formular. Recht
 * `lernapp.religioes.pruefen` (nie per Administration); die Action prüft alles erneut. Kennungen mit Vorsatz `baustein-`:
 * `inhalt` trägt schon das `<main>` des Layouts (Sprunglink).
 */
export default async function ReligioeserBaustein({ params }: PageProps<'/[locale]/verwaltung/lernapp/religioes/[baustein]'>) {
  const a = await verlangeLernappSeite('lernapp.religioes.pruefen');
  const ziel = zerlege((await params).baustein);
  if (!ziel) notFound();
  const [t, tg, b] = await Promise.all([
    getTranslations('verwaltung.lernapp.religioes'),
    getTranslations('verwaltung.shell'),
    ladeReligioesenBaustein(ziel.typ, ziel.id, a.benutzerId),
  ]);
  if (!b) notFound();
  const karte = (beleg: BelegFundstelle) => `beleg-${beleg.id}`;
  const fundstelle = (beleg: BelegFundstelle, nr: number) => {
    const bandSeite = [
      beleg.band ? t('beleg.band', { band: beleg.band }) : null,
      beleg.seite ? t('beleg.seite', { seite: beleg.seite }) : null,
    ]
      .filter(Boolean)
      .join(', ');
    const zeilen: { label: string; wert: string; mono?: boolean }[] = [
      { label: t('beleg.werk'), wert: beleg.autor ? `${beleg.werk} (${beleg.autor})` : beleg.werk },
      { label: t('beleg.kapitel'), wert: beleg.kapitel.length ? beleg.kapitel.join(' › ') : t('beleg.ohne') },
      { label: t('beleg.ausgabe'), wert: beleg.ausgabe ?? t('beleg.ohne') },
      { label: t('beleg.bandSeite'), wert: bandSeite || t('beleg.ohne') },
      { label: t('beleg.passage'), wert: beleg.passage, mono: true },
      ...(beleg.fundstelle ? [{ label: t('beleg.fundstelle'), wert: beleg.fundstelle, mono: true }] : []),
      { label: t('beleg.art'), wert: t(`beleg.artWert.${beleg.art}`) },
      ...(beleg.belegpruefung ? [{ label: t('beleg.belegpruefung'), wert: t(`beleg.belegpruefungWert.${beleg.belegpruefung}`) }] : []),
    ];
    return (
      <li key={beleg.id} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-4">
        <h3 id={karte(beleg)} className="font-text text-20 font-bold tracking-normal">
          {t('belegName', { nr })}: {beleg.werk}
        </h3>
        <dl className="grid gap-x-4 gap-y-1 text-16 md:raster-symbol">
          {zeilen.map((z) => (
            <div key={z.label} className="contents">
              <dt className="font-bold text-tinte-2">{z.label}</dt>
              <dd className={cn(z.mono && 'font-mono break-all')}>{z.wert}</dd>
            </div>
          ))}
        </dl>
      </li>
    );
  };
  const wert = (label: string, w: string) => (label === 'strittig' || label === 'kinderGeeignet' ? (w === 'ja' ? t('ja') : t('nein')) : w);
  const darfUrteilen = !b.verfasser && !b.lage.kiHerkunft && !(b.typ === 'aussage' && b.lage.belegFehlt);

  return (
    <>
      <VerwaltungsKopf
        kennung={tg('gruppe.inhalte')}
        titel={t('detailTitel')}
        einleitung={t('bausteinKennung', { typ: t(`typ.${b.typ}`), schluessel: b.schluessel })}
      />
      <LernappNavigation aktiv="religioes" rollen={a.rollen} />
      <NextLink
        href="/verwaltung/lernapp/religioes"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t('zurueck')}
      </NextLink>

      <section aria-labelledby="baustein-stand" className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
        <h2 id="baustein-stand" className="flex flex-wrap items-center gap-3 font-display text-24 font-semibold">
          {t('spalte.stand')}
          <span className={cn(PILLE, STAND_FARBE[b.stand] ?? STAND_FARBE[0])} aria-label={t('standName', { stand: b.stand })}>
            {t('stand', { stand: b.stand })}
          </span>
        </h2>
        <p>{t(`standText.${b.stand}` as 'standText.0')}</p>
        {b.lektion ? <p className="text-16 text-tinte-2">{t('lektion', { schluessel: b.lektion })}</p> : null}
      </section>

      {b.lage.kiHerkunft ? <Meldung art="fehler">{t('meldung.kiHerkunft')}</Meldung> : null}
      {b.typ === 'aussage' && b.lage.belegFehlt ? <Meldung art="fehler">{t('meldung.belegFehlt')}</Meldung> : null}
      {b.unsicher ? <Meldung art="info">{t('meldung.unsicher')}</Meldung> : null}
      {b.lage.gesperrt ? <Meldung art="info">{t('meldung.einwand')}</Meldung> : null}
      {b.eigenes ? <Meldung art="info">{t('meldung.eigenes', { urteil: t(`urteilName.${b.eigenes}`) })}</Meldung> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="baustein-inhalt" className="flex min-w-0 flex-col gap-4">
          <h2 id="baustein-inhalt" className="font-display text-24 font-semibold">
            {t('inhaltTitel')}
          </h2>
          {b.wortform ? (
            <div className="flex flex-col gap-1 rounded-lg border border-linie bg-weiss p-4">
              <span className="text-16 font-bold text-tinte-2">{t('wortform')}</span>
              <span lang="ar" dir="rtl" className="font-arabic text-arabisch-3">
                {b.wortform}
              </span>
            </div>
          ) : null}
          <dl className="grid gap-x-4 gap-y-2 rounded-lg border border-linie bg-weiss p-4 text-18 md:raster-symbol">
            {b.angaben.map((g) => (
              <div key={g.label} className="contents">
                <dt className="font-bold text-tinte-2">{t(`feld.${g.label}` as 'feld.aussage')}</dt>
                <dd lang={g.lang} dir={g.dir} className={cn('whitespace-pre-line', g.dir === 'rtl' && 'font-arabic text-arabisch-3')}>
                  {wert(g.label, g.wert)}
                </dd>
              </div>
            ))}
          </dl>
          {b.aussage ? (
            <div className="flex flex-col gap-1 rounded-lg border border-linie bg-papier p-4">
              <p className="text-16 font-bold text-tinte-2">
                {t('aussageBezug', { schluessel: b.aussage.schluessel, stand: b.aussage.stand })}
              </p>
              <p lang="de">{b.aussage.text}</p>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="baustein-fundstellen" className="flex min-w-0 flex-col gap-4">
          <h2 id="baustein-fundstellen" className="font-display text-24 font-semibold">
            {t('fundstellenTitel')}
          </h2>
          <p className="text-16 text-tinte-2">{t('fundstellenHinweis')}</p>
          {b.belege.length ? (
            <ol className="flex flex-col gap-3">{b.belege.map((beleg, i) => fundstelle(beleg, i + 1))}</ol>
          ) : (
            <p>{t('keineBelege')}</p>
          )}
        </section>
      </div>

      {b.verfasser ? (
        <Meldung art="info">{t('meldung.verfasser')}</Meldung>
      ) : darfUrteilen ? (
        <section className="rounded-lg border border-linie bg-weiss p-5 md:p-6">
          <ReligioesesUrteilFormular
            aktion={religioesPruefen}
            typ={b.typ}
            id={b.id}
            hash={b.inhaltHash}
            belege={b.belege.map((beleg, i) => ({
              id: beleg.id,
              wert: belegHaken(beleg),
              name: t('belegName', { nr: i + 1 }),
              karte: karte(beleg),
            }))}
          />
        </section>
      ) : null}
    </>
  );
}
