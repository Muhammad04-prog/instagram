import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IMAGE_BASE } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1234 → "1,234"; 12_500 → "12.5K"; 3_400_000 → "3.4M" (as Instagram shows counters). */
export function formatCount(value: number): string {
  if (value < 1_000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  const m = value / 1_000_000;
  return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
}

/** Builds an absolute URL for a file name returned by the API. */
export function getImageUrl(fileName: string | null | undefined): string | null {
  if (!fileName) return null;
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) return fileName;
  return `${IMAGE_BASE}/${fileName}`;
}

export function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}
