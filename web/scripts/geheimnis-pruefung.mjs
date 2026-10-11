#!/usr/bin/env node
// Geheimnis- und Datenschutz-Prüfung vor Commit und Push (ADR 0010, G-03, G-04).
// Aufruf: node scripts/geheimnis-pruefung.mjs --staged | --push | --alles
// Prüft die betroffenen Dateien des Repos (Wurzel = ..), bricht bei Treffern mit Exit 1 ab.
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const wurzel = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const modus = process.argv[2] ?? '--staged';

function dateien() {
  const git = (...args) => execFileSync('git', args, { cwd: wurzel, encoding: 'utf8' }).split('\n').filter(Boolean);
  if (modus === '--alles') return git('ls-files');
  if (modus === '--push') {
    let basis = '';
    try {
      basis = execFileSync('git', ['rev-parse', '--verify', '--quiet', '@{u}'], { cwd: wurzel, encoding: 'utf8' }).trim();
    } catch {
      basis = '';
    }
    return basis ? git('diff', '--name-only', '--diff-filter=ACMR', `${basis}..HEAD`) : git('ls-files');
  }
  return git('diff', '--cached', '--name-only', '--diff-filter=ACMR');
}

const VERBOTENE_PFADE = [
  /(^|\/)\.env($|\.(?!example$)[^/]*$)/,
  /\.(pem|key|p12|pfx|keystore)$/i,
  /(^|\/)\.pglite[^/]*\//,
  /(^|\/)\.medien\//,
  /(^|\/)\.mail\//,
  /\.(eml|sqlite|db|dump)$/i,
  /(^|\/)id_(rsa|ed25519)/,
];

const MUSTER = [
  { name: 'Privater Schlüssel', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { name: 'AWS-Zugangsschlüssel', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub-Token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Slack-Token', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'Stripe-Schlüssel', re: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/ },
  { name: 'Anthropic/OpenAI-Schlüssel', re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{32,}\b/ },
  { name: 'JWT', re: /\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/ },
  {
    name: 'Geheimnis-Zuweisung',
    re: /\b(?:BETTER_AUTH_SECRET|EINGANG_SCHLUESSEL|RATE_GEHEIMNIS|ALTCHA_GEHEIMNIS|WARTUNG_TOKEN|SMTP_PASS|S3_GEHEIMNIS|POSTGRES_PASSWORD)\s*[=:]\s*["']?(?!\$\{)[A-Za-z0-9+/=_-]{16,}/,
  },
  { name: 'Verbindungs-URL mit Passwort', re: /postgres(?:ql)?:\/\/[^:\s/]+:(?!igmg-lokal@|\$\{)[^@\s]{6,}@/ },
];

// E-Mail-Adressen nur mit erlaubten Beispiel-Domains (G-04)
const EMAIL = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;
const ERLAUBTE_DOMAINS = new Set([
  'example.test',
  'example.com',
  'example.org',
  'beispiel.de',
  'ornek.com',
  'igmg-wetzlar.de',
  'igmg.org',
  'anthropic.com',
  'users.noreply.github.com',
]);
const OHNE_INHALTSPRUEFUNG = /(^|\/)(pnpm-lock\.yaml|.*\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|pdf|zip))$/i;
const AUSNAHME_DATEI = /(^|\/)scripts\/geheimnis-pruefung\.mjs$/;

/**
 * Geprüft wird, was tatsächlich in den Commit bzw. Push geht – nicht die Arbeitskopie (parallel arbeitende Pakete
 * können dort Zwischenstände haben): --staged liest den Index (`:pfad`), --push den Stand von HEAD, --alles die Arbeitskopie.
 */
function inhaltVon(datei) {
  try {
    if (modus === '--alles') {
      const pfad = join(wurzel, datei);
      if (statSync(pfad).size > 2_000_000) return null;
      return readFileSync(pfad, 'utf8');
    }
    const objekt = modus === '--push' ? `HEAD:${datei}` : `:${datei}`;
    const groesse = Number(execFileSync('git', ['cat-file', '-s', objekt], { cwd: wurzel, encoding: 'utf8' }).trim());
    if (groesse > 2_000_000) return null;
    return execFileSync('git', ['show', objekt], { cwd: wurzel, encoding: 'utf8', maxBuffer: 4_000_000 });
  } catch {
    return null;
  }
}

const befunde = [];
for (const datei of dateien()) {
  for (const re of VERBOTENE_PFADE) if (re.test(datei)) befunde.push(`${datei}: verbotener Pfad`);
  if (OHNE_INHALTSPRUEFUNG.test(datei) || AUSNAHME_DATEI.test(datei)) continue;
  const inhalt = inhaltVon(datei);
  if (inhalt === null) continue;
  const zeilen = inhalt.split('\n');
  zeilen.forEach((zeile, i) => {
    for (const m of MUSTER) if (m.re.test(zeile)) befunde.push(`${datei}:${i + 1}: ${m.name}`);
    for (const t of zeile.matchAll(EMAIL)) {
      const domain = t[1].toLowerCase();
      if (!ERLAUBTE_DOMAINS.has(domain) && !domain.endsWith('.example.test') && !domain.endsWith('.local')) {
        befunde.push(`${datei}:${i + 1}: E-Mail-Adresse mit nicht erlaubter Domain (${domain})`);
      }
    }
  });
}

if (befunde.length) {
  console.error(`Geheimnis-/Datenschutz-Prüfung: ${befunde.length} Befund(e) – Vorgang abgebrochen.`);
  for (const b of befunde) console.error(`  ${b}`);
  process.exit(1);
}
console.log(`Geheimnis-/Datenschutz-Prüfung (${modus}): ohne Befund.`);
