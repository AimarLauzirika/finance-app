import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';

const AccountForm: React.FC = () => {
  const { addAccount } = useFinance();
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ref, setRef] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAccountId = parseInt(accountId);
    if (numAccountId > 0 && ref.trim() && date) {
      await addAccount({
        account_id: numAccountId,
        date,
        ref: ref.trim(),
      });

      // Reset form
      setAccountId('');
      setRef('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold hover:cursor-pointer hover:text-blue-500 hover:opacity-75 select-none" onClick={() => setFormVisible(!formVisible)}>
        Agregar Cuenta {<Plus className="inline font-bold h-6 w-6 stroke-[3]" />}
      </h2>
      <form onSubmit={handleSubmit} className={`space-y-6 ${formVisible ? 'block' : 'hidden'} mt-6`}>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <label className="block text-gray-600 text-sm font-medium mb-2">ID de Cuenta</label>
            <input
              type="number"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 p-1 border-gray-900 rounded focus:outline-none focus:bg-gray-700 placeholder:text-gray-600 focus:placeholder:text-gray-500"
              placeholder="123"
              min="1"
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
          <label className="block text-gray-600 text-sm font-medium mb-2">Referencia</label>
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 p-1 border-gray-900 rounded focus:outline-none focus:bg-gray-700 placeholder:text-gray-600 focus:placeholder:text-gray-500"
            placeholder="Referencia de la cuenta"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-800 px-4 py-2 bg-blue-500 text-blue-100 rounded hover:bg-blue-600"
        >
          Agregar Cuenta
        </button>
      </form>
    </div>
  );
};

export default AccountForm;