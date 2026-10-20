import { LogOut } from 'lucide-react';
import type { Metadata } from 'next';
import { AnmeldeFormulare } from '@/components/lernapp/anmelden/AnmeldeFormulare';
import { LernMeldung } from '@/components/lernapp/anmelden/Felder';
import { ZweiFaktorFormular } from '@/components/lernapp/anmelden/ZweiFaktorFormular';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { pfadFuer } from '@/i18n/navigation';
import { sichererRuecksprung } from '@/lib/konto/regeln';
import { verlangeKontenSeite } from '@/lib/konto/zugang';
import { lernAdresse, oberflaecheVon } from '@/lib/lernapp/adressen';
import { oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';
import { ladeKonto } from '@/lib/rechte/gemeinde';
import { kontoAbmelden } from '@/server/actions/konto';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return { title: lernTexte(ui)('anmelden.titel'), robots: { index: false, follow: false } };
}

/**
 * Anmeldung im Scope der Lern-App (ADR 0037 Nr. 4, O-7; installierte iOS-PWAs haben eine eigene Cookie-Ablage):
 * E-Mail + Passwort, Benutzername (Kinderzugang), Passkey, danach ggf. der zweite Faktor (`?schritt=zwei-faktor`).
 * Die Server Actions der Konten prüfen Schalter, Ratenbegrenzung und Faktor; `weiter` führt zurück in die Lern-App
 * (geprüft, nur Lern-App-Pfade, Standard: Start der Oberfläche). Angemeldet: Hinweis, weiter oder abmelden.
 * Schalter `lernapp` oder `konten` aus → 404 (sicher aus über die Umgebung schon im Proxy).
 */
export default async function LernAppAnmelden({ searchParams }: PageProps<'/lern-app/[ui]/anmelden'>) {
  await verlangeLernApp();
  await verlangeKontenSeite();
  const ui = await oberflaeche();
  const s = await searchParams;
  const geprueft = sichererRuecksprung(s.weiter);
  const weiter = geprueft && oberflaecheVon(geprueft) ? geprueft : lernAdresse(ui);
  const t = lernTexte(ui);
  const texte = rohTexte(ui, 'anmelden');
  const website = ui === 'tr' ? 'tr' : 'de';
  const k = await ladeKonto();

  if (k) {
    return (
      <Rahmen ui={ui} bereich={null} pfad="anmelden">
        <Seitenkopf titel={t('anmelden.angemeldet')} einleitung={t('anmelden.angemeldetAls', { name: k.anzeigename })} />
        <div className="flex max-w-(--container-dialog) flex-wrap gap-3">
          <a
            href={weiter}
            className="inline-flex min-h-12 items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss"
          >
            {t('anmelden.weiter')}
          </a>
          <form action={kontoAbmelden}>
            <input type="hidden" name="weiter" value={weiter} />
            <button
              type="submit"
              className="inline-flex min-h-12 druck cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-6 font-bold hover:bg-sand"
            >
              <LogOut aria-hidden className="size-5 shrink-0 rtl:-scale-x-100" />
              {t('anmelden.abmelden')}
            </button>
          </form>
        </div>
      </Rahmen>
    );
  }

  const zweiFaktor = s.schritt === 'zwei-faktor';
  const neuAnmelden = `${lernAdresse(ui, 'anmelden')}?${new URLSearchParams({ weiter })}`;
  return (
    <Rahmen ui={ui} bereich={null} pfad="anmelden">
      <Seitenkopf
        titel={zweiFaktor ? t('anmelden.zweiFaktorTitel') : t('anmelden.titel')}
        einleitung={zweiFaktor ? t('anmelden.zweiFaktorText') : t('anmelden.einleitung')}
      />
      <div className="flex max-w-(--container-dialog) flex-col gap-6 rounded-lg border border-linie bg-weiss p-5 md:p-8">
        {s.hinweis === 'abgemeldet' ? (
          <LernMeldung id="anmelden-hinweis" art="info">
            {t('anmelden.abgemeldet')}
          </LernMeldung>
        ) : null}
        {zweiFaktor ? (
          <ZweiFaktorFormular weiter={weiter} neuAnmelden={neuAnmelden} texte={texte} />
        ) : (
          <>
            <AnmeldeFormulare weiter={weiter} texte={texte} startReiter={s.zugang === 'kind' ? 'kind' : 'email'} />
            <div className="flex flex-col gap-1 border-t border-linie pt-5">
              <a
                href={pfadFuer('/passwort-vergessen', website)}
                hrefLang={website}
                className="inline-flex min-h-11 items-center self-start font-bold"
              >
                {t('anmelden.passwortVergessen')}
              </a>
              <p className="text-16 text-tinte-2">{t('anmelden.keinKonto')}</p>
              <a
                href={pfadFuer('/registrieren', website)}
                hrefLang={website}
                className="inline-flex min-h-11 items-center self-start font-bold"
              >
                {t('anmelden.registrieren')}
              </a>
            </div>
          </>
        )}
      </div>
    </Rahmen>
  );
}
