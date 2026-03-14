import React from 'react';
import { useFinance } from '../hooks/useFinance';
import TransactionItem from './TransactionItem';

const TransactionList: React.FC = () => {
  const { state } = useFinance();

  // Sort transactions by date descending
  const sortedTransactions = [...state.transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-gray-300 text-2xl font-bold mb-4">Transacciones</h2>
      {sortedTransactions.length === 0 ? (
        <p className="text-gray-500">No hay transacciones aún.</p>
      ) : (
        <div className="space-y-2">
          {sortedTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;