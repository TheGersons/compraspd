import { useState, useEffect } from 'react';
import { hayNuevaVersion } from '@/utils/version';

const POLLING_INTERVAL = 2 * 60 * 1000;

export function useAppVersion(): { hayNueva: boolean } {
  const [hayNueva, setHayNueva] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (await hayNuevaVersion()) {
        setHayNueva(true);
      }
    };

    check(); // captura baseline en primer llamado
    const interval = setInterval(check, POLLING_INTERVAL);
    window.addEventListener('focus', check);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', check);
    };
  }, []);

  return { hayNueva };
}
