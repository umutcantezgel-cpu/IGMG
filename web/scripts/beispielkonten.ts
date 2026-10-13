// Beispielkonten für die Vorführung von „Mein Bereich“ (ADR 0026) – nur außerhalb der Produktion.
// Wird von scripts/bau-datenbank.mjs NICHT aufgerufen (Entscheidung des Orchestrators).
//
// Aufruf: pnpm exec tsx --conditions=react-server --env-file-if-exists=.env scripts/beispielkonten.ts [--praefix x] [--neu] [--json]
//   --praefix x  eigene Adressen/Benutzernamen (z. B. für E2E-Läufe): gemeinde.x@beispiel.invalid, kind.x
//   --neu        vorhandene Beispielkonten dieses Präfixes vorher löschen
//   --json       Zugangsdaten als JSON (für Tests), sonst als Tabelle
// Passwörter: BEISPIEL_PASSWORT aus der Umgebung (für alle gleich) oder je Konto zufällig – nur auf der Konsole,
// nie in Dateien. Adressen unter `.invalid` (RFC 2606): Der Mail-Ausgang weist sie ab, es geht keine Mail hinaus.
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { eq, inArray, like, or } from 'drizzle-orm';
import konto from '../messages/bereiche/konto.json';
import { auth } from '../src/lib/auth/server';
import { holeDb, schema } from '../src/lib/db';
import { KONTO_EINWILLIGUNG_VERSION, textVersion } from '../src/lib/konto/einwilligung';
import { legeKinderkontoAn } from '../src/lib/konto/kinderkonto';
import { anzeigenameAus } from '../src/lib/konto/regeln';
import { verschluessele } from '../src/lib/krypto';
import { betriebsart } from '../src/lib/umgebung';

type Rolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];

const { values } = parseArgs({
  options: {
    praefix: { type: 'string', default: '' },
    neu: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
});

function fehler(text: string): never {
  console.error(text);
  process.exit(1);
}

if (betriebsart(process.env) === 'produktion') fehler('Beispielkonten gibt es nur außerhalb der Produktion (SITE_MODE/NODE_ENV).');
const praefix = (values.praefix ?? '').toLowerCase();
if (praefix && !/^[a-z0-9]{1,12}$/.test(praefix)) fehler('--praefix: 1–12 Zeichen a–z, 0–9.');

const adresse = (art: string) => (praefix ? `${art}.${praefix}@beispiel.invalid` : `${art}@beispiel.invalid`);
const benutzername = praefix ? `kind.${praefix}` : 'kind.beispiel';
const passwort = () => process.env.BEISPIEL_PASSWORT || randomBytes(18).toString('base64url');
const einwilligung = textVersion(KONTO_EINWILLIGUNG_VERSION, konto.de.konto.einwilligung.text);

const db = holeDb();

async function loesche() {
  const alt = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(
      or(
        inArray(schema.user.email, [adresse('gemeinde'), adresse('eltern'), adresse('lehrkraft')]),
        eq(schema.user.username, benutzername),
      ),
    );
  if (alt.length) await db.delete(schema.user).where(inArray(schema.user.id, alt.map((u) => u.id)));
  // Lernende des Beispielkinds (Anzeigename mit Präfix-Kennung) mit entfernen
  await db.delete(schema.lernende).where(like(schema.lernende.anzeigename, `Emre B.${praefix ? ` (${praefix})` : ''}`));
}

async function erwachsen(art: string, name: string, rollen: Rolle[]) {
  const email = adresse(art);
  const [vorhanden] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email)).limit(1);
  if (vorhanden) return { email, id: vorhanden.id, passwort: null as string | null };
  const pw = passwort();
  const r = await auth.api.signUpEmail({ body: { email, password: pw, name } });
  const id = r.user.id;
  await db.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, id));
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: anzeigenameAus(name), sprache: 'de' });
  await db.insert(schema.gemeindeRolle).values(rollen.map((rolle) => ({ benutzerId: id, rolle, erstelltVon: 'beispielkonten' })));
  await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'konto', textVersion: einwilligung, erteiltVon: id });
  return { email, id, passwort: pw };
}

async function main() {
  if (values.neu) await loesche();
  const gemeinde = await erwachsen('gemeinde', 'Amira Beispiel', ['gemeinde']);
  const eltern = await erwachsen('eltern', 'Yusuf Beispiel', ['gemeinde', 'eltern']);
  const lehrkraft = await erwachsen('lehrkraft', 'Selin Beispiel', ['gemeinde', 'lehrkraft']);

  // Kind: Lernende (Personendaten verschlüsselt, fiktiv) + Eltern-Bezug + Einwilligung „kinderkonto“ → Kinderzugang
  let kind: { benutzername: string; passwort: string | null } = { benutzername, passwort: null };
  const [kindVorhanden] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, benutzername)).limit(1);
  if (!kindVorhanden) {
    const paket = verschluessele({ vorname: 'Emre', nachname: 'Beispiel', geburtsdatum: '[fiktiv]' });
    const [lernende] = await db
      .insert(schema.lernende)
      .values({
        datenVerschluesselt: paket.daten,
        schluesselId: paket.schluesselId,
        anzeigename: `Emre B.${praefix ? ` (${praefix})` : ''}`,
        aufgenommenVon: 'beispielkonten',
      })
      .returning({ id: schema.lernende.id });
    await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: lernende.id, bestaetigtAm: new Date() });
    await db.insert(schema.kontoEinwilligung).values({
      lernendeId: lernende.id,
      art: 'kinderkonto',
      textVersion: textVersion('beispiel', '[Einwilligung Kinderkonto – Beispiel]'),
      einvernehmenBestaetigt: true,
      erteiltVon: eltern.id,
    });
    const pw = passwort();
    const r = await legeKinderkontoAn({ benutzername, passwort: pw, elternBenutzerId: eltern.id, lernendeId: lernende.id });
    if (!r.ok) fehler(`Kinderzugang nicht angelegt: ${r.fehler}`);
    kind = { benutzername, passwort: pw };
  }

  const ergebnis = {
    gemeinde: { email: gemeinde.email, passwort: gemeinde.passwort },
    eltern: { email: eltern.email, passwort: eltern.passwort },
    lehrkraft: { email: lehrkraft.email, passwort: lehrkraft.passwort },
    kind,
  };
  if (values.json) {
    console.log(JSON.stringify(ergebnis));
    return;
  }
  console.log('Beispielkonten (Passwort nur bei neu angelegten Konten; vorhandene bleiben unverändert):');
  for (const [art, z] of Object.entries(ergebnis)) {
    const kennung = 'email' in z ? z.email : z.benutzername;
    console.log(`  ${art.padEnd(10)} ${kennung.padEnd(36)} ${z.passwort ?? '(vorhanden, Passwort unverändert)'}`);
  }
  console.log('Lehrkraft: beim ersten Anmelden ist die Einrichtung des zweiten Faktors Pflicht.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
