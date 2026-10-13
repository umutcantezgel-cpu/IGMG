import { pfadFuer, type Ziel } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Navigationsstruktur (Header, Telefonmenü) nach design/Header.dc.html und Laufbuch D-04/D-07.
 * Texte als Schlüssel im Namensraum `kopf`; Ziele als lokalisierte Pfade (K-03).
 */
export type { Ziel };

/** Menüpunkt; `href` ist die fertige lokalisierte Adresse (für Client-Komponenten). */
export type MenuePunkt = { schluessel: string; label: string; beschreibung: string; href: string; logo?: string };
export type Menue = { schluessel: Bereich; label: string; punkte: MenuePunkt[] };
/** Bereich der Hauptnavigation; Gruppen eines Menüs aus der Verwaltung ohne Gegenstück im Bestand heißen `db-<n>`. */
export type Bereich = 'startseite' | 'moschee' | 'islam' | 'organisationen' | 'bildung' | 'keiner' | `db-${number}`;

/**
 * Sprachziel des Sprachumschalters: lokalisierter Pfad (Bestand) oder – für freie Seiten mit eigenem Slug je Sprache
 * (ADR 0032) – die fertigen Adressen je Sprache.
 */
export type SprachZiel = Ziel | { adressen: Record<Locale, string> };

export function sprachAdresse(ziel: SprachZiel, sprache: Locale): string {
  return typeof ziel === 'object' && 'adressen' in ziel ? ziel.adressen[sprache] : pfadFuer(ziel, sprache);
}

export const LOGOS = {
  at: '/bilder/logos/logo-igmg-wetzlar.png',
  kt: '/bilder/logos/logo-kadin.png',
  gt: '/bilder/logos/logo-genclik.png',
  kgt: '/bilder/logos/logo-kadin-genclik.png',
} as const;

type Uebersetzer = (schluessel: string) => string;

const org = (slug: string): Ziel => ({ pathname: '/organisationen/[organisation]', params: { organisation: slug } });

export function baueMenues(t: Uebersetzer, adresse: (ziel: Ziel) => string): Menue[] {
  const p = (schluessel: string, label: string, beschreibung: string, ziel: Ziel, logo?: string): MenuePunkt => ({
    schluessel,
    label: t(label),
    beschreibung: t(beschreibung),
    href: adresse(ziel),
    logo,
  });
  return [
    {
      schluessel: 'moschee',
      label: t('moschee'),
      punkte: [
        p('ueber-uns', 'ueberUns', 'bUeberUns', '/ueber-uns'),
        p('vorstand', 'vorstand', 'bVorstand', '/vorstand'),
        p('projekte', 'projekt', 'bProjekt', '/projekte'),
        p('veranstaltungen', 'veranstaltungen', 'bVeranstaltungen', '/veranstaltungen'),
        p('nachrichten', 'neuigkeiten', 'bNeuigkeiten', '/nachrichten'),
        p('kontakt', 'kontakt', 'bKontakt', '/kontakt'),
        p('igmg', 'igmg', 'bIgmg', '/igmg'),
      ],
    },
    {
      schluessel: 'islam',
      label: t('islam'),
      punkte: [
        p('gebetszeiten', 'gebetszeiten', 'bGebetszeiten', '/gebetszeiten'),
        p('quran', 'quran', 'bQuran', '/quran'),
        p('hadith', 'hadith', 'bHadith', '/hadith'),
        p('islamisches-wissen', 'wissen', 'bWissen', '/islamisches-wissen'),
      ],
    },
    {
      schluessel: 'organisationen',
      label: t('organisationen'),
      punkte: [
        p('ana-teskilati', 'at', 'bOrganisation', org('ana-teskilati'), LOGOS.at),
        p('kadin-teskilati', 'kt', 'bOrganisation', org('kadin-teskilati'), LOGOS.kt),
        p('genclik-teskilati', 'gt', 'bOrganisation', org('genclik-teskilati'), LOGOS.gt),
        p('kadin-genclik-teskilati', 'kgt', 'bOrganisation', org('kadin-genclik-teskilati'), LOGOS.kgt),
      ],
    },
    {
      schluessel: 'bildung',
      label: t('bildung'),
      punkte: [
        p('lernen', 'lernen', 'bLernen', '/lernen'),
        p('elifbe', 'elifbe', 'bElifbe', '/elifbe'),
        p('voranmeldung', 'voranmeldung', 'bVoranmeldung', '/bildung/voranmeldung'),
        p('korankurse', 'korankurse', 'bKorankurse', '/bildung/korankurse'),
        // Laufbuch D-07: „Islamunterricht“ vorläufig → Islamisches Wissen (MENSCHEN M-022)
        p('islamunterricht', 'islamunterricht', 'bIslamunterricht', '/islamisches-wissen'),
      ],
    },
  ];
}

/** Gruppe des Kopfmenüs aus der Verwaltung, bereits je Sprache aufgelöst (`ladeKopfMenue`). */
export type DbMenueGruppe = {
  titel: string;
  kinder: { titel: string; beschreibung: string; href: string; ziel: string }[];
};

/**
 * Kopfmenü aus der Verwaltung (ADR 0032) in die Struktur des Bestands: Einträge mit derselben Adresse wie ein
 * Bestandspunkt übernehmen dessen Schlüssel und Logo (aktuelle Seite bleibt markiert); eine Gruppe übernimmt den
 * Bereich der Bestandsgruppe mit den meisten gleichen Zielen (Hervorhebung des Bereichs), sonst `db-<n>`.
 */
export function menuesAusDb(gruppen: readonly DbMenueGruppe[], bestand: readonly Menue[]): Menue[] {
  const punkteBestand = bestand.flatMap((m) => m.punkte);
  const vergeben = new Set<Bereich>();
  return gruppen.map((g, i) => {
    const punkte: MenuePunkt[] = g.kinder.map((k) => {
      const gleich = punkteBestand.find((p) => p.href === k.href);
      return { schluessel: gleich?.schluessel ?? k.ziel, label: k.titel, beschreibung: k.beschreibung, href: k.href, logo: gleich?.logo };
    });
    let bester: Bereich | null = null;
    let treffer = 0;
    for (const m of bestand) {
      const n = m.punkte.filter((p) => punkte.some((q) => q.href === p.href)).length;
      if (n > treffer && !vergeben.has(m.schluessel)) {
        treffer = n;
        bester = m.schluessel;
      }
    }
    const schluessel: Bereich = bester ?? `db-${i}`;
    vergeben.add(schluessel);
    return { schluessel, label: g.titel, punkte };
  });
}

/** Bereich der Gruppe, die einen Punkt (Schlüssel) enthält; sonst „keiner“. */
export function bereichMit(menues: readonly Menue[], punkt: string): Bereich {
  return menues.find((m) => m.punkte.some((p) => p.schluessel === punkt))?.schluessel ?? 'keiner';
}
