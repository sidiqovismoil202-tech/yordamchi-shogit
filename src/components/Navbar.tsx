/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  CalendarCheck,
  Tag,
  Scissors,
  Wallet,
  Calculator
} from 'lucide-react';

export type TabType = 'workers' | 'attendance' | 'prices' | 'production' | 'advances' | 'payroll';

interface NavbarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'workers' as TabType,
      label: 'Ishchilar',
      shortLabel: 'Ishchilar',
      icon: Users
    },
    {
      id: 'attendance' as TabType,
      label: 'Davomat',
      shortLabel: 'Davomat',
      icon: CalendarCheck
    },
    {
      id: 'prices' as TabType,
      label: 'Narxlar',
      shortLabel: 'Narxlar',
      icon: Tag
    },
    {
      id: 'production' as TabType,
      label: 'Bajarilgan ish',
      shortLabel: 'Ish',
      icon: Scissors
    },
    {
      id: 'advances' as TabType,
      label: 'Avans & Jarima',
      shortLabel: 'Avans',
      icon: Wallet
    },
    {
      id: 'payroll' as TabType,
      label: 'Oylik maosh',
      shortLabel: 'Oylik',
      icon: Calculator
    }
  ];

  return (
    <>
      {/* Katta ekranlar (Desktop/Planshet) uchun yuqori tablar */}
      <nav className="hidden md:flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobil ekranlar uchun PASTKI DOIMIY NAVIGATSIYA (Mobile-first bottom navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] no-print">
        <div className="grid grid-cols-6 gap-0.5 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`min-h-[52px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 font-bold bg-emerald-50/70'
                    : 'text-slate-500 hover:text-slate-700 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'scale-110 bg-emerald-600 text-white' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-tight">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
