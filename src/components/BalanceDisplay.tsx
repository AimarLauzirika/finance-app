import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';

const BalanceDisplay: React.FC = () => {
  const { state, dispatch, balance, profit } = useFinance();
  const [newCapital, setNewCapital] = useState(state.initialCapital.toString());
  const [newCapitalDate, setNewCapitalDate] = useState(state.initialCapitalDate);
  const [initialCapitalFormVisible, setInitialCapitalFormVisible] = useState(false);

  const handleSetInitialCapital = () => {
    const capital = parseFloat(newCapital);
    if (!isNaN(capital)) {
      dispatch({ type: 'SET_INITIAL_CAPITAL', payload: capital });
    }
    const date = newCapitalDate;
    dispatch({ type: 'SET_INITIAL_CAPITAL_DATE', payload: date });
    const initialTransaction = state.transactions.find(t => t.type === 'initial');
    if (initialTransaction) {
      initialTransaction.amount = capital;
      initialTransaction.date = newCapitalDate;
    }
  };

  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold mb-6">Balance</h2>
      <div className='flex items-center justify-center gap-24'>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center col-span-2">
            <p className="text-sm text-gray-400">Capital Inicial</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(state.initialCapital)}</p>
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
        <div className="grid grid-rows-2 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">Balance Actual</p>
            <p className='text-xl font-bold text-blue-600'>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Beneficio</p>
            <p className={`text-xl font-bold ${profit > 0 ? 'text-green-600' : profit === 0 ? 'text-gray-400' : 'text-red-700'}`}>{formatCurrency(profit)}</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className='mx-auto'>
          <label className=" text-gray-600 text-sm select-none font-medium hover:cursor-pointer" onClick={() => {setInitialCapitalFormVisible(!initialCapitalFormVisible)}}>
            Modificar Capital Inicial {<Pencil className="inline h-4 align-top" />}
          </label>
          <div className={`justify-center gap-2 mt-2 ${initialCapitalFormVisible ? 'flex' : 'hidden'}`}>
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
    </div>
  );
};

export default BalanceDisplay;