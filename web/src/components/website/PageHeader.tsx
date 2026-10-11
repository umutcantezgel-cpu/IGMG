import Image from 'next/image';
import type { ReactNode } from 'react';
import { Seitenkopf } from './Seitenkopf';

/**
 * Seitenkopf (design/PageHeader.dc.html): Kennung mit Stern, Titel (h1), Untertitel; optional Logo und
 * Akzentband (Organisationen, D-06). Fläche Sand oder Organisations-Tönung. Nur in Server-Komponenten verwenden –
 * Client-Komponenten nehmen `Seitenkopf` (ohne Bildkomponente).
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
    <Seitenkopf
      titel={titel}
      untertitel={untertitel}
      kennung={kennung}
      kennungFarbe={kennungFarbe}
      flaeche={flaeche}
      kinder={kinder}
      vorn={
        logo ? (
          <span className={`flex shrink-0 rounded-lg border-2 bg-weiss p-2 ${akzent ?? ''}`}>
            <Image src={logo} alt={logoAlt} width={40} height={40} className="size-10" />
          </span>
        ) : null
      }
      hinten={akzent ? <div aria-hidden className={`h-1.5 ${akzent.replace('border-', 'bg-')}`} /> : null}
    />
  );
}
