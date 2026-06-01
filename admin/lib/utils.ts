import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatPrice(price: number) { return `₹${price.toLocaleString('en-IN')}`; }

export function formatDate(date: string | Date) { return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }); }
