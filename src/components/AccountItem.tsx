import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import TransactionForm from './TransactionForm';
import AccountTransactionsModal from './AccountTransactionsModal';
import { format } from 'date-fns';

interface AccountItemProps {
  account: {
    id: string;
    account_id: number;
    date: string;
    ref: string;
  };
}

const AccountItem: React.FC<AccountItemProps> = ({ account }) => {
  const { state } = useFinance();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check if account has buy_account transaction
  const hasBuyTransaction = state.transactions.some(t => t.type === 'buy_account' && t.my_account_id === account.id);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-200 font-medium">Cuenta ID: {account.account_id}</p>
          <p className="text-gray-500 text-sm">{format(new Date(account.date), 'dd/MM/yyyy')}</p>
          <p className="text-gray-400 text-sm">Ref: {account.ref}</p>
          {!hasBuyTransaction && (
            <p className="text-red-500 text-sm">⚠️ Sin transacción de compra</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransactionForm(!showTransactionForm)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Transacción
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
          >
            <Eye className="h-4 w-4" /> Ver Transacciones
          </button>
        </div>
      </div>
      {showTransactionForm && (
        <div className="mt-4">
          <TransactionForm accountId={account.id} onClose={() => setShowTransactionForm(false)} />
        </div>
      )}
      {showModal && (
        <AccountTransactionsModal accountId={account.id} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default AccountItem;