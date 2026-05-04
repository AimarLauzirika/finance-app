import React, { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import type { Transaction } from '../types';

interface TransactionStatsHeaderProps {
  filteredTransactions?: Transaction[];
}

const TransactionStatsHeader: React.FC<TransactionStatsHeaderProps> = ({ filteredTransactions }) => {
  const { state } = useFinance();

  const stats = useMemo(() => {
    const transactions = filteredTransactions || state.transactions;

    // Total account costs (buy_account + reset_account + activation_fee + renew_subscription + data)
    const totalExpenses = transactions
      .filter(t => t.type === 'buy_account' || t.type === 'reset_account' || t.type === 'activation_fee' || t.type === 'renew_subscription' || t.type === 'data')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total payouts (sum of payout transactions)
    const totalPayouts = transactions
      .filter(t => t.type === 'payout')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total results (payouts minus expenses)
    const totalResults = totalPayouts - totalExpenses;

    return {
      totalExpenses,
      totalPayouts,
      totalResults,
    };
  }, [state.transactions, filteredTransactions]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-sm text-gray-400 font-semibold mb-4">Resumen</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded text-center">
          <p className="text-xs text-gray-400 mb-1">Gastos</p>
          <p className={`text-lg font-bold ${stats.totalExpenses > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {formatCurrency(stats.totalExpenses)}
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

export default TransactionStatsHeader;
