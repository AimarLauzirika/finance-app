import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import BalanceChart from './BalanceChart';

const BalanceDisplay: React.FC = () => {
  const { state, setInitialCapital } = useFinance();
  const [newCapital, setNewCapital] = useState(state.initialCapital.toString());
  const [newCapitalDate, setNewCapitalDate] = useState(state.initialCapitalDate);
  const [initialCapitalFormVisible, setInitialCapitalFormVisible] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<number | ''>('');
  const [selectedCompany, setSelectedCompany] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sync inputs with current state
  useEffect(() => {
    setNewCapital(state.initialCapital.toString());
    setNewCapitalDate(state.initialCapitalDate);
  }, [state.initialCapital, state.initialCapitalDate]);

  const handleSetInitialCapital = () => {
    const capital = parseFloat(newCapital);
    if (!isNaN(capital)) {
      setInitialCapital(capital, newCapitalDate);
    }
  };

  const myAccountById = React.useMemo(() => {
    return state.myAccounts.reduce<Record<string, typeof state.myAccounts[0]>>((acc, my) => {
      acc[my.id] = my;
      return acc;
    }, {});
  }, [state.myAccounts]);

  const accountById = React.useMemo(() => {
    return state.accounts.reduce<Record<number, typeof state.accounts[0]>>((acc, account) => {
      acc[account.id] = account;
      return acc;
    }, {});
  }, [state.accounts]);

  const filteredTransactions = state.transactions.filter(tx => {
    // Apply account/company filters
    if (selectedAccount !== '') {
      const myAccount = tx.my_account_id ? myAccountById[tx.my_account_id] : undefined;
      if (!myAccount || myAccount.account_id !== selectedAccount) {
        return false;
      }
    }

    if (selectedCompany !== '') {
      const myAccount = tx.my_account_id ? myAccountById[tx.my_account_id] : undefined;
      const account = myAccount ? accountById[myAccount.account_id] : undefined;
      if (!account || account.company_id !== selectedCompany) {
        return false;
      }
    }

    const txDate = new Date(tx.date);
    if (startDate && txDate < new Date(startDate)) {
      return false;
    }
    if (endDate && txDate > new Date(endDate)) {
      return false;
    }

    return true;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'payout')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type !== 'payout' && t.type !== 'initial')
    .reduce((sum, t) => sum + t.amount, 0);
  const filteredInitialCapital = filteredTransactions
    .filter(t => t.type === 'initial')
    .reduce((sum, t) => sum + t.amount, 0) || state.initialCapital;
  const filteredBalance = filteredInitialCapital + totalIncome - totalExpense;
  const filteredProfit = totalIncome - totalExpense;
  const roi = filteredInitialCapital > 0 ? (filteredProfit / filteredInitialCapital) * 100 : 0;

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold mb-6">Balance</h2>
      <div className='flex items-center justify-center gap-24'>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center col-span-2">
            <p className="text-sm text-gray-400">Capital Inicial</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(filteredInitialCapital)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Ingresos</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Total Gastos</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="grid grid-rows-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Balance Actual</p>
            <p className='text-xl font-bold text-blue-600'>
              {formatCurrency(filteredBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Beneficio</p>
            <p className={`text-xl font-bold ${filteredProfit > 0 ? 'text-green-600' : filteredProfit === 0 ? 'text-gray-400' : 'text-red-700'}`}>{formatCurrency(filteredProfit)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">ROI</p>
            <p className={`text-xl font-bold ${roi > 0 ? 'text-green-600' : roi === 0 ? 'text-gray-400' : 'text-red-700'}`}>{roi.toFixed(2)}%</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className='mx-auto'>
          <label className=" text-gray-600 text-sm select-none items-center flex font-medium hover:cursor-pointer hover:text-blue-500 hover:opacity-75" onClick={() => {setInitialCapitalFormVisible(!initialCapitalFormVisible)}}>
            Modificar Capital Inicial <span>{<Pencil className="inline h-4 ml-1" />}</span>
          </label>
          <div className={`justify-center gap-2 mt-6 ${initialCapitalFormVisible ? 'flex' : 'hidden'}`}>
            <input
              type="number"
              value={newCapital}
              onChange={(e) => setNewCapital(e.target.value)}
              className="bg-gray-800 placeholder:text-gray-600 text-gray-200 px-2 rounded focus:outline-none focus:bg-gray-700 focus:placeholder:text-gray-500"
              placeholder="Capital Inicial"
              />
            <input
              type="date"
              value={newCapitalDate}
              onChange={(e) => setNewCapitalDate(e.target.value)}
              className="bg-gray-800 placeholder:text-gray-600 text-gray-200 px-2 rounded focus:outline-none focus:bg-gray-700 focus:placeholder:text-gray-500"
              placeholder="Capital Inicial"
              />
            <button
              onClick={() => {handleSetInitialCapital()}}
              className="px-4 py-1 bg-gray-800 border-gray-700 text-blue-100 rounded hover:bg-gray-700"
              >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded">
        <h3 className="text-sm text-gray-400 mb-3">Filtros del gráfico</h3>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
        <div className="">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Empresa</label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCompany(value ? Number(value) : '');
                  setSelectedAccount('');
                }}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              >
                <option value="">Todas</option>
                {Array.from(new Set(
                  state.transactions
                    .filter(t => t.my_account_id)
                    .map(t => {
                      const myAcc = state.myAccounts.find(m => m.id === t.my_account_id);
                      const acc = myAcc ? state.accounts.find(a => a.id === myAcc.account_id) : undefined;
                      return acc?.company_id;
                    })
                    .filter(Boolean)
                ))
                  .map(companyId => state.companies.find(c => c.id === companyId))
                  .filter(Boolean)
                  .map(company => (
                    <option key={company!.id} value={company!.id}>{company!.short_name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Cuenta</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 rounded ${
                  selectedCompany === '' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white'
                }`}
                disabled={selectedCompany === ''}
              >
                <option value="">Todas</option>
                {state.accounts
                  .filter(a => (selectedCompany ? a.company_id === selectedCompany : true))
                  .filter(a => state.transactions.some(t => {
                    const myAcc = state.myAccounts.find(m => m.id === t.my_account_id);
                    return myAcc?.account_id === a.id;
                  }))
                  .map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 mb-6 w-xl">
        <BalanceChart transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default BalanceDisplay;