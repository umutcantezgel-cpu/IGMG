import { ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { sprachHinweis } from '@/components/website/dachverband/DachverbandKarte';
import type { Locale } from '@/i18n/routing';
import { zielFuer } from '@/lib/hadsch-umra/auswahl';
import { cn } from '@/lib/utils';
import type { HadschUmraZiel } from '@/lib/validierung/seiteninhalte/hadsch-umra';

/** Externer Textlink (Klickziel 48 px, Unterstreichung wie Verweisliste und Dachverband-Karte). */
const LINK =
  'inline-flex min-h-12 flex-wrap items-center gap-x-2 self-start font-bold text-gruen-700 underline underline-offset-4 transition duration-(--dauer-rueckmeldung) hover:decoration-2';

/**
 * Link zu IGMG Reisen oder zur IGMG (Plan Marktstart P4, K-14): nur ein Link, keine Anfrage beim Aufruf. Die Zielsprache
 * steht in `hrefLang`; weicht sie von der Seite ab, steht der Hinweis sichtbar daneben („(auf Deutsch)“, „(auf Türkisch)“,
 * „(auf Englisch)“).
 * Linkname mit Kontext nach MUSTER §4: sichtbarer Text vorn, dann `kontext` (z. B. der Titel des Programms) oder
 * „externe Seite“. Server-Komponente ohne Client-JavaScript (K-12).
 */
export async function ZielLink({
  ziel,
  sprache,
  text,
  textLang,
  kontext,
  className,
}: {
  ziel: HadschUmraZiel;
  sprache: Locale;
  /** Sichtbarer Linktext */
  text: string;
  /** Sprache des Linktexts, wenn er auf Deutsch zurückfällt (gepflegter Inhalt ohne Übersetzung, K-02) */
  textLang?: 'de';
  /** Kontext für Hilfstechnik, wenn mehrere gleich beschriftete Links auf der Seite stehen */
  kontext?: string;
  className?: string;
}) {
  const t = await getTranslations({ locale: sprache, namespace: 'dachverband' });
  const link = zielFuer(ziel, sprache);
  const hinweis = sprachHinweis(
    { aufDeutsch: t('aufDeutsch'), aufTuerkisch: t('aufTuerkisch'), aufEnglisch: t('aufEnglisch') },
    link.zielSprache,
    sprache,
  );
  const sichtbar = hinweis ? `${text} ${hinweis}` : text;
  return (
    <a
      href={link.href}
      hrefLang={link.zielSprache}
      rel="noopener noreferrer"
      aria-label={`${sichtbar}: ${kontext ?? t('externeSeite')}`}
      className={cn(LINK, className)}
    >
      <span lang={textLang}>{text}</span>
      {hinweis ? <span className="font-normal text-tinte-2">{hinweis}</span> : null}
      <ExternalLink aria-hidden className="size-4 shrink-0" />
    </a>
  );
}
