import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { LeerHinweis, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { AnwesenheitErfassen, type AnwesenheitsTexte } from '@/components/unterricht/AnwesenheitErfassen';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText, zeitspanne } from '@/lib/lernen/ansicht';
import { anwesenheitsListe, KeinGruppenRecht } from '@/lib/lernen/dienst';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { gruppeFuerLeitung, terminDerGruppe } from '@/server/queries/mein-bereich/unterricht';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('anwesenheit') };
}

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Lehrkraft › Anwesenheit (B-23): ein Bildschirm mit großen Schaltern je Kind; Abmeldungen der Eltern sind als
 * „entschuldigt“ vorbelegt (`anwesenheitsListe`). Nur Leitung der Gruppe; Termin und Gruppe der Adresse müssen
 * zusammengehören, sonst 404.
 */
export default async function AnwesenheitSeite({ params }: PageProps<'/[locale]/mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]'>) {
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['lehrkraft']);
  const { gruppe: gruppeId, termin: terminId } = await params;
  if (!UUID.test(gruppeId) || !UUID.test(terminId)) notFound();
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const [g, termin, t] = await Promise.all([
    gruppeFuerLeitung(gruppeId, kontext, berlinerDatum(new Date())),
    terminDerGruppe(gruppeId, terminId),
    getTranslations('unterricht'),
  ]);
  if (!g || !termin) notFound();
  const liste = await anwesenheitsListe(terminId, kontext).catch((e: unknown) => {
    if (e instanceof KeinGruppenRecht) return null;
    throw e;
  });
  if (!liste) notFound();
  const name = text(g.name, sprache);
  const datum = [datumText(termin.datum, sprache, 'tag'), zeitspanne(termin.beginn, termin.ende)].filter(Boolean).join(', ');
  const ta = (s: string) => t(`anwesenheit.erfassen.${s}`);
  const texte: AnwesenheitsTexte = {
    titel: ta('titel'),
    status: { anwesend: ta('status.anwesend'), verspaetet: ta('status.verspaetet'), entschuldigt: ta('status.entschuldigt'), fehlt: ta('status.fehlt') },
    fehlmeldung: ta('fehlmeldung'),
    speichern: ta('speichern'),
    gespeichert: ta('gespeichert'),
    fehler: ta('fehler'),
    alleAnwesend: ta('alleAnwesend'),
    // Platzhalter füllt die Insel selbst
    zaehler: t.raw('anwesenheit.erfassen.zaehler') as string,
  };

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="unterricht"
      titel={t('anwesenheit.titel')}
      untertitel={t('anwesenheit.untertitel', { gruppe: name, datum })}
      sprachZiel={{ pathname: '/mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]', params: { gruppe: gruppeId, termin: terminId } }}
      zwischen={[
        { label: t('titel'), ziel: '/mein-bereich/unterricht' },
        { label: name, ziel: { pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } } },
      ]}
    >
      <ZurueckLink ziel={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } }} text={t('anwesenheit.zurueck')} />
      {termin.ausgefallen ? <Meldung art="info">{t('anwesenheit.ausgefallen')}</Meldung> : null}
      {liste.zeilen.length ? (
        <AnwesenheitErfassen
          terminId={terminId}
          zeilen={liste.zeilen.map(({ lernendeId, name: n, status, fehlmeldung }) => ({ lernendeId, name: n, status, fehlmeldung }))}
          texte={texte}
        />
      ) : (
        <LeerHinweis text={t('anwesenheit.leer')} rahmen />
      )}
    </MeinBereichRahmen>
  );
}
