import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * In-memory rate limiter (per-IP, resets each minute)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Validate job description input
 */
export function validateJobDescription(text: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = text.trim();
  if (trimmed.length < 100) {
    return {
      valid: false,
      error: 'Job description is too short. Please paste at least 100 characters for accurate results.',
    };
  }
  if (trimmed.length > 15_000) {
    return {
      valid: false,
      error: 'Job description is too long. Please limit to 15,000 characters.',
    };
  }
  return { valid: true };
}
