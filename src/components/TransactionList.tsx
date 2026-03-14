import React, {useState} from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import TransactionItem from './TransactionItem';

const TransactionList: React.FC = () => {
  const { state } = useFinance();
  const [transactionListVisible, setTransactionListVisible] = useState(true);

  // Sort transactions by date descending
  const sortedTransactions = [...state.transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );


  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-gray-400 text-2xl font-semibold hover:cursor-pointer select-none" onClick={() => {setTransactionListVisible(!transactionListVisible)}}>Transacciones {<ChevronsUpDown className="inline h-5 w-5 stroke-[3.5]" />}</h2>
      {sortedTransactions.length === 0 ? (
        <p className="text-gray-500">No hay transacciones aún.</p>
      ) : (
        <div className={`space-y-2 mt-4 ${transactionListVisible ? 'block' : 'hidden'}`}>
          {sortedTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;