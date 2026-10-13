import { and, eq, gt, isNull } from 'drizzle-orm';
import { Eye } from 'lucide-react';
import type { Metadata } from 'next';
import NextLink from 'next/link';
import { connection } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { FreieSeiteInhalt } from '@/components/website/bloecke/FreieSeiteInhalt';
import { hashVonToken, TOKEN_MUSTER } from '@/lib/cms/vorschau';
import { db, schema } from '@/lib/db';
import { cn } from '@/lib/utils';
import { seiteMitMedien } from '@/server/queries/seiten';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('verwaltung.seiten.vorschau');
  return { title: t('titel'), robots: { index: false, follow: false } };
}

const SPRACHEN = ['de', 'tr', 'en'] as const;
const zeit = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });

/**
 * Signierte Vorschau einer freien Seite (ADR 0032): ohne Anmeldung, nur mit gültigem Token (Hash in `vorschau_token`,
 * 24 Stunden). Je Anfrage gerendert (Verwaltungs-Layout mit `connection()`), noindex und `no-store` über den Proxy.
 * Zeigt den gespeicherten Stand – auch Entwürfe – in der gewählten Sprache.
 */
export default async function SeitenVorschau({ params, searchParams }: PageProps<'/[locale]/verwaltung/vorschau/[token]'>) {
  const [{ token }, sp] = await Promise.all([params, searchParams]);
  const sprache = SPRACHEN.find((s) => s === sp.sprache) ?? 'de';
  const t = await getTranslations('verwaltung.seiten');
  // Je Anfrage: Ablaufzeit gegen die aktuelle Uhrzeit prüfen
  await connection();
  const jetzt = new Date();
  const [eintrag] = TOKEN_MUSTER.test(token)
    ? await db
        .select()
        .from(schema.vorschauToken)
        .where(and(eq(schema.vorschauToken.tokenHash, hashVonToken(token)), gt(schema.vorschauToken.laeuftAb, jetzt)))
        .limit(1)
    : [];
  const [zeile] =
    eintrag?.inhaltTyp === 'seite'
      ? await db
          .select()
          .from(schema.seite)
          .where(and(eq(schema.seite.id, eintrag.inhaltId), isNull(schema.seite.imPapierkorbSeit)))
          .limit(1)
      : [];
  if (!eintrag || !zeile)
    return (
      <main id="inhalt" className="mx-auto flex max-w-einleitung flex-col gap-4 px-4 py-16">
        <h1 className="text-display-2">{t('vorschau.abgelaufenTitel')}</h1>
        <p className="text-18">{t('vorschau.abgelaufen')}</p>
        <NextLink href="/verwaltung" className="inline-flex min-h-12 items-center self-start font-bold underline underline-offset-4">
          {t('vorschau.zurVerwaltung')}
        </NextLink>
      </main>
    );
  const seite = await seiteMitMedien(zeile);
  return (
    <div lang={sprache}>
      <div role="status" className="sticky top-0 z-(--ebene-kopf) border-b border-info bg-info-toenung text-info">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-8">
          <p lang="de" className="flex items-center gap-2 font-bold">
            <Eye aria-hidden className="size-5 shrink-0" />
            {t('vorschau.banner', { status: t(`status.${zeile.status}`), zeit: zeit.format(eintrag.laeuftAb) })}
          </p>
          <nav aria-label={t('vorschau.spracheWaehlen')} lang="de">
            <ul className="flex gap-1">
              {SPRACHEN.map((s) => (
                <li key={s}>
                  <NextLink
                    href={`/verwaltung/vorschau/${token}${s === 'de' ? '' : `?sprache=${s}`}`}
                    aria-current={s === sprache ? 'true' : undefined}
                    className={cn(
                      'inline-flex min-h-12 min-w-12 items-center justify-center rounded-md px-3 font-bold no-underline',
                      s === sprache ? 'bg-info text-weiss hover:text-weiss' : 'text-info hover:bg-weiss',
                    )}
                  >
                    {s.toUpperCase()}
                  </NextLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <main id="inhalt" className="bg-papier">
        <FreieSeiteInhalt seite={seite} sprache={sprache} />
      </main>
    </div>
  );
}
