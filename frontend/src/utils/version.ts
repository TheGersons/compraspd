// _initialVersion === undefined → todavía no se hizo el primer fetch
// _initialVersion === null     → el servidor no tiene version.json (dev local sin build)
// _initialVersion === "..."    → versión capturada al cargar la app
let _initialVersion: string | null | undefined = undefined;

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

  if (_initialVersion === undefined) {
    // Primer fetch exitoso → establecer baseline; no hay "nueva versión" todavía
    _initialVersion = remote;
    return false;
  }

  // Sin version.json en el servidor → modo dev, no hacer nada
  if (_initialVersion === null) return false;

  return remote !== null && remote !== _initialVersion;
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
