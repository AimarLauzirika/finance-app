import React, { useReducer } from 'react';
import type { ReactNode } from 'react';
import type { FinanceState, FinanceAction, Transaction } from '../types';
import { FinanceContext } from './FinanceContextObject';

// Reducer function
const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'SET_INITIAL_CAPITAL':
      return { ...state, initialCapital: action.payload };
    case 'SET_INITIAL_CAPITAL_DATE':
      return { ...state, initialCapitalDate: action.payload };
    // case 'SET_BALANCE_AFTER':
    //   return { ...state, transactions: state.transactions.map(t => t.type === 'initial' ? { ...t, balanceAfter: action.payload } : t) };
    case 'ADD_TRANSACTION':
      { const newTransaction: Transaction = {
        ...action.payload,
        id: Date.now().toString(), // Simple ID generation
      };
      return { ...state, transactions: [...state.transactions, newTransaction] }; }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    default:
      return state;
  }
};

// Initial state
const initialState: FinanceState = {
  initialCapital: 2000,
  initialCapitalDate: '2026-01-01',
  transactions: [],
};
const initialTransactionsData: Transaction[] = [
  {type: 'initial', id: new Date('2026-01-01').getTime().toString(), amount: 2000, description: 'Capital Inicial', date: '2026-01-01', balanceAfter: 2000},
  {type: 'expense', id: new Date('2026-02-01').getTime().toString(), amount: 49, description: 'AF1 Eval', date: '2026-02-01', balanceAfter: 1951},
  {type: 'expense', id: new Date('2026-02-02').getTime().toString(), amount: 49, description: 'AF2 Eval', date: '2026-02-02', balanceAfter: 1902},
  {type: 'expense', id: new Date('2026-02-05').getTime().toString(), amount: 49, description: 'AF2 Activación', date: '2026-02-05', balanceAfter: 1853},
  {type: 'income', id: new Date('2026-02-20').getTime().toString(), amount: 175, description: 'AF2 Retiro', date: '2026-02-20', balanceAfter: 1853}
]
initialTransactionsData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
initialTransactionsData.forEach((transaction, index) => {
  if (index === 0) {
    transaction.balanceAfter = transaction.amount;
  } else {
    const previousTransaction = initialTransactionsData[index - 1];
    transaction.balanceAfter = previousTransaction.balanceAfter + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }
  initialState.transactions.push(transaction);
});


// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Helper functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  // Calculate balance
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = state.initialCapital + totalIncome - totalExpense;
  const profit = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{ state, dispatch, addTransaction, deleteTransaction, balance, profit, transactionFormVisible: false, initialCapitalFormVisible: false, transactionListVisible: true }}>
      {children}
    </FinanceContext.Provider>
  );
};

