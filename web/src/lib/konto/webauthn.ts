/**
 * WebAuthn im Browser (Passkeys) ohne Zusatzbibliothek: Die Server Actions liefern die Optionen als JSON
 * (Base64url-Felder, Format von @simplewebauthn/server), hier werden sie in ArrayBuffer umgesetzt und die Antwort des
 * Authenticators wieder als JSON zurückgegeben. Moderne Browser können das selbst (`parse…FromJSON`, `toJSON`);
 * der Rückfall rechnet von Hand.
 */
type Json = Record<string, unknown>;

export function passkeysMoeglich(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function' && Boolean(navigator.credentials);
}

function zuPuffer(b64url: string): ArrayBuffer {
  const b64 = b64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(b64url.length / 4) * 4, '=');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function zuText(puffer: ArrayBuffer | null | undefined): string | undefined {
  if (!puffer) return undefined;
  const bytes = new Uint8Array(puffer);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

type MitParser = typeof PublicKeyCredential & {
  parseRequestOptionsFromJSON?: (o: Json) => PublicKeyCredentialRequestOptions;
  parseCreationOptionsFromJSON?: (o: Json) => PublicKeyCredentialCreationOptions;
};

function anfrageOptionen(o: Json): PublicKeyCredentialRequestOptions {
  const pkc = window.PublicKeyCredential as MitParser;
  if (pkc.parseRequestOptionsFromJSON) return pkc.parseRequestOptionsFromJSON(o);
  const erlaubt = (o.allowCredentials as { id: string; type: 'public-key'; transports?: AuthenticatorTransport[] }[] | undefined) ?? [];
  return {
    ...(o as unknown as PublicKeyCredentialRequestOptions),
    challenge: zuPuffer(o.challenge as string),
    allowCredentials: erlaubt.map((c) => ({ ...c, id: zuPuffer(c.id) })),
  };
}

function erstellOptionen(o: Json): PublicKeyCredentialCreationOptions {
  const pkc = window.PublicKeyCredential as MitParser;
  if (pkc.parseCreationOptionsFromJSON) return pkc.parseCreationOptionsFromJSON(o);
  const user = o.user as { id: string; name: string; displayName: string };
  const ausgeschlossen =
    (o.excludeCredentials as { id: string; type: 'public-key'; transports?: AuthenticatorTransport[] }[] | undefined) ?? [];
  return {
    ...(o as unknown as PublicKeyCredentialCreationOptions),
    challenge: zuPuffer(o.challenge as string),
    user: { ...user, id: zuPuffer(user.id) },
    excludeCredentials: ausgeschlossen.map((c) => ({ ...c, id: zuPuffer(c.id) })),
  };
}

function alsJson(c: PublicKeyCredential): Json {
  const mitJson = c as PublicKeyCredential & { toJSON?: () => Json };
  if (typeof mitJson.toJSON === 'function') return mitJson.toJSON();
  const r = c.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse;
  const antwort: Json = { clientDataJSON: zuText(r.clientDataJSON) };
  if ('attestationObject' in r && r.attestationObject) {
    antwort.attestationObject = zuText(r.attestationObject);
    antwort.transports = typeof r.getTransports === 'function' ? r.getTransports() : [];
  }
  if ('authenticatorData' in r && r.authenticatorData) {
    antwort.authenticatorData = zuText(r.authenticatorData);
    antwort.signature = zuText(r.signature);
    antwort.userHandle = zuText(r.userHandle);
  }
  return {
    id: c.id,
    rawId: zuText(c.rawId),
    type: c.type,
    response: antwort,
    clientExtensionResults: c.getClientExtensionResults(),
    authenticatorAttachment: c.authenticatorAttachment ?? undefined,
  };
}

/** Anmeldung: Optionen → Authenticator → Antwort als JSON-Text (null = abgebrochen). */
export async function passkeyAbfragen(optionen: Json): Promise<string | null> {
  try {
    const c = (await navigator.credentials.get({ publicKey: anfrageOptionen(optionen) })) as PublicKeyCredential | null;
    return c ? JSON.stringify(alsJson(c)) : null;
  } catch {
    return null;
  }
}

/** Registrierung: Optionen → Authenticator → Antwort als JSON-Text (null = abgebrochen). */
export async function passkeyErstellen(optionen: Json): Promise<string | null> {
  try {
    const c = (await navigator.credentials.create({ publicKey: erstellOptionen(optionen) })) as PublicKeyCredential | null;
    return c ? JSON.stringify(alsJson(c)) : null;
  } catch {
    return null;
  }
}
