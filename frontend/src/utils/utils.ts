import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSearch(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesSearch(
  query: string,
  ...fields: Array<string | null | undefined>
): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  return fields.some((f) => normalizeSearch(f).includes(q));
}
