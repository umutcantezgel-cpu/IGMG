import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { PruefOberflaeche, type PruefEintrag } from '@/components/verwaltung/lernapp/Pruefoberflaeche';
import { SprachWahl } from '@/components/verwaltung/lernapp/SprachWahl';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { richtung, type Sprache, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { buendelAdresse } from '@/lib/lernapp/paket/buendel';
import { pruefTexte, pruefUi, rohPruefTexte } from '@/lib/lernapp/verwaltung/pruefung-texte';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { darfSprachePruefen } from '@/lib/rechte/matrix';
import { ladePruefSprachen, ladeStichprobeKopf, ladeStichprobenEintraege } from '@/server/queries/lernapp/sprachpruefung';

/**
 * Verwaltung › Lern-App › Sprachprüfung › Stichprobe (L3-06, ADR 0041 Nr. 4/5/10): Einträge der Stichprobe nacheinander
 * beurteilen – Urteil, Fehlerkategorie, Korrekturvorschlag, Kommentar; Tastenkürzel. Nur in den eigenen Prüfsprachen.
 * Sind alle Einträge beurteilt, entscheidet die Annahmeregel (bestanden: Einträge der Einheit veröffentlicht).
 */
export default async function Stichprobe({ params, searchParams }: PageProps<'/[locale]/verwaltung/lernapp/sprachpruefung/[stichprobe]'>) {
  const a = await verlangeLernappSeite('lernapp.sprache.pruefen');
  const ui = pruefUi((await searchParams).ui);
  const k = await ladeStichprobeKopf((await params).stichprobe);
  if (!k) notFound();
  if (!darfSprachePruefen(a.rollen, await ladePruefSprachen(a.benutzerId), k.sprache)) redirect('/verwaltung/kein-zugriff');
  const [eintraege, tg] = await Promise.all([ladeStichprobenEintraege(k), getTranslations('verwaltung.shell')]);
  const t = pruefTexte(ui);
  const roh = rohPruefTexte(ui);
  const uiAttr = { lang: ui, dir: richtung(ui) } as const;
  const sprachName = (s: string) => roh.sprachname[s as keyof typeof roh.sprachname] ?? s;
  const ziel = k.kurs as Sprache;
  const ausgang = k.richtungId ? zerlegeRichtung(k.richtungId).ausgang : null;
  const art = k.richtungId
    ? `${t(`art.${k.art}`)}: ${t('richtung', { ziel: sprachName(ziel), ausgang: sprachName(ausgang ?? ziel) })}`
    : t(`art.${k.art}`);
  const pruefEintraege: PruefEintrag[] = eintraege.map((e) => ({
    schluessel: e.schluessel,
    zielSprache: ziel,
    ausgangSprache: ausgang,
    text: e.text,
    uebersetzung: e.uebersetzung ?? null,
    clip: e.clip ? { adresse: buendelAdresse(ziel, e.clip.buendel), versatz: e.clip.versatz, laenge: e.clip.laenge } : null,
    fehlt: Boolean(e.fehlt),
    urteil: e.urteil ? { urteil: e.urteil.urteil, kategorie: e.urteil.kategorie } : null,
  }));
  const pfad = `/verwaltung/lernapp/sprachpruefung/${k.id}`;

  return (
    <>
      <NextLink
        href={`/verwaltung/lernapp/sprachpruefung?ui=${ui}`}
        {...uiAttr}
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
        {t('stichprobe.zurueck')}
      </NextLink>
      <VerwaltungsKopf
        kennung={tg('gruppe.inhalte')}
        titel={t('stichprobe.titel', { einheit: k.einheit })}
        titelLang={ui}
        einleitung={<span {...uiAttr}>{t('stichprobe.angaben', { art, sprache: sprachName(k.sprache), groesse: k.groesse })}</span>}
      />
      <SprachWahl ui={ui} pfad={pfad} />
      {k.einlauf ? <p {...uiAttr}>{t('stichprobe.einlauf')}</p> : null}
      {k.entscheidung !== 'offen' ? (
        <Meldung art={k.entscheidung === 'bestanden' ? 'erfolg' : 'info'}>
          <span {...uiAttr}>
            {t(`stichprobe.ergebnis.${k.entscheidung}`)}{' '}
            {k.ergebnis ? t('stichprobe.ergebnis.zahlen', { ...k.ergebnis }) : null}
          </span>
        </Meldung>
      ) : null}
      <PruefOberflaeche
        stichprobe={k.id}
        ui={ui}
        art={k.art}
        eintraege={pruefEintraege}
        offen={k.entscheidung === 'offen'}
        texte={{
          s: Object.fromEntries(Object.entries(roh.stichprobe).filter(([, v]) => typeof v === 'string')) as Record<string, string>,
          urteile: roh.stichprobe.urteile,
          kategorien: roh.stichprobe.kategorien,
          tasten: roh.stichprobe.tasten,
          fehler: roh.fehler,
        }}
      />
    </>
  );
}
