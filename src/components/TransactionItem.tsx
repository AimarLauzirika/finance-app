import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Pencil, Save, X } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import type { Transaction } from '../types';
import { TRANSACTION_TYPES } from '../constants/transactionTypes';
import { format } from 'date-fns';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { deleteTransaction, updateTransaction, state } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    type: transaction.type,
    amount: transaction.amount.toString(),
    date: transaction.date,
    info: transaction.info || '',
  });

  // Get account information if transaction is associated with an account
  const getAccountInfo = () => {
    if (!transaction.my_account_id) return null;
    const myAccount = state.myAccounts.find(ma => ma.id === transaction.my_account_id);
    if (!myAccount) return null;
    const account = state.accounts.find(a => a.id === myAccount.account_id);
    if (!account) return null;
    const company = state.companies.find(c => c.id === account.company_id);
    return { myAccount, account, company };
  };

  const accountInfo = getAccountInfo();

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      deleteTransaction(transaction.id);
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(editData.amount);
    if (isNaN(amount) || !editData.date) return;

    await updateTransaction(transaction.id, {
      type: editData.type,
      amount,
      date: editData.date,
      info: editData.info || undefined,
    });

    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded">
      <div className="flex items-center gap-3 flex-1">
        {transaction.type === 'payout' ? (
          <ArrowUp className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <ArrowDown className="w-5 h-5 text-red-600 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={editData.type}
                  onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="bg-gray-800 text-white px-2 py-1 rounded"
                >
                  {Object.entries(TRANSACTION_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                  className="bg-gray-800 text-white px-2 py-1 rounded"
                />
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-gray-800 text-white px-2 py-1 rounded"
                />
              </div>
              <textarea
                value={editData.info}
                onChange={(e) => setEditData(prev => ({ ...prev, info: e.target.value }))}
                className="bg-gray-800 text-white px-2 py-1 rounded resize-none"
                placeholder="Información (opcional)"
                rows={2}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-300">
                  {TRANSACTION_TYPES[transaction.type]}
                </p>
                <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'dd/MM/yyyy')}</p>
              </div>
              {accountInfo && (
                <p className="text-sm text-gray-400 mt-1">
                  {accountInfo.company?.short_name} - {accountInfo.account.name} - Ref: {accountInfo.myAccount.ref}
                </p>
              )}
              {transaction.info && <p className="text-sm text-gray-400 mt-1">{transaction.info}</p>}
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center flex-1">
        {!isEditing && (
          <div className={`text-sm font-medium ${
            transaction.type === 'payout' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'payout' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 flex-1">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-1 text-green-400 hover:text-green-600 transition-colors flex-shrink-0"
              title="Guardar cambios"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
            title="Editar transacción"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
          title="Eliminar transacción"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;