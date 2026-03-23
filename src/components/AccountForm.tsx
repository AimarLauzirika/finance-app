import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';

const AccountForm: React.FC = () => {
  const { addMyAccount } = useFinance();
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ref, setRef] = useState('');
  const [state, setState] = useState<'active' | 'closed' | 'pending'>('active');
  const [cost, setCost] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const numAccountId = parseInt(accountId);
    const numCost = parseFloat(cost);
    if (numAccountId > 0 && ref.trim() && date && state && numCost >= 0) {
      try {
        await addMyAccount({
          account_id: numAccountId,
          date,
          ref: ref.trim(),
          state,
          cost: numCost,
        });

        setAccountId('');
        setRef('');
        setState('active');
        setCost('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        const errorMessage = err?.message || 'Error al agregar la cuenta. Verifica que la referencia sea única.';
        setError(errorMessage);
        console.error('Error:', err);
      }
    } else {
      setError('Completa todos los campos correctamente.');
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold">Agregar Cuenta {<Plus className="inline font-bold h-6 w-6 stroke-[3]" />}</h2>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded text-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded text-green-200">
          <p className="font-medium">Éxito</p>
          <p className="text-sm mt-1">La cuenta ha sido agregada correctamente.</p>
        </div>
      )}
      
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
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm font-medium mb-2">Estado</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value as 'active' | 'closed' | 'pending')}
            className="w-full bg-gray-800 text-gray-200 p-1 rounded focus:outline-none focus:bg-gray-700"
            required
          >
            <option value="active">Activa</option>
            <option value="closed">Cerrada</option>
            <option value="pending">Pendiente</option>
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