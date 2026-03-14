import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';

const TransactionForm: React.FC = () => {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<'' | 'initial' | 'income' | 'expense'>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formVisible, setFormVisible] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && description.trim()) {
      addTransaction({
        type,
        amount: numAmount,
        description: description.trim(),
        date,
      });
      // Reset form
      setAmount('');
      setDescription('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };


  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold hover:cursor-pointer select-none" onClick={() => setFormVisible(!formVisible)}>
        Agregar Transacción {<Plus className="inline font-bold h-6 w-6 stroke-[3]" />}
      </h2>
      <form onSubmit={handleSubmit} className={`space-y-6 ${formVisible ? 'block' : 'hidden'} mt-6`}>
        <div className='flex gap-4'>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as '' | 'income' | 'expense')}
              className={`w-full bg-gray-800 text-gray-200 p-1 rounded ${type === '' ? 'text-gray-600' : 'text-gray-200'}`}
              required
              >
              <option value="" className='text-gray-600' disabled>Tipo</option>
              <option value="income" className='text-gray-200'>Ingreso</option>
              <option value="expense" className='text-gray-200'>Gasto</option>
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
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-2">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 p-1 border-gray-900 rounded focus:outline-none focus:bg-gray-700 placeholder:text-gray-600 focus:placeholder:text-gray-500"
            placeholder="Descripción de la transacción"
            required
          />
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