import React, { useMemo, useState } from 'react';
import { Pencil, PlusCircle, Save, X, Trash2 } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import type { ActiveAccount } from '../types';
import { formatCurrency } from '../utils/formatters';

const ActiveAccounts: React.FC = () => {
  const {
    state,
    addActiveAccount,
    updateActiveAccount,
    closeAccount,
  } = useFinance();

  const activeMyAccounts = useMemo(() => state.myAccounts.filter(a => a.state === 'active'), [state.myAccounts]);

  const activeAccountMap = useMemo(() => {
    const map: Record<string, ActiveAccount> = {};
    state.activeAccounts.forEach((a) => {
      map[a.ref] = a;
    });
    return map;
  }, [state.activeAccounts]);

  const companiesById = useMemo(() => {
    const map: Record<number, string> = {};
    state.companies.forEach((c) => {
      map[c.id] = c.short_name;
    });
    return map;
  }, [state.companies]);

  const companiesByIdLong = useMemo(() => {
    const map: Record<number, string> = {};
    state.companies.forEach((c) => {
      map[c.id] = c.long_name;
    });
    return map;
  }, [state.companies]);

  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ActiveAccount>>({});

  const startEditing = (ref: string) => {
    setEditingRef(ref);
    setEditValues(activeAccountMap[ref] ?? {});
  };

  const cancelEditing = () => {
    setEditingRef(null);
    setEditValues({});
  };

  const saveEdits = async () => {
    if (!editingRef) return;
    await updateActiveAccount(editingRef, editValues);
    setEditingRef(null);
    setEditValues({});
  };

  const createActiveRecord = async (ref: string) => {
    const now = new Date().toISOString().slice(0, 10);
    const newActive: ActiveAccount = {
      ref,
      last_trade: now,
      withdrawal_date: now,
      balance: 0,
      current_mdd: 0,
      target_account: 0,
    };
    await addActiveAccount(newActive);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl text-gray-400 font-semibold mb-2">Active Accounts</h2>
        <p className="text-sm text-gray-500">
          This view lists your active accounts and lets you track progress toward your target account balance.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {activeMyAccounts.length === 0 ? (
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <p className="text-gray-400">No active accounts found. Mark an account as active to get started.</p>
          </div>
        ) : null}

        {activeMyAccounts.map((myAccount) => {
          const activeAccount = activeAccountMap[myAccount.ref];
          const account = state.accounts.find(a => a.id === myAccount.account_id);
          const accountName = account?.name ?? 'Unknown account';
          const companyShortName = account ? companiesById[account.company_id] ?? 'Unknown' : 'Unknown';
          const companyName = account ? companiesByIdLong[account.company_id] ?? 'Unknown' : 'Unknown';

          const progress = activeAccount?.target_account
            ? (activeAccount.balance - activeAccount.current_mdd) / (activeAccount.target_account - activeAccount.current_mdd)
            : 0;

          return (
            <div key={myAccount.id} className="bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {account && account.company_id && (
                    <img
                      src={`/src/assets/logos/${companyShortName}.png`}
                      alt={companyName}
                      className="w-16 h-full flex-shrink-0 my-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">{accountName}</h3>
                    <p className="text-sm text-gray-500">{companyName}</p>
                    <p className="text-sm text-gray-500">{myAccount.ref}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeAccount ? (
                    <>
                      <button
                        onClick={() => (editingRef === myAccount.ref ? cancelEditing() : startEditing(myAccount.ref))}
                        className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-sm font-medium hover:bg-blue-500"
                      >
                        <Pencil size={16} />
                        <span>{editingRef === myAccount.ref ? 'Cancel' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to close this account? This action cannot be undone.')) {
                            closeAccount(myAccount.ref);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-sm font-medium hover:bg-red-500"
                      >
                        <Trash2 size={16} />
                        <span>Close</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => createActiveRecord(myAccount.ref)}
                      className="inline-flex items-center gap-2 rounded bg-emerald-600 px-3 py-1 text-sm font-medium hover:bg-emerald-500"
                    >
                      <PlusCircle size={16} />
                      <span>Create</span>
                    </button>
                  )}
                </div>
              </div>

              {activeAccount ? (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Last trade</p>
                      {editingRef === myAccount.ref ? (
                        <input
                          type="date"
                          value={editValues.last_trade ?? activeAccount.last_trade}
                          onChange={(e) => setEditValues(prev => ({ ...prev, last_trade: e.target.value }))}
                          className="mt-1 w-full rounded bg-gray-800 px-2 py-1 text-gray-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-200">{activeAccount.last_trade}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Withdrawal date</p>
                      {editingRef === myAccount.ref ? (
                        <input
                          type="date"
                          value={editValues.withdrawal_date ?? activeAccount.withdrawal_date}
                          onChange={(e) => setEditValues(prev => ({ ...prev, withdrawal_date: e.target.value }))}
                          className="mt-1 w-full rounded bg-gray-800 px-2 py-1 text-gray-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-200">{activeAccount.withdrawal_date}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Max Drawdown</p>
                      {editingRef === myAccount.ref ? (
                        <input
                        type="number"
                        value={editValues.current_mdd ?? activeAccount.current_mdd}
                        onChange={(e) => setEditValues(prev => ({ ...prev, current_mdd: parseFloat(e.target.value) }))}
                        className="mt-1 w-full rounded bg-gray-800 px-2 py-1 text-gray-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-200">{formatCurrency(activeAccount.current_mdd)}</p>
                      )}
                    </div>
                    <div className='text-center'>
                      <p className="text-xs text-gray-400">Balance</p>
                      {editingRef === myAccount.ref ? (
                        <input
                          type="number"
                          value={editValues.balance ?? activeAccount.balance}
                          onChange={(e) => setEditValues(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
                          className="mt-1 w-full rounded bg-gray-800 px-2 py-1 text-gray-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-200">{formatCurrency(activeAccount.balance)}</p>
                      )}
                    </div>
                    <div className='text-right'>
                      <p className="text-xs text-gray-400">Target</p>
                      {editingRef === myAccount.ref ? (
                        <input
                          type="number"
                          value={editValues.target_account ?? activeAccount.target_account}
                          onChange={(e) => setEditValues(prev => ({ ...prev, target_account: parseFloat(e.target.value) }))}
                          className="mt-1 w-full rounded bg-gray-800 px-2 py-1 text-gray-200"
                        />
                      ) : (
                        <p className="text-sm text-gray-200">{formatCurrency(activeAccount.target_account)}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-gray-800">
                      <div
                        className={`h-full rounded-full ${progress < 1 ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Progress: {Math.round(progress * 100)}% ({formatCurrency(activeAccount.balance - activeAccount.current_mdd)} / {formatCurrency(activeAccount.target_account -  activeAccount.balance)})
                    </p>
                  </div>

                  {editingRef === myAccount.ref ? (
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={saveEdits}
                        className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-sm font-medium hover:bg-blue-500"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-2 rounded bg-gray-700 px-3 py-1 text-sm font-medium hover:bg-gray-600"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-400">No active account record found for this reference.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveAccounts;
