import { BellRing, BookMarked, GraduationCap, ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Stern8 } from '@/components/website/Icons';
import { KontoHuelle } from './KontoHuelle';
import type { Ziel } from '@/i18n/navigation';

/**
 * Rahmen der Konto-Einstiegsseiten (Anmelden, Registrieren, Einladung, Passwort): Kopf und Fuß der Website, darunter
 * eine Sandfläche mit der Karte (h1 + Formular) und – ab 1024 px links daneben, auf dem Telefon darunter – eine kurze
 * Einordnung, was das Gemeinde-Konto bietet. Achtstern-Band an der Kante wie beim Seitenkopf (K-008, nie hinter Text).
 */
export async function KontoEinstieg({
  seite,
  sprachZiel,
  titel,
  untertitel,
  children,
  ohneEinordnung = false,
  konto,
}: {
  seite: string;
  sprachZiel: Ziel;
  titel: string;
  untertitel?: string;
  children: ReactNode;
  ohneEinordnung?: boolean;
  /** Angemeldet (z. B. Pflicht-Einrichtung des zweiten Faktors): Kopf mit Kontoschaltfläche statt „Anmelden“. */
  konto?: { anzeigename: string };
}) {
  const t = await getTranslations('konto.einordnung');
  const punkte = [
    { Icon: BookMarked, text: t('punkt1') },
    { Icon: GraduationCap, text: t('punkt2') },
    { Icon: BellRing, text: t('punkt3') },
    { Icon: ShieldCheck, text: t('punkt4') },
  ];
  const kennung = (
    <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
      <Stern8 />
      <span>{t('kennung')}</span>
    </span>
  );
  const karte = (
    <div className="min-w-0 rounded-lg border border-linie bg-weiss p-6 shadow-s2 md:p-8">
      <h1 className="text-display-2 text-balance">{titel}</h1>
      {untertitel ? <p className="mt-3 text-pretty text-tinte-2">{untertitel}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
  return (
    <KontoHuelle seite={seite} sprachZiel={sprachZiel} konto={konto}>
      <section className="border-b border-linie bg-sand">
        {ohneEinordnung ? (
          // Ohne Einordnung (Passwort, Pflicht-Faktor): eine mittige Spalte in Dialogbreite – Platz für QR und Ersatzcodes
          <div className="mx-auto flex max-w-(--container-dialog) flex-col gap-5 px-4 pt-8 pb-12 md:px-8 md:pt-14 md:pb-16 lg:pt-20 lg:pb-24">
            {kennung}
            {karte}
          </div>
        ) : (
          <div className="mx-auto grid max-w-(--container-inhalt) gap-10 px-4 pt-8 pb-12 md:px-8 md:pt-14 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:pt-20 lg:pb-24">
            <div className="flex flex-col gap-5 max-lg:order-2 lg:sticky lg:top-8 lg:self-start lg:pt-4">
              {kennung}
              <p className="max-w-seitenkopf font-display text-display-2 text-balance text-tinte">{t('titel')}</p>
              <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{t('text')}</p>
              <ul className="mt-2 grid max-w-160 gap-3 sm:grid-cols-2">
                {punkte.map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 rounded-lg border border-linie bg-weiss p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="pt-1.5 text-16 text-tinte">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {karte}
          </div>
        )}
        <div aria-hidden className="h-5 achtstern-band" />
      </section>
    </KontoHuelle>
  );
}
