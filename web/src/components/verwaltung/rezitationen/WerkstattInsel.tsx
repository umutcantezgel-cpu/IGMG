'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { WerkstattProps } from './Werkstatt';

function Laden() {
  const t = useTranslations('verwaltung.rezitationen.werkstatt');
  return (
    <p role="status" className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">
      {t('laedt')}
    </p>
  );
}

/** Die Werkstatt (Wellenform, Aufnahme, Abgleich) lädt erst im Browser als eigener Teil (Client-Insel, lazy). */
const Werkstatt = dynamic(() => import('./Werkstatt'), { ssr: false, loading: () => <Laden /> });

export function WerkstattInsel(props: WerkstattProps) {
  return <Werkstatt {...props} />;
}
