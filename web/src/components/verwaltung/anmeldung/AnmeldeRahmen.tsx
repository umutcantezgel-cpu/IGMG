import Image from 'next/image';
import type { ReactNode } from 'react';

/** Rahmen der Anmeldeseiten: zentrierte Karte nach LoginDialog.dc.html (weiß, Linie, Radius 12, Schatten S1). */
export function AnmeldeRahmen({ titel, untertitel, children }: { titel: string; untertitel?: string; children: ReactNode }) {
  return (
    <main id="inhalt" className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-center px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="rounded-sm" />
        <span className="font-display text-20 font-semibold">IGMG Wetzlar</span>
      </div>
      <div className="rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:p-8">
        <h1 className="text-30">{titel}</h1>
        {untertitel ? <p className="mt-2 text-tinte-2">{untertitel}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
