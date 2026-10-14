import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { ChatFenster, type ChatTexte } from '@/components/chat/ChatFenster';
import { KNOPF_SEKUNDAER, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import type { BereichSchluessel } from '@/components/mein-bereich/eintraege';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { kanaeleDerGruppe, ladeKanal, schreibLage } from '@/lib/chat/dienst';
import { echtzeitAusUmgebung } from '@/lib/echtzeit/konfig';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { kanaeleFuer, kanalWahl, localeFuer, type KanalArt } from '@/lib/lernen/ansicht';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { cn } from '@/lib/utils';
import { eigeneEinwilligungen, gruppeAnsicht } from '@/server/queries/mein-bereich/gruppe';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('gruppenSeite');
  return { title: t('chatTitel') };
}

type Uebersetzer = Awaited<ReturnType<typeof getTranslations>>;

/** Texte der Chat-Insel (kein next-intl im Browser): Kinder in Du-Form, Erwachsene in Sie-Form (`chatFenster.sie`). */
function chatTexte(t: Uebersetzer, art: KanalArt, sie: boolean, chatVon: string): ChatTexte {
  const w = (s: string) => (sie && t.has(`chatFenster.sie.${s}`) ? t(`chatFenster.sie.${s}`) : t(`chatFenster.${s}`));
  const gruende = [
    'keinRecht',
    'kanalAus',
    'notfallpause',
    'pausiert',
    'zuWenigeErwachsene',
    'geschlossen',
    'nurLehrkraft',
    'stumm',
    'einwilligungFehlt',
    'zuJung',
    'regelnFehlen',
    'leer',
    'zuLang',
    'rate',
  ] as const;
  // Je Regel Stichwort und (einklappbare) Erläuterung, GC-4
  const regeln = t.raw(sie ? 'chatRegeln.erwachsen.regeln' : 'chatRegeln.regeln') as Record<string, ChatTexte['regeln'][number]>;
  return {
    titel: t(art === 'gruppe' ? 'chatFenster.titelGruppe' : 'chatFenster.titelEltern'),
    leer: w('leer'),
    laedt: w('laedt'),
    eingabe: w('eingabe'),
    eingabeGesperrt: w('eingabeGesperrt'),
    eingabeRegeln: w('eingabeRegeln'),
    wiederAb: t('chatFenster.wiederAb', { von: chatVon }),
    senden: w('senden'),
    zeichen: t.raw('chatFenster.zeichen') as string,
    entfernt: w('entfernt'),
    lehrkraft: w('lehrkraft'),
    du: w('du'),
    melden: w('melden'),
    meldenAria: t.raw('chatFenster.meldenAria') as string,
    meldenTitel: w('meldenTitel'),
    meldenGrund: w('meldenGrund'),
    meldenGrundFehlt: w('meldenGrundFehlt'),
    gruende: {
      beleidigung: t('chatFenster.gruende.beleidigung'),
      bedrohung: t('chatFenster.gruende.bedrohung'),
      unangemessen: t('chatFenster.gruende.unangemessen'),
      spam: t('chatFenster.gruende.spam'),
      sonstiges: t('chatFenster.gruende.sonstiges'),
    },
    meldenFreitext: w('meldenFreitext'),
    meldenSenden: w('meldenSenden'),
    abbrechen: w('abbrechen'),
    gemeldet: w('gemeldet'),
    hilfe: w('hilfe'),
    hilfeNummer: w('hilfeNummer'),
    grund: Object.fromEntries(gruende.map((g) => [g, w(`grund.${g}`)])),
    fehler: w('fehler'),
    regelnTitel: w('regelnTitel'),
    regeln: Object.values(regeln),
    regelnBestaetigen: w('regelnBestaetigen'),
    moderation: {
      entfernen: t('chatFenster.moderation.entfernen'),
      stumm: t('chatFenster.moderation.stumm'),
      pausieren: t('chatFenster.moderation.pausieren'),
      fortsetzen: t('chatFenster.moderation.fortsetzen'),
      begruendung: t('chatFenster.moderation.begruendung'),
    },
  };
}

/**
 * Gruppenchat bzw. Elternkanal (H-C01, S-01…S-18): Schüler und Leitung im Gruppenkanal, Eltern und Leitung im Elternkanal
 * (`?kanal=eltern`). Nur über Gruppenrechte – nie über eine Verwaltungsrolle (ADR 0026). Kinder unter 16 ohne
 * Einwilligung der Eltern (und ab 16 ohne eigene, D-11) sehen statt des Chats nur einen freundlichen Hinweis.
 */
export default async function ChatSeite({ params, searchParams }: PageProps<'/[locale]/mein-bereich/gruppen/[id]/chat'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform')) || !(await funktionAn('chat'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache);
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const heute = berlinerDatum(new Date());
  const g = await gruppeAnsicht(id, kontext, heute);
  if (!g) notFound();
  const erlaubt = kanaeleFuer(kontext, g.id);
  const wahl = kanalWahl(erlaubt, sp.kanal);
  if (!wahl) notFound();
  const kanalIds = await kanaeleDerGruppe(g.id);
  const kanal = await ladeKanal(kanalIds[wahl]);
  if (!kanal) notFound();
  const [lage, t, ts, eigene] = await Promise.all([
    schreibLage(kanal, kontext),
    getTranslations(),
    getTranslations('gruppenSeite'),
    eigeneEinwilligungen(kontext, heute),
  ]);
  const tu = await getTranslations('unterricht');

  const leitung = kontext.leitung.has(g.id);
  const schueler = wahl === 'gruppe' && !leitung && kontext.eigeneLernendeId !== null;
  const sie = !schueler;
  const name = text(g.name, sprache);
  const aktuell: BereichSchluessel = leitung && k.gemeindeRollen.includes('lehrkraft') ? 'unterricht' : schueler ? 'gruppe' : 'kinder';

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell={aktuell}
      titel={ts(`kanal.${wahl}`)}
      untertitel={name}
      sprachZiel={{
        pathname: '/mein-bereich/gruppen/[id]/chat',
        params: { id: g.id },
        ...(wahl === 'eltern' ? { query: { kanal: wahl } } : {}),
      }}
      zwischen={[{ label: tu('meta.gruppe'), ziel: { pathname: '/mein-bereich/gruppen/[id]', params: { id: g.id } } }]}
    >
      <ZurueckLink ziel={{ pathname: '/mein-bereich/gruppen/[id]', params: { id: g.id } }} text={ts('zurGruppe')} />
      {erlaubt.length > 1 ? (
        <nav aria-label={ts('kanaeleLabel')}>
          <ul className="flex flex-wrap gap-2">
            {erlaubt.map((art) => (
              <li key={art}>
                <Link
                  href={{
                    pathname: '/mein-bereich/gruppen/[id]/chat',
                    params: { id: g.id },
                    ...(art === 'eltern' ? { query: { kanal: art } } : {}),
                  }}
                  prefetch={false}
                  aria-current={art === wahl ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-12 items-center rounded-pill border px-5 font-bold no-underline transition duration-(--dauer-rueckmeldung)',
                    art === wahl
                      ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss'
                      : 'border-rand bg-weiss text-tinte hover:border-gruen-700 hover:text-gruen-800',
                  )}
                >
                  {ts(`kanal.${art}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {lage === 'einwilligungFehlt' && !leitung ? (
        <section
          aria-labelledby="freigabe-titel"
          className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-6 md:flex-row md:p-8"
        >
          <Zustandsgrafik art="leer" groesse={72} />
          <div className="flex max-w-text flex-col gap-3">
            <h2 id="freigabe-titel" className="text-24">
              {ts('du.einwilligungTitel')}
            </h2>
            <p className="text-18 text-pretty">{eigene ? ts('du.einwilligungSelbst') : ts('du.einwilligungText')}</p>
            {eigene ? (
              <Link
                href={{ pathname: '/mein-bereich', hash: 'einwilligungen' }}
                prefetch={false}
                className={cn(KNOPF_SEKUNDAER, 'self-start')}
              >
                {ts('du.zuEinwilligungen')}
              </Link>
            ) : null}
          </div>
        </section>
      ) : (
        <ChatFenster
          kanalId={kanal.kanalId}
          texte={chatTexte(t, wahl, sie, g.chatVon)}
          istLeitung={leitung}
          zeitformat={localeFuer(sprache)}
          echtzeit={echtzeitAusUmgebung() !== null && (await funktionAn('echtzeit'))}
        />
      )}

      <aside aria-label={t('chatRegeln.titel')} className="flex flex-col gap-2 rounded-lg bg-sand px-5 py-4 text-16 text-tinte-2">
        {/* GC-11: Symbol an der ersten Zeile, schrumpft beim Umbruch nicht */}
        <p className="flex items-start gap-2 font-bold text-tinte">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
          {ts('oeffnungszeiten', { von: g.chatVon, bis: g.chatBis })}
        </p>
        <p>{ts(`${sie ? 'sie' : 'du'}.datenschutz`)}</p>
      </aside>
    </MeinBereichRahmen>
  );
}
