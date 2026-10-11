import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Tor B/C M7 (K-06, G-07): Die Anmeldung mit zweitem Faktor schreibt `anmeldung.erfolg` mit der Konto-ID aus dem
 * Prüfergebnis – die neue Sitzung steht erst in der Antwort. Fehlversuche schreiben `anmeldung.fehlgeschlagen`.
 */
const { client, db } = await verwaltungsUmgebung();
const { zweiFaktorPruefen } = await import('@/server/actions/anmeldung');
const { auth } = await import('@/lib/auth/server');
afterAll(() => client.close());
const api = auth.api as unknown as Record<string, (o: unknown) => Promise<unknown>>;

beforeEach(async () => {
  await db.delete(schema.ratenbegrenzung);
});

const erfolgVon = (id: string) =>
  db
    .select()
    .from(schema.auditEintrag)
    .where(and(eq(schema.auditEintrag.aktion, 'anmeldung.erfolg'), eq(schema.auditEintrag.benutzerId, id)));

describe('Zweiter Faktor – Audit', () => {
  it('TOTP richtig: anmeldung.erfolg mit Konto-ID, danach zur Übersicht', async () => {
    const id = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    api.verifyTOTP = async () => ({ token: 'neu', user: { id } });
    await expect(zweiFaktorPruefen({}, formular({ code: '123456' }))).rejects.toMatchObject({ ziel: '/verwaltung' });
    const [a] = await erfolgVon(id);
    expect(a.details).toEqual({ zweiFaktor: true, ersatzcode: false });
  });

  it('Ersatzcode: ebenfalls protokolliert, Kennzeichen ersatzcode', async () => {
    const id = (await angemeldetAls([{ rolle: 'bildung' }]))!;
    api.verifyBackupCode = async () => ({ token: 'neu', user: { id } });
    await expect(zweiFaktorPruefen({}, formular({ art: 'ersatzcode', code: 'abcde-fghij' }))).rejects.toMatchObject({
      ziel: '/verwaltung',
    });
    expect((await erfolgVon(id))[0].details).toEqual({ zweiFaktor: true, ersatzcode: true });
  });

  it('falscher Code: Feldfehler und anmeldung.fehlgeschlagen ohne Konto', async () => {
    api.verifyTOTP = async () => {
      throw new Error('INVALID_CODE');
    };
    expect(await zweiFaktorPruefen({}, formular({ code: '000000' }))).toMatchObject({ feldFehler: { code: 'zweiFaktor.fehler' } });
    const fehl = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'anmeldung.fehlgeschlagen'));
    expect(fehl.at(-1)).toMatchObject({ benutzerId: null, details: { schritt: 'zwei_faktor' } });
  });
});
