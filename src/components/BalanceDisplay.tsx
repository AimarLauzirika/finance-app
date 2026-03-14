import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';

const BalanceDisplay: React.FC = () => {
  const { state, dispatch, balance } = useFinance();
  const [newCapital, setNewCapital] = useState(state.initialCapital.toString());

  const handleSetCapital = () => {
    const capital = parseFloat(newCapital);
    if (!isNaN(capital)) {
      dispatch({ type: 'SET_INITIAL_CAPITAL', payload: capital });
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
      <h2 className="text-2xl text-gray-300 font-bold mb-4">Balance</h2>
      <div className="mb-4">
        <div className='w-min mx-auto'>
        <label className="block text-gray-600 text-sm font-medium mb-2">Capital Inicial</label>
          <div className="flex justify-center gap-2">
            <input
              type="number"
              value={newCapital}
              onChange={(e) => setNewCapital(e.target.value)}
              className="bg-gray-800 placeholder:text-gray-600 text-gray-200 px-2 rounded focus:outline-none focus:bg-gray-700 focus:placeholder:text-gray-500"
              placeholder="Capital Inicial"
              />
            <button
              onClick={handleSetCapital}
              className="px-4 py-1 bg-gray-800 border-gray-700 text-blue-100 rounded hover:bg-gray-700"
              >
              Guardar
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">Inicial: {formatCurrency(state.initialCapital)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">Balance Actual</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Total Ingresos</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Total Gastos</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplay;