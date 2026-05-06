export const APP_VERSION =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

export async function fetchServerVersion(): Promise<string | null> {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}

export async function hayNuevaVersion(): Promise<boolean> {
  const remote = await fetchServerVersion();
  return remote !== null && remote !== APP_VERSION;
}

export async function preflightVersion(mensaje?: string): Promise<boolean> {
  if (await hayNuevaVersion()) {
    alert(
      mensaje ??
        'Hay una nueva versión disponible. La página se recargará para continuar.'
    );
    window.location.reload();
    return false;
  }
  return true;
}
