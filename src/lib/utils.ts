import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Media } from "@/payload-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract URL from a Payload Media field
 * Handles both populated Media objects and unpopulated number references
 */
export function getMediaUrl(media: number | Media | null | undefined): string | undefined {
  if (!media) return undefined;
  if (typeof media === "number") return undefined;
  return media.url || undefined;
}
