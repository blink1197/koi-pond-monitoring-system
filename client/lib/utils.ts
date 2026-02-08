import { AggregatedPoint, Reading, Sensor, SensorTypes } from "@/app/sensors/types";
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

export function getTimeRangeMs(interval: string): number {
  switch (interval) {
    case 'hourly':
      return 60 * 60 * 1000; // 1 hour
    case 'daily':
      return 24 * 60 * 60 * 1000; // 24 hourss
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000; // 30 days
    case 'yearly':
      return 365 * 24 * 60 * 60 * 1000; // 365 days
    default:
      return 24 * 60 * 60 * 1000; // default to daily
  }
};


export function findThreshold(value: number, thresholds?: Sensor['thresholds'], type: SensorTypes = 'temperature') {
  const thresholdsArray = thresholds?.[type];
  if (!Array.isArray(thresholdsArray) || thresholdsArray.length === 0) return null;

  // Find the threshold that matches the current value
  for (const threshold of thresholdsArray) {
    const { min, max } = threshold;

    if ((min === undefined || value >= min) && (max === undefined || value <= max)) {
      return threshold;
    }
  }

  return null;
}

export function getReadingStatus(value: number, thresholds?: Sensor['thresholds'], type: SensorTypes = 'temperature'): string {
  const thresholdsArray = thresholds?.[type];
  if (!Array.isArray(thresholdsArray) || thresholdsArray.length === 0) return 'Unknown';

  // First, try to find an exact match
  for (const threshold of thresholdsArray) {
    const { min, max } = threshold;

    // Check if value falls within this threshold's range
    if ((min === undefined || value >= min) && (max === undefined || value <= max)) {
      return threshold.name;
    }
  }

  // If no exact match, find the closest threshold
  let closestThreshold = thresholdsArray[0];
  let closestDistance = Math.abs(value - (closestThreshold.max ?? closestThreshold.min ?? 0));

  for (const threshold of thresholdsArray.slice(1)) {
    const thresholdCenter = threshold.max !== undefined && threshold.min !== undefined
      ? (threshold.min + threshold.max) / 2
      : threshold.max ?? threshold.min ?? 0;

    const distance = Math.abs(value - thresholdCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestThreshold = threshold;
    }
  }

  return closestThreshold.name;
}

export function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Aggregate readings into hourly buckets
export function aggregateHourly(readings: Reading[]): AggregatedPoint[] {
  const buckets: Record<string, number[]> = {};
  readings.forEach((r) => {
    const d = new Date(r.recorded_at);
    const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours())).toISOString();
    buckets[key] = buckets[key] || [];
    buckets[key].push(r.value);
  });
  const entries = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([key, vals]) => ({
    time: key,
    value: vals.reduce((s, n) => s + n, 0) / vals.length,
  }));
}

// Aggregate readings into daily buckets
export function aggregateDaily(readings: Reading[]): AggregatedPoint[] {
  const buckets: Record<string, number[]> = {};
  readings.forEach((r) => {
    const d = new Date(r.recorded_at);
    const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
    buckets[key] = buckets[key] || [];
    buckets[key].push(r.value);
  });
  const entries = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([key, vals]) => ({
    time: key,
    value: vals.reduce((s, n) => s + n, 0) / vals.length,
  }));
}

// Aggregate readings into weekly buckets
export function aggregateWeekly(readings: Reading[]): AggregatedPoint[] {
  const buckets: Record<string, number[]> = {};
  readings.forEach((r) => {
    const d = new Date(r.recorded_at);
    const dayOfWeek = d.getUTCDay();
    const diff = d.getUTCDate() - dayOfWeek;
    const weekStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    const key = weekStart.toISOString();
    buckets[key] = buckets[key] || [];
    buckets[key].push(r.value);
  });
  const entries = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([key, vals]) => ({
    time: key,
    value: vals.reduce((s, n) => s + n, 0) / vals.length,
  }));
}

// Aggregate readings into monthly buckets
export function aggregateMonthly(readings: Reading[]): AggregatedPoint[] {
  const buckets: Record<string, number[]> = {};
  readings.forEach((r) => {
    const d = new Date(r.recorded_at);
    const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)).toISOString();
    buckets[key] = buckets[key] || [];
    buckets[key].push(r.value);
  });
  const entries = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([key, vals]) => ({
    time: key,
    value: vals.reduce((s, n) => s + n, 0) / vals.length,
  }));
}

// Aggregate readings into yearly buckets
export function aggregateYearly(readings: Reading[]): AggregatedPoint[] {
  const buckets: Record<string, number[]> = {};
  readings.forEach((r) => {
    const d = new Date(r.recorded_at);
    const key = new Date(Date.UTC(d.getFullYear(), 0, 1)).toISOString();
    buckets[key] = buckets[key] || [];
    buckets[key].push(r.value);
  });
  const entries = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([key, vals]) => ({
    time: key,
    value: vals.reduce((s, n) => s + n, 0) / vals.length,
  }));
}

export function formatLabel(iso: string, interval: string) {
  const d = new Date(iso);
  if (interval === 'hourly') {
    return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", hour12: false });
  } else if (interval === 'daily') {
    return d.toLocaleString(undefined, { month: "short", day: "2-digit" });
  } else if (interval === 'weekly') {
    return d.toLocaleString(undefined, { month: "short", day: "2-digit" });
  } else if (interval === 'monthly') {
    return d.toLocaleString(undefined, { month: "short", year: "2-digit" });
  } else if (interval === 'yearly') {
    return d.toLocaleString(undefined, { year: "numeric" });
  }
  return d.toLocaleString();
}

export function getPageItems(totalPages: number, currentPage: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [];
  pages.push(1);

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) pages.push('ellipsis');

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < totalPages - 1) pages.push('ellipsis');

  pages.push(totalPages);
  return pages;
}
