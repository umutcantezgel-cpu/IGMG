import type { MetadataRoute } from 'next';
import { SLUG } from '@/components/website/organisation/stil';
import { ohneLaufzeitDatenbank } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { SLUGS as BUCHSTABEN_SLUGS } from '@/lib/elifbe/alphabet';
import { LEKTIONEN } from '@/lib/elifbe/lektionen';
import { basisUrl } from '@/lib/seo/metadaten';
import { baueSitemap, FESTE_ZIELE } from '@/lib/seo/sitemap';
import { ladeHadithBuchNummern, ladeHadithBuchTeile } from '@/server/queries/hadith';
import { ladeNachrichtenStaende } from '@/server/queries/nachrichten';
import { ladeSeitenAdressen } from '@/server/queries/seiten';
import { ladeVeranstaltungen } from '@/server/queries/veranstaltungen';
import { ladeWissensThemen } from '@/server/queries/wissen';

/**
 * Sitemap (D-O2, K-16, ADR 0049): lädt die Daten und übergibt sie an `baueSitemap` (src/lib/seo/sitemap.ts) – feste
 * Seiten, Organisationen, veröffentlichte Veranstaltungen, Neuigkeiten und Wissensthemen (mit Änderungsdatum), freie
 * CMS-Seiten, Quran, Elif-Be und die freigeschalteten Bereiche. Ohne Verwaltung, Suche, Offline und Anzeige. Die
 * Abfragen sind gecacht und werden über die Inhalts-Tags erneuert.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [veranstaltungen, nachrichten, themen, cmsSeiten, hadithGesamt, hatim, newsletter] = await Promise.all([
    ladeVeranstaltungen(),
    ladeNachrichtenStaende(),
    ladeWissensThemen(),
    ladeSeitenAdressen(),
    funktionAn('hadith_gesamt'),
    funktionAn('hatim'),
    funktionAn('newsletter'),
  ]);
  const [hadithBuecher, hadithTeile] = hadithGesamt ? await Promise.all([ladeHadithBuchNummern(), ladeHadithBuchTeile()]) : [[], []];
  return baueSitemap({
    basis: basisUrl(),
    // Beispielmodus (ADR 0019): Die Seeds tragen den Zeitpunkt des Baus – kein lastModified
    mitDatum: !ohneLaufzeitDatenbank(),
    seiten: Object.values(cmsSeiten),
    ziele: [
      ...FESTE_ZIELE,
      ...Object.values(SLUG).map((organisation) => ({ pathname: '/organisationen/[organisation]' as const, params: { organisation } })),
      ...veranstaltungen.map((v) => ({
        ziel: { pathname: '/veranstaltungen/[slug]' as const, params: { slug: v.slug } },
        geaendert: v.aktualisiertAm,
      })),
      ...nachrichten.map((n) => ({
        ziel: { pathname: '/nachrichten/[slug]' as const, params: { slug: n.slug } },
        geaendert: n.aktualisiertAm,
      })),
      // Ungeprüfte Entwürfe (Schalter `website_wissen_vorschau`, ADR 0047) sind `noindex` und stehen nicht in der Sitemap
      ...themen
        .filter((t) => !t.entwurf)
        .map((t) => ({
          ziel: { pathname: '/islamisches-wissen/[thema]' as const, params: { thema: t.slug } },
          geaendert: t.aktualisiertAm,
        })),
      ...Array.from({ length: 114 }, (_, i) => ({ pathname: '/quran/[sure]' as const, params: { sure: String(i + 1) } })),
      ...Array.from({ length: 30 }, (_, i) => ({ pathname: '/quran/cuz/[nr]' as const, params: { nr: String(i + 1) } })),
      ...BUCHSTABEN_SLUGS.map((buchstabe) => ({ pathname: '/elifbe/buchstaben/[buchstabe]' as const, params: { buchstabe } })),
      ...LEKTIONEN.map((l) => ({ pathname: '/elifbe/lektion/[lektion]' as const, params: { lektion: l.slug } })),
      // Hatim und Newsletter nur mit eingeschaltetem Schalter (ADR 0035)
      ...(hatim ? ['/hatim' as const] : []),
      ...(newsletter ? ['/newsletter' as const] : []),
      // Der Bukhari-Volltext nur, wenn er freigeschaltet ist (MN-06)
      ...(hadithGesamt
        ? [
            '/hadith/bukhari' as const,
            ...hadithBuecher.map((buch) => ({ pathname: '/hadith/bukhari/[buch]' as const, params: { buch: String(buch) } })),
            ...hadithTeile.flatMap((b) =>
              Array.from({ length: b.teile - 1 }, (_, i) => ({
                pathname: '/hadith/bukhari/[buch]/teil/[teil]' as const,
                params: { buch: String(b.nr), teil: String(i + 2) },
              })),
            ),
          ]
        : []),
    ],
  });
}
