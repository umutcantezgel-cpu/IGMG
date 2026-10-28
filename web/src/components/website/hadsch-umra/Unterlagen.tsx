import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { waehle } from '@/lib/i18n/inhalt';
import type { HadschUmraInhalt } from '@/lib/validierung/seiteninhalte/hadsch-umra';
import { ZielLink } from './ZielLink';

/**
 * Unterlagen zum Herunterladen (Plan Marktstart P4): Liste im Stil der Verweisliste – je Eintrag ein Link zur Seite bei
 * IGMG Reisen bzw. der IGMG (mit Sprachhinweis zur Zielseite) und darunter die Sprache der Unterlagen und die Ausgabe.
 * Nur Links, keine Dateien von fremden Hosts beim Aufruf (K-14). Server-Komponente.
 */
export async function Unterlagen({ unterlagen, sprache }: { unterlagen: HadschUmraInhalt['unterlagen']; sprache: Locale }) {
  const t = await getTranslations({ locale: sprache, namespace: 'hadschUmra.unterlagen' });
  return (
    <ul className="flex flex-col">
      {unterlagen.map((u, i) => {
        const titel = waehle(u.titel, sprache);
        const angaben = [t(`sprache.${u.sprache}`), u.jahr ? t('jahr', { jahr: u.jahr }) : null].filter(Boolean).join(' · ');
        return (
          <li key={i} className="flex min-w-0 flex-col border-t border-linie py-2">
            <ZielLink ziel={u.url} sprache={sprache} text={titel.text} textLang={titel.rueckfall ? 'de' : undefined} />
            <p className="max-w-text text-16 text-tinte-2">{angaben}</p>
          </li>
        );
      })}
    </ul>
  );
}
