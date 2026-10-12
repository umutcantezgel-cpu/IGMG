import { Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { klassen } from '@/lib/klassen';

/** Kennzahl: Begriff und Wert (design/PrayerTimes.dc.html, Karte „Qibla Information“). */
function Kennzahl({ begriff, wert, className }: { begriff: string; wert: string; className?: string }) {
  return (
    <div className={klassen('flex flex-col gap-1 rounded-md bg-sand px-4 py-3', className)}>
      <dt className="text-16 font-bold text-tinte-2">{begriff}</dt>
      <dd className="m-0 font-bold wrap-break-word">{wert}</dd>
    </div>
  );
}

const TIPPS = ['tipp_kompass', 'tipp_deklination', 'tipp_imam', 'tipp_apps'] as const;

/**
 * Karte „Qibla Information“ (Server-Komponente, ohne Interaktion). Der Winkel ist fest berechnet und
 * kommt bereits in der Sprache der Seite formatiert herein; Kaaba-Koordinaten sind feste Angaben aus dem Design.
 */
export async function QiblaInformation({ winkelGenau }: { winkelGenau: string }) {
  const t = await getTranslations('gebetszeitenQibla');
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-24 leading-tight">{t('information_titel')}</h3>
        <p className="text-16 leading-einleitung text-tinte-2">{t('information_untertitel')}</p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Kennzahl begriff={t('genauer_winkel')} wert={t('genauer_winkel_wert', { winkel: winkelGenau })} />
        {/* Die Entfernung zur Kaaba entfällt, bis ein belegter Wert vorliegt (MENSCHEN.md); nicht selbst rechnen. */}
        <Kennzahl begriff={t('kaaba_koordinaten')} wert={t('kaaba_koordinaten_wert')} />
        <Kennzahl begriff={t('berechnungsmethode')} wert={t('berechnungsmethode_wert')} className="sm:col-span-2" />
      </dl>
      <div className="flex flex-col gap-2 rounded-md bg-info-toenung px-5 py-4 text-tinte">
        <h4 className="flex items-center gap-2 font-text text-18 font-bold text-info">
          <Info aria-hidden className="size-5 shrink-0" />
          {t('tipps_titel')}
        </h4>
        <ul className="flex list-disc flex-col gap-1 pl-5.5">
          {TIPPS.map((schluessel) => (
            <li key={schluessel}>{t(schluessel)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
