import React, { useState, useEffect, useMemo } from 'react';
import { getItemPriceHistory, getAllItems } from '../services/dbService';
import { PriceHistoryPoint, Item } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const PriceComparison: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllItems().then(data => {
      setItems(data);
    }).catch(error => {
      console.error('Error loading items:', error);
    });
  }, []);

  useEffect(() => {
    if (selectedItemName) {
      setLoading(true);
      getItemPriceHistory(selectedItemName).then(data => {
        console.log('=== RAW API RESPONSE ===');
        console.log('Item searched:', selectedItemName);
        console.log('Number of records:', data.length);
        console.log('Full raw data:', JSON.stringify(data, null, 2));
        
        // Log each record individually with all fields
        data.forEach((point: any, idx: number) => {
          console.log(`Record ${idx}:`, {
            id: point.id,
            date: point.date,
            price: point.price,
            priceType: typeof point.price,
            priceValue: point.price,
            item_name: point.item_name,
            created_at: point.created_at,
            ALL_FIELDS: point
          });
        });
        
        // Ensure data is sorted by date and convert dates properly
        const sortedData = data
          .map((point: any, index: number) => {
            // Extract price - check multiple possible fields
            let priceValue = 0;
            
            // Try price field first
            if (point.price !== undefined && point.price !== null) {
              if (typeof point.price === 'string') {
                priceValue = parseFloat(point.price);
              } else if (typeof point.price === 'number') {
                priceValue = point.price;
              } else {
                priceValue = Number(point.price) || 0;
              }
            }
            
            // If still 0, try amount field
            if ((priceValue === 0 || isNaN(priceValue)) && point.amount !== undefined) {
              priceValue = typeof point.amount === 'string' ? parseFloat(point.amount) : Number(point.amount) || 0;
            }
            
            const date = typeof point.date === 'string' ? point.date : String(point.date);
            
            const result = {
              id: point.id || `expense-${index}`,
              date,
              price: priceValue,
              index,
              rawData: point, // Keep raw data for debugging
            };
            
            console.log(`Mapped point ${index}:`, {
              original: point.price,
              converted: priceValue,
              result: result
            });
            
            return result;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        console.log('=== PROCESSED DATA ===');
        console.log('Sorted data:', sortedData);
        console.log('Price values:', sortedData.map(p => p.price));
        console.log('Unique prices:', [...new Set(sortedData.map(p => p.price))]);
        
        setHistory(sortedData);
        setLoading(false);
      }).catch(error => {
        console.error('Error loading price history:', error);
        setLoading(false);
      });
    } else {
      setHistory([]);
    }
  }, [selectedItemName]);

  // Format chart data with readable dates - ensure each point is unique
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      console.log('No history data for chart');
      return [];
    }
    
    console.log('=== CREATING CHART DATA ===');
    console.log('History input:', JSON.parse(JSON.stringify(history)));
    
    const formatted = history.map((point: any, index: number) => {
      // Use the price directly from history - it should already be converted
      let price = 0;
      if (point.price !== undefined && point.price !== null) {
        if (typeof point.price === 'number') {
          price = point.price;
        } else if (typeof point.price === 'string') {
          price = parseFloat(point.price);
        } else {
          price = Number(point.price) || 0;
        }
      }
      
      if (isNaN(price)) {
        console.warn(`Invalid price at index ${index}:`, point.price);
        price = 0;
      }
      
      const dateStr = typeof point.date === 'string' ? point.date : String(point.date);
      const dateObj = new Date(dateStr);
      const dateLabel = format(dateObj, 'MMM dd');
      
      const dataPoint = {
        date: dateLabel,
        fullDate: dateStr,
        price: price, // CRITICAL: This must be unique for each point
        id: point.id || `point-${index}`,
        index: index,
        // Add explicit price field for tooltip
        value: price, // Recharts sometimes uses 'value'
      };
      
      console.log(`Chart point ${index}:`, {
        inputPrice: point.price,
        inputPriceType: typeof point.price,
        outputPrice: dataPoint.price,
        date: dateLabel,
        id: dataPoint.id,
        fullDataPoint: dataPoint
      });
      
      return dataPoint;
    });
    
    // Verify all prices are different
    const prices = formatted.map(p => p.price);
    const uniquePrices = [...new Set(prices)];
    console.log('=== CHART DATA SUMMARY ===');
    console.log('Total points:', formatted.length);
    console.log('Unique prices count:', uniquePrices.length);
    console.log('Unique prices:', uniquePrices);
    console.log('All prices in order:', prices);
    console.log('Full chart data array:', JSON.parse(JSON.stringify(formatted)));
    
    if (uniquePrices.length === 1 && formatted.length > 1) {
      console.error('⚠️ WARNING: All points have the same price!', uniquePrices[0]);
      console.error('This suggests a data issue. Check the history data above.');
    }
    
    return formatted;
  }, [history]);

  // Unique item names for the dropdown
  const uniqueNames = Array.from(new Set(items.map(i => i.name)));

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Price Tracker</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            list="items-list" 
            type="text"
            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Search for an item (e.g. Milk, Gas)..."
            value={selectedItemName}
            onChange={(e) => setSelectedItemName(e.target.value)}
          />
          <datalist id="items-list">
            {uniqueNames.map((name, i) => (
              <option key={i} value={name} />
            ))}
          </datalist>
        </div>
      </div>

      {selectedItemName && history.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Price History: {selectedItemName}</h3>
          
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart 
                 data={chartData} 
                 margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                 key={`chart-${chartData.length}-${chartData.map(d => d.price).join('-')}`}
               >
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis 
                   dataKey="date" 
                   tickLine={false} 
                   axisLine={false} 
                   tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                   dy={10}
                   angle={-45}
                   textAnchor="end"
                   height={80}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                   tickFormatter={(val) => `$${Number(val).toFixed(0)}`}
                   domain={['dataMin - 10', 'dataMax + 10']}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="price" 
                   stroke="#10B981" 
                   strokeWidth={3} 
                   dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} 
                   activeDot={{ r: 8, fill: '#10B981' }}
                   isAnimationActive={false}
                   connectNulls={false}
                   name="Price"
                   key={`line-${chartData.length}-${Date.now()}`}
                 />
               </LineChart>
             </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Records</h4>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...history].reverse().slice(0, 5).map((point: any, idx: number) => {
                    const price = typeof point.price === 'string' ? parseFloat(point.price) : Number(point.price) || 0;
                    const dateStr = typeof point.date === 'string' ? point.date : String(point.date);
                    return (
                      <tr key={point.id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(dateStr), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ${price.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedItemName && history.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10">
          No price history found for "{selectedItemName}"
        </div>
      )}
    </div>
  );
};

