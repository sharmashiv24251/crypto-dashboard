import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * A utility to safely merge Tailwind and conditional classNames.
 *
 * Usage:
 *  cn("p-2", isActive && "bg-green-500", customClass)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
