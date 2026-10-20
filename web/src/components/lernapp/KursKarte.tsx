import { ArrowRight } from 'lucide-react';
import { LernStern } from './Zeichen';

/**
 * Karte eines Kurses in der Kurswahl: Titel als Link über die ganze Karte, darunter die Ausgangssprache bzw. eine kurze
 * Beschreibung und die Stufen. `eigenname` zeigt die Zielsprache in ihrer eigenen Sprache und Schrift (mit `lang` und
 * `dir`; ein Block mit eigener Richtung ist isoliert). `hinweis` (z. B. „Inhalt auf Deutsch“) steht als Plakette.
 */
export function KursKarte({
  adresse,
  titel,
  text,
  stufen,
  eigenname,
  hinweis,
}: {
  adresse: string;
  titel: string;
  text: string;
  stufen: string;
  eigenname?: { text: string; lang: string; dir: 'ltr' | 'rtl' };
  hinweis?: { text: string; lang?: string };
}) {
  return (
    <li className="group relative flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5 shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-24 leading-ueberschrift">
          <a href={adresse} className="text-tinte no-underline group-hover:text-gruen-800 after:absolute after:inset-0 after:rounded-lg">
            {titel}
          </a>
        </h3>
        <LernStern linie className="mt-1 size-7 shrink-0 text-gruen-700" />
      </div>
      {eigenname ? (
        <p lang={eigenname.lang} dir={eigenname.dir} className="self-start text-20 text-gruen-800">
          {eigenname.text}
        </p>
      ) : null}
      <p className="text-16 text-pretty text-tinte-2">{text}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
        <span className="text-16 text-tinte-2">{stufen}</span>
        {hinweis ? (
          <span lang={hinweis.lang} className="rounded-pill bg-sand px-3 py-1 text-16 font-bold text-tinte-2">
            {hinweis.text}
          </span>
        ) : null}
        <ArrowRight aria-hidden className="ms-auto size-5 shrink-0 text-gruen-700 rtl:rotate-180" />
      </div>
    </li>
  );
}
