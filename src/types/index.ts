/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Ishchi lavozimlari
export type WorkerRole = 'Tikuvchi' | 'Bichuvchi' | 'Dazmolchi' | 'Yordamchi';

export const WORKER_ROLES: WorkerRole[] = [
  'Tikuvchi',
  'Bichuvchi',
  'Dazmolchi',
  'Yordamchi'
];

// Ishchi ma'lumoti
export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: WorkerRole;
  createdAt: string;
  active: boolean;
}

// Davomat holati
export type AttendanceStatus = 'keldi' | 'kelmadi' | 'yarim_kun';

// Davomat yozuvi (sana + ishchi ID bo'yicha)
export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  workerId: string;
  status: AttendanceStatus;
}

// Ish turi (dona narxi)
export interface PieceworkRate {
  id: string;
  name: string;
  price: number; // so'mda
  createdAt: string;
}

// 5-bo'lim: Bajarilgan ish yozuvi (har bir ishchi tikkan buyumlari)
export interface ProductionRecord {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  pieceworkRateId: string;
  pieceworkName: string;
  quantity: number; // dona soni
  unitPrice: number; // dona narxi (tarix buzilmasligi uchun saqlanadi)
  totalPrice: number; // jami summa = quantity * unitPrice
  note?: string; // ixtiyoriy izoh
  createdAt: string;
}

// 6-bo'lim: Avans va jarima yozuvi
export type TransactionType = 'avans' | 'jarima';

export interface AdvancePenaltyRecord {
  id: string;
  workerId: string;
  type: TransactionType;
  amount: number; // so'mda
  date: string; // YYYY-MM-DD
  note: string; // sababi / izoh
  createdAt: string;
}

// 7-bo'lim: Ishchining oylik maosh hisoboti
export interface WorkerMonthlyPayroll {
  worker: Worker;
  workedDays: number; // Keldi = 1, Yarim kun = 0.5
  fullDays: number; // Keldi soni
  halfDays: number; // Yarim kun soni
  absentDays: number; // Kelmadi soni
  shiftRate: number; // bir kunlik smena narxi
  shiftTotal: number; // smena summasi = workedDays * shiftRate
  productionTotal: number; // bajargan ishlar jami summasi
  productionCount: number; // bajargan jami dona soni
  advanceTotal: number; // jami olingan avans
  penaltyTotal: number; // jami jarima
  finalSalary: number; // Yakuniy maosh = shiftTotal + productionTotal - advanceTotal - penaltyTotal
  productionList: ProductionRecord[];
  advancePenaltyList: AdvancePenaltyRecord[];
  attendanceDates: { date: string; status: AttendanceStatus }[];
}

// Oylik umumiy korxona ko'rsatkichlari
export interface MonthlyOverallSummary {
  month: string; // YYYY-MM
  totalWorkedDays: number;
  totalShiftAmount: number;
  totalProductionCount: number;
  totalProductionAmount: number;
  totalAdvanceAmount: number;
  totalPenaltyAmount: number;
  totalFinalSalary: number;
}
