import { Search, User } from 'lucide-react';
import NextLink from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/link';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { entscheide } from '@/lib/funktionen';
import { Bild, bildAttribute } from './Bild';
import { KopfMenues } from './kopf/KopfMenues';
import { MobilMenue } from './kopf/MobilMenue';
import { Sprachwahl, type SprachEintrag } from './kopf/Sprachwahl';
import { ladeKopfMenue } from '@/server/queries/menues';
import { baueMenues, menuesAusDb, sprachAdresse, type Bereich, type SprachZiel } from './navigation';

/**
 * Angemeldetes Konto für den Kopf der Konto-Seiten (Sichtabnahme X-1). Nur `KontoHuelle` (dynamische Konto-Seiten)
 * übergibt es; öffentliche Seiten rendern den Kopf ohne und bleiben statisch, ohne Sitzung (K-01).
 */
export type KopfKonto = {
  initiale: string;
  vorname: string;
  /**
   * Abmelden als Formular (Server Action, Zeilenform), gebaut von der Konto-Hülle: So hängt der Kopf öffentlicher Seiten
   * nie an der Aktion und ihren Abhängigkeiten (Auth, Datenbank).
   */
  abmelden: ReactNode;
  /**
   * Kontomenü am Desktop (`KontoKopfMenue`), ebenfalls von der Konto-Hülle gebaut: Der Kopf öffentlicher Seiten lädt
   * dessen Client-Code nicht mit (Z-08).
   */
  menue: ReactNode;
};

/**
 * Kopfzeile nach design/Header.dc.html (02.1): Logo, Hauptnavigation mit Untermenüs (ab 1240 px),
 * Sprachumschalter, „Anmelden“, darunter Menü-Button mit Schublade.
 * Öffentlich ohne Anmeldezustand (K-01: keine Cookies auf öffentlichen Seiten).
 * „Anmelden“ führt zur Konto-Anmeldung (ADR 0026), solange die Funktion `konten` an ist – sonst wie bisher zur
 * Verwaltung (ADR 0016). Der Kopf ist statisch: Entschieden wird zur Bauzeit allein aus der Umgebung (ADR 0035).
 * Mit `konto` (nur Konto-Seiten) steht statt „Anmelden“ die Kontoschaltfläche mit „Mein Bereich“ und „Abmelden“ –
 * am Desktop als Aufklapp-Menü, im Telefonmenü als Kontokarte.
 */
export async function Header({
  aktiv,
  aktuell,
  sprachZiel,
  konto,
}: {
  aktiv: Bereich;
  aktuell: string;
  sprachZiel: SprachZiel;
  konto?: KopfKonto;
}) {
  const sprache = (await getLocale()) as Locale;
  const anmeldenHref = entscheide('konten', process.env, null) ? pfadFuer('/anmelden', sprache) : '/verwaltung/anmelden';
  const meinBereichHref = pfadFuer('/mein-bereich', sprache);
  const t = await getTranslations('kopf');
  const ts = await getTranslations('sprachwahl');
  const tsu = await getTranslations('suche');
  const bestand = baueMenues(
    (k) => t(k),
    (ziel) => pfadFuer(ziel, sprache),
    { hatim: entscheide('hatim', process.env, null), newsletter: entscheide('newsletter', process.env, null) },
  );
  // Menü aus der Verwaltung (ADR 0032), sonst der Bestand
  const ausDb = await ladeKopfMenue(sprache);
  // Logos der Menüpunkte als fertige img-Attribute: Die Menüs sind Client-Komponenten und brauchen so kein next/image (Z-08)
  const menues = (ausDb ? menuesAusDb(ausDb, bestand) : bestand).map((m) => ({
    ...m,
    punkte: m.punkte.map(({ logo, ...p }) => (logo ? { ...p, logoBild: bildAttribute({ src: logo, alt: '', width: 32, height: 32 }) } : p)),
  }));
  const sprachen: SprachEintrag[] = (['de', 'tr', 'en'] as const).map((code) => ({
    code,
    kurz: code.toUpperCase(),
    name: ts(code),
    href: sprachAdresse(sprachZiel, code),
  }));
  return (
    <header className="relative z-(--ebene-kopf) border-b border-linie bg-weiss" style={{ viewTransitionName: 'kopf' }}>
      <div className="mx-auto flex h-18 max-w-(--container-inhalt) items-center gap-3 px-4 sm:gap-4 md:px-8 menu:h-20">
        <Link
          href="/"
          aria-label={t('logoLabel')}
          className="flex min-h-12 shrink-0 items-center gap-3 rounded-md py-1 pr-2 text-gruen-800 no-underline hover:text-gruen-800"
        >
          <Bild src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10" preload />
          <span className="font-display text-20 leading-none font-semibold whitespace-nowrap">IGMG Wetzlar</span>
        </Link>
        <KopfMenues
          menues={menues}
          startHref={pfadFuer('/', sprache)}
          startseite={t('startseite')}
          aktiv={aktiv}
          aktuell={aktuell}
          label={t('hauptnavigation')}
          aktuelleSeiteText={t('aktuelleSeite')}
        />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Suche (ADR 0013): Link zur Suchseite, kein Client-JS; Design ohne Suchfeld → A-C01c. Unter 640 px im
              Telefonmenü – Logo, Suche und Menüknopf passen nicht in 358 px (Tor B/C R-BC-D1, Frage 2) */}
          <Link
            href="/suche"
            prefetch={false}
            className="hidden size-12 druck items-center justify-center rounded-md text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 sm:inline-flex"
          >
            <Search aria-hidden className="size-6" />
            <span className="sr-only">{tsu('kopfLink')}</span>
          </Link>
          <div className="hidden menu:block">
            <Sprachwahl
              aktuell={sprache}
              sprachen={sprachen}
              texte={{ aendern: ts('aendern'), titel: ts('titel'), titelZweit: ts('titelZweit'), weitere: ts('weitere') }}
            />
          </div>
          {konto ? (
            <div className="hidden menu:block">{konto.menue}</div>
          ) : (
            <NextLink
              href={anmeldenHref}
              prefetch={false}
              className="hidden min-h-12 druck items-center gap-2 rounded-md border border-gruen-700 bg-weiss px-4 text-18 font-bold whitespace-nowrap text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 menu:inline-flex"
            >
              <User aria-hidden className="size-5" />
              <span>{t('anmelden')}</span>
            </NextLink>
          )}
          <MobilMenue
            menues={menues}
            startHref={pfadFuer('/', sprache)}
            gebetszeitenHref={pfadFuer('/gebetszeiten', sprache)}
            sucheHref={pfadFuer('/suche', sprache)}
            anmeldenHref={anmeldenHref}
            konto={
              konto
                ? {
                    initiale: konto.initiale,
                    vorname: konto.vorname,
                    meinBereichHref,
                    angemeldetAls: t('angemeldetAls'),
                    meinBereich: t('meinBereich'),
                    abmelden: konto.abmelden,
                  }
                : undefined
            }
            aktiv={aktiv}
            aktuell={aktuell}
            sprache={sprache}
            sprachen={sprachen}
            texte={{
              menue: t('menue'),
              menueOeffnen: t('menueOeffnen'),
              menueSchliessen: t('menueSchliessen'),
              navigation: t('navigation'),
              entdecken: t('entdecken'),
              spracheGruppe: t('spracheGruppe'),
              mobilNavigation: t('mobilNavigation'),
              startseite: t('startseite'),
              gebetszeiten: t('gebetszeiten'),
              suche: tsu('kopfLink'),
              anmelden: t('anmelden'),
              aktuelleSeite: t('aktuelleSeite'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
