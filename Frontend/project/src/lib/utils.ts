import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePESEL(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  
  const weights = [9, 7, 3, 1, 9, 7, 3, 1, 9, 7];
  const sum = pesel
    .slice(0, 10)
    .split('')
    .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0);
    
  const checkSum = (10 - (sum % 10)) % 10;
  return checkSum === parseInt(pesel[10]);
}

export function generateToothNumber(quadrant: number, position: number): number {
  return quadrant * 10 + position;
}

export function getToothQuadrant(toothNumber: number): number {
  return Math.floor(toothNumber / 10);
}

export function getToothPosition(toothNumber: number): number {
  return toothNumber % 10;
}

export const TOOTH_STATUS_COLORS = {
  HEALTHY: '#10b981', // Green
  CARIES: '#ef4444', // Red
  FILLING: '#3b82f6', // Blue
  CROWN: '#8b5cf6', // Purple
  IMPLANT: '#f59e0b', // Amber
  EXTRACTION: '#dc2626', // Red-600
  MISSING: '#6b7280', // Gray
} as const;

export const TOOTH_STATUS_LABELS = {
  HEALTHY: 'Healthy',
  CARIES: 'Caries',
  FILLING: 'Filling',
  CROWN: 'Crown',
  IMPLANT: 'Implant',
  EXTRACTION: 'Extraction',
  MISSING: 'Missing',
} as const;