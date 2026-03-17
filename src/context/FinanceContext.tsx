import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FinanceState, Transaction, MyAccount, AccountTable, Company } from '../types';
import { FinanceContext } from './FinanceContextObject';
import { supabase } from '../lib/supabase';

// Initial state
const initialState: FinanceState = {
  initialCapital: 0,
  initialCapitalDate: '',
  transactions: [],
  myAccounts: [],
  accounts: [],
  companies: [],
};

// Load initial data from Supabase
const getInitialData = async (): Promise<{ transactions: Transaction[], myAccounts: MyAccount[], accounts: AccountTable[], companies: Company[] }> => {
  const [transactionsRes, myAccountsRes, accountsRes, companiesRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: true }),
    supabase
      .from('my_accounts')
      .select('*')
      .order('date', { ascending: true }),
    supabase
      .from('accounts')
      .select('*'),
    supabase
      .from('companies')
      .select('*')
  ]);

  if (transactionsRes.error) {
    console.error('Error fetching transactions:', transactionsRes.error);
  }
  if (myAccountsRes.error) {
    console.error('Error fetching my_accounts:', myAccountsRes.error);
  }
  if (accountsRes.error) {
    console.error('Error fetching accounts:', accountsRes.error);
  }
  if (companiesRes.error) {
    console.error('Error fetching companies:', companiesRes.error);
  }

  // Compute balanceAfter
  let balance = 0;
  const transactionsWithBalance = (transactionsRes.data || []).map((t: any) => {
    balance += t.type === 'payout' || t.type === 'initial' ? t.amount : -t.amount;
    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      date: t.date,
      balanceAfter: balance,
      my_account_id: t.my_account_id,
    };
  });

  const myAccounts = (myAccountsRes.data || []).map((a: any) => ({
    id: a.id,
    account_id: a.account_id,
    date: a.date,
    ref: a.ref,
    state: a.state,
    eval_pass: a.eval_pass,
  }));

  const accounts = accountsRes.data || [];
  const companies = companiesRes.data || [];

  return { transactions: transactionsWithBalance, myAccounts, accounts, companies };
};


// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>(initialState);

  useEffect(() => {
    const loadData = async () => {
      const { transactions, myAccounts, accounts, companies } = await getInitialData();
      const initialTransaction = transactions.find(t => t.type === 'initial');
      setState({
        initialCapital: initialTransaction ? initialTransaction.amount : 0,
        initialCapitalDate: initialTransaction ? initialTransaction.date : '',
        transactions,
        myAccounts,
        accounts,
        companies,
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
        my_account_id: transaction.my_account_id,
        // account_id: null, // optional
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
      my_account_id: data.my_account_id,
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
          // account_id: null,
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

  const addMyAccount = async (account: Omit<MyAccount, 'id'>) => {
    const { data, error } = await supabase
      .from('my_accounts')
      .insert([account])
      .select()
      .single();

    if (error) {
      console.error('Error adding my_account:', error);
      return;
    }

    // Add to state
    setState(prev => ({
      ...prev,
      myAccounts: [...prev.myAccounts, {
        id: data.id,
        account_id: data.account_id,
        date: data.date,
        ref: data.ref,
        state: data.state,
        eval_pass: data.eval_pass,
      }],
    }));
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
    <FinanceContext.Provider value={{ state, addTransaction, deleteTransaction, setInitialCapital, addMyAccount, balance, profit, transactionFormVisible: false, initialCapitalFormVisible: false, transactionListVisible: true }}>
      {children}
    </FinanceContext.Provider>
  );
};

