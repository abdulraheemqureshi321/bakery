import * as xlsx from 'xlsx';
import { normalizePhone, isValidPhone } from './phone';

export interface ColumnMapping {
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
}

export interface ParsedMemberRow {
  rowNumber: number;
  raw: Record<string, any>;
  name?: string;
  phone?: string;
  normalizedPhone?: string;
  email?: string;
  birthday?: Date;
  isValid: boolean;
  isDuplicateInFile?: boolean;
  isDuplicateInDb?: boolean;
  existingMemberId?: string;
  errors: string[];
}

export interface ImportPreviewResult {
  headers: string[];
  suggestedMapping: ColumnMapping;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  rows: ParsedMemberRow[];
}

const NAME_VARIATIONS = [
  'name',
  'fullname',
  'full name',
  'member name',
  'customer name',
  'customer',
  'client',
  'nama',
];

const PHONE_VARIATIONS = [
  'phone',
  'mobile',
  'tel',
  'telephone',
  'contact',
  'phone number',
  'mobile number',
  'contact number',
  'handphone',
  'hp',
  'no tel',
  'notel',
  'nombor telefon',
];

const EMAIL_VARIATIONS = [
  'email',
  'e-mail',
  'email address',
  'emel',
  'mail',
  'alamat emel',
];

const BIRTHDAY_VARIATIONS = [
  'birthday',
  'birth date',
  'date of birth',
  'dob',
  'bday',
  'tarikh lahir',
  'birth',
];

/**
 * Clean and normalize a header string for fuzzy matching
 */
function cleanHeader(header: string): string {
  return String(header).trim().toLowerCase().replace(/[_\-\.]/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Auto-detect column mapping from sheet headers
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    name: '',
    phone: '',
    email: '',
    birthday: '',
  };

  for (const h of headers) {
    const cleaned = cleanHeader(h);

    if (!mapping.name && NAME_VARIATIONS.includes(cleaned)) {
      mapping.name = h;
    } else if (!mapping.phone && PHONE_VARIATIONS.includes(cleaned)) {
      mapping.phone = h;
    } else if (!mapping.email && EMAIL_VARIATIONS.includes(cleaned)) {
      mapping.email = h;
    } else if (!mapping.birthday && BIRTHDAY_VARIATIONS.includes(cleaned)) {
      mapping.birthday = h;
    }
  }

  // Fallbacks: partial matching if exact variation wasn't found
  for (const h of headers) {
    const cleaned = cleanHeader(h);
    if (!mapping.name && (cleaned.includes('name') || cleaned.includes('nama'))) {
      mapping.name = h;
    }
    if (!mapping.phone && (cleaned.includes('phone') || cleaned.includes('mobile') || cleaned.includes('tel') || cleaned.includes('contact'))) {
      mapping.phone = h;
    }
    if (!mapping.email && cleaned.includes('email')) {
      mapping.email = h;
    }
    if (!mapping.birthday && (cleaned.includes('birth') || cleaned.includes('dob'))) {
      mapping.birthday = h;
    }
  }

  return mapping;
}

/**
 * Parse an Excel date value (serial number, Date object, or date string)
 */
export function parseExcelDate(val: any): { date?: Date; error?: string } {
  if (val === null || val === undefined || val === '') {
    return {};
  }

  // If already a Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) {
      return { error: 'Invalid date value' };
    }
    return { date: val };
  }

  // If number (Excel date serial)
  if (typeof val === 'number' || (!isNaN(Number(val)) && !String(val).includes('-') && !String(val).includes('/'))) {
    const num = Number(val);
    if (num > 0 && num < 100000) {
      try {
        const parsed = xlsx.SSF.parse_date_code(num);
        if (parsed && parsed.y && parsed.m && parsed.d) {
          const d = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
          if (!isNaN(d.getTime())) {
            return { date: d };
          }
        }
      } catch {
        // fall back to JS calculation
      }
      // Excel epoch starts Dec 30 1899 due to 1900 leap year bug
      const utcDays = Math.floor(num - 25569);
      const utcValue = utcDays * 86400 * 1000;
      const d = new Date(utcValue);
      if (!isNaN(d.getTime())) {
        return { date: d };
      }
    }
  }

  // String parsing
  const str = String(val).trim();
  if (!str) return {};

  // Try standard YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime()) && d.getUTCFullYear() === year) {
      return { date: d };
    }
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const part1 = parseInt(dmyMatch[1], 10);
    const part2 = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);

    // If part1 > 12, it must be DD/MM/YYYY
    if (part1 > 12) {
      const d = new Date(Date.UTC(year, part2 - 1, part1));
      if (!isNaN(d.getTime())) return { date: d };
    } else if (part2 > 12) {
      // If part2 > 12, it must be MM/DD/YYYY
      const d = new Date(Date.UTC(year, part1 - 1, part2));
      if (!isNaN(d.getTime())) return { date: d };
    } else {
      // Default to DD/MM/YYYY (common in UK/Malaysia/International)
      const d = new Date(Date.UTC(year, part2 - 1, part1));
      if (!isNaN(d.getTime())) return { date: d };
    }
  }

  // Fallback to Date.parse
  const parsedTime = Date.parse(str);
  if (!isNaN(parsedTime)) {
    const d = new Date(parsedTime);
    return { date: d };
  }

  return { error: `Unable to parse date: "${str}"` };
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Read raw rows from buffer (.xlsx, .xls, .csv)
 */
export function parseSheetFromBuffer(buffer: Buffer): { headers: string[]; rows: Record<string, any>[] } {
  const workbook = xlsx.read(buffer, {
    type: 'buffer',
    cellDates: false, // keep raw to parse serials & strings deterministically
    raw: true,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('The uploaded spreadsheet contains no sheets.');
  }

  const sheet = workbook.Sheets[sheetName];
  // Parse rows as raw objects with header keys
  const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 0,
    defval: '',
    blankrows: false,
  });

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  // Extract all distinct headers present across rows
  const headerSet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => headerSet.add(k)));
  const headers = Array.from(headerSet);

  return { headers, rows };
}
