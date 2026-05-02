import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import AccountItem from './AccountItem';

interface AccountListProps {
  onFilteredAccountsChange?: (accountIds: string[]) => void;
}

const AccountList: React.FC<AccountListProps> = ({ onFilteredAccountsChange }) => {
  const { state } = useFinance();
  const [companyFilter, setCompanyFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showClosed, setShowClosed] = useState(true);

  const filteredAccounts = useMemo(() => {
    return state.myAccounts
      .filter(account => {
        const accountDetails = state.accounts.find(a => a.id === account.account_id);
        const company = accountDetails ? state.companies.find(c => c.id === accountDetails.company_id) : null;

        const matchesCompany = !companyFilter || (company && company.short_name.toLowerCase().includes(companyFilter.toLowerCase()));
        const matchesState = !stateFilter || account.state.toLowerCase().includes(stateFilter.toLowerCase());
        const matchesStartDate = !startDate || new Date(account.date) >= new Date(startDate);
        const matchesEndDate = !endDate || new Date(account.date) <= new Date(endDate);
        const matchesClosed = showClosed || account.state !== 'closed';

        return matchesCompany && matchesState && matchesStartDate && matchesEndDate && matchesClosed;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [state.myAccounts, state.accounts, state.companies, companyFilter, stateFilter, startDate, endDate, sortOrder, showClosed]);

  const uniqueCompanies = Array.from(new Set(
    state.myAccounts
      .map(account => {
        const accountDetails = state.accounts.find(a => a.id === account.account_id);
        const company = accountDetails ? state.companies.find(c => c.id === accountDetails.company_id) : null;
        return company?.short_name;
      })
      .filter(Boolean)
  ));

  const uniqueStates = Array.from(new Set(state.myAccounts.map(account => account.state)));

  // Notify parent about filtered account IDs
  useEffect(() => {
    onFilteredAccountsChange?.(filteredAccounts.map(acc => acc.id));
  }, [filteredAccounts, onFilteredAccountsChange]);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-4xl mx-auto h-[calc(100vh-65px)] flex flex-col">
      <h2 className="text-2xl text-gray-100 font-semibold">Mis Cuentas</h2>
      <div className="mt-4 bg-gray-800 p-4 rounded flex gap-4 flex-wrap">
        <div className="">
          <label className="block text-gray-300 text-sm mb-1">Orden</label>
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
        <div className="">
          <label className="block text-gray-300 text-sm mb-1">Cuentas</label>
          <button
            onClick={() => setShowClosed(!showClosed)}
            className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
              !showClosed
                ? 'bg-amber-700 hover:bg-amber-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
            title={showClosed ? 'Ocultar cuentas cerradas' : 'Mostrar cuentas cerradas'}
          >
            {showClosed ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="hidden sm:inline">{showClosed ? 'Mostrar cerradas' : 'Ocultar cerradas'}</span>
            <span className="sm:hidden text-xs">{showClosed ? 'Ver' : 'Ocultar'}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Compañía</label>
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
            <label className="block text-gray-300 text-sm mb-1">Estado</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="">Todos</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
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
      <div className="mt-6 flex-1 overflow-auto scrollbar-custom">
        {filteredAccounts.length === 0 ? (
          <p className="text-gray-500">No hay cuentas que coincidan con los filtros.</p>
        ) : (
          <div className="space-y-4">
            {filteredAccounts.map(account => (
              <AccountItem key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountList;