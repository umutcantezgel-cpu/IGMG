import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Stern8 } from './Icons';

/**
 * Seitenkopf (design/PageHeader.dc.html): Kennung mit Stern, Titel (h1), Untertitel; optional Logo und
 * Akzentband (Organisationen, D-06). Fläche Sand oder Organisations-Tönung.
 */
export function PageHeader({
  titel,
  untertitel,
  kennung,
  logo,
  logoAlt = '',
  akzent,
  flaeche = 'bg-sand',
  kennungFarbe = 'text-gruen-800',
  kinder,
}: {
  titel: string;
  untertitel?: string;
  kennung?: string;
  logo?: string;
  logoAlt?: string;
  akzent?: string;
  flaeche?: string;
  kennungFarbe?: string;
  kinder?: ReactNode;
}) {
  return (
    <section className={cn('border-b border-linie', flaeche)}>
      <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-start gap-6 px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14">
        {logo ? (
          <span className={cn('flex shrink-0 rounded-lg border-2 bg-weiss p-2', akzent)}>
            <Image src={logo} alt={logoAlt} width={40} height={40} className="size-10" />
          </span>
        ) : null}
        <div className="flex max-w-[880px] min-w-0 flex-[1_1_480px] flex-col gap-3">
          {kennung ? (
            <span className={cn('inline-flex items-center gap-2 text-16 font-bold', kennungFarbe)}>
              <Stern8 />
              <span>{kennung}</span>
            </span>
          ) : null}
          <h1 className="text-36 leading-[1.15] text-pretty md:text-48">{titel}</h1>
          {untertitel ? <p className="max-w-[62ch] text-20 leading-[1.55] text-pretty text-tinte-2">{untertitel}</p> : null}
          {kinder}
        </div>
      </div>
      {akzent ? <div aria-hidden className={cn('h-1.5', akzent.replace('border-', 'bg-'))} /> : null}
    </section>
  );
}
