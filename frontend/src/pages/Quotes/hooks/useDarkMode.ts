// src/pages/Quotes/hooks/useDarkMode.ts
import { useEffect, useState } from "react";

export default function useDarkMode() {
  const get = () => document.documentElement.classList.contains("dark");
  const [isDark, setIsDark] = useState(get());

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(get()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}
