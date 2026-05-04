import React, { useState } from 'react';
import { Plus, Eye, Award, Pencil, Save, X } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import TransactionForm from './TransactionForm';
import AccountTransactionsModal from './AccountTransactionsModal';
import { format } from 'date-fns';
import type { MyAccount } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AccountItemProps {
  account: MyAccount;
}

const AccountItem: React.FC<AccountItemProps> = ({ account }) => {
  const { state, updateMyAccount } = useFinance();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    date: account.date,
    ref: account.ref,
    state: account.state,
    eval_pass: account.eval_pass ?? false,
  });

  // Find account details
  const accountDetails = state.accounts.find(a => a.id === account.account_id);
  const company = accountDetails ? state.companies.find(c => c.id === accountDetails.company_id) : null;

  // Check if account has buy_account transaction
  const hasBuyTransaction = state.transactions.some(t => t.type === 'buy_account' && t.my_account_id === account.id);

  // Calculate results (total payouts and total incomes)
  const totalPayouts = state.transactions
    .filter(t => t.type === 'payout' && t.my_account_id === account.id)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = state.transactions
    .filter(t => (t.type === 'buy_account' || t.type === 'activation_fee' || t.type === 'reset_account' || t.type === 'renew_subscription' || t.type === 'data') && t.my_account_id === account.id)
    .reduce((sum, t) => sum + t.amount, 0);
  const accountResults = totalPayouts - totalExpenses

  const accountName = company && accountDetails ? `${company.short_name} - ${accountDetails.name} (${account.account_id})` : `Cuenta ID: ${account.account_id}`;

  const handleSave = async () => {
    await updateMyAccount(account.id, {
      date: editValues.date,
      ref: editValues.ref,
      state: editValues.state,
      eval_pass: editValues.eval_pass,
    });
    setIsEditing(false);
  };

  const isActive = account.state === 'active';

  return (
    <div className={`p-4 bg-gray-800 rounded-lg transition-all ${
      isActive
        ? ' border-l-4 border-l-green-500'
        : ''
    }`}>
      <div className="flex items-center justify-between">
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-gray-400 text-xs">Fecha</label>
                <input
                  type="date"
                  value={editValues.date}
                  onChange={(e) => setEditValues(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-gray-900 text-gray-200 px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Referencia</label>
                <input
                  value={editValues.ref}
                  onChange={(e) => setEditValues(prev => ({ ...prev, ref: e.target.value }))}
                  className="w-full bg-gray-900 text-gray-200 px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Estado</label>
                <select
                  value={editValues.state}
                  onChange={(e) => setEditValues(prev => ({ ...prev, state: e.target.value as any }))}
                  className="w-full bg-gray-900 text-gray-200 px-2 py-1 rounded"
                >
                  <option value="active">Activa</option>
                  <option value="closed">Cerrada</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-xs">Eval Pass</label>
                <input
                  type="checkbox"
                  checked={editValues.eval_pass}
                  onChange={(e) => setEditValues(prev => ({ ...prev, eval_pass: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className={`font-medium ${
                  isActive ? 'text-gray-100' : 'text-gray-400'
                }`}>{accountName}</p>
                {isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
              </div>
              <p className={`text-sm ${
                isActive ? 'text-gray-400' : 'text-gray-600'
              }`}>{format(new Date(account.date), 'dd/MM/yyyy')}</p>
              <p className={`text-sm ${
                isActive ? 'text-gray-400' : 'text-gray-600'
              }`}>Ref: {account.ref}</p>
              <p className={`text-sm ${
                isActive ? 'text-green-400 font-medium' : 'text-gray-500'
              }`}>Estado: {account.state}</p>
              {!hasBuyTransaction && (
                <p className="text-red-500 text-sm">⚠️ Sin transacción de compra</p>
              )}
            </>
          )}
        </div>
        <div className='text-center'>
          {account.eval_pass ? <div className='flex text-amber-400 justify-center'><p className=''> Eval Pass</p><Award className='h-5 w-5' /></div> : ''}
          <p className="text-gray-400 text-sm">Pagos: {formatCurrency(totalPayouts)}</p>
          {/* <p className='text-gray-400'>Resultado:</p> */}
          <p className={`text-xl font-bold text-gray-300 ${accountResults > 0 ? 'text-green-600' : 'text-red-700'}`}>{formatCurrency(accountResults)}</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> Guardar
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 flex items-center gap-1"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setShowTransactionForm(!showTransactionForm)}
                className="bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-600 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> T
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-sky-900 text-white px-3 py-1 rounded hover:bg-sky-700 flex items-center gap-1"
              >
                <Eye className="h-4 w-4" /> T
              </button>
            </>
          )}
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