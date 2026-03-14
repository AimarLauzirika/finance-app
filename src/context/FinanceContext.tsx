import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FinanceState, Transaction } from '../types';
import { FinanceContext } from './FinanceContextObject';
import transactionsData from '../data/transactions.json';

// Initial state
const parsedState = JSON.parse(localStorage.getItem('financeState') || '{}');
const initialState: FinanceState = {
  initialCapital: parsedState.transactions.find((t: Transaction) => t.type === 'initial').amount,
  initialCapitalDate: parsedState.transactions.find((t: Transaction) => t.type === 'initial').date,
  transactions: [],
};

// Load initial data from JSON if no localStorage
const getInitialData = (): Transaction[] => {
  const saved = localStorage.getItem('financeState');
  if (saved) {
    const parsed = JSON.parse(saved);
    return parsed.transactions || [];
  }
  // If no saved data, use JSON data
  const initialTransactionsData: Transaction[] = transactionsData as Transaction[];
  initialTransactionsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let balance = 0;
  initialTransactionsData.forEach((transactionData) => {
    balance += transactionData.type === 'income' || transactionData.type === 'initial' ? transactionData.amount : -transactionData.amount;
    transactionData.balanceAfter = balance;
  });
  return initialTransactionsData;
};


// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>(() => ({
    ...initialState,
    transactions: getInitialData(),
  }));

  useEffect(() => {
    localStorage.setItem('financeState', JSON.stringify(state));
  }, [state]);

  // Compute and return a new transactions array with updated `balanceAfter`
  const computeBalanceAfter = (transactions: Transaction[]): Transaction[] => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let balance = 0;
    return sortedTransactions.map(t => {
      balance += t.type === 'income' || t.type === 'initial' ? t.amount : -t.amount;
      return { ...t, balanceAfter: balance };
    });
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    setState(prev => {
      const updatedTransactions = computeBalanceAfter([...prev.transactions, newTransaction]);
      return {
        ...prev,
        transactions: updatedTransactions,
      };
    });

    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    setState(prev => {
      const updatedTransactions = computeBalanceAfter(prev.transactions.filter(t => t.id !== id));
      return {
        ...prev,
        transactions: updatedTransactions,
      };
    });
  };

  const setInitialCapital = (capital: number, date: string) => {
    setState(prev => {
      const updatedTransactions = computeBalanceAfter(
        prev.transactions.map(t => (t.type === 'initial' ? { ...t, amount: capital, date } : t)),
      );
      initialState.initialCapital = capital;
      initialState.initialCapitalDate = date;

      return {
        ...prev,
        initialCapital: capital,
        initialCapitalDate: date,
        transactions: updatedTransactions,
      };
    });
  };


  // useEffect(() => {
  //   console.log('updating.............')
  //   let balance = 0;
  //   const updatedTransactions = state.transactions.map(t => {
  //     balance += t.type === 'income' || t.type === 'initial' ? t.amount : -t.amount;
  //     return { ...t, balanceAfter: balance };
  //   });
  //   setState(prev => ({ ...prev, transactions: updatedTransactions }));
  // }, [state.transactions, state.initialCapital]);

  // Calculate balance and profit
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = state.initialCapital + totalIncome - totalExpense;
  const profit = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{ state, addTransaction, deleteTransaction, setInitialCapital, balance, profit, transactionFormVisible: false, initialCapitalFormVisible: false, transactionListVisible: true }}>
      {children}
    </FinanceContext.Provider>
  );
};

