import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import TransactionItem from './TransactionItem';
import TransactionStatsHeader from './TransactionStatsHeader';

const TransactionList: React.FC = () => {
  const { state } = useFinance();
  const [typeFilter, setTypeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedTransactions = [...state.transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getCompanyForTransaction = (transaction: any) => {
    if (!transaction.my_account_id) return null;
    const myAccount = state.myAccounts.find(ma => ma.id === transaction.my_account_id);
    if (!myAccount) return null;
    const account = state.accounts.find(a => a.id === myAccount.account_id);
    if (!account) return null;
    return state.companies.find(c => c.id === account.company_id);
  };

  const filteredTransactions = sortedTransactions.filter(transaction => {
    const matchesType = !typeFilter || transaction.type === typeFilter;
    const matchesCompany = !companyFilter || getCompanyForTransaction(transaction)?.short_name === companyFilter;
    const matchesStartDate = !startDate || new Date(transaction.date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(transaction.date) <= new Date(endDate);

    return matchesType && matchesCompany && matchesStartDate && matchesEndDate;
  });

  const uniqueTypes = Array.from(new Set(state.transactions.map(t => t.type)));
  const uniqueCompanies = Array.from(new Set(
    state.transactions
      .map(t => getCompanyForTransaction(t)?.short_name)
      .filter(Boolean)
  ));

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-4xl mx-auto h-[calc(100vh-65px)] flex flex-col">
      <h2 className="text-gray-400 text-2xl font-semibold flex-shrink-0">Transacciones</h2>
      <TransactionStatsHeader filteredTransactions={filteredTransactions} />
      <div className="mt-4 bg-gray-800 p-4 rounded flex-shrink-0">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center gap-2 rounded bg-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-600 text-gray-200"
          >
            {sortOrder === 'desc' ? (
              <>
                <ChevronDown size={16} />
                <span>Nuevas a Viejas</span>
              </>
            ) : (
              <>
                <ChevronUp size={16} />
                <span>Viejas a Nuevas</span>
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Empresa</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="">Todas</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
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