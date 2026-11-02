/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Edit2,
  Trash2,
  Users,
  Briefcase,
  X,
  Check
} from 'lucide-react';
import { Worker, WorkerRole, WORKER_ROLES } from '../types';
import { isValidUzPhone, formatUzPhone } from '../utils/formatters';

interface WorkersTabProps {
  workers: Worker[];
  onAddWorker: (worker: Omit<Worker, 'id' | 'createdAt' | 'active'>) => void;
  onUpdateWorker: (id: string, updates: Partial<Worker>) => void;
  onDeleteWorker: (id: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (opts: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void;
}

export const WorkersTab: React.FC<WorkersTabProps> = ({
  workers,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker,
  onShowToast,
  onRequestConfirm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Forma holatlari
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<WorkerRole>('Tikuvchi');
  const [phoneError, setPhoneError] = useState('');

  // Filtrlangan ishchilar
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.phone.includes(searchTerm);
      const matchRole =
        selectedRoleFilter === 'all' || w.role === selectedRoleFilter;
      return matchSearch && matchRole;
    });
  }, [workers, searchTerm, selectedRoleFilter]);

  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setFormName('');
    setFormPhone('');
    setFormRole('Tikuvchi');
    setPhoneError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormName(worker.name);
    setFormPhone(worker.phone);
    setFormRole(worker.role);
    setPhoneError('');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onShowToast("Iltimos, ishchining ismini kiriting", 'error');
      return;
    }

    if (formPhone.trim() && !isValidUzPhone(formPhone.trim())) {
      setPhoneError("Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67");
      onShowToast("Telefon raqami formati noto'g'ri", 'error');
      return;
    }

    const formattedPhone = formPhone.trim() ? formatUzPhone(formPhone.trim()) : '';

    if (editingWorker) {
      onUpdateWorker(editingWorker.id, {
        name: formName.trim(),
        phone: formattedPhone,
        role: formRole
      });
      onShowToast("Ishchi ma'lumotlari muvaffaqiyatli yangilandi", 'success');
    } else {
      onAddWorker({
        name: formName.trim(),
        phone: formattedPhone,
        role: formRole
      });
      onShowToast("Yangi ishchi qo'shildi", 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (worker: Worker) => {
    onRequestConfirm({
      title: "Ishchini o'chirish",
      message: `Rostdan ham "${worker.name}"ni o'chirmoqchimisiz? (Avvalgi yozuvlar saqlanib qoladi)`,
      confirmText: "Ha, o'chirish",
      onConfirm: () => {
        onDeleteWorker(worker.id);
        onShowToast(`"${worker.name}" ro'yxatdan o'chirildi`, 'info');
      }
    });
  };

  const getRoleBadgeColor = (role: WorkerRole) => {
    switch (role) {
      case 'Tikuvchi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bichuvchi':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Dazmolchi':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Yordamchi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Yuqori boshqaruv paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sex ishchilari ({workers.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tikuvchilar, bichuvchilar va sex xodimlarini boshqarish
          </p>
        </div>

        {/* Katta + Ishchi qo'shish tugmasi (kamida 48px) */}
        <button
          onClick={handleOpenAddModal}
          className="min-h-[48px] px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-sm sm:text-base"
        >
          <UserPlus className="w-5 h-5 shrink-0" />
          <span>+ Ishchi qoʻshish</span>
        </button>
      </div>

      {/* Qidiruv va lavozim filtri */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        {/* Qidirish maydoni */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ism yoki telefon boʻyicha qidirish..."
            className="w-full pl-11 pr-4 min-h-[46px] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Lavozim filtri */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedRoleFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Barchasi ({workers.length})
          </button>
          {WORKER_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedRoleFilter === role
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Ishchilar ro'yxati yoki bo'sh holat */}
      {filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchTerm || selectedRoleFilter !== 'all'
              ? "Qidiruv boʻyicha hech kim topilmadi"
              : "Hozircha ishchilar yoʻq"}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedRoleFilter !== 'all'
              ? "Qidiruv soʻzini oʻzgartirib koʻring yoki filtrni bekor qiling."
              : "Tikuv sexi xodimlarini hisobga olish uchun birinchi ishchini qoʻshing."}
          </p>
          {!searchTerm && selectedRoleFilter === 'all' && (
            <button
              onClick={handleOpenAddModal}
              className="mt-5 min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 cursor-pointer shadow-sm"
            >
              + Birinchi ishchini qoʻshish
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between"
            >
              <div>
                {/* Ism va lavozim */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {worker.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                          worker.role
                        )}`}
                      >
                        <Briefcase className="w-3 h-3" />
                        {worker.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Telefon raqami */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{worker.phone || "Telefon kiritilmagan"}</span>
                  </div>
                  {worker.phone && (
                    <a
                      href={`tel:${worker.phone.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      Qoʻngʻiroq
                    </a>
                  )}
                </div>
              </div>

              {/* Tahrirlash va o'chirish tugmalari */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(worker)}
                  className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(worker)}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                  title="Ishchini o'chirish"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="sr-only">Oʻchirish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ishchi qo'shish / tahrirlash modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingWorker ? "Ishchini tahrirlash" : "Yangi ishchi qoʻshish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {/* Ism-familiya */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ism-familiya <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Masalan: Dilnoza Karimova"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                  required
                  autoFocus
                />
              </div>

              {/* Telefon raqami */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Telefon raqami (ixtiyoriy)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => {
                    setFormPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="+998 90 123 45 67"
                  className={`w-full px-3.5 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 ${
                    phoneError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {phoneError ? (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{phoneError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Format: +998 XX XXX XX XX
                  </p>
                )}
              </div>

              {/* Lavozim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lavozim <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKER_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`min-h-[46px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                        formRole === role
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{role}</span>
                      {formRole === role && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal tugmalari */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-[48px] rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md cursor-pointer"
                >
                  {editingWorker ? "Saqlash" : "Qoʻshish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
