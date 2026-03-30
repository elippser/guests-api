/** Logging mínimo (consola). Evita carpeta `logs/` bajo `src/` — el .gitignore ignoraba `logs/` en cualquier ruta. */

function formatArgs(args: unknown[]): unknown[] {
  return args.map((a) => (a instanceof Error ? `${a.message}\n${a.stack}` : a));
}

export const logger = {
  info: (...args: unknown[]) => console.log(...formatArgs(args)),
  warn: (...args: unknown[]) => console.warn(...formatArgs(args)),
  error: (...args: unknown[]) => console.error(...formatArgs(args)),
};
