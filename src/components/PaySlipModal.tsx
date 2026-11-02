/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, X, Scissors, Calendar, User, CheckCircle2 } from 'lucide-react';
import { WorkerMonthlyPayroll } from '../types';
import {
  formatSum,
  formatNumber,
  formatMonthUz,
  formatDateUz,
  getTodayDate
} from '../utils/formatters';

interface PaySlipModalProps {
  payroll: WorkerMonthlyPayroll;
  month: string; // YYYY-MM
  onClose: () => void;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  payroll,
  month,
  onClose
}) => {
  const {
    worker,
    workedDays,
    fullDays,
    halfDays,
    shiftRate,
    shiftTotal,
    productionTotal,
    productionCount,
    advanceTotal,
    penaltyTotal,
    finalSalary,
    productionList,
    advancePenaltyList
  } = payroll;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = formatDateUz(getTodayDate(), false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      {/* Modal oynasi */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto print-area">
        {/* Yuqori boshqaruv paneli (Chop etishda ko'rinmaydi) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Ishchi maosh varaqasi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CHOP ETILADIGAN MAOSH VARAQASI */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          {/* Sex sarlavhasi */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Scissors className="w-6 h-6 text-emerald-700" />
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Chevarxona Tikuvchilik Sexi
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ishchining oylik hisob-kitob va maosh varaqasi
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                {formatMonthUz(month)} oyi
              </span>
              <div className="text-[11px] text-slate-400 mt-1">Sana: {todayStr}</div>
            </div>
          </div>

          {/* Ishchi ma'lumoti */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Ishchi:</div>
              <div className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                {worker.name}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Lavozim:</div>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {worker.role}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Telefon:</div>
              <div className="font-semibold text-slate-700 text-xs sm:text-sm mt-0.5">
                {worker.phone || "—"}
              </div>
            </div>
          </div>

          {/* 1. Smena hisobi */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>1. Davomat va Kunlik Smena hisobi</span>
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Toʻliq kun (Keldi)</th>
                    <th className="p-2.5">Yarim kun (0.5)</th>
                    <th className="p-2.5">Jami hisoblangan kun</th>
                    <th className="p-2.5">1 kunlik smena</th>
                    <th className="p-2.5 text-right">Smena summasi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5">{fullDays} kun</td>
                    <td className="p-2.5">{halfDays} kun</td>
                    <td className="p-2.5 font-bold text-slate-900">{workedDays} kun</td>
                    <td className="p-2.5">{formatSum(shiftRate)}</td>
                    <td className="p-2.5 text-right font-black text-emerald-800">
                      {formatSum(shiftTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Bajarilgan ishlar (Dona hisobi) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Tikilgan buyumlar (Dona hisobi)
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Jami: {productionCount} dona
              </span>
            </div>
            {productionList.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Ushbu oyda dona hisobida bajarilgan ishlar kiritilmagan.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Sana</th>
                      <th className="p-2.5">Mahsulot / Ish turi</th>
                      <th className="p-2.5">Dona soni</th>
                      <th className="p-2.5">Dona narxi</th>
                      <th className="p-2.5 text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productionList.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 text-slate-500">{p.date}</td>
                        <td className="p-2 font-semibold text-slate-800">{p.pieceworkName}</td>
                        <td className="p-2 font-bold">{p.quantity} ta</td>
                        <td className="p-2 text-slate-600">{formatSum(p.unitPrice)}</td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          {formatSum(p.totalPrice)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={4} className="p-2.5 text-right text-slate-700">
                        Bajarilgan ishlar jami:
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-800">
                        {formatSum(productionTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Avans va Jarimalar */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              3. Olingan avanslar va hisoblangan jarimalar
            </h3>
            {advancePenaltyList.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Ushbu oyda avans yoki jarimalar mavjud emas.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Sana</th>
                      <th className="p-2.5">Turi</th>
                      <th className="p-2.5">Sababi / Izoh</th>
                      <th className="p-2.5 text-right">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {advancePenaltyList.map((ap) => (
                      <tr key={ap.id}>
                        <td className="p-2 text-slate-500">{ap.date}</td>
                        <td className="p-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              ap.type === 'avans'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {ap.type === 'avans' ? 'Avans' : 'Jarima'}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600">{ap.note}</td>
                        <td className="p-2 text-right font-bold text-rose-700">
                          -{formatSum(ap.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. YAKUNIY HISOB-KITOB BLOKI */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-400">Smena haqi:</span>
                <div className="font-bold text-slate-200 mt-0.5">+{formatSum(shiftTotal)}</div>
              </div>
              <div>
                <span className="text-slate-400">Dona haqi:</span>
                <div className="font-bold text-slate-200 mt-0.5">+{formatSum(productionTotal)}</div>
              </div>
              <div>
                <span className="text-slate-400">Avans ushlanmasi:</span>
                <div className="font-bold text-rose-300 mt-0.5">-{formatSum(advanceTotal)}</div>
              </div>
              <div>
                <span className="text-slate-400">Jarima ushlanmasi:</span>
                <div className="font-bold text-rose-300 mt-0.5">-{formatSum(penaltyTotal)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Qoʻlga tegadigan yakuniy maosh:
                </div>
                <div className="text-[11px] text-slate-400">
                  (Smena + Dona − Avans − Jarima)
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                {formatSum(finalSalary)}
              </div>
            </div>
          </div>

          {/* Imzo bo'limi */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div className="space-y-6">
              <div>Sex rahbari: _______________________</div>
              <div className="text-[11px] text-slate-400">(imzo va sana)</div>
            </div>
            <div className="space-y-6 text-right">
              <div>Ishchi qabul qildi: _______________________</div>
              <div className="text-[11px] text-slate-400">(imzo va sana)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
