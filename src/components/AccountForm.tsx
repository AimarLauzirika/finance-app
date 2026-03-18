import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';

const AccountForm: React.FC = () => {
  const { addMyAccount } = useFinance();
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ref, setRef] = useState('');
  const [state, setState] = useState('active');
  const [cost, setCost] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAccountId = parseInt(accountId);
    const numCost = parseFloat(cost);
    if (numAccountId > 0 && ref.trim() && date && state && numCost > 0) {
      await addMyAccount({
        account_id: numAccountId,
        date,
        ref: ref.trim(),
        state,
        cost: numCost,
      });

      // Reset form
      setAccountId('');
      setRef('');
      setState('active');
      setCost('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold">Agregar Cuenta {<Plus className="inline font-bold h-6 w-6 stroke-[3]" />}</h2>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-2">Costo de compra (USD)</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 p-1 border-gray-900 rounded focus:outline-none focus:bg-gray-700 placeholder:text-gray-600 focus:placeholder:text-gray-500"
            placeholder="0.00"
            min="0.00"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-2">Estado</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-gray-800 text-gray-200 p-1 rounded focus:outline-none focus:bg-gray-700"
            required
          >
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
            <option value="sold">Vendida</option>
          </select>
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