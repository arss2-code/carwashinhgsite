/**
 * Localization and formatting utilities for Russian (ru-RU) car wash application
 */

// Formats a number to Russian rubles: "1 500 ₽"
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Formats Russian phone number with mask +7 (XXX) XXX-XX-XX
export function formatPhone(input: string): string {
  // Strip non-digits
  const digits = input.replace(/\D/g, '');

  if (!digits) return '';

  // If starts with 8, normalize to 7
  let normalized = digits;
  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.slice(1);
  } else if (!normalized.startsWith('7')) {
    normalized = '7' + normalized;
  }

  // Limit to 11 digits
  normalized = normalized.slice(0, 11);

  let formatted = '+7';
  if (normalized.length > 1) {
    formatted += ' (' + normalized.slice(1, 4);
  }
  if (normalized.length >= 4) {
    formatted += ') ' + normalized.slice(4, 7);
  }
  if (normalized.length >= 7) {
    formatted += '-' + normalized.slice(7, 9);
  }
  if (normalized.length >= 9) {
    formatted += '-' + normalized.slice(9, 11);
  }

  return formatted;
}

export function isValidRussianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'));
}

// Map Latin letters often typed by mistake to their Cyrillic counterparts on Russian plates
const LATIN_TO_CYRILLIC: Record<string, string> = {
  A: 'А',
  B: 'В',
  E: 'Е',
  K: 'К',
  M: 'М',
  H: 'Н',
  O: 'О',
  P: 'Р',
  C: 'С',
  T: 'Т',
  Y: 'У',
  X: 'Х',
  a: 'А',
  b: 'В',
  e: 'Е',
  k: 'К',
  m: 'М',
  h: 'Н',
  o: 'О',
  p: 'Р',
  c: 'С',
  t: 'Т',
  y: 'У',
  x: 'Х',
};

// Russian plate valid letters: А, В, Е, К, М, Н, О, Р, С, Т, У, Х
const VALID_CYRILLIC_LETTERS = new Set(['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х']);

/**
 * Formats Russian vehicle registration plate: e.g. "А 123 АА 77" or "А 123 АА 777"
 * Structure: 1 letter + 3 numbers + 2 letters + 2-3 numbers (region)
 */
export function formatCarPlate(input: string): string {
  if (!input) return '';

  // Transliterate latin lookalikes to cyrillic uppercase
  let cleaned = '';
  for (const char of input) {
    if (LATIN_TO_CYRILLIC[char]) {
      cleaned += LATIN_TO_CYRILLIC[char];
    } else {
      cleaned += char.toUpperCase();
    }
  }

  // Remove invalid characters (keep only valid cyrillic plate letters and digits)
  cleaned = cleaned.replace(/[^АВЕКМНОРСТУХ0-9]/g, '');

  if (cleaned.length === 0) return '';

  let result = '';
  let i = 0;

  // 1st character: Letter
  if (i < cleaned.length && VALID_CYRILLIC_LETTERS.has(cleaned[i])) {
    result += cleaned[i];
    i++;
  } else if (i < cleaned.length) {
    // If user typed digit first, still allow
    result += cleaned[i];
    i++;
  }

  // Next up to 3 digits
  let digitsCount = 0;
  let digitsPart = '';
  while (i < cleaned.length && /\d/.test(cleaned[i]) && digitsCount < 3) {
    digitsPart += cleaned[i];
    digitsCount++;
    i++;
  }
  if (digitsPart) {
    result += ' ' + digitsPart;
  }

  // Next up to 2 letters
  let lettersCount = 0;
  let lettersPart = '';
  while (i < cleaned.length && VALID_CYRILLIC_LETTERS.has(cleaned[i]) && lettersCount < 2) {
    lettersPart += cleaned[i];
    lettersCount++;
    i++;
  }
  if (lettersPart) {
    result += ' ' + lettersPart;
  }

  // Region code: 2 or 3 digits
  let regionPart = '';
  while (i < cleaned.length && /\d/.test(cleaned[i]) && regionPart.length < 3) {
    regionPart += cleaned[i];
    i++;
  }
  if (regionPart) {
    result += ' ' + regionPart;
  }

  return result.trim();
}

export function isValidRussianPlate(plate: string): boolean {
  // Regex for Russian state registration: e.g., "А 123 АА 77" or "А 123 АА 777"
  const regex = /^[АВЕКМНОРСТУХ]\s?\d{3}\s?[АВЕКМНОРСТУХ]{2}\s?\d{2,3}$/;
  return regex.test(plate.trim());
}

/**
 * Format date in Russian: "5 ноября 2026" or "ДД.ММ.ГГГГ"
 */
export function formatRuDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatRuDateShort(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr;
  }
}

// Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes from midnight to "HH:mm"
export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Calculate end time string given start time and duration in minutes
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
}

// Format duration into readable Russian string: "45 мин" or "1 ч 15 мин"
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${remainingMins} мин`;
}

// Generate unique booking code like "AQ-74921"
export function generateBookingId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AQ-${randomNum}`;
}
