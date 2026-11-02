/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Worker,
  AttendanceRecord,
  PieceworkRate,
  ProductionRecord,
  AdvancePenaltyRecord
} from '../types';
import { getTodayDate, addDaysToDate } from './formatters';

// ============================================================
// BOSHLANG'ICH PAROL: Bu yerda tizim parolini o'zgartirishingiz mumkin
// ============================================================
export const DEFAULT_MASTER_PASSWORD = '1234'; // Boshlang'ich parol: 1234

const KEYS = {
  AUTH_SESSION: 'chevar_auth_session',
  PASSWORD: 'chevar_master_password',
  SHIFT_RATE: 'chevar_shift_rate',
  WORKERS: 'chevar_workers_list',
  PIECEWORK_RATES: 'chevar_piecework_rates',
  ATTENDANCE: 'chevar_attendance_records',
  PRODUCTION: 'chevar_production_records',
  ADVANCES: 'chevar_advance_penalty_records'
};

// Boshlang'ich namunaviy ish turlari (foydalanuvchi talabiga ko'ra)
const INITIAL_PIECEWORK_RATES: PieceworkRate[] = [
  { id: 'rate-1', name: "Ko'ylak", price: 15000, createdAt: new Date().toISOString() },
  { id: 'rate-2', name: 'Shim', price: 20000, createdAt: new Date().toISOString() },
  { id: 'rate-3', name: 'Kurtka', price: 40000, createdAt: new Date().toISOString() },
  { id: 'rate-4', name: 'Nimcha', price: 18000, createdAt: new Date().toISOString() },
  { id: 'rate-5', name: 'Xalat', price: 22000, createdAt: new Date().toISOString() }
];

// Boshlang'ich namunaviy ishchilar
const INITIAL_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    name: 'Dilnoza Karimova',
    phone: '+998 90 123 45 67',
    role: 'Tikuvchi',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'worker-2',
    name: 'Malika Rahimova',
    phone: '+998 91 234 56 78',
    role: 'Tikuvchi',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'worker-3',
    name: 'Nodir Usmonov',
    phone: '+998 93 345 67 89',
    role: 'Bichuvchi',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'worker-4',
    name: 'Zuhra Alimova',
    phone: '+998 94 456 78 90',
    role: 'Dazmolchi',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'worker-5',
    name: 'Jasur Toirov',
    phone: '+998 97 567 89 01',
    role: 'Yordamchi',
    createdAt: new Date().toISOString(),
    active: true
  }
];

// --- 1-BO'LIM: KIRISH VA PAROL ---
export function checkAuthSession(): boolean {
  try {
    return localStorage.getItem(KEYS.AUTH_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setAuthSession(isLoggedIn: boolean): void {
  try {
    if (isLoggedIn) {
      localStorage.setItem(KEYS.AUTH_SESSION, 'true');
    } else {
      localStorage.removeItem(KEYS.AUTH_SESSION);
    }
  } catch (e) {
    console.error('Session saqlashda xato:', e);
  }
}

export function getMasterPassword(): string {
  try {
    return localStorage.getItem(KEYS.PASSWORD) || DEFAULT_MASTER_PASSWORD;
  } catch {
    return DEFAULT_MASTER_PASSWORD;
  }
}

export function updateMasterPassword(newPass: string): void {
  try {
    localStorage.setItem(KEYS.PASSWORD, newPass);
  } catch (e) {
    console.error('Parolni saqlashda xato:', e);
  }
}

// --- 4-BO'LIM: BIR SMENA NARXI ---
export function getShiftRate(): number {
  try {
    const val = localStorage.getItem(KEYS.SHIFT_RATE);
    return val ? Math.max(0, Number(val)) : 100000; // Boshlang'ich 100 000 so'm
  } catch {
    return 100000;
  }
}

export function saveShiftRate(rate: number): void {
  try {
    localStorage.setItem(KEYS.SHIFT_RATE, String(rate));
  } catch (e) {
    console.error('Smena narxini saqlashda xato:', e);
  }
}

// --- 4-BO'LIM: ISH TURLARI (DONA NARXLARI) ---
export function getPieceworkRates(): PieceworkRate[] {
  try {
    const raw = localStorage.getItem(KEYS.PIECEWORK_RATES);
    if (!raw) {
      localStorage.setItem(KEYS.PIECEWORK_RATES, JSON.stringify(INITIAL_PIECEWORK_RATES));
      return INITIAL_PIECEWORK_RATES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PIECEWORK_RATES;
  }
}

export function savePieceworkRates(rates: PieceworkRate[]): void {
  try {
    localStorage.setItem(KEYS.PIECEWORK_RATES, JSON.stringify(rates));
  } catch (e) {
    console.error('Ish turlarini saqlashda xato:', e);
  }
}

// --- 2-BO'LIM: ISHCHILAR ---
export function getWorkers(): Worker[] {
  try {
    const raw = localStorage.getItem(KEYS.WORKERS);
    if (!raw) {
      localStorage.setItem(KEYS.WORKERS, JSON.stringify(INITIAL_WORKERS));
      return INITIAL_WORKERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WORKERS;
  }
}

export function saveWorkers(workers: Worker[]): void {
  try {
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  } catch (e) {
    console.error('Ishchilarni saqlashda xato:', e);
  }
}

// --- 3-BO'LIM: DAVOMAT ---
export function getAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    if (!raw) {
      // Boshlang'ich bugungi va kechagi namunaviy davomat
      const today = getTodayDate();
      const yesterday = addDaysToDate(today, -1);
      const demoAttendance: AttendanceRecord[] = [
        { date: today, workerId: 'worker-1', status: 'keldi' },
        { date: today, workerId: 'worker-2', status: 'keldi' },
        { date: today, workerId: 'worker-3', status: 'keldi' },
        { date: today, workerId: 'worker-4', status: 'yarim_kun' },
        { date: today, workerId: 'worker-5', status: 'keldi' },
        { date: yesterday, workerId: 'worker-1', status: 'keldi' },
        { date: yesterday, workerId: 'worker-2', status: 'keldi' },
        { date: yesterday, workerId: 'worker-3', status: 'kelmadi' },
        { date: yesterday, workerId: 'worker-4', status: 'keldi' },
        { date: yesterday, workerId: 'worker-5', status: 'keldi' }
      ];
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(demoAttendance));
      return demoAttendance;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttendance(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Davomatni saqlashda xato:', e);
  }
}

// --- 5-BO'LIM: BAJARILGAN ISHLAR ---
export function getProduction(): ProductionRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTION);
    if (!raw) {
      const today = getTodayDate();
      const yesterday = addDaysToDate(today, -1);
      const demoProd: ProductionRecord[] = [
        {
          id: 'prod-1',
          workerId: 'worker-1',
          date: today,
          pieceworkRateId: 'rate-1',
          pieceworkName: "Ko'ylak",
          quantity: 12,
          unitPrice: 15000,
          totalPrice: 180000,
          note: 'Gulli ipak koʻylak',
          createdAt: new Date().toISOString()
        },
        {
          id: 'prod-2',
          workerId: 'worker-2',
          date: today,
          pieceworkRateId: 'rate-2',
          pieceworkName: 'Shim',
          quantity: 8,
          unitPrice: 20000,
          totalPrice: 160000,
          note: 'Klassik erkaklar shimi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'prod-3',
          workerId: 'worker-3',
          date: yesterday,
          pieceworkRateId: 'rate-3',
          pieceworkName: 'Kurtka',
          quantity: 5,
          unitPrice: 40000,
          totalPrice: 200000,
          note: 'Kuzgi kurtkalar bichimi',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(KEYS.PRODUCTION, JSON.stringify(demoProd));
      return demoProd;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProduction(records: ProductionRecord[]): void {
  try {
    localStorage.setItem(KEYS.PRODUCTION, JSON.stringify(records));
  } catch (e) {
    console.error('Bajarilgan ishlarni saqlashda xato:', e);
  }
}

// --- 6-BO'LIM: AVANS VA JARIMA ---
export function getAdvancePenalties(): AdvancePenaltyRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.ADVANCES);
    if (!raw) {
      const today = getTodayDate();
      const demoRecords: AdvancePenaltyRecord[] = [
        {
          id: 'adv-1',
          workerId: 'worker-1',
          type: 'avans',
          amount: 200000,
          date: today,
          note: 'Roʻzgʻor xarajatlari uchun',
          createdAt: new Date().toISOString()
        },
        {
          id: 'adv-2',
          workerId: 'worker-4',
          type: 'jarima',
          amount: 30000,
          date: today,
          note: 'Dazmolda mato kuydirilganligi uchun',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(KEYS.ADVANCES, JSON.stringify(demoRecords));
      return demoRecords;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAdvancePenalties(records: AdvancePenaltyRecord[]): void {
  try {
    localStorage.setItem(KEYS.ADVANCES, JSON.stringify(records));
  } catch (e) {
    console.error('Avans/jarimalarni saqlashda xato:', e);
  }
}

// Barcha ma'lumotlarni qayta namunaviy holatga tiklash
export function resetToDemoData(): void {
  try {
    localStorage.removeItem(KEYS.WORKERS);
    localStorage.removeItem(KEYS.PIECEWORK_RATES);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.PRODUCTION);
    localStorage.removeItem(KEYS.ADVANCES);
    localStorage.removeItem(KEYS.SHIFT_RATE);
  } catch (e) {
    console.error('Qayta tiklashda xato:', e);
  }
}
