import { useEffect, useState } from "react";

export default function useIsMac() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
    }
  }, []);

  return isMac;
}
