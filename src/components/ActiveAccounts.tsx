import React, { useMemo, useState } from 'react';
import { Pencil, PlusCircle, Save, X, Trash2 } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import type { ActiveAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { isToday } from 'date-fns';

const ActiveAccounts: React.FC = () => {
  const {
    state,
    addActiveAccount,
    updateActiveAccount,
    closeAccount,
  } = useFinance();

  const [mode, setMode] = useState<'estado' | 'operativa'>('estado');
  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ActiveAccount>>({});

  const activeMyAccounts = useMemo(() => {
    const filtered = state.myAccounts.filter(a => a.state === 'active');
    
    return filtered.sort((a, b) => {
      const stageA = state.activeAccounts.find(aa => aa.ref === a.ref)?.stage ?? '';
      const stageB = state.activeAccounts.find(aa => aa.ref === b.ref)?.stage ?? '';
      
      const accountA = state.accounts.find(acc => acc.id === a.account_id);
      const accountB = state.accounts.find(acc => acc.id === b.account_id);
      const companyIdA = accountA?.company_id ?? 0;
      const companyIdB = accountB?.company_id ?? 0;
      
      if (stageA !== stageB) {
        return stageB.localeCompare(stageA);
      }
      
      if (companyIdA !== companyIdB) {
        return companyIdA - companyIdB;
      }
      
      return a.ref.localeCompare(b.ref);
    });
  }, [state.myAccounts, state.activeAccounts, state.accounts]);

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

  const companiesById2 = useMemo(() => {
    const map: Record<number, any> = {};
    state.companies.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [state.companies]);

  const fundResultsMap = useMemo(() => {
    const map: Record<string, any> = {};
    state.fundResults.forEach((f) => {
      const key = `${f.account_id}-${f.criteria}`;
      map[key] = f;
    });
    return map;
  }, [state.fundResults]);

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
      stage: 'e1',
      last_trade: now,
      withdrawal_date: now,
      balance: 0,
      current_mdd: 0,
      target_account: 0,
    };
    await addActiveAccount(newActive);
  };

  const renderEstadoRow = (myAccount: any) => {
    const activeAccount = activeAccountMap[myAccount.ref];
    const account = state.accounts.find(a => a.id === myAccount.account_id);
    const accountName = account?.name ?? 'Desconocida';
    const companyShortName = account ? companiesById[account.company_id] ?? 'Unknown' : 'Unknown';
    const companyName = account ? companiesByIdLong[account.company_id] ?? 'Unknown' : 'Unknown';

    const progress = activeAccount?.target_account
      ? (activeAccount.balance - (activeAccount.current_mdd ?? 0)) / (activeAccount.target_account - (activeAccount.current_mdd ?? 0))
      : 0;

    if (!activeAccount) {
      return (
        <tr key={myAccount.id} className="border-b border-gray-700 hover:bg-gray-800">
          <td colSpan={11} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {account && account.company_id && (
                  <img
                    src={`/logos/${companyShortName}.png`}
                    alt={companyName}
                    className="w-6 h-6 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <p className="text-gray-200">{accountName}</p>
                  <p className="text-xs text-gray-500">{companyName}</p>
                </div>
              </div>
              <button
                onClick={() => createActiveRecord(myAccount.ref)}
                className="inline-flex items-center gap-2 rounded bg-emerald-600 px-3 py-1 text-sm font-medium hover:bg-emerald-500"
              >
                <PlusCircle size={16} />
                <span>Crear</span>
              </button>
            </div>
          </td>
        </tr>
      );
    }

    let stage = activeAccount.stage;
    if (activeAccount.stage === null) {
      stage = '';
    }

    // Check if minimum days are met
    const minDaysMet = (activeAccount.profit_days ?? 0) >= (account?.f_min_profit_days ?? 0);

    // Determine progress bar color based on balance and minimum days
    let progressBarColor = 'bg-gray-600'; // Default: balance < target
    if (progress >= 1) {
      progressBarColor = minDaysMet ? 'bg-green-500' : 'bg-blue-500';
    }

    return (
      <tr key={myAccount.id} className={`border-b border-gray-600 ${isToday(activeAccount.last_trade) || (progress >= 1 && minDaysMet) ? 'bg-gray-700' : 'bg-transparent'} hover:bg-gray-800`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {account && account.company_id && (
              <img
                src={`/src/assets/logos/${companyShortName}.png`}
                alt={companyName}
                className="w-6 h-6 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <p className="text-gray-200 font-medium">{accountName}</p>
              <p className="text-xs text-gray-500">{companyName}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300">
          {editingRef === myAccount.ref ? (
            <select name="" id="" value={editValues.stage ?? activeAccount.stage}
              onChange={(e) => setEditValues(prev => ({ ...prev, stage: e.target.value }))}
              className='bg-gray-800'
            >
              <option value="">Elige una opción</option>
              <option value="e1">e1</option>
              <option value="e2">e2</option>
              <option value="e3">e3</option>
              <option value="f">f</option>
            </select>
          ) : (
            <div className={`rounded text-center ${stage[0] === 'e' ? 'bg-amber-600 text-gray-900' : 'bg-indigo-700'}`}>{activeAccount.stage}</div>
          )}
        </td>
        <td className="px-4 py-3 text-gray-300">{myAccount.ref}</td>
        <td className="px-4 py-3">
          {editingRef === myAccount.ref ? (
            <input
              type="date"
              value={editValues.last_trade ?? activeAccount.last_trade}
              onChange={(e) => setEditValues(prev => ({ ...prev, last_trade: e.target.value }))}
              className="rounded bg-gray-900 px-2 py-1 text-gray-200"
            />
          ) : (
            <span className="text-gray-300">{activeAccount.last_trade}</span>
          )}
        </td>
        <td className="px-4 py-3">
          {editingRef === myAccount.ref ? (
            <input
              type="date"
              value={editValues.withdrawal_date ?? activeAccount.withdrawal_date}
              onChange={(e) => setEditValues(prev => ({ ...prev, withdrawal_date: e.target.value }))}
              className="rounded bg-gray-900 px-2 py-1 text-gray-200"
            />
          ) : (
            <span className="text-gray-300">{activeAccount.withdrawal_date}</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {editingRef === myAccount.ref ? (
            <input
              type="number"
              step="0.01"
              value={editValues.current_mdd ?? activeAccount.current_mdd}
              onChange={(e) => setEditValues(prev => ({ ...prev, current_mdd: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded bg-gray-900 px-2 py-1 text-gray-200"
            />
          ) : (
            <span className="text-gray-300">{formatCurrency(activeAccount.current_mdd ?? 0)}</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {editingRef === myAccount.ref ? (
            <input
              type="number"
              step="0.01"
              value={editValues.balance ?? activeAccount.balance}
              onChange={(e) => setEditValues(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded bg-gray-900 px-2 py-1 text-gray-200"
            />
          ) : (
            <span className="text-gray-300">{formatCurrency(activeAccount.balance)}</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {editingRef === myAccount.ref ? (
            <input
              type="number"
              step="0.01"
              value={editValues.target_account ?? activeAccount.target_account}
              onChange={(e) => setEditValues(prev => ({ ...prev, target_account: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded bg-gray-900 px-2 py-1 text-gray-200"
            />
          ) : (
            <span className="text-gray-300">{formatCurrency(activeAccount.target_account ?? 0)}</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          {account && account.f_min_profit_days ? (
            editingRef === myAccount.ref ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={editValues.profit_days ?? activeAccount.profit_days ?? 0}
                  onChange={(e) => setEditValues(prev => ({ ...prev, profit_days: parseInt(e.target.value) || 0 }))}
                  className="w-16 rounded bg-gray-900 px-2 py-1 text-gray-200 text-center"
                />
                <span className="text-gray-300">/ {account.f_min_profit_days}</span>
              </div>
            ) : (
              <span className="text-gray-300">
                {activeAccount.profit_days ?? 0} / {account.f_min_profit_days} de ${Math.round(account.a_profit_day_usd ?? 0)}
              </span>
            )
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-full rounded-full ${progressBarColor}`}
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress * 100)}% - {formatCurrency(activeAccount.balance - (activeAccount.current_mdd ?? 0))} / {formatCurrency((activeAccount.target_account ?? 0) - activeAccount.balance)}</p>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {editingRef === myAccount.ref ? (
              <>
                <button
                  onClick={saveEdits}
                  className="rounded bg-blue-600 px-2 py-1 text-sm font-medium hover:bg-blue-500"
                  title="Guardar cambios"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={cancelEditing}
                  className="rounded bg-gray-700 px-2 py-1 text-sm font-medium hover:bg-gray-600"
                  title="Cancelar"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEditing(myAccount.ref)}
                  className="rounded bg-blue-600 px-2 py-1 text-sm font-medium hover:bg-blue-500"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres cerrar esta cuenta? Esta acción no se puede deshacer.')) {
                      closeAccount(myAccount.ref);
                    }
                  }}
                  className="rounded bg-red-900 px-2 py-1 text-sm font-medium hover:bg-red-700 text-red-300"
                  title="Cerrar cuenta"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderOperativaRow = (myAccount: any) => {
    const activeAccount = activeAccountMap[myAccount.ref];
    const account = state.accounts.find(a => a.id === myAccount.account_id);
    const accountName = account?.name ?? 'Desconocida';
    const companyShortName = account ? companiesById[account.company_id] ?? 'Unknown' : 'Unknown';
    const companyName = account ? companiesByIdLong[account.company_id] ?? 'Unknown' : 'Unknown';
    const company = companiesById2[account?.company_id ?? 0];

    const progress = activeAccount?.target_account
      ? (activeAccount.balance - (activeAccount.current_mdd ?? 0)) / (activeAccount.target_account - (activeAccount.current_mdd ?? 0))
      : 0;

    // Get fund result: fund_results.account_id = accounts.id and fund_results.criteria = my_active_accounts.criteria
    const fundKey = `${account?.id}-${activeAccount?.criteria}`;
    const fundResult = fundResultsMap[fundKey];

    if (!activeAccount) {
      return (
        <tr key={myAccount.id} className="border-b border-gray-700 hover:bg-gray-800">
          <td colSpan={11} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {account && account.company_id && (
                  <img
                    src={`/logos/${companyShortName}.png`}
                    alt={companyName}
                    className="w-6 h-6 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <p className="text-gray-200">{accountName}</p>
                  <p className="text-xs text-gray-500">{companyName}</p>
                </div>
              </div>
              <button
                onClick={() => createActiveRecord(myAccount.ref)}
                className="inline-flex items-center gap-2 rounded bg-emerald-600 px-3 py-1 text-sm font-medium hover:bg-emerald-500"
              >
                <PlusCircle size={16} />
                <span>Crear</span>
              </button>
            </div>
          </td>
        </tr>
      );
    }

    let stage = activeAccount.stage;
    if (activeAccount.stage === null) {
      stage = '';
    }

    // Get DDD value based on stage
    let dddValue = 0;
    if (stage[0] === 'e') {
      dddValue = account?.e_ddd_usd ?? 0;
    } else if (stage === 'f') {
      dddValue = account?.f_ddd_usd ?? 0;
    }

    const hasNews = (account?.news_minutes ?? 0) !== 0;
    const autoClose = company?.auto_close !== false;
    const dddSoftBreach = company?.ddd_soft_breach === true;

    // Check if minimum days are met
    const minDaysMet = (activeAccount.profit_days ?? 0) >= (account?.f_min_profit_days ?? 0);

    // Determine progress bar color based on balance and minimum days
    let progressBarColor = 'bg-gray-600'; // Default: balance < target
    if (progress >= 1) {
      progressBarColor = minDaysMet ? 'bg-green-500' : 'bg-blue-500';
    }

    return (
      <tr key={myAccount.id} className={`border-b border-gray-600 ${isToday(activeAccount.last_trade) || (progress >= 1 && minDaysMet) ? 'bg-gray-700' : 'bg-transparent'} hover:bg-gray-800`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {account && account.company_id && (
              <img
                src={`/src/assets/logos/${companyShortName}.png`}
                alt={companyName}
                className="w-6 h-6 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <p className="text-gray-200 font-medium">{accountName}</p>
              <p className="text-xs text-gray-500">{companyName}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300">
          <div className={`rounded text-center ${stage[0] === 'e' ? 'bg-amber-600 text-gray-900' : 'bg-indigo-700'}`}>{activeAccount.stage}</div>
        </td>
        <td className="px-4 py-3 text-gray-300">{myAccount.ref}</td>
        <td className="px-4 py-3 text-gray-300">{activeAccount.criteria ?? '-'}</td>
        <td className="px-4 py-3 text-center">
          {fundResult ? (
            <span className="text-gray-300">{fundResult.tp} - {fundResult.sl}</span>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          {fundResult && fundResult.cut_profit !== undefined ? (
            <span className={fundResult.cut_profit ? 'text-green-400' : 'text-gray-300'}>
              {fundResult.cut_profit ? 'Sí' : 'No'}
            </span>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </td>
        <td className={`px-4 py-3 text-center ${hasNews ? 'text-red-400' : 'text-gray-300'}`}>
          {hasNews ? `${account?.news_minutes} min` : '-'}
        </td>
        <td className={`px-4 py-3 text-center ${!autoClose ? 'text-red-400' : 'text-gray-300'}`}>
          {company?.close_time ?? '-'}
        </td>
        <td className={`px-4 py-3 text-center ${dddSoftBreach ? 'text-gray-300' : 'text-red-400'}`}>
          ${Math.round(dddValue)}
        </td>
        <td className="px-4 py-3 text-center">
          {account && account.f_min_profit_days ? (
            <span className="text-gray-300">
              {activeAccount.profit_days ?? 0} / {account.f_min_profit_days} de ${Math.round(account.a_profit_day_usd ?? 0)}
            </span>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-full rounded-full ${progressBarColor}`}
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress * 100)}% - {formatCurrency(activeAccount.balance - (activeAccount.current_mdd ?? 0))} / {formatCurrency((activeAccount.target_account ?? 0) - activeAccount.balance)}</p>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">Cuentas Activas</h2>
            <p className="text-sm text-gray-500">
              Vista de tabla de cuentas activas. Gestiona y monitorea el progreso de tus cuentas.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('estado')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'estado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Estado
            </button>
            <button
              onClick={() => setMode('operativa')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                mode === 'operativa'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Operativa
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeMyAccounts.length === 0 ? (
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <p className="text-gray-400">No hay cuentas activas. Marca una cuenta como activa para comenzar.</p>
          </div>
        ) : (
          <>
            {mode === 'estado' ? (
              <table className="w-full border-collapse bg-gray-900 text-sm">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800">
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Cuenta</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Fase</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Ref</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Último Trade</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Fecha Retiro</th>
                    <th className="px-4 py-3 text-right text-gray-300 font-semibold">MDD</th>
                    <th className="px-4 py-3 text-right text-gray-300 font-semibold">Balance</th>
                    <th className="px-4 py-3 text-right text-gray-300 font-semibold">Target</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Días Mín.</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Progreso</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMyAccounts.map((myAccount) => renderEstadoRow(myAccount))}
                </tbody>
              </table>
            ) : (
              <table className="w-full border-collapse bg-gray-900 text-sm">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800">
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Cuenta</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Fase</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Ref</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-semibold">Criterio</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">TP - SL</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Cortar B.</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Noticias</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Cierre</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">DDD</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Días Mín.</th>
                    <th className="px-4 py-3 text-center text-gray-300 font-semibold">Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMyAccounts.map((myAccount) => renderOperativaRow(myAccount))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveAccounts;
