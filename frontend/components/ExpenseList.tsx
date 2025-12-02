import React from 'react';
import { Expense } from '../types';
import { CATEGORIES } from '../constants';
import { format } from 'date-fns';

export const ExpenseList: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  return (
    <div className="space-y-4 pb-6">
      <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
      {expenses.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          No expenses yet. Tap + to add one.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {expenses.map(expense => {
            const category = CATEGORIES.find(c => c.id === expense.categoryId);
            return (
              <div key={expense.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div 
                     className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                     style={{ backgroundColor: category?.color || '#ccc' }}
                   >
                     {category?.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-medium text-gray-900">{expense.itemName}</p>
                     <p className="text-xs text-gray-500">
                       {format(new Date(expense.date), 'MMM dd, yyyy')} • {category?.name}
                     </p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">-${expense.amount.toFixed(2)}</p>
                  {expense.receiptImageUrl && (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Receipt</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

