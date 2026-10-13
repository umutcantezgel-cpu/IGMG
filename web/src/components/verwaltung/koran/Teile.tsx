import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { prozent, vierAugenErfuellt, type FreigabeStatus, type ReligioeseArt } from '@/lib/religioes/freigabe';
import { cn } from '@/lib/utils';
import { statusSetzen } from '@/server/actions/koran';
import type { VerlaufEintrag } from '@/server/queries/verwaltung/koran';
import { FreigabeSchritte } from './FormularBausteine';

/**
 * Bausteine des Moduls „Koran & Hadith“ (Server-Komponenten): Statuspille, Bereichsnavigation, Freigabeleiste mit den
 * erlaubten Schritten, Verlauf und Fortschrittsbalken.
 */
export const KARTE = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6';
const PILLE = 'inline-flex items-center rounded-pill px-3 text-16 leading-normal font-bold whitespace-nowrap';
const TON: Record<FreigabeStatus, string> = {
  entwurf: 'bg-sand text-tinte-2',
  zur_pruefung: 'bg-warnung-toenung text-tinte',
  geprueft: 'bg-gruen-50 text-gruen-800',
};

export async function StatusPille({ status }: { status: FreigabeStatus }) {
  const t = await getTranslations('verwaltung.koran');
  return <span className={cn(PILLE, TON[status])}>{t(`status.${status}`)}</span>;
}

/** Leere Pille „noch nicht erfasst“ (gestrichelt). */
export function LeerPille({ text }: { text: string }) {
  return <span className={cn(PILLE, 'border border-dashed border-rand bg-weiss font-normal text-tinte-2')}>{text}</span>;
}

const BEREICHE = [
  { schluessel: 'uebersicht', pfad: '/verwaltung/koran' },
  { schluessel: 'ausgaben', pfad: '/verwaltung/koran/ausgaben' },
  { schluessel: 'woerter', pfad: '/verwaltung/koran/woerter' },
  { schluessel: 'tajwid', pfad: '/verwaltung/koran/tajwid' },
  { schluessel: 'hadith', pfad: '/verwaltung/koran/hadith' },
] as const;
export type KoranBereich = (typeof BEREICHE)[number]['schluessel'];

/** Navigation zwischen den Bereichen des Moduls (aktueller Bereich mit aria-current). */
export async function KoranNavigation({ aktiv }: { aktiv: KoranBereich }) {
  const t = await getTranslations('verwaltung.koran');
  return (
    <nav aria-label={t('navName')} className="relative -mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 border-b border-linie px-1">
        {BEREICHE.map((b) => {
          const ist = b.schluessel === aktiv;
          return (
            <li key={b.schluessel}>
              <NextLink
                href={b.pfad}
                aria-current={ist ? 'page' : undefined}
                className={cn(
                  '-mb-px inline-flex min-h-12 items-center border-b-4 px-4 font-bold no-underline',
                  ist ? 'border-gruen-700 text-gruen-800' : 'border-transparent text-tinte-2 hover:text-tinte',
                )}
              >
                {t(`bereich.${b.schluessel}`)}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ZurueckLink({ href, text }: { href: string; text: string }) {
  return (
    <NextLink
      href={href}
      className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-4"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {text}
    </NextLink>
  );
}

/** Balken für Fortschritt (nur Schmuck; die Zahl steht daneben als Text). */
export function Balken({ teil, gesamt }: { teil: number; gesamt: number }) {
  const p = prozent(teil, gesamt);
  return (
    <svg aria-hidden viewBox="0 0 100 4" preserveAspectRatio="none" className="h-2 w-full overflow-hidden rounded-pill">
      <rect width="100" height="4" className="fill-sand" />
      <rect width={p} height="4" className="fill-gruen-700" />
    </svg>
  );
}

export function Fortschritt({ teil, gesamt, text }: { teil: number; gesamt: number; text: string }) {
  return (
    <div className="flex min-w-36 flex-col gap-1">
      <span className="text-16 tabular-nums">{text}</span>
      <Balken teil={teil} gesamt={gesamt} />
    </div>
  );
}

/**
 * Freigabeleiste eines religiösen Inhalts: Stand, verfasst/geprüft von und die erlaubten Schritte – einreichen
 * (Recht zum Bearbeiten), freigeben (nur `religioes.freigeben` und nie die verfassende Person), zurückweisen oder
 * Freigabe aufheben (mit Grund). Der Server prüft alles erneut.
 */
export async function FreigabeLeiste({
  art,
  kennung,
  status,
  verfasstVonId,
  verfasstVon,
  geprueftVon,
  geprueftAm,
  benutzerId,
  darfBearbeiten,
  darfFreigeben,
}: {
  art: ReligioeseArt;
  kennung: string;
  status: FreigabeStatus;
  verfasstVonId: string | null;
  verfasstVon: string | null;
  geprueftVon: string | null;
  geprueftAm: Date | null;
  benutzerId: string;
  darfBearbeiten: boolean;
  darfFreigeben: boolean;
}) {
  const t = await getTranslations('verwaltung.koran');
  const eigen = !vierAugenErfuellt(verfasstVonId, benutzerId);
  const person = (name: string | null, id: string | null) => name ?? (id ? t('kontoFehlt') : null);
  const verfasser = person(verfasstVon, verfasstVonId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <StatusPille status={status} />
        <span className="text-16 text-tinte-2">{verfasser ? t('verfasstVon', { name: verfasser }) : t('verfasstUnbekannt')}</span>
        {status === 'geprueft' && geprueftAm ? (
          <span className="text-16 text-tinte-2">
            {t('geprueftVon', { name: geprueftVon ?? t('kontoFehlt'), datum: datumOhneWochentag(geprueftAm, 'de') })}
          </span>
        ) : null}
      </div>
      <FreigabeSchritte
        aktion={statusSetzen}
        art={art}
        kennung={kennung}
        status={status}
        eigen={eigen}
        darfBearbeiten={darfBearbeiten}
        darfFreigeben={darfFreigeben}
      />
    </div>
  );
}

/** Verlauf der Freigabe (jüngste zuerst). */
export async function VerlaufListe({ eintraege }: { eintraege: VerlaufEintrag[] }) {
  const t = await getTranslations('verwaltung.koran');
  if (!eintraege.length) return <p className="text-16 text-tinte-2">{t('verlauf.leer')}</p>;
  return (
    <ol className="flex flex-col gap-2 text-16">
      {eintraege.map((e, i) => (
        <li key={i} className="flex flex-col border-l-2 border-linie pl-3">
          <span>
            {t('verlauf.eintrag', {
              status: t(`status.${e.status}`),
              name: e.von ?? t('verlauf.ohneName'),
              datum: datumOhneWochentag(e.am, 'de'),
            })}
          </span>
          {e.kommentar ? <span className="text-tinte-2">{e.kommentar}</span> : null}
        </li>
      ))}
    </ol>
  );
}
