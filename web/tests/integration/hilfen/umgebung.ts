import { randomBytes } from 'node:crypto';

// Testumgebung für Integrationstests: Geheimnisse werden je Lauf zufällig erzeugt (keine festen Werte im Repo, G-03).
const zufall = () => randomBytes(32).toString('base64');
process.env.EINGANG_SCHLUESSEL = zufall();
process.env.EINGANG_SCHLUESSEL_ID = '1';
process.env.RATE_GEHEIMNIS = zufall();
process.env.ALTCHA_GEHEIMNIS = zufall();
process.env.BETTER_AUTH_SECRET = zufall();
process.env.MAIL_TRANSPORT = 'datei';
delete process.env.DATABASE_URL;
// Vorschau ungeprüfter Wissensinhalte (L3-E22): in Tests standardmäßig aus – außerhalb der Produktion wäre sie sonst an und
// jede Sperre bis zu zwei Freigaben aufgehoben. Tests der Vorschau schalten sie ausdrücklich ein.
process.env.FUNKTION_LERNAPP_WISSEN_VORSCHAU = 'aus';
// Religiöse Erklärtexte der Website als gekennzeichneter Entwurf (ADR 0047): in Tests ebenso standardmäßig aus – sonst wären
// Themen „zur Prüfung“ öffentlich und die Tests der Freigabe (öffentlich nur „geprüft“) liefen mit einem anderen Stand. Tests
// der Vorschau schalten sie ausdrücklich ein (`tests/integration/wissen-entwuerfe.test.ts`).
process.env.FUNKTION_WEBSITE_WISSEN_VORSCHAU = 'aus';
