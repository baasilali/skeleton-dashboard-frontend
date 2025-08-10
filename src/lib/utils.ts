import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseBackendDate(ts: string): Date | null {
  if (!ts) return null;

  // Trim trailing/leading spaces
  const str = ts.trim();

  // Format 1: M/D/YYYY ...
  const mdy = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})/.exec(str);
  if (mdy) {
    const [, m, d, y] = mdy;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // Format 2: YYYY-MM-DD ...
  const ymd = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})/.exec(str);
  if (ymd) {
    const [, y, m, d] = ymd;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  return null; // Unknown format
}
