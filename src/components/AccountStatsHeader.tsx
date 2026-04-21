import React, { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import type { Transaction } from '../types';

interface AccountStatsHeaderProps {
  accountIds?: string[]; // If provided, filter stats to these accounts
}

const AccountStatsHeader: React.FC<AccountStatsHeaderProps> = ({ accountIds }) => {
  const { state } = useFinance();

  const stats = useMemo(() => {
    let filteredTransactions: Transaction[] = state.transactions;

    if (accountIds && accountIds.length > 0) {
      filteredTransactions = state.transactions.filter(t => 
        t.my_account_id && accountIds.includes(t.my_account_id)
      );
    }

    // Get my accounts for this filter
    const myAccountsInFilter = accountIds 
      ? state.myAccounts.filter(ma => accountIds.includes(ma.id))
      : state.myAccounts;

    // Count evaluations completed (buy_account + reset_account)
    const evaluationsCompleted = filteredTransactions.filter(
      t => t.type === 'buy_account' || t.type === 'reset_account'
    ).length;

    // Count evaluations passed (accounts with eval_pass = true)
    const evaluationsPassed = myAccountsInFilter.filter(ma => ma.eval_pass).length;

    // Calculate pass rate
    const passRate = evaluationsCompleted > 0 
      ? (evaluationsPassed / evaluationsCompleted) * 100 
      : 0;

    // Total account costs (buy_account + reset_account + activation_fee + renew_subscription)
    const totalAccountCosts = filteredTransactions
      .filter(t => t.type === 'buy_account' || t.type === 'reset_account' || t.type === 'activation_fee' || t.type === 'renew_subscription')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total payouts (sum of payout transactions)
    const totalPayouts = filteredTransactions
      .filter(t => t.type === 'payout')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total results (payouts minus account costs)
    const totalResults = totalPayouts - totalAccountCosts;

    return {
      evaluationsCompleted,
      evaluationsPassed,
      passRate,
      totalAccountCosts,
      totalPayouts,
      totalResults,
    };
  }, [state.transactions, state.myAccounts, accountIds]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-sm text-gray-400 font-semibold mb-4">Estadísticas de Cuentas</h3>
      {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"> */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">Evaluaciones</p>
          <p className="text-lg font-bold text-gray-200">{stats.evaluationsCompleted}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">Aprobadas</p>
          <p className="text-lg font-bold text-green-400">{stats.evaluationsPassed}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">% Éxito</p>
          <p className={`text-lg font-bold ${stats.passRate > 0 ? 'text-green-400' : 'text-gray-400'}`}>
            {stats.passRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">Gastos</p>
          <p className={`text-lg font-bold ${stats.totalAccountCosts > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {formatCurrency(stats.totalAccountCosts)}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">Pagos</p>
          <p className={`text-lg font-bold ${stats.totalPayouts > 0 ? 'text-green-400' : 'text-gray-400'}`}>
            {formatCurrency(stats.totalPayouts)}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">Resultados</p>
          <p className={`text-lg font-bold ${stats.totalResults > 0 ? 'text-blue-400' : stats.totalResults < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {formatCurrency(stats.totalResults)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountStatsHeader;
