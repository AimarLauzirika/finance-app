import React from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import TransactionItem from './TransactionItem';

interface AccountTransactionsModalProps {
  accountId: string;
  onClose: () => void;
}

const AccountTransactionsModal: React.FC<AccountTransactionsModalProps> = ({ accountId, onClose }) => {
  const { state } = useFinance();

  const accountTransactions = state.transactions.filter(t => t.my_account_id === accountId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl text-gray-200">Transacciones de la Cuenta {accountId}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          {accountTransactions.length === 0 ? (
            <p className="text-gray-500">No hay transacciones para esta cuenta.</p>
          ) : (
            accountTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountTransactionsModal;