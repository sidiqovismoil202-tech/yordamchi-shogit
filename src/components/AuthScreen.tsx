/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Scissors, ArrowRight } from 'lucide-react';
import { getMasterPassword, setAuthSession } from '../utils/storage';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const currentMasterPassword = getMasterPassword();

    if (password.trim() === currentMasterPassword) {
      setAuthSession(true);
      onSuccess();
    } else {
      setErrorMessage('Parol notoʻgʻri. Qaytadan urinib koʻring.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
        {/* Sex logotipi va sarlavha */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-600/30">
            <Scissors className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Chevarxona Hisobi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Tikuvchilik sexi ishchilari, davomati va oylik maoshini boshqarish tizimi
          </p>
        </div>

        {/* Xatolik xabari */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center gap-2 animate-shake">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Kirish formasi */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="master-password"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Tizim parolini kiriting
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="master-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Parolni kiriting..."
                className="w-full pl-11 pr-12 min-h-[50px] text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              💡 Boshlangʻich parol: <span className="font-semibold text-emerald-700">1234</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full min-h-[50px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <span>Tizimga kirish</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          Xavfsiz sex boshqaruvi • Barcha maʼlumotlar qurilmangizda saqlanadi
        </div>
      </div>
    </div>
  );
};
