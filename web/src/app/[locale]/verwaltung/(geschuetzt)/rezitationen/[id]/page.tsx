import { ArrowLeft, CircleCheck, CircleOff, ExternalLink, Star } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { AktionsKnopf, VereinbarungFormular } from '@/components/verwaltung/rezitationen/FreigabeFormulare';
import { RezitationsFormular } from '@/components/verwaltung/rezitationen/RezitationsFormular';
import { SurenRaster } from '@/components/verwaltung/rezitationen/SurenRaster';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { freigabeSetzen, rezitationAendern, standardSetzen, vereinbarungLoesen, vereinbarungSetzen } from '@/server/actions/rezitationen';
import { ladeRezitation, ladeVereinbarungsAuswahl } from '@/server/queries/verwaltung/rezitationen';

const KARTE = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 shadow-s1 md:p-6';

/**
 * Eine Rezitation (O-Q02, H-Q05, ADR 0029): Freigabe (Aktivieren/Standard nur mit Vereinbarung und `religioes.freigeben`),
 * Vereinbarung als PDF, Vollständigkeit, Suren-Raster in die Werkstatt und die Angaben.
 */
export default async function RezitationSeite({ params, searchParams }: PageProps<'/[locale]/verwaltung/rezitationen/[id]'>) {
  const a = await verlangeSeitenRecht('rezitation.bearbeiten');
  const { id } = await params;
  const { angelegt } = await searchParams;
  const [t, tg, r] = await Promise.all([
    getTranslations('verwaltung.rezitationen'),
    getTranslations('verwaltung.shell'),
    ladeRezitation(id),
  ]);
  const zurueck = (
    <NextLink
      href="/verwaltung/rezitationen"
      className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {t('zurueck')}
    </NextLink>
  );
  if (!r)
    return (
      <div className="flex flex-col gap-6">
        {zurueck}
        <ListenLeer text={t('fehler.nichtGefunden')} />
      </div>
    );
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const darfHochladen = darf(a.rollen, 'medium.hochladen');
  const auswahl = await ladeVereinbarungsAuswahl();
  const vereinbarung = r.vereinbarung && !r.vereinbarung.imPapierkorb ? r.vereinbarung : null;
  const suren = r.suren;
  const zaehle = (f: (s: (typeof suren)[number]) => boolean) => suren.filter(f).length;
  const stand = [
    { label: t('stand.audio'), wert: zaehle((s) => s.stufe !== 'leer') },
    { label: t('stand.verse'), wert: zaehle((s) => s.stufe === 'verse' || s.stufe === 'fertig') },
    { label: t('stand.woerter'), wert: zaehle((s) => s.stufe === 'fertig') },
  ];

  return (
    <div className="flex flex-col gap-8">
      {zurueck}
      <VerwaltungsKopf
        kennung={tg('gruppe.inhalte')}
        titel={r.name.de}
        einleitung={`${r.rezitator} · ${t(`art.${r.art}`)} · ${r.lizenz}`}
      />
      {angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section aria-labelledby="rz-freigabe" className={KARTE}>
          <h2 id="rz-freigabe" className="text-24 font-bold">
            {t('freigabe.titel')}
          </h2>
          <p className={r.aktiv ? 'flex items-start gap-2 font-bold text-gruen-800' : 'flex items-start gap-2 text-tinte-2'}>
            {r.aktiv ? (
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
            ) : (
              <CircleOff aria-hidden className="mt-0.5 size-5 shrink-0" />
            )}
            {r.aktiv ? t('freigabe.aktiv') : t('freigabe.inaktiv')}
          </p>
          {r.standard ? <p className="font-bold text-info">{t('freigabe.standard')}</p> : null}
          {r.aktiv ? (
            <AktionsKnopf
              aktion={freigabeSetzen}
              felder={{ id: r.id, an: '0' }}
              knopf={t('freigabe.deaktivieren')}
              erfolg={t('freigabe.gespeichert')}
              variante="outline"
            />
          ) : darfFreigeben && vereinbarung ? (
            <AktionsKnopf
              aktion={freigabeSetzen}
              felder={{ id: r.id, an: '1' }}
              knopf={t('freigabe.aktivieren')}
              erfolg={t('freigabe.gespeichert')}
            />
          ) : (
            <p className="text-16 text-tinte-2">{darfFreigeben ? t('freigabe.ohneVereinbarung') : t('freigabe.ohneRecht')}</p>
          )}
          {r.aktiv && !r.standard && darfFreigeben ? (
            <AktionsKnopf
              aktion={standardSetzen}
              felder={{ id: r.id }}
              knopf={t('freigabe.alsStandard')}
              erfolg={t('freigabe.gespeichert')}
              variante="secondary"
              icon={<Star aria-hidden />}
            />
          ) : null}
        </section>

        <section aria-labelledby="rz-vereinbarung" className={KARTE}>
          <h2 id="rz-vereinbarung" className="text-24 font-bold">
            {t('vereinbarung.titel')}
          </h2>
          <p className="text-16 text-tinte-2">{t('vereinbarung.einleitung')}</p>
          {r.vereinbarung?.imPapierkorb ? <Meldung art="fehler">{t('vereinbarung.imPapierkorb')}</Meldung> : null}
          {vereinbarung ? (
            <>
              <p className="font-bold">{t('vereinbarung.hinterlegt', { datei: vereinbarung.dateiname ?? vereinbarung.schluessel })}</p>
              <a
                href={`/medien/${vereinbarung.schluessel}`}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-4"
              >
                <ExternalLink aria-hidden className="size-5" />
                {t('vereinbarung.ansehen')}
              </a>
            </>
          ) : (
            <p className="font-bold text-fehler">{t('vereinbarung.fehlt')}</p>
          )}
          <VereinbarungFormular
            aktion={vereinbarungSetzen}
            id={r.id}
            darfHochladen={darfHochladen}
            auswahl={auswahl.map((m) => ({ id: m.id, titel: m.dateiname ? `${m.dateiname} – ${m.alt}` : m.alt }))}
          />
          {r.vereinbarung && !r.aktiv ? (
            <div className="flex flex-col gap-1 border-t border-linie pt-4">
              <AktionsKnopf
                aktion={vereinbarungLoesen}
                felder={{ id: r.id }}
                knopf={t('vereinbarung.loesen')}
                erfolg={t('vereinbarung.geloest')}
                variante="outline"
              />
              <p className="text-16 text-tinte-2">{t('vereinbarung.loesenHinweis')}</p>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="rz-stand" className={KARTE}>
          <h2 id="rz-stand" className="text-24 font-bold">
            {t('stand.titel')}
          </h2>
          <dl className="flex flex-col gap-4">
            {stand.map((s, i) => (
              <div key={s.label} className="flex flex-col gap-1">
                <dt id={`rz-stand-${i}`} className="text-16 text-tinte-2">
                  {s.label}
                </dt>
                <dd className="flex flex-col gap-1">
                  <span className="text-20 font-bold tabular-nums">{t('liste.zaehler', { anzahl: s.wert })}</span>
                  <progress max={114} value={s.wert} aria-labelledby={`rz-stand-${i}`} className="h-2 w-full accent-gruen-700" />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section aria-labelledby="rz-suren" className={KARTE}>
        <div className="flex flex-col gap-1">
          <h2 id="rz-suren" className="text-24 font-bold">
            {t('raster.titel')}
          </h2>
          <p className="max-w-text text-tinte-2">{t('raster.einleitung')}</p>
        </div>
        <SurenRaster id={r.id} suren={r.suren} />
      </section>

      <section aria-labelledby="rz-angaben" className={KARTE}>
        <h2 id="rz-angaben" className="text-24 font-bold">
          {t('formular.stammdaten')}
        </h2>
        <div className="max-w-text">
          <RezitationsFormular
            aktion={rezitationAendern}
            modus="bearbeiten"
            id={r.id}
            startwerte={{
              nameDe: r.name.de,
              nameTr: r.name.tr ?? '',
              nameEn: r.name.en ?? '',
              rezitator: r.rezitator,
              art: r.art,
              lizenz: r.lizenz,
              kennung: r.id,
            }}
          />
        </div>
      </section>
    </div>
  );
}
