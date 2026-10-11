import { getTranslations } from 'next-intl/server';
import { PostfachRahmen } from '@/components/verwaltung/postfach/PostfachRahmen';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { ladeUnterhaltungen } from '@/server/queries/verwaltung/postfach';

/** Verwaltung › Nachrichten (internes Postfach, V09): Liste der eigenen Unterhaltungen, rechts der Leerzustand. */
export default async function PostfachStart() {
  const a = await verlangeSeitenRecht('postfach.nutzen');
  const [t, liste] = await Promise.all([getTranslations('verwaltung.postfach'), ladeUnterhaltungen(a.benutzerId)]);
  return (
    <PostfachRahmen liste={liste}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <h2 className="text-24">{t('leerVerlaufTitel')}</h2>
        <p className="text-tinte-2">{t('leerVerlaufText')}</p>
      </div>
    </PostfachRahmen>
  );
}
