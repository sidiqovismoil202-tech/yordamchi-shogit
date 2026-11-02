/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Layers,
  X
} from 'lucide-react';
import { PieceworkRate } from '../types';
import { formatSum, formatNumber } from '../utils/formatters';

interface PricesTabProps {
  shiftRate: number;
  onSaveShiftRate: (rate: number) => void;
  pieceworkRates: PieceworkRate[];
  onAddPieceworkRate: (rate: Omit<PieceworkRate, 'id' | 'createdAt'>) => void;
  onUpdatePieceworkRate: (id: string, updates: Partial<PieceworkRate>) => void;
  onDeletePieceworkRate: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (opts: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
}

export const PricesTab: React.FC<PricesTabProps> = ({
  shiftRate,
  onSaveShiftRate,
  pieceworkRates,
  onAddPieceworkRate,
  onUpdatePieceworkRate,
  onDeletePieceworkRate,
  onShowToast,
  onRequestConfirm
}) => {
  // Smena narxi forma holati
  const [shiftRateInput, setShiftRateInput] = useState<string>(String(shiftRate));
  const [isShiftSaved, setIsShiftSaved] = useState<boolean>(false);

  // Ish turi modal holati
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<PieceworkRate | null>(null);
  const [rateName, setRateName] = useState('');
  const [ratePrice, setRatePrice] = useState('');

  // Smena narxini saqlash
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = Number(shiftRateInput.replace(/\D/g, ''));
    if (isNaN(cleaned) || cleaned <= 0) {
      onShowToast("Smena narxi 0 dan katta boʻlishi kerak", 'error');
      return;
    }
    onSaveShiftRate(cleaned);
    setIsShiftSaved(true);
    setTimeout(() => setIsShiftSaved(false), 2000);
    onShowToast(`Kunlik smena narxi saqlandi: ${formatSum(cleaned)}`, 'success');
  };

  const handleOpenAddModal = () => {
    setEditingRate(null);
    setRateName('');
    setRatePrice('');
    setIsRateModalOpen(true);
  };

  const handleOpenEditModal = (rate: PieceworkRate) => {
    setEditingRate(rate);
    setRateName(rate.name);
    setRatePrice(String(rate.price));
    setIsRateModalOpen(true);
  };

  const handleSubmitRate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = rateName.trim();
    const priceNum = Number(ratePrice.replace(/\D/g, ''));

    if (!trimmedName) {
      onShowToast("Ish turining nomini kiriting", 'error');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      onShowToast("Narx 0 dan katta boʻlishi kerak", 'error');
      return;
    }

    // Bir xil nomli ikki ish turi bo'lmasin
    const hasDuplicate = pieceworkRates.some(
      (r) =>
        r.name.toLowerCase() === trimmedName.toLowerCase() &&
        r.id !== editingRate?.id
      );

    if (hasDuplicate) {
      onShowToast(`"${trimmedName}" nomli ish turi allaqachon mavjud!`, 'error');
      return;
    }

    if (editingRate) {
      onUpdatePieceworkRate(editingRate.id, {
        name: trimmedName,
        price: priceNum
      });
      onShowToast("Ish turi narxi muvaffaqiyatli oʻzgartirildi", 'success');
    } else {
      onAddPieceworkRate({
        name: trimmedName,
        price: priceNum
      });
      onShowToast("Yangi ish turi qoʻshildi", 'success');
    }

    setIsRateModalOpen(false);
  };

  const handleDeleteRateClick = (rate: PieceworkRate) => {
    onRequestConfirm({
      title: "Ish turini o'chirish",
      message: `Rostdan ham "${rate.name}" ish turini o'chirmoqchimisiz? (Avval kiritilgan bajarilgan ishlar o'z narxi bilan saqlanib qoladi)`,
      confirmText: "Ha, o'chirish",
      onConfirm: () => {
        onDeletePieceworkRate(rate.id);
        onShowToast(`"${rate.name}" o'chirildi`, 'info');
      }
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Sarlavha */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Narxlar va Tariflar (Faqat ega uchun)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Kunlik smena narxi va har bir tikiladigan buyum dona narxlarini belgilash
        </p>
      </div>

      {/* 1. BIR KUNLIK SMENA NARXI */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Bir kunlik smena narxi
            </h3>
            <p className="text-xs text-slate-500">
              Ishchining 1 toʻliq ish kuni uchun hisoblanadigan bazaviy haq
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveShift} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={formatNumber(Number(shiftRateInput.replace(/\D/g, '')))}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                setShiftRateInput(digits);
              }}
              placeholder="Masalan: 100 000"
              className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              soʻm
            </span>
          </div>

          <button
            type="submit"
            className={`min-h-[48px] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isShiftSaved
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            {isShiftSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saqlandi!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Saqlash</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-2 text-xs text-slate-400">
          💡 Joriy belgilangan smena: <span className="font-semibold text-emerald-700">{formatSum(shiftRate)}</span> (yarim kun uchun: {formatSum(shiftRate / 2)})
        </p>
      </div>

      {/* 2. ISH TURLARI RO'YXATI (DONA NARXI) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Ish turlari va dona narxlari ({pieceworkRates.length})
              </h3>
              <p className="text-xs text-slate-500">
                Har bir tikilgan mahsulot uchun toʻlanadigan dona haqi
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ish turi qoʻshish</span>
          </button>
        </div>

        {/* Ish turlari ro'yxati */}
        {pieceworkRates.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Hozircha ish turlari mavjud emas. Yuqoridagi tugma orqali qoʻshing.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {pieceworkRates.map((rate) => (
              <div
                key={rate.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="font-bold text-slate-900 text-base">
                    {rate.name}
                  </div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">
                    {formatSum(rate.price)} <span className="text-xs font-normal text-slate-500">/ dona</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(rate)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="O'zgartirish"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRateClick(rate)}
                    className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ish turi qo'shish / tahrirlash modali */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingRate ? "Ish turini tahrirlash" : "Yangi ish turi qoʻshish"}
              </h3>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ish turi nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={rateName}
                  onChange={(e) => setRateName(e.target.value)}
                  placeholder="Masalan: Ko'ylak, Shim, Kurtka..."
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1 dona uchun narx (soʻmda) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(Number(ratePrice.replace(/\D/g, '')))}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setRatePrice(digits);
                  }}
                  placeholder="Masalan: 15 000"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-semibold"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="flex-1 min-h-[46px] rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingRate ? "Saqlash" : "Qoʻshish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
