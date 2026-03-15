import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Play } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import type { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { deleteTransaction } = useFinance();

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      deleteTransaction(transaction.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-700">
      <div className="flex items-center gap-3">
        {transaction.type === 'initial' ? (
          <Play className="w-5 h-5 text-blue-600" />
        ) : transaction.type === 'payout' ? (
          <ArrowUp className="w-5 h-5 text-green-600" />
        ) : (
          <ArrowDown className="w-5 h-5 text-red-600" />
        )}
        <div>
          <p className="font-medium text-gray-300">
            {transaction.type === 'buy_eval' ? 'Compra Evaluación' : 
             transaction.type === 'activation_fee' ? 'Activación' : 
             transaction.type === 'reset_account' ? 'Reset' : 
             transaction.type === 'VPS' ? 'VPS' : 
             transaction.type === 'payout' ? 'Pago' : transaction.type}
          </p>
          <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className='text-right'>
          <span
            className={` block ${
              transaction.type === 'initial' ? 'text-blue-500' : transaction.type === 'payout' ? 'text-green-600' : 'text-red-600'
            }`}
            >
            {transaction.type === 'initial' ? '' : transaction.type === 'payout' ? '+' : '-'}{formatCurrency(transaction.amount )}
          </span>
          <p className="text-sm text-gray-500">Balance: <span className='text-gray-400'>{formatCurrency(transaction.balanceAfter)}</span></p>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Eliminar transacción"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;