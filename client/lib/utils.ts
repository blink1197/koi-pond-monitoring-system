import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Map threshold color keys to Tailwind classes for consistent UI
export type ThresholdColorKey = 'none' | 'blue' | 'green' | 'yellow' | 'orange' | 'red';

export function getThresholdColorClasses(color: ThresholdColorKey) {
  switch (color) {
    case 'blue':
      return 'bg-blue-500 text-white';
    case 'green':
      return 'bg-green-500 text-white';
    case 'yellow':
      return 'bg-yellow-400 text-black';
    case 'orange':
      return 'bg-orange-400 text-black';
    case 'red':
      return 'bg-red-500 text-white';
    case 'none':
    default:
      return 'bg-gray-200 text-black';
  }
}

export function getThresholdColorStyle(color: ThresholdColorKey) {
  switch (color) {
    case 'blue':
      return { backgroundColor: '#1e40af', color: '#93c5fd' }; // blue-800 / blue-300
    case 'green':
      return { backgroundColor: '#166534', color: '#86efac' }; // green-800 / green-300
    case 'yellow':
      return { backgroundColor: '#854d0e', color: '#fde047' }; // yellow-800 / yellow-300
    case 'orange':
      return { backgroundColor: '#9a3412', color: '#fdba74' }; // orange-800 / orange-300
    case 'red':
      return { backgroundColor: '#991b1b', color: '#fca5a5' }; // red-800 / red-300
    case 'none':
    default:
      return { backgroundColor: '#4b5563', color: '#d1d5db' }; // gray-600 / gray-300
  }
}