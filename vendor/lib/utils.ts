import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatPrice(price: number | string | null | undefined) {
  const n = Number(price);
  if (!isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN')}`;
}
export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
