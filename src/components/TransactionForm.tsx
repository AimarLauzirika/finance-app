import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';

const TransactionForm: React.FC = () => {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<'' | 'buy_eval' | 'activation_fee' | 'reset_account' | 'VPS' | 'payout'>('buy_eval');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formVisible, setFormVisible] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && type !== '' && date) {
      addTransaction({
        type,
        amount: numAmount,
        date,
      });
      
      // Reset form
      setAmount('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };


  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold hover:cursor-pointer hover:text-blue-500 hover:opacity-75 select-none" onClick={() => setFormVisible(!formVisible)}>
        Agregar Transacción {<Plus className="inline font-bold h-6 w-6 stroke-[3]" />}
      </h2>
      <form onSubmit={handleSubmit} className={`space-y-6 ${formVisible ? 'block' : 'hidden'} mt-6`}>
        <div className='flex gap-4'>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'buy_eval' | 'activation_fee' | 'reset_account' | 'VPS' | 'payout')}
              className={`w-full bg-gray-800 text-gray-200 p-1 rounded ${type === '' ? 'text-gray-600' : 'text-gray-200'}`}
              required
              >
              <option value="" className='text-gray-600' disabled>Tipo</option>
              <option value="buy_eval" className='text-red-500'>Comprar Evaluación</option>
              <option value="activation_fee" className='text-red-500'>Activación</option>
              <option value="reset_account" className='text-red-500'>Reset</option>
              <option value="VPS" className='text-red-500'>VPS</option>
              <option value="payout" className='text-green-500'>Pago</option>
            </select>
          </div>
          <div className='flex-1'>
            <label className="block text-gray-600 text-sm font-medium mb-2">Cantidad (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 p-1 border-gray-900 rounded focus:outline-none focus:bg-gray-700 placeholder:text-gray-600 focus:placeholder:text-gray-500"
              placeholder="0"
              min="0.01"
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