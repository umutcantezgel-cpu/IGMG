import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { Seitenkopf } from './Seitenkopf';

/**
 * Seitenkopf (design/PageHeader.dc.html): Kennung mit Stern, Titel (h1), Untertitel; optional Logo und
 * Akzentband (Organisationen, D-06). Fläche Sand oder Organisations-Tönung. Nur in Server-Komponenten verwenden –
 * Client-Komponenten nehmen `Seitenkopf` (ohne Bildkomponente). Die Zusatzangaben (`oben`, Titel- und Untertitel-
 * Sprache, Morph-Name des Titels) reicht er an `Seitenkopf` weiter.
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
  zierde,
  kinder,
  oben,
  bild,
  kennungZeichen,
  titelId,
  titelLang,
  titelStil,
  untertitelLang,
}: {
  titel: string;
  untertitel?: string;
  kennung?: string;
  logo?: string;
  logoAlt?: string;
  akzent?: string;
  flaeche?: string;
  kennungFarbe?: string;
  /** Grafik rechts neben dem Text (dekorativ) */
  zierde?: ReactNode;
  kinder?: ReactNode;
  /** Zeile vor der Kennung, z. B. Rückweg zur Liste */
  oben?: ReactNode;
  /** Kopfbild (H-C02), siehe `Seitenkopf` */
  bild?: ReactNode;
  /** Zeichen vor der Kennung (Vorgabe Achtstern), siehe `Seitenkopf` */
  kennungZeichen?: ReactNode;
  titelId?: string;
  titelLang?: string;
  titelStil?: CSSProperties;
  untertitelLang?: string;
}) {
  return (
    <Seitenkopf
      titel={titel}
      untertitel={untertitel}
      kennung={kennung}
      kennungFarbe={kennungFarbe}
      flaeche={flaeche}
      kinder={kinder}
      zierde={zierde}
      oben={oben}
      bild={bild}
      kennungZeichen={kennungZeichen}
      titelId={titelId}
      titelLang={titelLang}
      titelStil={titelStil}
      untertitelLang={untertitelLang}
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
