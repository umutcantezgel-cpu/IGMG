import { sql } from 'drizzle-orm';
import { inspect } from 'node:util';
import { afterAll, describe, expect, it } from 'vitest';
import { installiereFehlerKuerzung } from '@/lib/db/fehler';
import * as schema from '@/lib/db/schema';
import { testDatenbank } from './hilfen/db';

installiereFehlerKuerzung();
const { client, db } = await testDatenbank();
afterAll(() => client.close());

const EMAIL = 'geheim.person@example.test';

/** Alles, was Next bei einem unbehandelten Fehler ins Protokoll schreiben würde. */
async function protokollText(versuch: () => Promise<unknown>): Promise<{ text: string; fehler: unknown }> {
  try {
    await versuch();
  } catch (fehler) {
    return { text: inspect(fehler, { depth: 5 }) + String((fehler as Error).stack), fehler };
  }
  throw new Error('Befehl hätte scheitern müssen');
}

describe('Datenbankfehler im Protokoll ohne Personendaten (V-10)', () => {
  it('Eindeutigkeit: weder Parameter noch detail enthalten die E-Mail', async () => {
    await db.insert(schema.user).values({ id: 'p1', name: 'Person Eins', email: EMAIL, emailVerified: true });
    const { text, fehler } = await protokollText(() =>
      db.insert(schema.user).values({ id: 'p2', name: 'Person Zwei', email: EMAIL, emailVerified: true }),
    );
    expect(text).not.toContain(EMAIL);
    expect(text).not.toContain('Person Zwei');
    expect(text).toContain('ausgeblendet');
    // Code und Constraint bleiben für die Fehlersuche
    expect((fehler as { cause?: { code?: string } }).cause?.code).toBe('23505');
  });

  it('Prüfbedingung über db.execute: keine Zeilenwerte („Failing row contains“)', async () => {
    const { text } = await protokollText(() =>
      db.execute(sql`insert into rolle_zuweisung (benutzer_id, rolle) values (${'p1'}, ${'organisationsredaktion'})`),
    );
    expect(text).not.toContain('Failing row');
    expect(text).not.toContain('organisationsredaktion)');
  });

  it('auch in Transaktionen', async () => {
    const { text } = await protokollText(() =>
      db.transaction(async (tx) => {
        await tx.insert(schema.user).values({ id: 'p3', name: 'Person Drei', email: EMAIL, emailVerified: true });
      }),
    );
    expect(text).not.toContain(EMAIL);
    expect(text).not.toContain('Person Drei');
  });
});
