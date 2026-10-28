import { ArrowRight, Heart } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import { PageHeader } from '@/components/website/PageHeader';
import { PersonCard } from '@/components/website/PersonCard';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Amtszeiten } from '@/components/website/vorstand/Amtszeiten';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.vorstand');
  return metadatenFuer({ pfad: '/vorstand', titel: t('titel'), beschreibung: t('beschreibung') });
}

/** Zeitraum wie im Design: „1975–1979“; die laufende Amtszeit endet mit „Heute“ („2025 – Heute“). */
function zeitraum(v: { von: string; bis: string; aktuell: boolean }, heute: string): string {
  if (v.bis) return `${v.von}–${v.bis}`;
  return v.aktuell ? `${v.von} – ${heute}` : v.von;
}

/** Leerzustand (REFERENZ §2): Zustandsgrafik, ein Satz, nächster Schritt als Knopf (nur wenn der Schlüssel steht). */
function Leerzustand({ text, schritt }: { text: string; schritt: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
      <Zustandsgrafik art="leer" />
      <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{text}</p>
      {schritt ? (
        <Link
          href="/kontakt"
          className="inline-flex min-h-12 druck items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition-colors duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800"
        >
          <span>{schritt}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Vorstand (design/BoardMembers.dc.html, Blatt S09): zuerst der aktuelle Vorstand, dann die Vorsitzenden als
 * Verbindungslinie der Amtszeiten (AUFTRAG 4) und Kartenraster, danach Dank mit Link zur Kontaktseite. Personen und
 * Jahre kommen aus dem Seiteninhalt (G-04), „heute“ aus dem stündlich erneuerten Datum (`heuteBerlin`).
 * Abschnitte nach Referenz (REFERENZ §2): Kennung mit Stern, Titel `text-display-2`, Einleitung mit `max-w-einleitung`.
 */
export default async function VorstandSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('vorstand');
  const tp = await getTranslations('kopf');
  const [inhalt, heute] = await Promise.all([ladeSeiteninhalt('vorstand'), heuteBerlin()]);
  // Nächster Schritt im Leerzustand erscheint, sobald vorstand.leerSchritt in den Sprachdateien steht (Bedarf)
  const leerSchritt = t.has('leerSchritt') ? t('leerSchritt') : null;
  return (
    <Seitenrahmen bereich="moschee" seite="vorstand" sprachZiel="/vorstand" pfad={[{ label: tp('vorstand') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />

      <section
        aria-labelledby="vorstand-aktuell"
        className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8"
      >
        <div className="flex flex-col gap-3">
          {/* Kennung erscheint, sobald der Schlüssel vorstand.aktuellKennung in den Sprachdateien steht (Bedarf) */}
          {t.has('aktuellKennung') ? (
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 />
              {t('aktuellKennung')}
            </span>
          ) : null}
          <h2 id="vorstand-aktuell" className="text-display-2">
            {t('aktuellTitel')}
          </h2>
          <p className="max-w-einleitung text-20 leading-einleitung text-pretty text-tinte-2">{t('aktuellText')}</p>
        </div>
        {inhalt.vorstand.length > 0 ? (
          <ul className="grid raster-karten gap-6">
            {inhalt.vorstand.map((m, i) => (
              <li key={i}>
                <PersonCard
                  variante="board"
                  sprache={sprache}
                  person={{
                    name: m.name,
                    funktion: m.funktion,
                    seit: m.seit || undefined,
                    liste: m.aufgaben,
                    email: m.email || undefined,
                    telefon: m.telefon,
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Leerzustand text={t('leer')} schritt={leerSchritt} />
        )}
      </section>

      <section
        aria-labelledby="vorstand-vorsitz"
        className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pb-abschnitt md:px-8"
      >
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
            <Stern8 />
            {t('fuehrungSeit', { jahr: inhalt.fuehrungSeit })}
          </span>
          <h2 id="vorstand-vorsitz" className="text-display-2">
            {t('vorsitzTitel')}
          </h2>
          <p className="max-w-einleitung text-20 leading-einleitung text-pretty text-tinte-2">{t('vorsitzUntertitel')}</p>
        </div>
        {/* Verbindungslinie der Amtszeiten vom ersten Amtsbeginn bis heute (AUFTRAG 4, statisch) */}
        <Amtszeiten liste={inhalt.vorsitzende} heuteJahr={heute.jahr} heute={t('heute')} />
        {/* Gleiche Kartenhöhe in einer Reihe: Zeilen strecken sich (kein items-start); Jahre als Jahresmarke */}
        {inhalt.vorsitzende.length > 0 ? (
          <ol className="grid raster-kacheln gap-4">
            {inhalt.vorsitzende.map((v, i) => (
              <li key={i}>
                <PersonCard
                  variante="leader"
                  sprache={sprache}
                  person={{
                    name: v.name,
                    rolle: v.aktuell ? t('rolleAktuell') : t('rolleEhemalig'),
                    zeitraum: zeitraum(v, t('heute')),
                    aktuell: v.aktuell,
                    liste: v.erfolge,
                  }}
                />
              </li>
            ))}
          </ol>
        ) : (
          <Leerzustand text={t('leer')} schritt={leerSchritt} />
        )}
      </section>

      <section aria-labelledby="vorstand-dank" className="mx-auto max-w-(--container-inhalt) px-4 pb-abschnitt md:px-8">
        <div className="flex flex-col gap-4 rounded-lg bg-sand p-6 md:p-12">
          <h2 id="vorstand-dank" className="flex items-center gap-3 text-display-2">
            <Heart aria-hidden className="size-7 shrink-0 text-gruen-800" />
            {t('dankTitel')}
          </h2>
          <p className="max-w-text text-18 text-pretty">{t('dankText')}</p>
          <Link
            href="/kontakt"
            aria-label={`${t('dankLink')}: ${t('dankTitel')}`}
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-3"
          >
            {t('dankLink')}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </section>
    </Seitenrahmen>
  );
}
