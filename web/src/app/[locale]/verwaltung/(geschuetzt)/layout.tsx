import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { KontoMenue } from '@/components/verwaltung/shell/KontoMenue';
import { MODULE, rechtListe } from '@/components/verwaltung/shell/module';
import { Seitenleiste, type SeitenleistenEintrag } from '@/components/verwaltung/shell/Seitenleiste';
import { darf, verlangeSitzung } from '@/lib/rechte/pruefe';
import { abmelden } from '@/server/actions/anmeldung';
import { zaehleNeueEingaenge } from '@/server/queries/verwaltung/eingaenge';
import { zaehleUngelesene } from '@/server/queries/verwaltung/postfach';
import { zaehleOffeneTickets } from '@/server/queries/verwaltung/tickets';
import { ladeKommendeVeranstaltungen, zaehleAktiveAnkuendigungen, zaehleEntwuerfe } from '@/server/queries/verwaltung/uebersicht';

/**
 * Geschützter Bereich mit Verwaltungs-Hülle (D05, V01): Sitzung + zweiter Faktor + Rolle (K-06).
 * Eigene Kopfzeile mit Kontomenü statt öffentlichem Kopf, Gebetszeitenleiste und Fußzeile (ADR 0016, ABWEICHUNGEN A-V01).
 */
export default async function GeschuetzterBereich({ children }: LayoutProps<'/[locale]/verwaltung'>) {
  const a = await verlangeSitzung();
  const t = await getTranslations('verwaltung');
  const sichtbar = MODULE.filter((m) => m.gebaut && rechtListe(m).some((r) => darf(a.rollen, r)));
  const zeigt = (schluessel: (typeof MODULE)[number]['schluessel']) => sichtbar.some((m) => m.schluessel === schluessel);
  const jetzt = new Date();
  const [veranstaltungen, neuigkeiten, ankuendigungen, eingaenge, postfach, tickets] = await Promise.all([
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
  ]);
  const zaehler: Partial<Record<(typeof MODULE)[number]['schluessel'], number>> = {
    veranstaltungen,
    neuigkeiten,
    ankuendigungen,
    eingaenge,
    postfach,
    tickets,
  };
  const eintraege: SeitenleistenEintrag[] = sichtbar.map((m) => ({
    schluessel: m.schluessel,
    label: t(`module.${m.schluessel}`),
    pfad: m.pfad,
    icon: m.icon,
    zaehler: zaehler[m.schluessel],
    zaehlerLabel: zaehler[m.schluessel] !== undefined ? t('shell.anzahl', { anzahl: zaehler[m.schluessel] ?? 0 }) : undefined,
  }));
  const rollen = t('shell.rollen', {
    rollen: a.rollen.map((r) => t(`rollen.${r.rolle}`) + (r.organisation ? ` (${r.organisation.toUpperCase()})` : '')).join(', '),
  });
  return (
    <div className="verwaltung-huelle">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--ebene-overlay) focus:rounded-md focus:bg-weiss focus:px-4 focus:py-3 focus:font-bold"
      >
        {t('shell.zumInhalt')}
      </a>
      <header className="border-b border-linie bg-weiss">
        <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
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
          <div className="flex flex-wrap items-center gap-3">
            <NextLink href="/" prefetch={false} className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4">
              {t('shell.zurWebsite')}
              <ExternalLink aria-hidden className="size-4" />
            </NextLink>
            <KontoMenue
              name={a.name}
              rollen={rollen}
              abmelden={abmelden}
              texte={{ kontoMenue: t('shell.kontoMenue'), meinKonto: t('shell.meinKonto'), abmelden: t('konto.abmelden') }}
            />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-360 flex-col gap-6 px-4 py-6 md:px-6 verwaltung:flex-row">
        <Seitenleiste
          eintraege={eintraege}
          texte={{
            titel: t('shell.titel'),
            untertitel: t('shell.untertitel'),
            navName: t('shell.navName'),
            oeffnen: t('shell.menueOeffnen'),
            schliessen: t('shell.menueSchliessen'),
          }}
        />
        <main id="inhalt" tabIndex={-1} className="flex min-w-0 flex-1 flex-col gap-6 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
