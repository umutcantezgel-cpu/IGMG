import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { KontoMenue } from '@/components/verwaltung/shell/KontoMenue';
import { MenueKnopf, MenueZustand } from '@/components/verwaltung/shell/MenueZustand';
import { MODULE, rechtListe } from '@/components/verwaltung/shell/module';
import { Seitenleiste, type SeitenleistenEintrag } from '@/components/verwaltung/shell/Seitenleiste';
import { funktionAn } from '@/lib/funktionen';
import { darf, verlangeSitzung } from '@/lib/rechte/pruefe';
import { abmelden } from '@/server/actions/anmeldung';
import { zaehleOffeneLernappMeldungen } from '@/server/queries/lernapp/meldungen';
import { zaehleOffeneFolien } from '@/server/queries/verwaltung/anzeige';
import { zaehleNeueEingaenge } from '@/server/queries/verwaltung/eingaenge';
import { zaehleOffeneMeldungen } from '@/server/queries/verwaltung/kinderschutz';
import { zaehleOffeneFreigaben } from '@/server/queries/verwaltung/koran';
import { zaehleUngelesene } from '@/server/queries/verwaltung/postfach';
import { zaehleOffeneTickets } from '@/server/queries/verwaltung/tickets';
import { ladeKommendeVeranstaltungen, zaehleAktiveAnkuendigungen, zaehleEntwuerfe } from '@/server/queries/verwaltung/uebersicht';

/**
 * Geschützter Bereich mit Verwaltungs-Hülle (D05, V01): Sitzung + zweiter Faktor + Rolle (K-06).
 * Eigene Kopfzeile mit Kontomenü statt öffentlichem Kopf, Gebetszeitenleiste und Fußzeile (ADR 0016, ABWEICHUNGEN A-V01).
 * Kopfzeile und Seitenleiste teilen den Menüzustand (H-B05): unter 900 px öffnet der Knopf in der Kopfzeile die Navigation.
 */
export default async function GeschuetzterBereich({ children }: LayoutProps<'/[locale]/verwaltung'>) {
  const a = await verlangeSitzung();
  const t = await getTranslations('verwaltung');
  // Module mit Personendaten erscheinen nur bei eingeschaltetem Funktionsschalter (ADR 0035)
  const schalter = {
    lernplattform: await funktionAn('lernplattform'),
    konten: await funktionAn('konten'),
    lernapp: await funktionAn('lernapp'),
  };
  const sichtbar = MODULE.filter((m) => m.gebaut && (!m.funktion || schalter[m.funktion]) && rechtListe(m).some((r) => darf(a.rollen, r)));
  const zeigt = (schluessel: (typeof MODULE)[number]['schluessel']) => sichtbar.some((m) => m.schluessel === schluessel);
  const jetzt = new Date();
  const [veranstaltungen, neuigkeiten, ankuendigungen, eingaenge, postfach, tickets, kinderschutz, koran, anzeige, lernapp] =
    await Promise.all([
      // Bevorstehende, veröffentlichte Veranstaltungen: dieselbe Zahl wie die Kachel auf der Übersicht (DP-C1 M3)
      zeigt('veranstaltungen') ? ladeKommendeVeranstaltungen(a, jetzt).then((kommend) => kommend?.length) : undefined,
      // Entwürfe der Neuigkeiten und derzeit sichtbare Ankündigungen (DP-C1 H1)
      zeigt('neuigkeiten') ? zaehleEntwuerfe(a) : undefined,
      zeigt('ankuendigungen') ? zaehleAktiveAnkuendigungen(a, jetzt) : undefined,
      // Neue (unbearbeitete) Eingänge, die die Person sehen darf
      zeigt('eingaenge') ? zaehleNeueEingaenge(a) : undefined,
      // Ungelesene Nachrichten an die Person, offene Tickets im eigenen Sichtbereich
      zeigt('postfach') ? zaehleUngelesene(a) : undefined,
      zeigt('tickets') ? zaehleOffeneTickets(a) : undefined,
      // Offene Chat-Meldungen (nur Rolle kinderschutz)
      zeigt('kinderschutz') ? zaehleOffeneMeldungen() : undefined,
      // Religiöse Freigaben „zur Prüfung“, die die Person prüfen darf (nicht selbst verfasst, ADR 0030)
      zeigt('koran') && darf(a.rollen, 'religioes.freigeben') ? zaehleOffeneFreigaben(a.benutzerId) : undefined,
      // Vers- und Hadith-Folien „zur Prüfung“, die die Person freigeben darf (O-K05)
      zeigt('anzeige') && darf(a.rollen, 'religioes.freigeben') ? zaehleOffeneFolien(a.benutzerId) : undefined,
      // Lern-App: offene Meldungen aus der App, die die Person bearbeiten darf (L3-06)
      zeigt('lernapp') && darf(a.rollen, 'lernapp.bearbeiten') ? zaehleOffeneLernappMeldungen() : undefined,
    ]);
  const zaehler: Partial<Record<(typeof MODULE)[number]['schluessel'], number>> = {
    veranstaltungen,
    neuigkeiten,
    ankuendigungen,
    eingaenge,
    postfach,
    tickets,
    kinderschutz,
    koran,
    anzeige,
    lernapp,
  };
  const eintraege: SeitenleistenEintrag[] = sichtbar.map((m) => {
    const anzahl = zaehler[m.schluessel];
    return {
      schluessel: m.schluessel,
      label: t(`module.${m.schluessel}`),
      pfad: m.pfad,
      icon: m.icon,
      gruppe: m.gruppe,
      zaehler: anzahl,
      // Ein Zähler erscheint nur mit Bedeutung: bei 0 weder Pille noch Text für Hilfstechnik (H-B05)
      zaehlerLabel: anzahl !== undefined && anzahl > 0 ? t('shell.anzahl', { anzahl }) : undefined,
    };
  });
  const rollen = t('shell.rollen', {
    rollen: a.rollen.map((r) => t(`rollen.${r.rolle}`) + (r.organisation ? ` (${r.organisation.toUpperCase()})` : '')).join(', '),
  });
  return (
    <div className="verwaltung-huelle">
      <MenueZustand>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--ebene-overlay) focus:rounded-md focus:bg-weiss focus:px-4 focus:py-3 focus:font-bold"
        >
          {t('shell.zumInhalt')}
        </a>
        <header className="border-b border-linie bg-weiss print:hidden">
          <div className="mx-auto flex max-w-360 flex-nowrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <NextLink href="/verwaltung" className="flex items-center gap-3 text-tinte no-underline hover:text-tinte">
              <Image
                src="/bilder/logos/logo-igmg-wetzlar.png"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-sm border border-linie"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-20 font-semibold">IGMG Wetzlar</span>
                <span className="text-16 text-tinte-2">{t('titel')}</span>
              </span>
            </NextLink>
            <div className="flex items-center gap-2">
              {/* Auf dem Telefon steht „Zur Website“ am Ende der Navigation (Seitenleiste) */}
              <NextLink
                href="/"
                prefetch={false}
                className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4 max-verwaltung:hidden"
              >
                {t('shell.zurWebsite')}
                <ExternalLink aria-hidden className="size-4" />
              </NextLink>
              <KontoMenue
                name={a.name}
                rollen={rollen}
                abmelden={abmelden}
                texte={{ kontoMenue: t('shell.kontoMenue'), meinKonto: t('shell.meinKonto'), abmelden: t('konto.abmelden') }}
              />
              <MenueKnopf texte={{ oeffnen: t('shell.menueOeffnen'), schliessen: t('shell.menueSchliessen') }} />
            </div>
          </div>
          <div aria-hidden className="h-5 achtstern-band" />
        </header>
        <div className="mx-auto flex max-w-360 flex-col gap-6 px-4 py-6 md:px-6 verwaltung:flex-row">
          <Seitenleiste
            eintraege={eintraege}
            texte={{
              navName: t('shell.navName'),
              zurWebsite: t('shell.zurWebsite'),
              gruppe: {
                inhalte: t('shell.gruppe.inhalte'),
                kommunikation: t('shell.gruppe.kommunikation'),
                betrieb: t('shell.gruppe.betrieb'),
              },
            }}
          />
          <main id="inhalt" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-6 outline-none">
            {children}
          </main>
        </div>
      </MenueZustand>
    </div>
  );
}
