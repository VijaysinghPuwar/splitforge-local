export interface NamingOptions {
  prefix: string;
  leadingZeros: boolean;
  total: number;
}

export function sanitizePrefix(raw: string): string {
  return raw.replace(/[^\w-]/g, "").slice(0, 32);
}

export function getFileName(index: number, opts: NamingOptions): string {
  const n = index + 1;
  const digits = opts.leadingZeros ? String(opts.total).length : 1;
  const padded = String(n).padStart(digits, "0");
  return opts.prefix ? `${opts.prefix}-${padded}.txt` : `${padded}.txt`;
}

export function getAllFileNames(total: number, opts: NamingOptions): string[] {
  return Array.from({ length: total }, (_, i) => getFileName(i, { ...opts, total }));
}

export function generateSubfolderName(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `splitforge-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
