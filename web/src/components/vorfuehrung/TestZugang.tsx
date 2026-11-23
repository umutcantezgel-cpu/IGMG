import { ArrowRight, Images, KeyRound, LogIn } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VORFUEHRUNG_KONTEN, VORFUEHRUNG_PASSWORT, type VorfuehrungsKonto } from '@/lib/vorfuehrung/konten';

/** Anmelden und Abmelden als gewöhnliches Formular und gewöhnliche Links (`src/app/api/vorfuehrung/`). */
const ANMELDEN = '/api/vorfuehrung/anmelden';
const ABMELDEN = '/api/vorfuehrung/abmelden';

const BEREICHE = [
  { bereich: 'verwaltung', titel: 'gruppeVerwaltung' },
  { bereich: 'mein-bereich', titel: 'gruppeMeinBereich' },
] as const;

/**
 * Anmeldeseite der Vorführung mit Testzugang (ADR 0052): ein Login-Fenster – Benutzername, Passwort, Anmelden. Je nach
 * Benutzername öffnet sich ein eigener Bereich mit eigenen Rechten (sechs Rollen der Verwaltung, drei Kontoarten in „Mein
 * Bereich“). Daneben die Liste der Benutzernamen mit dem, was sie sehen und dürfen, und je einem Knopf zum direkten
 * Anmelden; das Passwort ist für alle gleich und steht dabei. Der Testzugang schützt nichts, die Vorführung enthält nur
 * Beispieldaten. Wer schon angemeldet ist, sieht das hier und kann den Benutzer wechseln. Ganz ohne Client-JavaScript:
 * ein gewöhnliches Formular und gewöhnliche Links auf `/api/vorfuehrung/anmelden`, die mit einer Weiterleitung antworten;
 * falsche Eingaben kommen mit `?fehler=1` zurück.
 */
export async function TestZugang({
  fehler,
  abgemeldet,
  angemeldet,
}: {
  fehler: boolean;
  abgemeldet: boolean;
  angemeldet: VorfuehrungsKonto | null;
}) {
  const t = await getTranslations('verwaltung.vorfuehrung');
  const tv = await getTranslations('verwaltung');
  return (
    <main id="inhalt" className="mx-auto w-full max-w-(--container-inhalt) px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10 rounded-sm" />
        <p className="font-display text-20 font-semibold">IGMG Wetzlar</p>
      </div>
      <div className="flex flex-col gap-8 verwaltung:flex-row verwaltung:items-start verwaltung:gap-12">
        <section aria-labelledby="anmelden-titel" className="w-full shrink-0 verwaltung:sticky verwaltung:top-8 verwaltung:w-104">
          <div className="rounded-lg border border-linie bg-weiss p-6 shadow-s2 md:p-8">
            <h1 id="anmelden-titel" className="text-display-2">
              {t('titel')}
            </h1>
            <p className="mt-3 text-pretty text-tinte-2">{t('untertitel')}</p>
            <div className="mt-5 flex flex-col gap-3">
              {fehler ? (
                <Meldung art="fehler" id="testzugang-meldung">
                  {t('fehler')}
                </Meldung>
              ) : null}
              {abgemeldet ? <Meldung art="info">{t('abgemeldet')}</Meldung> : null}
              {angemeldet ? (
                <div className="rounded-md border border-gruen-700 bg-gruen-50 px-4 py-3">
                  <p className="font-bold text-gruen-800">{t('angemeldet', { name: t(`konten.${angemeldet.schluessel}.name`) })}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Button asChild size="sm">
                      <NextLink href={angemeldet.ziel} prefetch={false}>
                        {t('weiter')}
                        <ArrowRight aria-hidden />
                      </NextLink>
                    </Button>
                    <Button asChild variant="link" size="sm">
                      <a href={ABMELDEN}>{t('abmelden')}</a>
                    </Button>
                  </div>
                  <p className="mt-2 text-16 text-tinte-2">{t('wechseln')}</p>
                </div>
              ) : null}
            </div>
            <form method="post" action={ANMELDEN} className="mt-5 flex flex-col gap-5">
              <Feld
                id="testzugang-benutzername"
                name="benutzername"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                label={t('benutzername')}
              />
              <Feld
                id="testzugang-passwort"
                name="passwort"
                type="password"
                autoComplete="current-password"
                required
                label={t('passwort')}
              />
              <Button type="submit" className="w-full">
                <LogIn aria-hidden />
                {t('anmelden')}
              </Button>
            </form>
          </div>
          <p className="mt-4 flex items-start gap-2 text-16 text-tinte-2">{t('hinweis')}</p>
          <div className="mt-2 flex flex-col">
            <NextLink href="/verwaltung/rundgang" prefetch={false} className="inline-flex min-h-11 items-center gap-2 font-bold">
              <Images aria-hidden className="size-5 shrink-0" />
              {t('rundgang')}
            </NextLink>
            <NextLink href="/" prefetch={false} className="inline-flex min-h-11 items-center font-bold">
              {tv('shell.zurWebsite')}
            </NextLink>
          </div>
        </section>

        <section aria-labelledby="zugaenge-titel" className="min-w-0 flex-1">
          <h2 id="zugaenge-titel" className="font-display text-24 font-semibold">
            {t('zugaenge')}
          </h2>
          <p className="mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-sand px-4 py-3 text-18">
            <KeyRound aria-hidden className="size-5 shrink-0 text-gruen-800" />
            <span className="text-tinte-2">{t('passwortAlle')}:</span>
            <strong className="font-bold break-all">{VORFUEHRUNG_PASSWORT}</strong>
          </p>
          {BEREICHE.map((b) => (
            <div key={b.bereich} className="mt-6">
              <h3 className="text-16 font-bold text-tinte-2">{t(b.titel)}</h3>
              <ul className="mt-2 overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1">
                {VORFUEHRUNG_KONTEN.filter((k) => k.bereich === b.bereich).map((k) => {
                  const name = t(`konten.${k.schluessel}.name`);
                  return (
                    <li
                      key={k.schluessel}
                      className="flex flex-col gap-3 border-t border-linie px-4 py-4 first:border-t-0 md:flex-row md:items-center md:gap-5 md:px-5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <strong className="rounded-sm bg-gruen-50 px-2 py-0.5 text-18 font-bold break-all text-gruen-800">
                            {k.benutzername}
                          </strong>
                          <span className="font-bold">{name}</span>
                        </p>
                        <p className="mt-1 text-pretty text-tinte-2">{t(`konten.${k.schluessel}.text`)}</p>
                      </div>
                      <Button asChild variant="secondary" size="sm" className="w-full shrink-0 md:w-40">
                        <a href={`${ANMELDEN}?als=${k.schluessel}`} aria-label={t('anmeldenAls', { name })}>
                          <LogIn aria-hidden />
                          {t('direkt')}
                        </a>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
