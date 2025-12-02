import React from 'react';
import { AppView, User } from '../types';
import { LayoutDashboard, PlusCircle, History, BarChart2, LogOut, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, currentView, onChangeView, onLogout, children }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`flex flex-col items-center justify-center p-2 w-full transition-colors ${
        currentView === view ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 shadow-sm w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <div>
               <h1 className="text-xl font-bold text-gray-900 tracking-tight">Smart<span className="text-emerald-600">Spend</span></h1>
               <p className="text-xs text-gray-500">Welcome back, {user.username || user.email.split('@')[0]}</p>
            </div>
            <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-32">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-gray-100 fixed bottom-0 w-full z-40 pb-safe h-20">
        <div className="max-w-md mx-auto flex justify-between items-center px-4 py-3 h-full">
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Home" />
          <NavItem view={AppView.COMPARE} icon={BarChart2} label="Compare" />
          
          {/* Floating Add Button */}
          <div className="relative -top-6">
             <button 
                onClick={() => onChangeView(AppView.ADD_EXPENSE)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  currentView === AppView.ADD_EXPENSE ? 'bg-emerald-700 ring-4 ring-emerald-100' : 'bg-emerald-600'
                }`}
             >
               <PlusCircle size={28} className="text-white" />
             </button>
          </div>

          <NavItem view={AppView.HISTORY} icon={History} label="History" />
          <NavItem view={AppView.PROFILE} icon={UserIcon} label="Profile" />
        </div>
      </nav>
    </div>
  );
};

