/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  CheckCheck,
  Calendar
} from 'lucide-react';
import { Worker, AttendanceRecord, AttendanceStatus } from '../types';
import {
  getTodayDate,
  addDaysToDate,
  formatDateUz
} from '../utils/formatters';

interface AttendanceTabProps {
  workers: Worker[];
  attendance: AttendanceRecord[];
  onSetStatus: (date: string, workerId: string, status: AttendanceStatus | null) => void;
  onSetAllPresent: (date: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (opts: {
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  workers,
  attendance,
  onSetStatus,
  onSetAllPresent,
  onShowToast,
  onRequestConfirm
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  // Tanlangan sana uchun xaritalash: workerId -> status
  const dayStatusMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const record of attendance) {
      if (record.date === selectedDate) {
        map.set(record.workerId, record.status);
      }
    }
    return map;
  }, [attendance, selectedDate]);

  // Kunlik xulosa hisoblash: Keldi, Kelmadi, Yarim kun, Belgilanmagan
  const summary = useMemo(() => {
    let keldi = 0;
    let kelmadi = 0;
    let yarimKun = 0;
    let unassigned = 0;

    for (const worker of workers) {
      const st = dayStatusMap.get(worker.id);
      if (st === 'keldi') keldi++;
      else if (st === 'kelmadi') kelmadi++;
      else if (st === 'yarim_kun') yarimKun++;
      else unassigned++;
    }

    return { keldi, kelmadi, yarimKun, unassigned };
  }, [workers, dayStatusMap]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDaysToDate(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDaysToDate(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(getTodayDate());
  };

  const handleToggleStatus = (workerId: string, clickedStatus: AttendanceStatus) => {
    const currentStatus = dayStatusMap.get(workerId);
    // Xuddi shu tugmani qayta bossa, belgi bekor bo'ladi (null)
    const nextStatus = currentStatus === clickedStatus ? null : clickedStatus;
    onSetStatus(selectedDate, workerId, nextStatus);
  };

  const handleMarkAllPresentClick = () => {
    if (workers.length === 0) {
      onShowToast("Avval ishchilar roʻyxatini toʻldiring", 'error');
      return;
    }

    onRequestConfirm({
      title: "Barchasini belgilash",
      message: `Tanlangan kun (${formatDateUz(selectedDate, false)}) uchun barcha ishchilarni "Keldi" deb belgilamoqchimisiz?`,
      confirmText: "Ha, hammasi keldi",
      isDanger: false,
      onConfirm: () => {
        onSetAllPresent(selectedDate);
        onShowToast("Barcha ishchilar 'Keldi' deb belgilandi", 'success');
      }
    });
  };

  const isToday = selectedDate === getTodayDate();

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* SANA TANLASH PANELI */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Oldingi / Keyingi kun navigatsiyasi */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="min-h-[46px] min-w-[46px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer text-slate-700"
            title="Oldingi kun"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 hover:bg-slate-100 transition-colors">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {formatDateUz(selectedDate, true)}
                </span>
              </div>
            </div>

            {!isToday && (
              <button
                onClick={handleToday}
                className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
              >
                Bugun
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="min-h-[46px] min-w-[46px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer text-slate-700"
            title="Keyingi kun"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tezkor belgilash tugmasi */}
        <button
          onClick={handleMarkAllPresentClick}
          className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>Hammasini "Keldi" deb belgilash</span>
        </button>
      </div>

      {/* KUNLIK XULOSA STATISTIKASI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-emerald-50/90 border border-emerald-200/80 p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-900">{summary.keldi}</div>
            <div className="text-xs font-semibold text-emerald-700">Keldi</div>
          </div>
        </div>

        <div className="bg-rose-50/90 border border-rose-200/80 p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-rose-900">{summary.kelmadi}</div>
            <div className="text-xs font-semibold text-rose-700">Kelmadi</div>
          </div>
        </div>

        <div className="bg-amber-50/90 border border-amber-200/80 p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-900">{summary.yarimKun}</div>
            <div className="text-xs font-semibold text-amber-700">Yarim kun (0.5)</div>
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-400 text-white rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{summary.unassigned}</div>
            <div className="text-xs font-semibold text-slate-600">Belgilanmagan</div>
          </div>
        </div>
      </div>

      {/* ISHCHILAR DAVOMAT RO'YXATI */}
      {workers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
          Avval "Ishchilar" boʻlimidan xodimlarni qoʻshing.
        </div>
      ) : (
        <div className="space-y-2.5">
          {workers.map((worker) => {
            const currentStatus = dayStatusMap.get(worker.id);

            return (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                {/* Ishchi nomi va lavozimi */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {worker.name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {worker.role}
                    </span>
                  </div>
                </div>

                {/* 3 ta katta tugma (kamida 48px) */}
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:min-w-[340px]">
                  {/* KELDI TUGMASI (Yashil) */}
                  <button
                    onClick={() => handleToggleStatus(worker.id, 'keldi')}
                    className={`min-h-[48px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'keldi'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600 ring-offset-1'
                        : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Keldi</span>
                  </button>

                  {/* YARIM KUN TUGMASI (Sariq) */}
                  <button
                    onClick={() => handleToggleStatus(worker.id, 'yarim_kun')}
                    className={`min-h-[48px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'yarim_kun'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-1'
                        : 'bg-amber-50/80 hover:bg-amber-100 text-amber-800 border border-amber-200/70'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Yarim kun</span>
                  </button>

                  {/* KELMADI TUGMASI (Qizil) */}
                  <button
                    onClick={() => handleToggleStatus(worker.id, 'kelmadi')}
                    className={`min-h-[48px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentStatus === 'kelmadi'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600 ring-offset-1'
                        : 'bg-rose-50/80 hover:bg-rose-100 text-rose-800 border border-rose-200/70'
                    }`}
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Kelmadi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
