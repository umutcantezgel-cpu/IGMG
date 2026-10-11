import type { Ziel } from '@/i18n/navigation';

/**
 * Navigationsstruktur (Header, Telefonmenü) nach design/Header.dc.html und Laufbuch D-04/D-07.
 * Texte als Schlüssel im Namensraum `kopf`; Ziele als lokalisierte Pfade (K-03).
 */
export type { Ziel };

/** Menüpunkt; `href` ist die fertige lokalisierte Adresse (für Client-Komponenten). */
export type MenuePunkt = { schluessel: string; label: string; beschreibung: string; href: string; logo?: string };
export type Menue = { schluessel: Bereich; label: string; punkte: MenuePunkt[] };
export type Bereich = 'startseite' | 'moschee' | 'islam' | 'organisationen' | 'bildung' | 'keiner';

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
        p('voranmeldung', 'voranmeldung', 'bVoranmeldung', '/bildung/voranmeldung'),
        p('korankurse', 'korankurse', 'bKorankurse', '/bildung/korankurse'),
        // Laufbuch D-07: „Islamunterricht“ vorläufig → Islamisches Wissen (MENSCHEN M-022)
        p('islamunterricht', 'islamunterricht', 'bIslamunterricht', '/islamisches-wissen'),
      ],
    },
  ];
}
