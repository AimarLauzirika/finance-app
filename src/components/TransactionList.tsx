import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import TransactionItem from './TransactionItem';

const TransactionList: React.FC = () => {
  const { state } = useFinance();
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sort transactions by date descending
  const sortedTransactions = [...state.transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredTransactions = sortedTransactions.filter(transaction => {
    const matchesType = !typeFilter || transaction.type === typeFilter;
    const matchesStartDate = !startDate || new Date(transaction.date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(transaction.date) <= new Date(endDate);

    return matchesType && matchesStartDate && matchesEndDate;
  });

  const uniqueTypes = Array.from(new Set(state.transactions.map(t => t.type)));

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-4xl mx-auto h-[calc(100vh-65px)] flex flex-col">
      <h2 className="text-gray-400 text-2xl font-semibold flex-shrink-0">Transacciones</h2>
      <div className="mt-4 bg-gray-800 p-4 rounded flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="">Todos</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Fecha Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex-1 overflow-auto scrollbar-custom">
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500">No hay transacciones que coincidan con los filtros.</p>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;