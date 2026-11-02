/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// O'zbekcha oy nomlari
export const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr'
];

// O'zbekcha hafta kunlari
export const UZ_WEEKDAYS = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba'
];

export const UZ_WEEKDAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

/**
 * Summani so'mda, minglik ajratgich (bo'sh joy) bilan chiroyli formatlash
 * Masalan: 1250000 -> "1 250 000 so'm"
 */
export function formatSum(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 so'm";
  }
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} so'm`;
}

/**
 * Faqat sonni minglik ajratgich bilan qaytarish (so'm qo'shimchasisiz)
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Bugungi sanani YYYY-MM-DD ko'rinishida olish
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hozirgi oyni YYYY-MM ko'rinishida olish
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Sanani o'zbekcha chiroyli ko'rsatish
 * Masalan: "2026-03-02" -> "2-Mart, 2026" (yoki haftaning kuni bilan)
 */
export function formatDateUz(dateStr: string, includeDayOfWeek: boolean = true): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, monthIndex, day);
  const monthName = UZ_MONTHS[monthIndex] || '';
  const weekdayName = UZ_WEEKDAYS[dateObj.getDay()] || '';

  if (includeDayOfWeek) {
    return `${day}-${monthName}, ${year} (${weekdayName})`;
  }
  return `${day}-${monthName}, ${year}`;
}

/**
 * Oyni o'zbekcha ko'rsatish
 * Masalan: "2026-03" -> "Mart 2026"
 */
export function formatMonthUz(monthStr: string): string {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = UZ_MONTHS[monthIndex] || month;
  return `${monthName} ${year}`;
}

/**
 * Sanaga kun qo'shish yoki ayirish
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Telefon raqamini tekshirish (O'zbekiston formati)
 * Qabul qiladi: +998901234567, 998901234567, +998 90 123 45 67, 90 123 45 67
 */
export function isValidUzPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Majburiy emas
  const cleaned = phone.replace(/\D/g, '');
  // 998 bilan 12 xonali yoki 9 xonali (901234567)
  return (cleaned.length === 12 && cleaned.startsWith('998')) || cleaned.length === 9;
}

/**
 * Telefon raqamini standart formatga keltirish: +998 90 123 45 67
 */
export function formatUzPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  let full = cleaned;
  if (cleaned.length === 9) {
    full = '998' + cleaned;
  }
  if (full.length === 12 && full.startsWith('998')) {
    const code = full.slice(3, 5);
    const p1 = full.slice(5, 8);
    const p2 = full.slice(8, 10);
    const p3 = full.slice(10, 12);
    return `+998 ${code} ${p1} ${p2} ${p3}`;
  }
  return phone;
}

/**
 * Hisobotni CSV (Excel) formatida yuklab olish.
 * Excel'da o'zbekcha harflar (o', g', sh, ch) to'g'ri ko'rinishi uchun UTF-8 BOM (\uFEFF) qo'shiladi.
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  // Har bir katakni xavfsiz CSV formatiga o'tkazish
  const escapeCell = (cell: string | number): string => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows: string[] = [];
  csvRows.push(headers.map(escapeCell).join(','));

  for (const row of rows) {
    csvRows.push(row.map(escapeCell).join(','));
  }

  const csvContent = csvRows.join('\r\n');
  // UTF-8 BOM: \uFEFF Excel dasturi UTF-8 kodlashni to'g'ri tanishi uchun shart
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
