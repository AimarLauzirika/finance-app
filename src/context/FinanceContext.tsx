import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FinanceState, Transaction } from '../types';
import { FinanceContext } from './FinanceContextObject';
import { supabase } from '../lib/supabase';

// Initial state
const initialState: FinanceState = {
  initialCapital: 0,
  initialCapitalDate: '',
  transactions: [],
};

// Load initial data from Supabase
const getInitialData = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  // Compute balanceAfter
  let balance = 0;
  const transactionsWithBalance = data.map((t: Transaction) => {
    balance += t.type === 'payout' || t.type === 'initial' ? t.amount : -t.amount;
    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      date: t.date,
      balanceAfter: balance,
    };
  });

  return transactionsWithBalance;
};


// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>(initialState);

  useEffect(() => {
    const loadData = async () => {
      const transactions = await getInitialData();
      const initialTransaction = transactions.find(t => t.type === 'initial');
      setState({
        initialCapital: initialTransaction ? initialTransaction.amount : 0,
        initialCapitalDate: initialTransaction ? initialTransaction.date : '',
        transactions,
      });
    };
    loadData();
  }, []);

  // Compute and return a new transactions array with updated `balanceAfter`
  const computeBalanceAfter = (transactions: Transaction[]): Transaction[] => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let balance = 0;
    return sortedTransactions.map(t => {
      balance += t.type === 'payout' || t.type === 'initial' ? t.amount : -t.amount;
      return { ...t, balanceAfter: balance };
    });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'balanceAfter'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        account_id: null, // optional
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }

    const newTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      balanceAfter: 0, // will be computed
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

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return;
    }

    setState(prev => {
      const updatedTransactions = computeBalanceAfter(prev.transactions.filter(t => t.id !== id));
      return {
        ...prev,
        transactions: updatedTransactions,
      };
    });
  };

  const setInitialCapital = async (capital: number, date: string) => {
    // Check if initial transaction exists
    const existingInitial = state.transactions.find(t => t.type === 'initial');
    let insertedData: Transaction;
    if (existingInitial) {
      // Update existing
      const { error } = await supabase
        .from('transactions')
        .update({ amount: capital, date })
        .eq('id', existingInitial.id);

      if (error) {
        console.error('Error updating initial capital:', error);
        return;
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: 'initial',
          amount: capital,
          date,
          account_id: null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding initial capital:', error);
        return;
      }
      insertedData = data;
    }

    setState(prev => {
      let newTransactionData;
      if (existingInitial) {
        newTransactionData = { ...existingInitial, amount: capital, date };
      } else {
        newTransactionData = insertedData;
      }
      let newTransactions = prev.transactions;
      if (existingInitial) {
        newTransactions = prev.transactions.map(t => (t.type === 'initial' ? newTransactionData : t));
      } else {
        newTransactions = [...prev.transactions, {
          id: newTransactionData.id,
          type: newTransactionData.type,
          amount: newTransactionData.amount,
          date: newTransactionData.date,
          balanceAfter: 0, // will be computed
        }];
      }
      const updatedTransactions = computeBalanceAfter(newTransactions);

      return {
        ...prev,
        initialCapital: capital,
        initialCapitalDate: date,
        transactions: updatedTransactions,
      };
    });
  };

  // Calculate balance and profit
  const totalIncome = state.transactions
    .filter(t => t.type === 'payout')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type !== 'payout' && t.type !== 'initial')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = state.initialCapital + totalIncome - totalExpense;
  const profit = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{ state, addTransaction, deleteTransaction, setInitialCapital, balance, profit, transactionFormVisible: false, initialCapitalFormVisible: false, transactionListVisible: true }}>
      {children}
    </FinanceContext.Provider>
  );
};

