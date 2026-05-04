import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { format } from 'date-fns';
import { TRANSACTION_TYPES } from '../constants/transactionTypes';
import type { TransactionType } from '../constants/transactionTypes';

type TransactionRow = {
  id: string;
  type: TransactionType;
  amount: string;
  date: string;
  info: string;
};

const TransactionForm: React.FC<{ accountId?: string; onClose?: () => void }> = ({ accountId, onClose }) => {
  const { addTransaction } = useFinance();
  const [rows, setRows] = useState<TransactionRow[]>([
    { id: crypto.randomUUID(), type: 'buy_account', amount: '', date: format(new Date(), 'yyyy-MM-dd'), info: '' },
  ]);

  const handleRowChange = (id: string, field: keyof Omit<TransactionRow, 'id'>, value: string) => {
    setRows(current => current.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows(current => [
      ...current,
      { id: crypto.randomUUID(), type: 'buy_account', amount: '', date: format(new Date(), 'yyyy-MM-dd'), info: '' },
    ]);
  };

  const removeRow = (id: string) => {
    setRows(current => current.filter(row => row.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entries = rows
      .map(row => ({
        type: row.type,
        amount: parseFloat(row.amount),
        date: row.date,
        info: row.info || undefined,
      }))
      .filter(row => row.amount > 0 && row.date);

    if (entries.length === 0) {
      return;
    }

    await Promise.all(
      entries.map(entry =>
        addTransaction({
          ...entry,
          my_account_id: accountId,
        }),
      ),
    );

    // Reset form
    setRows([{ id: crypto.randomUUID(), type: 'buy_account', amount: '', date: format(new Date(), 'yyyy-MM-dd'), info: '' }]);
    onClose?.();
  };


  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto min-w-[480px]">
      <h2 className="text-xl text-gray-400 font-semibold">Agregar Transacciones</h2>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {rows.map((row, index) => (
          <div key={row.id} className="border-b pb-4 border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-300">Transacción {index + 1}</p>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="text-red-400 hover:text-red-600"
                  title="Eliminar fila"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">Tipo</label>
                <select
                  value={row.type}
                  onChange={e => handleRowChange(row.id, 'type', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                  required
                >
                  <option value="">Elige un tipo</option>
                  {!accountId &&
                    Object.entries(TRANSACTION_TYPES)
                      .filter(([key]) => key === 'VPS' || key === 'dividends' || key === 'income_tax')
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                  {accountId &&
                    Object.entries(TRANSACTION_TYPES)
                      .filter(([key]) => key === 'payout' || key === 'buy_account' || key === 'reset_account' || key === 'activation_fee' || key === 'renew_subscription' || key === 'data')
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">Cantidad (USD)</label>
                <input
                  type="number"
                  value={row.amount}
                  onChange={e => handleRowChange(row.id, 'amount', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                  placeholder="0"
                  min="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  value={row.date}
                  onChange={e => handleRowChange(row.id, 'date', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Información (opcional)</label>
              <textarea
                value={row.info}
                onChange={e => handleRowChange(row.id, 'info', e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded resize-none"
                placeholder="Agregar notas o comentarios..."
                rows={2}
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between gap-4">
          <p
            onClick={addRow}
            className="text-gray-400 px-4 py-2 hover:text-blue-600 hover:cursor-pointer select-none flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Otra transacción
          </p>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Agregar todas
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;