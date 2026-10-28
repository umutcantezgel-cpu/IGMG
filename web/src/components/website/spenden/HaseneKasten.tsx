import { HandHeart, Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Verweisliste } from '@/components/website/dachverband/Verweisliste';
import { klassen } from '@/lib/klassen';

/** Spendenbereiche, für die Hasene sammelt (nur Namen – keine Beträge, keine Regeln; G-06). */
export const HASENE_BEREICHE = ['kurban', 'zakat', 'fitra', 'nothilfe'] as const;

/**
 * Kasten „Weltweit helfen mit Hasene“ auf /spenden (Plan Marktstart P7): Kurban, Zakat, Fitra und Nothilfe laufen über die
 * Hilfsorganisation des Dachverbands, HASENE International e. V. – der Kasten sagt deutlich, dass diese Spenden nicht an die
 * Gemeinde gehen. Bewusst ohne GiroCode, ohne Bankverbindung und ohne Feld in der Einstellung „spenden“: Ein Konto des
 * Dachverbands darf nie wie das Gemeindekonto aussehen. Links nur über das Netzwerk-Verzeichnis (Hasene, Zakat-Rechner),
 * keine Anfrage beim Aufruf (K-14). Server-Komponente ohne Client-Code (K-12).
 */
export async function HaseneKasten({ className }: { className?: string }) {
  const t = await getTranslations('spenden.hasene');
  return (
    <section
      aria-labelledby="spenden-hasene"
      data-spenden="hasene"
      className={klassen('flex flex-col gap-4 rounded-lg border border-linie bg-sand p-6 md:p-8', className)}
    >
      <h2 id="spenden-hasene" className="flex items-center gap-2.5 text-24 text-balance">
        <HandHeart aria-hidden className="size-6 shrink-0 text-gruen-700" />
        {t('titel')}
      </h2>
      <p className="max-w-text text-pretty">{t('text')}</p>
      <p className="flex max-w-text items-start gap-2 rounded-md border border-gruen-700 bg-weiss p-3 font-bold">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
        {t('empfaenger')}
      </p>
      <div className="flex flex-col gap-2">
        <h3 id="spenden-hasene-bereiche" className="font-text text-18 font-bold tracking-normal">
          {t('bereicheTitel')}
        </h3>
        <ul aria-labelledby="spenden-hasene-bereiche" className="flex flex-wrap gap-2">
          {HASENE_BEREICHE.map((b) => (
            <li key={b} className="rounded-pill border border-linie bg-weiss px-3 py-1 text-16 font-bold text-gruen-800">
              {t(`bereiche.${b}`)}
            </li>
          ))}
        </ul>
      </div>
      <Verweisliste eintraege={['hasene', 'zakatRechner']} />
      <p className="max-w-text text-16 text-tinte-2">{t('gemeinde')}</p>
    </section>
  );
}
