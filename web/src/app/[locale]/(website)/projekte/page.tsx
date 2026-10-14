import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Achtstern } from '@/components/website/Icons';
import { PageHeader } from '@/components/website/PageHeader';
import { istNurPlatzhalter } from '@/components/website/Platzhalter';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { textMitSprache } from '@/components/website/Text';
import { Bauprojekt } from '@/components/website/projekte/Bauprojekt';
import { Meilensteine } from '@/components/website/projekte/Meilensteine';
import { Unterstuetzen } from '@/components/website/projekte/Unterstuetzen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projekte');
  return metadatenFuer({ pfad: '/projekte', titel: t('kopf.titel'), beschreibung: t('kopf.untertitel') });
}

/**
 * Projekte (design/Projects.dc.html, Blatt S10): Bauprojekt mit 3D-Platzhalter und Fakten, Meilensteine, Unterstützen
 * mit der Spendenkarte. Redaktionelle Inhalte kommen aus dem Seiteninhalt „projekte“, feste Überschriften
 * und Schaltflächen aus messages/bereiche/projekte.json. Keine Formulare, keine Anfragen an Dritte (K-14).
 * Sichtabnahme Runde 2 (PR-4): Ist das Projekt fertiggestellt, trägt der Kopf die Kernbotschaft „{Name} ist eröffnet“
 * mit dem gefüllten Achtstern samt Haken (dieselbe Marke wie der erreichte letzte Meilenstein, B-08; unter 640 px ohne
 * Marke, damit der Name nicht am Bindestrich bricht); der allgemeine Titel wird zur Unterzeile. Ein Name, der nur Platzhalter ist, bleibt aus dem Titel (G-05). Gebetsleiste als eine Zeile (X-8).
 */
export default async function ProjekteSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('projekte');
  const inhalt = await ladeSeiteninhalt('projekte');
  const name = textMitSprache(inhalt.projekt.name, sprache).text;
  const eroeffnet = inhalt.projekt.status === 'fertiggestellt' && name !== '' && !istNurPlatzhalter(name);
  return (
    <Seitenrahmen bereich="moschee" seite="projekte" sprachZiel="/projekte" kompakteLeiste pfad={[{ label: t('kopf.eyebrow') }]}>
      {eroeffnet ? (
        <PageHeader
          kennung={t('kopf.eyebrow')}
          titel={t('kopf.titelFertig', { name })}
          untertitel={t('kopf.titel')}
          titelZeichen={
            <span
              aria-hidden
              className="relative inline-flex size-12 shrink-0 items-center justify-center text-gruen-700 max-sm:hidden md:size-16"
            >
              <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
              <Check className="relative size-6 text-weiss md:size-8" strokeWidth={3} />
            </span>
          }
        />
      ) : (
        <PageHeader kennung={t('kopf.eyebrow')} titel={t('kopf.titel')} untertitel={t('kopf.untertitel')} />
      )}
      {/* Erzählfolge (O-11): das Vorhaben → der Stand (Meilensteinlinie, B-08) → was es braucht → Aufruf */}
      <section aria-label={t('kopf.titel')} className="bg-papier">
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
          <Bauprojekt inhalt={inhalt} sprache={sprache} />
        </div>
      </section>
      <div className="border-y border-linie bg-sand">
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
          <Meilensteine inhalt={inhalt} sprache={sprache} />
        </div>
      </div>
      <div className="bg-papier">
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
          <Unterstuetzen inhalt={inhalt} sprache={sprache} />
        </div>
      </div>
    </Seitenrahmen>
  );
}
