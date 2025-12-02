import React, { useState } from 'react';
import { Camera, Upload, Plus, Loader2, Check } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { analyzeReceiptImage } from '../services/geminiService';
import { addExpense } from '../services/dbService';
import { CameraCapture } from './CameraCapture';
import { User, ReceiptItem } from '../types';

interface AddExpenseProps {
  user: User;
  onExpenseAdded: () => void;
}

export const AddExpense: React.FC<AddExpenseProps> = ({ user, onExpenseAdded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  // Form State
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [bulkItems, setBulkItems] = useState<ReceiptItem[]>([]);

  const resetForm = () => {
    setItemName('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId(CATEGORIES[0].id);
    setReceiptImage(null);
    setBulkItems([]);
  };

  const handleImage = async (imageSrc: string) => {
    setReceiptImage(imageSrc);
    setShowCamera(false);
    setIsProcessing(true);

    try {
      const data = await analyzeReceiptImage(imageSrc);
      
      // Auto-fill logic
      if (data.items && data.items.length > 0) {
        if (data.items.length === 1) {
          // Single item mode
          setItemName(data.items[0].name);
          setAmount(data.items[0].price.toString());
          
          // Try to match category
          const foundCat = CATEGORIES.find(c => c.name.toLowerCase() === data.items[0].category.toLowerCase());
          if (foundCat) setCategoryId(foundCat.id);
        } else {
          // Bulk items found
          setBulkItems(data.items);
          if (data.date) setDate(data.date);
        }
      }
      
      if (data.total && !amount) {
        setAmount(data.total.toString());
      }
      
      if (data.date) {
        setDate(data.date);
      }

    } catch (e) {
      console.error(e);
      alert('Failed to analyze receipt. Please enter details manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !amount) return;

    setIsProcessing(true);
    try {
      await addExpense({
        userId: user.id,
        itemName,
        amount: parseFloat(amount),
        date,
        categoryId,
        receiptImageUrl: receiptImage || undefined
      });
      resetForm();
      onExpenseAdded();
      alert('Expense saved!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSave = async () => {
    setIsProcessing(true);
    try {
      for (const item of bulkItems) {
         // Try to match category
         const foundCat = CATEGORIES.find(c => c.name.toLowerCase().includes(item.category.toLowerCase()) || item.category.toLowerCase().includes(c.name.toLowerCase()));

        await addExpense({
          userId: user.id,
          itemName: item.name,
          amount: item.price,
          date,
          categoryId: foundCat ? foundCat.id : CATEGORIES[0].id, // Default to first if unknown
          receiptImageUrl: receiptImage || undefined
        });
      }
      resetForm();
      onExpenseAdded();
      alert(`Saved ${bulkItems.length} items successfully!`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleImage} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Add New Expense</h2>

      {/* Input Methods */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setShowCamera(true)}
          className="flex-1 py-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-gray-600 hover:text-emerald-600 bg-white"
        >
          <Camera size={24} />
          <span className="text-sm font-medium">Scan Receipt</span>
        </button>
        <label className="flex-1 py-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer text-gray-600 hover:text-emerald-600 bg-white">
          <Upload size={24} />
          <span className="text-sm font-medium">Upload Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center p-4 mb-4 bg-emerald-50 text-emerald-700 rounded-lg animate-pulse">
          <Loader2 className="animate-spin mr-2" />
          <span>Processing with Gemini AI...</span>
        </div>
      )}

      {/* Bulk Review Mode */}
      {bulkItems.length > 0 ? (
        <div className="space-y-4">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-medium text-gray-800">Review Scanned Items ({bulkItems.length})</h3>
             <button onClick={() => setBulkItems([])} className="text-sm text-red-500 hover:text-red-600">Clear</button>
           </div>
           <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded p-2">
             {bulkItems.map((item, idx) => (
               <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 text-gray-900 rounded">
                 <span>{item.name}</span>
                 <span className="font-bold">${item.price.toFixed(2)}</span>
               </div>
             ))}
           </div>
           <button 
              onClick={handleBulkSave}
              disabled={isProcessing}
              className="w-full mt-4 mb-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
           >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Check size={20} />}
              Save All Items
           </button>
        </div>
      ) : (
        /* Manual Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input 
              type="text" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Coffee, Laptop Stand"
              className="w-full p-3 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`text-xs py-2 px-1 rounded-md transition-colors border ${
                    categoryId === cat.id 
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-medium' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full mt-6 mb-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            Add Expense
          </button>
        </form>
      )}
    </div>
  );
};

