export {};

declare global {
  interface Window {
    showAccessDenied?: (message: string) => void;
  }
}