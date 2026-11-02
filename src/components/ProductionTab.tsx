/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Plus,
  Calendar,
  User,
  Layers,
  Edit2,
  Trash2,
  X,
  Package,
  Calculator
} from 'lucide-react';
import { Worker, PieceworkRate, ProductionRecord } from '../types';
import {
  formatSum,
  formatNumber,
  formatDateUz,
  getTodayDate,
  getCurrentMonth,
  formatMonthUz
} from '../utils/formatters';

interface ProductionTabProps {
  workers: Worker[];
  pieceworkRates: PieceworkRate[];
  production: ProductionRecord[];
  onAddProduction: (record: Omit<ProductionRecord, 'id' | 'createdAt'>) => void;
  onUpdateProduction: (id: string, updates: Partial<ProductionRecord>) => void;
  onDeleteProduction: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (opts: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({
  workers,
  pieceworkRates,
  production,
  onAddProduction,
  onUpdateProduction,
  onDeleteProduction,
  onShowToast,
  onRequestConfirm
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);

  // Forma maydonlari
  const [formWorkerId, setFormWorkerId] = useState('');
  const [formDate, setFormDate] = useState(getTodayDate());
  const [formRateId, setFormRateId] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formNote, setFormNote] = useState('');

  // Tanlangan ish turining narxi
  const selectedPieceworkRate = useMemo(() => {
    return pieceworkRates.find((r) => r.id === formRateId);
  }, [pieceworkRates, formRateId]);

  // Jonli hisoblanayotgan jami summa
  const calculatedLiveTotal = useMemo(() => {
    const qty = parseInt(formQuantity, 10) || 0;
    const price = selectedPieceworkRate ? selectedPieceworkRate.price : 0;
    return qty * price;
  }, [formQuantity, selectedPieceworkRate]);

  // Filtrlangan yozuvlar
  const filteredRecords = useMemo(() => {
    return production
      .filter((rec) => {
        const matchesMonth = rec.date.startsWith(selectedMonth);
        const matchesWorker =
          selectedWorkerFilter === 'all' || rec.workerId === selectedWorkerFilter;
        return matchesMonth && matchesWorker;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [production, selectedMonth, selectedWorkerFilter]);

  // Statistik xulosa
  const stats = useMemo(() => {
    let totalQty = 0;
    let totalAmount = 0;
    for (const r of filteredRecords) {
      totalQty += r.quantity;
      totalAmount += r.totalPrice;
    }
    return { totalQty, totalAmount };
  }, [filteredRecords]);

  // Ishchi xaritasini tuzish
  const workerMap = useMemo(() => {
    const map = new Map<string, Worker>();
    for (const w of workers) {
      map.set(w.id, w);
    }
    return map;
  }, [workers]);

  const handleOpenAddModal = () => {
    if (workers.length === 0) {
      onShowToast("Avval ishchilar roʻyxatini kiriting", 'error');
      return;
    }
    if (pieceworkRates.length === 0) {
      onShowToast("Avval 'Narxlar' boʻlimida ish turini qoʻshing", 'error');
      return;
    }

    setEditingRecord(null);
    setFormWorkerId(workers[0]?.id || '');
    setFormDate(getTodayDate());
    setFormRateId(pieceworkRates[0]?.id || '');
    setFormQuantity('1');
    setFormNote('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: ProductionRecord) => {
    setEditingRecord(rec);
    setFormWorkerId(rec.workerId);
    setFormDate(rec.date);
    setFormRateId(rec.pieceworkRateId);
    setFormQuantity(String(rec.quantity));
    setFormNote(rec.note || '');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formQuantity, 10);

    if (!formWorkerId) {
      onShowToast("Ishchini tanlang", 'error');
      return;
    }
    if (!formDate) {
      onShowToast("Sanani kiriting", 'error');
      return;
    }
    if (!formRateId) {
      onShowToast("Ish turini tanlang", 'error');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      onShowToast("Dona soni kamida 1 boʻlishi kerak", 'error');
      return;
    }

    const rateObj = pieceworkRates.find((r) => r.id === formRateId);
    const unitPrice = rateObj ? rateObj.price : 0;
    const totalPrice = qty * unitPrice;
    const pieceworkName = rateObj ? rateObj.name : 'Nomaʼlum ish';

    if (editingRecord) {
      onUpdateProduction(editingRecord.id, {
        workerId: formWorkerId,
        date: formDate,
        pieceworkRateId: formRateId,
        pieceworkName,
        quantity: qty,
        unitPrice,
        totalPrice,
        note: formNote.trim()
      });
      onShowToast("Bajarilgan ish maʼlumotlari yangilandi", 'success');
    } else {
      onAddProduction({
        workerId: formWorkerId,
        date: formDate,
        pieceworkRateId: formRateId,
        pieceworkName,
        quantity: qty,
        unitPrice,
        totalPrice,
        note: formNote.trim()
      });
      onShowToast(`Bajarilgan ish qoʻshildi: ${qty} dona (${formatSum(totalPrice)})`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteRecord = (rec: ProductionRecord) => {
    const workerName = workerMap.get(rec.workerId)?.name || 'Ishchi';
    onRequestConfirm({
      title: "Yozuvni oʻchirish",
      message: `${workerName} tomonidan tikilgan ${rec.quantity} dona "${rec.pieceworkName}" yozuvini oʻchirmoqchimisiz?`,
      confirmText: "Ha, oʻchirish",
      onConfirm: () => {
        onDeleteProduction(rec.id);
        onShowToast("Bajarilgan ish yozuvi oʻchirildi", 'info');
      }
    });
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Sarlavha va qo'shish tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bajarilgan ishlar (Dona hisobi)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Har bir ishchi tikkan buyumlar miqdori va summasi
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="min-h-[48px] px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-sm sm:text-base"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span>+ Bajarilgan ish qoʻshish</span>
        </button>
      </div>

      {/* Filtrlar va statistika */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Oy tanlagich */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Oy:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Ishchi bo'yicha filtr */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Ishchi:
            </span>
            <select
              value={selectedWorkerFilter}
              onChange={(e) => setSelectedWorkerFilter(e.target.value)}
              className="w-full sm:w-auto flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Barcha ishchilar</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tanlangan davr xulosasi */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Jami mahsulot</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {formatNumber(stats.totalQty)} <span className="text-xs font-semibold text-slate-500">dona</span>
            </div>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80">
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Jami summa</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-950 mt-1">
              {formatSum(stats.totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Yozuvlar ro'yxati */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <p className="font-semibold text-slate-700">
            {formatMonthUz(selectedMonth)} oyi uchun bajarilgan ishlar topilmadi.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Yuqoridagi "+ Bajarilgan ish qoʻshish" tugmasini bosing.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRecords.map((rec) => {
            const worker = workerMap.get(rec.workerId);
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
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {rec.pieceworkName}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateUz(rec.date, false)}
                    </span>
                    <span>
                      Dona soni: <strong className="text-slate-800">{rec.quantity} ta</strong>
                    </span>
                    <span>
                      Dona narxi: <strong className="text-slate-800">{formatSum(rec.unitPrice)}</strong>
                    </span>
                  </div>

                  {rec.note && (
                    <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg inline-block border border-slate-200/60">
                      💬 {rec.note}
                    </div>
                  )}
                </div>

                {/* Summa va amallar */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500">Summa:</div>
                    <div className="text-base sm:text-lg font-black text-emerald-700">
                      {formatSum(rec.totalPrice)}
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRecord ? "Bajarilgan ishni tahrirlash" : "Yangi bajarilgan ish kiritish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
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

              {/* Ish turi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ish turi (Mahsulot) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formRateId}
                  onChange={(e) => setFormRateId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-semibold cursor-pointer"
                  required
                >
                  {pieceworkRates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {formatSum(r.price)} / dona
                    </option>
                  ))}
                </select>
              </div>

              {/* Dona soni */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dona soni <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                    required
                  />
                  <div className="flex gap-1 shrink-0">
                    {[5, 10, 20].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setFormQuantity(String(quick))}
                        className="px-2.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        +{quick}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avtomatik hisoblangan summa */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-800">
                    Hisoblangan summa:
                  </div>
                  <div className="text-xs text-emerald-600">
                    {formQuantity || 0} dona × {formatSum(selectedPieceworkRate?.price || 0)}
                  </div>
                </div>
                <div className="text-lg font-black text-emerald-950">
                  {formatSum(calculatedLiveTotal)}
                </div>
              </div>

              {/* Izoh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Izoh (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Masalan: 2-partiya, qora rangli..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
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
                  className="flex-1 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer"
                >
                  {editingRecord ? "Saqlash" : "Qoʻshish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
