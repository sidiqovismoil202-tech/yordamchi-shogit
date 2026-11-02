/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Briefcase,
  Printer,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import {
  Worker,
  AttendanceRecord,
  ProductionRecord,
  AdvancePenaltyRecord,
  WorkerMonthlyPayroll
} from '../types';
import {
  formatSum,
  formatNumber,
  getCurrentMonth,
  formatMonthUz,
  exportToCSV
} from '../utils/formatters';
import { PaySlipModal } from './PaySlipModal';

interface PayrollTabProps {
  workers: Worker[];
  attendance: AttendanceRecord[];
  pieceworkRates: any[];
  production: ProductionRecord[];
  advances: AdvancePenaltyRecord[];
  shiftRate: number;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({
  workers,
  attendance,
  production,
  advances,
  shiftRate,
  onShowToast
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedSlipWorker, setSelectedSlipWorker] = useState<WorkerMonthlyPayroll | null>(null);

  // Oylik har bir ishchi bo'yicha maoshni hisoblash
  const payrollList: WorkerMonthlyPayroll[] = useMemo(() => {
    return workers.map((worker) => {
      // Shu oydagi davomat
      const workerAttendance = attendance.filter(
        (a) => a.workerId === worker.id && a.date.startsWith(selectedMonth)
      );

      let fullDays = 0;
      let halfDays = 0;
      let absentDays = 0;

      for (const a of workerAttendance) {
        if (a.status === 'keldi') fullDays++;
        else if (a.status === 'yarim_kun') halfDays++;
        else if (a.status === 'kelmadi') absentDays++;
      }

      // Keldi = 1, Yarim kun = 0.5
      const workedDays = fullDays + halfDays * 0.5;
      const shiftTotal = workedDays * shiftRate;

      // Shu oydagi bajarilgan ishlar
      const workerProduction = production.filter(
        (p) => p.workerId === worker.id && p.date.startsWith(selectedMonth)
      );

      let productionTotal = 0;
      let productionCount = 0;
      for (const p of workerProduction) {
        productionTotal += p.totalPrice;
        productionCount += p.quantity;
      }

      // Shu oydagi avans va jarimalar
      const workerAdvances = advances.filter(
        (ap) => ap.workerId === worker.id && ap.date.startsWith(selectedMonth)
      );

      let advanceTotal = 0;
      let penaltyTotal = 0;
      for (const ap of workerAdvances) {
        if (ap.type === 'avans') advanceTotal += ap.amount;
        else penaltyTotal += ap.amount;
      }

      // YAKUNIY MAOSH = Smena summasi + Dona summasi − Avans − Jarima
      const finalSalary = shiftTotal + productionTotal - advanceTotal - penaltyTotal;

      return {
        worker,
        workedDays,
        fullDays,
        halfDays,
        absentDays,
        shiftRate,
        shiftTotal,
        productionTotal,
        productionCount,
        advanceTotal,
        penaltyTotal,
        finalSalary,
        productionList: workerProduction,
        advancePenaltyList: workerAdvances,
        attendanceDates: workerAttendance.map((a) => ({ date: a.date, status: a.status }))
      };
    });
  }, [workers, attendance, production, advances, shiftRate, selectedMonth]);

  // Umumiy sex yig'indisi
  const overallTotals = useMemo(() => {
    let totalWorkedDays = 0;
    let totalShiftAmount = 0;
    let totalProductionAmount = 0;
    let totalAdvanceAmount = 0;
    let totalPenaltyAmount = 0;
    let totalFinalSalary = 0;

    for (const p of payrollList) {
      totalWorkedDays += p.workedDays;
      totalShiftAmount += p.shiftTotal;
      totalProductionAmount += p.productionTotal;
      totalAdvanceAmount += p.advanceTotal;
      totalPenaltyAmount += p.penaltyTotal;
      totalFinalSalary += p.finalSalary;
    }

    return {
      totalWorkedDays,
      totalShiftAmount,
      totalProductionAmount,
      totalAdvanceAmount,
      totalPenaltyAmount,
      totalFinalSalary
    };
  }, [payrollList]);

  // 8-BO'LIM: CSV (EXCEL) YUKLAB OLISH
  const handleExportCSV = () => {
    if (payrollList.length === 0) {
      onShowToast("Yuklab olish uchun ishchilar mavjud emas", 'error');
      return;
    }

    const headers = [
      '№',
      'Ishchi ism-familiyasi',
      'Lavozimi',
      'Ishlagan kunlar',
      "Smena haqi (so'm)",
      "Dona haqi (so'm)",
      "Avans (so'm)",
      "Jarima (so'm)",
      "Yakuniy maosh (so'm)"
    ];

    const rows: (string | number)[][] = payrollList.map((p, index) => [
      index + 1,
      p.worker.name,
      p.worker.role,
      `${p.workedDays} kun`,
      p.shiftTotal,
      p.productionTotal,
      p.advanceTotal,
      p.penaltyTotal,
      p.finalSalary
    ]);

    // Umumiy yakuniy qator
    rows.push([
      'JAMI',
      'Umumiy korxona boʻyicha',
      '',
      `${overallTotals.totalWorkedDays} kun`,
      overallTotals.totalShiftAmount,
      overallTotals.totalProductionAmount,
      overallTotals.totalAdvanceAmount,
      overallTotals.totalPenaltyAmount,
      overallTotals.totalFinalSalary
    ]);

    const filename = `Chevarxona_Oylik_Maosh_${selectedMonth}`;
    exportToCSV(filename, headers, rows);
    onShowToast("Oylik maosh hisoboti CSV (Excel) formatida yuklab olindi", 'success');
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Sarlavha va amallar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Oylik maosh hisob-kitobi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Smena, tikilgan buyumlar, avans va jarimalar asosida sof oylik
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Oy tanlagich */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* Excel yuklab olish (8-bo'lim) */}
          <button
            onClick={handleExportCSV}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Excel (CSV) formatida yuklab olish"
          >
            <Download className="w-4 h-4" />
            <span>Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* UMUMIY KORXONA KO'RSATKICHLARI (KORXONA JAMI) */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {formatMonthUz(selectedMonth)} oyi umumiy hisobi
              </h3>
              <p className="text-xs text-slate-400">
                Sex boʻyicha barcha ishchilar umumiy maosh fondi
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Ishchilar:</span>
            <div className="font-bold text-sm">{payrollList.length} nafar</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 font-medium">Jami smena haqi:</span>
            <div className="text-base font-bold text-white mt-1">
              +{formatSum(overallTotals.totalShiftAmount)}
            </div>
            <span className="text-[11px] text-slate-400">{overallTotals.totalWorkedDays} kun ishlangan</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 font-medium">Jami dona haqi:</span>
            <div className="text-base font-bold text-emerald-400 mt-1">
              +{formatSum(overallTotals.totalProductionAmount)}
            </div>
            <span className="text-[11px] text-slate-400">Bajarilgan ishlar</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 font-medium">Jami berilgan avans:</span>
            <div className="text-base font-bold text-blue-300 mt-1">
              -{formatSum(overallTotals.totalAdvanceAmount)}
            </div>
            <span className="text-[11px] text-slate-400">Oldindan toʻlangan</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-slate-400 font-medium">Jami jarimalar:</span>
            <div className="text-base font-bold text-rose-300 mt-1">
              -{formatSum(overallTotals.totalPenaltyAmount)}
            </div>
            <span className="text-[11px] text-slate-400">Ushlab qolingan</span>
          </div>
        </div>

        {/* Yakuniy to'lanadigan sof summa */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              JAMI TOʻLANADIGAN SOF MAOSH:
            </span>
            <div className="text-[11px] text-slate-400">
              (Smena + Dona − Avans − Jarima)
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300">
            {formatSum(overallTotals.totalFinalSalary)}
          </div>
        </div>
      </div>

      {/* ISHCHILAR JADVALI (DESKTOP) VA KARTOCHKALARI (MOBIL) */}
      {payrollList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
          Hisoblash uchun bironta ham ishchi topilmadi.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobil kartochkalar (sm gacha) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {payrollList.map((p) => (
              <div
                key={p.worker.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{p.worker.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold inline-block mt-0.5">
                      {p.worker.role}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedSlipWorker(p)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Varaqa</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400">Ishlagan:</span>
                    <div className="font-bold text-slate-800">{p.workedDays} kun</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Smena haqi:</span>
                    <div className="font-bold text-slate-800">+{formatSum(p.shiftTotal)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Dona haqi ({p.productionCount} ta):</span>
                    <div className="font-bold text-emerald-700">+{formatSum(p.productionTotal)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avans / Jarima:</span>
                    <div className="font-bold text-rose-700">
                      -{formatSum(p.advanceTotal + p.penaltyTotal)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Qoʻlga tegadigan:
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatSum(p.finalSalary)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Jadval (md va undan katta) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ishchi</th>
                    <th className="py-3.5 px-3">Lavozimi</th>
                    <th className="py-3.5 px-3 text-center">Kunlar</th>
                    <th className="py-3.5 px-3 text-right">Smena haqi</th>
                    <th className="py-3.5 px-3 text-right">Dona haqi</th>
                    <th className="py-3.5 px-3 text-right">Avans</th>
                    <th className="py-3.5 px-3 text-right">Jarima</th>
                    <th className="py-3.5 px-4 text-right">Yakuniy maosh</th>
                    <th className="py-3.5 px-3 text-center">Varaqa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {payrollList.map((p) => (
                    <tr key={p.worker.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.worker.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {p.worker.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        {p.workedDays} <span className="text-xs text-slate-400">kun</span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {formatSum(p.shiftTotal)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {formatSum(p.productionTotal)}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-700 font-semibold">
                        {p.advanceTotal > 0 ? `-${formatSum(p.advanceTotal)}` : '0'}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-700 font-semibold">
                        {p.penaltyTotal > 0 ? `-${formatSum(p.penaltyTotal)}` : '0'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-800 text-base">
                        {formatSum(p.finalSalary)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedSlipWorker(p)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Maosh varaqasini ko'rish va chop etish"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Chop etish</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Jadval ostidagi umumiy jami qatori */}
                  <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3.5 px-4 uppercase text-xs">Jami korxona:</td>
                    <td className="py-3.5 px-3"></td>
                    <td className="py-3.5 px-3 text-center font-black">
                      {overallTotals.totalWorkedDays} kun
                    </td>
                    <td className="py-3.5 px-3 text-right font-black">
                      {formatSum(overallTotals.totalShiftAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-800">
                      {formatSum(overallTotals.totalProductionAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-blue-800">
                      -{formatSum(overallTotals.totalAdvanceAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-rose-800">
                      -{formatSum(overallTotals.totalPenaltyAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-900 text-base">
                      {formatSum(overallTotals.totalFinalSalary)}
                    </td>
                    <td className="py-3.5 px-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tanlangan ishchining maosh varaqasi modali (Chop etish uchun) */}
      {selectedSlipWorker && (
        <PaySlipModal
          payroll={selectedSlipWorker}
          month={selectedMonth}
          onClose={() => setSelectedSlipWorker(null)}
        />
      )}
    </div>
  );
};
