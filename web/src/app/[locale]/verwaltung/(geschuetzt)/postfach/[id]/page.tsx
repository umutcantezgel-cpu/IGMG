import { notFound } from 'next/navigation';
import { GelesenMarkierer } from '@/components/verwaltung/postfach/GelesenMarkierer';
import { PostfachRahmen } from '@/components/verwaltung/postfach/PostfachRahmen';
import { Verlauf } from '@/components/verwaltung/postfach/Verlauf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { antworten, markiereGelesen } from '@/server/actions/postfach';
import { ladeUnterhaltung, ladeUnterhaltungen } from '@/server/queries/verwaltung/postfach';

/**
 * Verwaltung › Nachrichten › Unterhaltung (V09): Verlauf und Antwort. Nur Teilnehmende sehen die Unterhaltung;
 * eine fremde oder unbekannte ID ergibt 404. Beim Öffnen wird sie als gelesen markiert (Aktion im Browser).
 */
export default async function UnterhaltungSeite({ params, searchParams }: PageProps<'/[locale]/verwaltung/postfach/[id]'>) {
  const a = await verlangeSeitenRecht('postfach.nutzen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [unterhaltung, liste] = await Promise.all([ladeUnterhaltung(id, a.benutzerId), ladeUnterhaltungen(a.benutzerId)]);
  if (!unterhaltung) notFound();
  return (
    <PostfachRahmen liste={liste} aktivId={unterhaltung.id}>
      <Verlauf unterhaltung={unterhaltung} gesendet={sp.gesendet === '1'} aktion={antworten} />
      <GelesenMarkierer id={unterhaltung.id} ungelesen={unterhaltung.ungelesen > 0} markiere={markiereGelesen} />
    </PostfachRahmen>
  );
}
