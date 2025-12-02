import React, { useMemo } from 'react';
import { Expense } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { startOfDay, subDays, isSameDay, startOfMonth, isSameMonth } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const summary = useMemo(() => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const startOfCurrentMonth = startOfMonth(today);

    let todayTotal = 0;
    let yesterdayTotal = 0;
    let monthTotal = 0;

    expenses.forEach(e => {
      const d = new Date(e.date);
      const amt = typeof e.amount === 'string' ? parseFloat(e.amount) : Number(e.amount) || 0;

      if (isSameDay(d, today)) todayTotal += amt;
      if (isSameDay(d, yesterday)) yesterdayTotal += amt;
      if (isSameMonth(d, today)) monthTotal += amt;
    });

    return { todayTotal, yesterdayTotal, monthTotal };
  }, [expenses]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d,
        amount: 0
      };
    });

    expenses.forEach(e => {
      const d = new Date(e.date);
      const dayData = last7Days.find(item => isSameDay(item.date, d));
      if (dayData) {
        const amt = typeof e.amount === 'string' ? parseFloat(e.amount) : Number(e.amount) || 0;
        dayData.amount += amt;
      }
    });

    return last7Days;
  }, [expenses]);

  const diffPercent = summary.yesterdayTotal === 0 
    ? 100 
    : ((summary.todayTotal - summary.yesterdayTotal) / summary.yesterdayTotal) * 100;

  return (
    <div className="space-y-6 pb-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign size={20} />
            </div>
            <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              diffPercent > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {diffPercent > 0 ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
              {Math.abs(diffPercent).toFixed(0)}% vs Yest.
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Spent Today</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">${summary.todayTotal.toFixed(2)}</p>
        </div>

        {/* Yesterday */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Calendar size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Yesterday</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">${summary.yesterdayTotal.toFixed(2)}</p>
        </div>

         {/* Month */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">This Month</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">${summary.monthTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Last 7 Days Spending</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.amount > (summary.todayTotal * 1.5) ? '#10B981' : '#34D399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

