/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  AlertCircle,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  X,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Worker, AdvancePenaltyRecord, TransactionType } from '../types';
import {
  formatSum,
  formatNumber,
  formatDateUz,
  getTodayDate,
  getCurrentMonth,
  formatMonthUz
} from '../utils/formatters';

interface AdvancePenaltyTabProps {
  workers: Worker[];
  records: AdvancePenaltyRecord[];
  onAddRecord: (record: Omit<AdvancePenaltyRecord, 'id' | 'createdAt'>) => void;
  onUpdateRecord: (id: string, updates: Partial<AdvancePenaltyRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (opts: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
}

export const AdvancePenaltyTab: React.FC<AdvancePenaltyTabProps> = ({
  workers,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onShowToast,
  onRequestConfirm
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'avans' | 'jarima'>('all');
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AdvancePenaltyRecord | null>(null);

  // Forma maydonlari
  const [formWorkerId, setFormWorkerId] = useState('');
  const [formType, setFormType] = useState<TransactionType>('avans');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(getTodayDate());
  const [formNote, setFormNote] = useState('');

  // Filtrlangan yozuvlar
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesMonth = rec.date.startsWith(selectedMonth);
        const matchesType =
          selectedTypeFilter === 'all' || rec.type === selectedTypeFilter;
        const matchesWorker =
          selectedWorkerFilter === 'all' || rec.workerId === selectedWorkerFilter;
        return matchesMonth && matchesType && matchesWorker;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, selectedMonth, selectedTypeFilter, selectedWorkerFilter]);

  // Statistik xulosa
  const stats = useMemo(() => {
    let totalAdvance = 0;
    let totalPenalty = 0;

    for (const r of filteredRecords) {
      if (r.type === 'avans') {
        totalAdvance += r.amount;
      } else {
        totalPenalty += r.amount;
      }
    }

    return {
      totalAdvance,
      totalPenalty,
      grandTotal: totalAdvance + totalPenalty
    };
  }, [filteredRecords]);

  const workerMap = useMemo(() => {
    const map = new Map<string, Worker>();
    for (const w of workers) {
      map.set(w.id, w);
    }
    return map;
  }, [workers]);

  const handleOpenAddModal = (defaultType: TransactionType = 'avans') => {
    if (workers.length === 0) {
      onShowToast("Avval ishchilar roʻyxatini kiriting", 'error');
      return;
    }
    setEditingRecord(null);
    setFormWorkerId(workers[0]?.id || '');
    setFormType(defaultType);
    setFormAmount('');
    setFormDate(getTodayDate());
    setFormNote('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: AdvancePenaltyRecord) => {
    setEditingRecord(rec);
    setFormWorkerId(rec.workerId);
    setFormType(rec.type);
    setFormAmount(String(rec.amount));
    setFormDate(rec.date);
    setFormNote(rec.note);
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(formAmount.replace(/\D/g, ''));

    if (!formWorkerId) {
      onShowToast("Ishchini tanlang", 'error');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      onShowToast("Summa 0 dan katta boʻlishi kerak", 'error');
      return;
    }
    if (!formDate) {
      onShowToast("Sanani kiriting", 'error');
      return;
    }
    if (!formNote.trim()) {
      onShowToast("Sababini yoki izohni yozing", 'error');
      return;
    }

    if (editingRecord) {
      onUpdateRecord(editingRecord.id, {
        workerId: formWorkerId,
        type: formType,
        amount: amountNum,
        date: formDate,
        note: formNote.trim()
      });
      onShowToast("Yozuv muvaffaqiyatli yangilandi", 'success');
    } else {
      onAddRecord({
        workerId: formWorkerId,
        type: formType,
        amount: amountNum,
        date: formDate,
        note: formNote.trim()
      });
      onShowToast(
        `${formType === 'avans' ? 'Avans' : 'Jarima'} kiritildi: ${formatSum(amountNum)}`,
        'success'
      );
    }

    setIsModalOpen(false);
  };

  const handleDeleteRecord = (rec: AdvancePenaltyRecord) => {
    const workerName = workerMap.get(rec.workerId)?.name || 'Ishchi';
    const typeLabel = rec.type === 'avans' ? 'avans' : 'jarima';

    onRequestConfirm({
      title: `${rec.type === 'avans' ? 'Avans' : 'Jarima'}ni oʻchirish`,
      message: `${workerName} ga tegishli ${formatSum(rec.amount)} lik ${typeLabel} yozuvini oʻchirmoqchimisiz?`,
      confirmText: "Ha, oʻchirish",
      onConfirm: () => {
        onDeleteRecord(rec.id);
        onShowToast("Yozuv oʻchirildi", 'info');
      }
    });
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Sarlavha va qo'shish tugmalari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Avans va Jarimalar hisobi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ishchilarga berilgan avanslar va hisoblangan jarimalar roʻyxati
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenAddModal('avans')}
            className="flex-1 sm:flex-none min-h-[48px] px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Avans berish</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('jarima')}
            className="flex-1 sm:flex-none min-h-[48px] px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 text-xs sm:text-sm cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>+ Jarima solish</span>
          </button>
        </div>
      </div>

      {/* Filtrlar va KPI ko'rsatkichlar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Oy */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Oy:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-slate-50 text-slate-800 cursor-pointer"
            />
          </div>

          {/* Tur filter (Barchasi / Avans / Jarima) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedTypeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setSelectedTypeFilter('avans')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedTypeFilter === 'avans'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Faqat avanslar
            </button>
            <button
              onClick={() => setSelectedTypeFilter('jarima')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedTypeFilter === 'jarima'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Faqat jarimalar
            </button>
          </div>

          {/* Ishchi bo'yicha filter */}
          <div className="flex items-center gap-2 flex-1">
            <select
              value={selectedWorkerFilter}
              onChange={(e) => setSelectedWorkerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-slate-50 text-slate-800 cursor-pointer"
            >
              <option value="all">Barcha ishchilar</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Xulosa kartalari */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-2xl">
            <div className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-blue-600" />
              <span>Jami avanslar</span>
            </div>
            <div className="text-base sm:text-xl font-black text-blue-950 mt-1">
              {formatSum(stats.totalAdvance)}
            </div>
          </div>

          <div className="bg-rose-50/80 border border-rose-200/80 p-3 rounded-2xl">
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Jami jarimalar</span>
            </div>
            <div className="text-base sm:text-xl font-black text-rose-950 mt-1">
              {formatSum(stats.totalPenalty)}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-100 border border-slate-200 p-3 rounded-2xl">
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Jami ushlanma</span>
            </div>
            <div className="text-base sm:text-xl font-black text-slate-900 mt-1">
              {formatSum(stats.grandTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Yozuvlar ro'yxati */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <p className="font-semibold text-slate-700">
            {formatMonthUz(selectedMonth)} oyi boʻyicha yozuvlar mavjud emas.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRecords.map((rec) => {
            const worker = workerMap.get(rec.workerId);
            const isAvans = rec.type === 'avans';

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {worker ? worker.name : "Oʻchirilgan ishchi"}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        isAvans
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isAvans ? 'Avans' : 'Jarima'}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateUz(rec.date, false)}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 inline-block">
                    💬 <span className="font-medium">{rec.note}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500">Summa:</div>
                    <div
                      className={`text-base sm:text-lg font-black ${
                        isAvans ? 'text-blue-700' : 'text-rose-700'
                      }`}
                    >
                      {isAvans ? '-' : '-'}{formatSum(rec.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(rec)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(rec)}
                      className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Oʻchirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Qo'shish / tahrirlash modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRecord
                  ? "Yozuvni tahrirlash"
                  : formType === 'avans'
                  ? "Avans berish"
                  : "Jarima solish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {/* Tur tanlash: Avans yoki Jarima */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Turini tanlang <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('avans')}
                    className={`min-h-[46px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      formType === 'avans'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Avans</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('jarima')}
                    className={`min-h-[46px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      formType === 'jarima'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Jarima</span>
                  </button>
                </div>
              </div>

              {/* Ishchi tanlash */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ishchi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formWorkerId}
                  onChange={(e) => setFormWorkerId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-semibold cursor-pointer"
                  required
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Summa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Summa (soʻmda) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(Number(formAmount.replace(/\D/g, '')))}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setFormAmount(digits);
                  }}
                  placeholder="Masalan: 200 000"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  required
                  autoFocus
                />
              </div>

              {/* Sana */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sana <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium cursor-pointer"
                  required
                />
              </div>

              {/* Izoh / Sabab */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Izoh yoki sababi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder={
                    formType === 'avans'
                      ? "Masalan: Uy xarajatlari uchun, roʻzgʻorga..."
                      : "Masalan: Mato kuydirilganligi yoki nuqson sababli..."
                  }
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  required
                />
              </div>

              {/* Tugmalar */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className={`flex-1 min-h-[48px] rounded-xl text-white font-bold text-sm shadow-md cursor-pointer ${
                    formType === 'avans'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingRecord ? "Saqlash" : "Kiritish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
