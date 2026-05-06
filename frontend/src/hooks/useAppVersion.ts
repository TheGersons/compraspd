import { useState, useEffect } from 'react';
import { fetchServerVersion, APP_VERSION } from '@/utils/version';

const POLLING_INTERVAL = 2 * 60 * 1000;

export function useAppVersion(): { hayNueva: boolean; nuevaVersion: string | null } {
  const [nuevaVersion, setNuevaVersion] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const remote = await fetchServerVersion();
      if (remote !== null && remote !== APP_VERSION) {
        setNuevaVersion(remote);
      }
    };

    check();
    const interval = setInterval(check, POLLING_INTERVAL);
    window.addEventListener('focus', check);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', check);
    };
  }, []);

  return { hayNueva: nuevaVersion !== null, nuevaVersion };
}
