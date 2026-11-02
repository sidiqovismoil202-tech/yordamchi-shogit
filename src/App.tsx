/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  checkAuthSession,
  setAuthSession,
  getWorkers,
  saveWorkers,
  getAttendance,
  saveAttendance,
  getShiftRate,
  saveShiftRate,
  getPieceworkRates,
  savePieceworkRates,
  getProduction,
  saveProduction,
  getAdvancePenalties,
  saveAdvancePenalties,
  resetToDemoData
} from './utils/storage';
import {
  Worker,
  AttendanceRecord,
  AttendanceStatus,
  PieceworkRate,
  ProductionRecord,
  AdvancePenaltyRecord
} from './types';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { WorkersTab } from './components/WorkersTab';
import { AttendanceTab } from './components/AttendanceTab';
import { PricesTab } from './components/PricesTab';
import { ProductionTab } from './components/ProductionTab';
import { AdvancePenaltyTab } from './components/AdvancePenaltyTab';
import { PayrollTab } from './components/PayrollTab';
import { Toast, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  // 1-BO'LIM: KIRISH VA SESSIYA
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAuthSession());

  // Asosiy bo'limlar navigatsiyasi
  const [activeTab, setActiveTab] = useState<TabType>('workers');

  // Ma'lumotlar holatlari (Local Storage bilan sinxron)
  const [workers, setWorkers] = useState<Worker[]>(() => getWorkers());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getAttendance());
  const [shiftRate, setShiftRateState] = useState<number>(() => getShiftRate());
  const [pieceworkRates, setPieceworkRatesState] = useState<PieceworkRate[]>(() => getPieceworkRates());
  const [production, setProductionState] = useState<ProductionRecord[]>(() => getProduction());
  const [advances, setAdvancesState] = useState<AdvancePenaltyRecord[]>(() => getAdvancePenalties());

  // Toast bildirishnomalari
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Tasdiqlash dialogi holati
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Toast chiqarish yordamchisi
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Tasdiqlash so'rovi yordamchisi
  const requestConfirm = (opts: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmConfig({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText,
      cancelText: opts.cancelText,
      isDanger: opts.isDanger !== undefined ? opts.isDanger : true,
      onConfirm: () => {
        opts.onConfirm();
        setConfirmConfig(null);
      }
    });
  };

  // --- 2-BO'LIM: ISHCHILAR AMALLARI ---
  const handleAddWorker = (data: Omit<Worker, 'id' | 'createdAt' | 'active'>) => {
    const newWorker: Worker = {
      ...data,
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      active: true
    };
    const updated = [newWorker, ...workers];
    setWorkers(updated);
    saveWorkers(updated);
  };

  const handleUpdateWorker = (id: string, updates: Partial<Worker>) => {
    const updated = workers.map((w) => (w.id === id ? { ...w, ...updates } : w));
    setWorkers(updated);
    saveWorkers(updated);
  };

  const handleDeleteWorker = (id: string) => {
    const updated = workers.filter((w) => w.id !== id);
    setWorkers(updated);
    saveWorkers(updated);
  };

  // --- 3-BO'LIM: DAVOMAT AMALLARI ---
  const handleSetAttendanceStatus = (
    date: string,
    workerId: string,
    status: AttendanceStatus | null
  ) => {
    setAttendance((prev) => {
      // Mavjud yozuvni topib yangilash yoki o'chirish
      const filtered = prev.filter((r) => !(r.date === date && r.workerId === workerId));
      let updated: AttendanceRecord[];

      if (status === null) {
        updated = filtered;
      } else {
        updated = [...filtered, { date, workerId, status }];
      }

      saveAttendance(updated);
      return updated;
    });
  };

  const handleSetAllPresent = (date: string) => {
    setAttendance((prev) => {
      // Tanlangan kundan tashqari boshqa kunlarni qoldirish
      const otherDays = prev.filter((r) => r.date !== date);
      // Barcha faol ishchilarni 'keldi' deb belgilash
      const newDayRecords: AttendanceRecord[] = workers.map((w) => ({
        date,
        workerId: w.id,
        status: 'keldi'
      }));
      const updated = [...otherDays, ...newDayRecords];
      saveAttendance(updated);
      return updated;
    });
  };

  // --- 4-BO'LIM: NARXLAR AMALLARI ---
  const handleSaveShiftRate = (rate: number) => {
    setShiftRateState(rate);
    saveShiftRate(rate);
  };

  const handleAddPieceworkRate = (data: Omit<PieceworkRate, 'id' | 'createdAt'>) => {
    const newRate: PieceworkRate = {
      ...data,
      id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...pieceworkRates, newRate];
    setPieceworkRatesState(updated);
    savePieceworkRates(updated);
  };

  const handleUpdatePieceworkRate = (id: string, updates: Partial<PieceworkRate>) => {
    const updated = pieceworkRates.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setPieceworkRatesState(updated);
    savePieceworkRates(updated);
  };

  const handleDeletePieceworkRate = (id: string) => {
    const updated = pieceworkRates.filter((r) => r.id !== id);
    setPieceworkRatesState(updated);
    savePieceworkRates(updated);
  };

  // --- 5-BO'LIM: BAJARILGAN ISHLAR AMALLARI ---
  const handleAddProduction = (data: Omit<ProductionRecord, 'id' | 'createdAt'>) => {
    const newRecord: ProductionRecord = {
      ...data,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newRecord, ...production];
    setProductionState(updated);
    saveProduction(updated);
  };

  const handleUpdateProduction = (id: string, updates: Partial<ProductionRecord>) => {
    const updated = production.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProductionState(updated);
    saveProduction(updated);
  };

  const handleDeleteProduction = (id: string) => {
    const updated = production.filter((p) => p.id !== id);
    setProductionState(updated);
    saveProduction(updated);
  };

  // --- 6-BO'LIM: AVANS VA JARIMALAR AMALLARI ---
  const handleAddAdvancePenalty = (data: Omit<AdvancePenaltyRecord, 'id' | 'createdAt'>) => {
    const newRecord: AdvancePenaltyRecord = {
      ...data,
      id: `ap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newRecord, ...advances];
    setAdvancesState(updated);
    saveAdvancePenalties(updated);
  };

  const handleUpdateAdvancePenalty = (id: string, updates: Partial<AdvancePenaltyRecord>) => {
    const updated = advances.map((ap) => (ap.id === id ? { ...ap, ...updates } : ap));
    setAdvancesState(updated);
    saveAdvancePenalties(updated);
  };

  const handleDeleteAdvancePenalty = (id: string) => {
    const updated = advances.filter((ap) => ap.id !== id);
    setAdvancesState(updated);
    saveAdvancePenalties(updated);
  };

  // Namunaviy ma'lumotlarni qaytarish
  const handleResetData = () => {
    requestConfirm({
      title: "Namunaviy ma'lumotlarni tiklash",
      message: "Barcha kiritilgan oʻzgarishlar oʻrniga namunaviy maʼlumotlar qayta yuklanadi. Davom etasizmi?",
      confirmText: "Ha, qaytarish",
      onConfirm: () => {
        resetToDemoData();
        setWorkers(getWorkers());
        setAttendance(getAttendance());
        setPieceworkRatesState(getPieceworkRates());
        setProductionState(getProduction());
        setAdvancesState(getAdvancePenalties());
        setShiftRateState(getShiftRate());
        showToast("Namunaviy maʼlumotlar qayta tiklandi", 'success');
      }
    });
  };

  // Chiqish (Logout)
  const handleLogout = () => {
    requestConfirm({
      title: "Tizimdan chiqish",
      message: "Tizimdan chiqmoqchimisiz? Qayta kirish uchun parol kerak boʻladi.",
      confirmText: "Ha, chiqish",
      onConfirm: () => {
        setAuthSession(false);
        setIsAuthenticated(false);
        showToast("Tizimdan chiqildi", 'info');
      }
    });
  };

  // 1-BO'LIM: Agar parol terilmagan bo'lsa, avval Kirish sahifasini ko'rsatish
  if (!isAuthenticated) {
    return <AuthScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast xabarnomalar */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Tasdiqlash modali */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          isDanger={confirmConfig.isDanger}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

      {/* Yuqori boshqaruv paneli */}
      <Header
        onLogout={handleLogout}
        onResetData={handleResetData}
        onShowToast={showToast}
      />

      {/* Asosiy konteyner */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        {/* Desktop uchun tablar menyusi */}
        <div className="mb-5 flex justify-center">
          <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>

        {/* Faol bo'lim ko'rinishi */}
        {activeTab === 'workers' && (
          <WorkersTab
            workers={workers}
            onAddWorker={handleAddWorker}
            onUpdateWorker={handleUpdateWorker}
            onDeleteWorker={handleDeleteWorker}
            onShowToast={showToast}
            onRequestConfirm={requestConfirm}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            workers={workers}
            attendance={attendance}
            onSetStatus={handleSetAttendanceStatus}
            onSetAllPresent={handleSetAllPresent}
            onShowToast={showToast}
            onRequestConfirm={requestConfirm}
          />
        )}

        {activeTab === 'prices' && (
          <PricesTab
            shiftRate={shiftRate}
            onSaveShiftRate={handleSaveShiftRate}
            pieceworkRates={pieceworkRates}
            onAddPieceworkRate={handleAddPieceworkRate}
            onUpdatePieceworkRate={handleUpdatePieceworkRate}
            onDeletePieceworkRate={handleDeletePieceworkRate}
            onShowToast={showToast}
            onRequestConfirm={requestConfirm}
          />
        )}

        {activeTab === 'production' && (
          <ProductionTab
            workers={workers}
            pieceworkRates={pieceworkRates}
            production={production}
            onAddProduction={handleAddProduction}
            onUpdateProduction={handleUpdateProduction}
            onDeleteProduction={handleDeleteProduction}
            onShowToast={showToast}
            onRequestConfirm={requestConfirm}
          />
        )}

        {activeTab === 'advances' && (
          <AdvancePenaltyTab
            workers={workers}
            records={advances}
            onAddRecord={handleAddAdvancePenalty}
            onUpdateRecord={handleUpdateAdvancePenalty}
            onDeleteRecord={handleDeleteAdvancePenalty}
            onShowToast={showToast}
            onRequestConfirm={requestConfirm}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollTab
            workers={workers}
            attendance={attendance}
            pieceworkRates={pieceworkRates}
            production={production}
            advances={advances}
            shiftRate={shiftRate}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Mobil ekranlar uchun pastki navigatsiya */}
      <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
