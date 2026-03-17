import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';
import { TRANSACTION_TYPES } from '../constants/transactionTypes';
import type { TransactionType } from '../constants/transactionTypes';

const TransactionForm: React.FC<{ accountId?: string; onClose?: () => void }> = ({ accountId, onClose }) => {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('buy_account');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formVisible, setFormVisible] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && date) {
      await addTransaction({
        type,
        amount: numAmount,
        date,
        my_account_id: accountId,
      });
      
      // Reset form
      setAmount('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      onClose?.();
    }
  };


  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      {accountId && (
        <h2 className="block text-md text-gray-400 font-semibold hover:cursor-pointer hover:text-blue-500 hover:opacity-75 select-none" onClick={() => setFormVisible(!formVisible)}>
        Agregar Transacción {<Plus className="inline font-bold h-5 w-5 stroke-[3]" />}
      </h2>
      )}
      {!accountId && (
        <h2 className="text-xl text-gray-400 font-semibold hover:cursor-pointer hover:text-blue-500 hover:opacity-75 select-none" onClick={() => setFormVisible(!formVisible)}>
        Agregar Transacción {<Plus className="inline font-bold h-5 w-5 stroke-[3]" />}
      </h2>
      )}
      <form onSubmit={handleSubmit} className={`space-y-6 ${formVisible ? 'block' : 'hidden'} mt-6`}>
        <div className='flex gap-4'>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Tipo</label>
            <select
              // value={type}
              defaultValue={''}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                e.target.className = `w-full bg-gray-800 p-1 rounded ${e.target.value === 'buy_account' || e.target.value === 'activation_fee' || e.target.value === 'reset_account' || e.target.value === 'VPS' ? 'text-red-500' : e.target.value === 'payout' ? 'text-green-500' : 'text-gray-500'}`;
              }}
              className={`w-full bg-gray-800 text-gray-500 p-1 rounded`}
              required
              >
                <option disabled value="">Elige un tipo</option>
              {!accountId && Object.entries(TRANSACTION_TYPES).filter(([key]) => key === 'VPS' || key === 'dividends' || key === 'income_tax').map(([key, label]) => (
                <option key={key} value={key} className='text-gray-300'>
                  {label}
                </option>
              ))}
              {accountId && Object.entries(TRANSACTION_TYPES).filter(([key]) => key === 'payout' || key === 'buy_account' || key === 'reset_account' || key === 'activation_fee').map(([key, label]) => (
                <option key={key} value={key} className={key === 'payout' ? 'text-green-500' : 'text-red-500'}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {accountId && (
            <div className='hidden'>
              <label className="block text-gray-600 text-sm font-medium mb-2">Cuenta Asociada</label>
              <input
                type="text"
                value={`Cuenta ${accountId}`}
                readOnly
                className="w-full bg-gray-700 text-gray-400 p-1 rounded"
              />
            </div>
          )}
          <div className='flex-1'>
            <label className="block text-gray-600 text-sm font-medium mb-2">Cantidad (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 p-1 border-gray-900 rounded focus:outline-none focus:bg-gray-700 placeholder:text-gray-600 focus:placeholder:text-gray-500"
              placeholder="0"
              min="0.00"
              step="0.01"
              required
              />
          </div>
          <div className='flex-1'>
            <label className="block text-gray-600 text-sm font-medium mb-2">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 p-1 rounded focus:outline-none focus:bg-gray-700"
              required
              />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-800 px-4 py-2 bg-blue-500 text-blue-100 rounded hover:bg-blue-600 "
        >
          Agregar Transacción
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;