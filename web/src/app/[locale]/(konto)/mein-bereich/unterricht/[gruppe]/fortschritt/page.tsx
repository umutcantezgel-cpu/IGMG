import { BookOpenCheck, ListChecks } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { LeerHinweis, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { FortschrittErfassen, type FortschrittTexte } from '@/components/unterricht/FortschrittErfassen';
import { HifzEintragen, type HifzTexte } from '@/components/unterricht/HifzEintragen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText, KURSARTEN, type KursartSchluessel } from '@/lib/lernen/ansicht';
import { fortschrittDerGruppe, KeinGruppenRecht } from '@/lib/lernen/dienst';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { cn } from '@/lib/utils';
import { hifzDerGruppe, gruppeFuerLeitung } from '@/server/queries/mein-bereich/unterricht';
import { ladeQuranStand } from '@/server/queries/quran';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('fortschritt') };
}

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Lehrkraft › Fortschritt (AUFTRAG 3.5): Lehrplan wählen (Kursart), Stufen je Lernende/r antippen, Hifz eintragen. Nur
 * die Lehrkraft der Gruppe (nicht die Aufsicht, `fortschritt.erfassen`); sonst 404. Die Stufentitel stammen aus dem
 * Lehrplan der Verwaltung (Platzhalter, bis die Lehrkräfte sie benennen).
 */
export default async function FortschrittSeite({
  params,
  searchParams,
}: PageProps<'/[locale]/mein-bereich/unterricht/[gruppe]/fortschritt'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['lehrkraft']);
  const [{ gruppe: gruppeId }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(gruppeId)) notFound();
  const heute = berlinerDatum(new Date());
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const g = await gruppeFuerLeitung(gruppeId, kontext, heute);
  if (!g || g.rolle !== 'lehrkraft') notFound();
  // Ohne Wahl die Kursart der Gruppe (Verwaltung, Migration 0011), sonst Elifbe
  const kursart: KursartSchluessel = (KURSARTEN as readonly string[]).includes(String(sp.kursart))
    ? (sp.kursart as KursartSchluessel)
    : (g.kursart ?? 'elifbe');
  const [raster, hifz, { suren }, t] = await Promise.all([
    fortschrittDerGruppe(gruppeId, kursart, kontext).catch((e: unknown) => {
      if (e instanceof KeinGruppenRecht) return null;
      throw e;
    }),
    hifzDerGruppe(gruppeId, kontext, heute),
    ladeQuranStand(),
    getTranslations('unterricht'),
  ]);
  if (!raster) notFound();
  const name = text(g.name, sprache);
  const tf = (s: string) => t(`fortschritt.${s}`);
  const texte: FortschrittTexte = {
    lernende: tf('lernende'),
    stufe: t.raw('fortschritt.stufe') as string,
    status: {
      offen: tf('status.offen'),
      begonnen: tf('status.begonnen'),
      sicher: tf('status.sicher'),
      abgeschlossen: tf('status.abgeschlossen'),
    },
    zelleAria: t.raw('fortschritt.zelleAria') as string,
    gespeichert: t.raw('fortschritt.gespeichert') as string,
    fehler: tf('fehler'),
    legende: tf('legende'),
  };
  const hifzTexte: HifzTexte = {
    lernende: tf('hifz.lernende'),
    waehlen: tf('hifz.waehlen'),
    sure: tf('hifz.sure'),
    vonVers: tf('hifz.vonVers'),
    bisVers: tf('hifz.bisVers'),
    bewertung: tf('hifz.bewertung'),
    ohne: tf('hifz.ohne'),
    speichern: tf('hifz.speichern'),
    gespeichert: tf('hifz.gespeichert'),
    fehler: tf('hifz.fehler'),
    verseMax: t.raw('fortschritt.hifz.verseMax') as string,
  };

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="unterricht"
      titel={tf('titel')}
      untertitel={name}
      sprachZiel={{ pathname: '/mein-bereich/unterricht/[gruppe]/fortschritt', params: { gruppe: gruppeId }, query: { kursart } }}
      // Ein kurzes Zwischenglied: Brotkrumen stehen auf dem Telefon in einer Zeile, nur das Endglied kürzt sich
      zwischen={[{ label: t('meta.gruppe'), ziel: { pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } } }]}
    >
      <ZurueckLink ziel={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } }} text={tf('zurueck')} />

      <nav aria-label={tf('kursartLabel')} className="relative -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex gap-2 pb-1">
          {KURSARTEN.map((ka) => (
            <li key={ka} className="shrink-0">
              <Link
                href={{ pathname: '/mein-bereich/unterricht/[gruppe]/fortschritt', params: { gruppe: gruppeId }, query: { kursart: ka } }}
                prefetch={false}
                aria-current={ka === kursart ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-12 items-center rounded-pill border px-5 font-bold no-underline transition duration-(--dauer-rueckmeldung)',
                  ka === kursart
                    ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss'
                    : 'border-rand bg-weiss text-tinte hover:border-gruen-700 hover:text-gruen-800',
                )}
              >
                {tf(`kursart.${ka}`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Abschnitt id="raster" Icon={ListChecks} titel={`${tf('rasterTitel')} · ${tf(`kursart.${kursart}`)}`} text={tf('hilfe')}>
        {!raster.lernende.length ? (
          <LeerHinweis text={tf('leer')} />
        ) : !raster.stufen.length ? (
          <LeerHinweis text={tf('keineStufen')} />
        ) : (
          <FortschrittErfassen
            key={kursart}
            gruppeId={gruppeId}
            stufen={raster.stufen.map((s) => ({ id: s.id, nr: s.reihenfolge, titel: text(s.titel, sprache) }))}
            lernende={raster.lernende}
            texte={texte}
          />
        )}
      </Abschnitt>

      <Abschnitt id="hifz" Icon={BookOpenCheck} titel={tf('hifz.titel')} text={tf('hifz.text')}>
        <div className="flex flex-col gap-8">
          {raster.lernende.length && suren.length ? (
            <HifzEintragen
              gruppeId={gruppeId}
              lernende={raster.lernende.map((l) => ({ id: l.id, name: l.name }))}
              suren={suren.map((s) => ({ nr: s.nr, name: s.umschrift || String(s.nr), verse: s.verseAnzahl }))}
              texte={hifzTexte}
            />
          ) : null}
          <div className="flex flex-col gap-3">
            <h3 className="text-20">{tf('hifz.zuletzt')}</h3>
            {hifz?.length ? (
              <ul className="flex flex-col divide-y divide-linie">
                {hifz.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
                    <span>
                      <span className="font-bold">{h.name}</span>
                      {' · '}
                      {t('fortschritt.hifz.eintrag', { sure: h.sure, von: h.vonVers, bis: h.bisVers })}
                      {h.bewertung ? ` · ${t('fortschritt.hifz.bewertet', { wert: h.bewertung })}` : ''}
                    </span>
                    <span className="text-16 text-tinte-2">{datumText(h.datum, sprache)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinte-2">{tf('hifz.leer')}</p>
            )}
          </div>
        </div>
      </Abschnitt>
    </MeinBereichRahmen>
  );
}
