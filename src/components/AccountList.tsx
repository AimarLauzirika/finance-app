import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import AccountItem from './AccountItem';

const AccountList: React.FC = () => {
  const { state } = useFinance();
  const [companyFilter, setCompanyFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredAccounts = state.myAccounts.filter(account => {
    const accountDetails = state.accounts.find(a => a.id === account.account_id);
    const company = accountDetails ? state.companies.find(c => c.id === accountDetails.company_id) : null;

    const matchesCompany = !companyFilter || (company && company.short_name.toLowerCase().includes(companyFilter.toLowerCase()));
    const matchesState = !stateFilter || account.state.toLowerCase().includes(stateFilter.toLowerCase());
    const matchesStartDate = !startDate || new Date(account.date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(account.date) <= new Date(endDate);

    return matchesCompany && matchesState && matchesStartDate && matchesEndDate;
  });

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

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-4xl mx-auto h-full flex flex-col">
      <h2 className="text-2xl text-gray-400 font-semibold flex-shrink-0">Mis Cuentas</h2>
      <div className="mt-4 bg-gray-800 p-4 rounded flex-shrink-0">
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