import React, { useMemo } from 'react';
import { User, Expense } from '../types';
import { User as UserIcon, DollarSign, Calendar, Package, TrendingUp, Settings, LogOut } from 'lucide-react';
import { startOfMonth, isSameMonth, format, subMonths } from 'date-fns';

interface ProfileProps {
  user: User;
  expenses: Expense[];
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, expenses, onLogout }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const startOfLastMonth = startOfMonth(subMonths(today, 1));

    let totalSpent = 0;
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    let totalExpenses = expenses.length;
    const uniqueItems = new Set<string>();

    expenses.forEach(e => {
      const d = new Date(e.date);
      totalSpent += e.amount;
      uniqueItems.add(e.itemName.toLowerCase());
      
      if (isSameMonth(d, today)) {
        thisMonthTotal += e.amount;
      } else if (isSameMonth(d, subMonths(today, 1))) {
        lastMonthTotal += e.amount;
      }
    });

    const monthChange = lastMonthTotal === 0 
      ? (thisMonthTotal > 0 ? 100 : 0)
      : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    const avgExpense = totalExpenses > 0 ? totalSpent / totalExpenses : 0;

    return {
      totalSpent,
      thisMonthTotal,
      lastMonthTotal,
      monthChange,
      totalExpenses,
      uniqueItems: uniqueItems.size,
      avgExpense,
    };
  }, [expenses]);

  const StatCard = ({ icon: Icon, label, value, subtitle, color }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {subtitle && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            subtitle.includes('+') ? 'bg-emerald-50 text-emerald-600' : 
            subtitle.includes('-') ? 'bg-red-50 text-red-600' : 
            'bg-gray-50 text-gray-600'
          }`}>
            {subtitle}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserIcon size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.username || user.email.split('@')[0]}</h2>
            <p className="text-emerald-100 text-sm mt-1">Member since {format(new Date(), 'MMMM yyyy')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-emerald-100 text-xs">Total Expenses</p>
            <p className="text-xl font-bold mt-1">{stats.totalExpenses}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-emerald-100 text-xs">Unique Items</p>
            <p className="text-xl font-bold mt-1">{stats.uniqueItems}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={`$${stats.totalSpent.toFixed(2)}`}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Calendar}
          label="This Month"
          value={`$${stats.thisMonthTotal.toFixed(2)}`}
          subtitle={stats.monthChange >= 0 ? `+${stats.monthChange.toFixed(0)}%` : `${stats.monthChange.toFixed(0)}%`}
          color="bg-blue-500"
        />
        <StatCard
          icon={Package}
          label="Avg. Expense"
          value={`$${stats.avgExpense.toFixed(2)}`}
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Last Month"
          value={`$${stats.lastMonthTotal.toFixed(2)}`}
          color="bg-orange-500"
        />
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Settings size={20} className="mr-2 text-gray-600" />
          Account
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Username</p>
              <p className="text-sm text-gray-500 mt-1">{user.username}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Account Type</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">User ID</p>
              <p className="text-xs text-gray-400 mt-1 font-mono">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};



