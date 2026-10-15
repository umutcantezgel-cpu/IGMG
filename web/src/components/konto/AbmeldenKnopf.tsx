import { LogOut } from 'lucide-react';
import { kontoAbmelden } from '@/server/actions/konto';

/** Abmelden als Formular (POST über die Server Action, CSRF-fest); funktioniert auch ohne JavaScript. */
export function AbmeldenKnopf({ sprache, text, variante = 'rand' }: { sprache: string; text: string; variante?: 'rand' | 'zeile' }) {
  return (
    <form action={kontoAbmelden}>
      <input type="hidden" name="sprache" value={sprache} />
      <button
        type="submit"
        className={
          variante === 'zeile'
            ? 'flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-18 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:bg-sand'
            : 'inline-flex min-h-12 druck cursor-pointer items-center justify-center gap-2 rounded-md border border-rand bg-weiss px-5 text-18 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:bg-sand'
        }
      >
        <LogOut aria-hidden className="size-5" />
        {text}
      </button>
    </form>
  );
}
