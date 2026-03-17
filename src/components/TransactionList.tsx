import React, {useState} from 'react';
import { ChevronsUpDown, Filter } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import TransactionItem from './TransactionItem';

const TransactionList: React.FC = () => {
  const { state } = useFinance();
  const [transactionListVisible, setTransactionListVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
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
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-gray-400 text-2xl font-semibold hover:cursor-pointer select-none flex items-center justify-between" onClick={() => {setTransactionListVisible(!transactionListVisible)}}>
        Transacciones {<ChevronsUpDown className="inline h-5 w-5 stroke-[3.5]" />}
        <button
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Filter className="h-4 w-4" /> Filtros
        </button>
      </h2>
      {filtersVisible && (
        <div className="mt-4 bg-gray-800 p-4 rounded">
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
      )}
      {filteredTransactions.length === 0 ? (
        <p className="text-gray-500">No hay transacciones que coincidan con los filtros.</p>
      ) : (
        <div className={`space-y-2 mt-4 ${transactionListVisible ? 'block' : 'hidden'}`}>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;