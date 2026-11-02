/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scissors, LogOut, KeyRound, RotateCcw } from 'lucide-react';
import { formatDateUz, getTodayDate } from '../utils/formatters';
import { updateMasterPassword } from '../utils/storage';

interface HeaderProps {
  onLogout: () => void;
  onResetData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  onResetData,
  onShowToast
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const todayStr = formatDateUz(getTodayDate(), true);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 3) {
      onShowToast("Yangi parol kamida 3 ta belgidan iborat bo'lishi kerak", 'error');
      return;
    }
    if (newPassword !== confirmPass) {
      onShowToast('Parollar bir-biriga mos kelmadi', 'error');
      return;
    }
    updateMasterPassword(newPassword.trim());
    onShowToast('Yangi parol muvaffaqiyatli saqlandi!', 'success');
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPass('');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Logo va sarlavha */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
                  Chevarxona
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  Sex hisobi
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tikuvchilik sexi ishchilari va maosh hisobi
              </p>
            </div>
          </div>

          {/* O'ng tomon amallar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden lg:flex items-center px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              📅 {todayStr}
            </div>

            {/* Parolni o'zgartirish tugmasi */}
            <button
              onClick={() => setShowPasswordModal(true)}
              title="Tizim parolini o'zgartirish"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Parol</span>
            </button>

            {/* Namunaviy ma'lumotlarni qayta tiklash */}
            <button
              onClick={onResetData}
              title="Namunaviy ma'lumotlarni qaytarish"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Namunaviy</span>
            </button>

            {/* Chiqish (Logout) */}
            <button
              onClick={onLogout}
              className="min-h-[40px] px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors text-xs sm:text-sm font-semibold flex items-center gap-1.5 border border-slate-200 hover:border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Parolni o'zgartirish modali */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Parolni oʻzgartirish</h3>
                <p className="text-xs text-slate-500">Yangi kirish parolini oʻrnating</p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yangi parol
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masalan: 1234"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yangi parolni tasdiqlang
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Qayta kiriting"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
