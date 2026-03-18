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

  const transactions = (transactionsRes.data || []).map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    my_account_id: t.my_account_id,
  }));

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

  return { transactions, myAccounts, accounts, companies };
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

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        my_account_id: transaction.my_account_id,
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
      my_account_id: data.my_account_id,
    };

    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
    }));

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

    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  };

  const setInitialCapital = async (capital: number, date: string) => {
    // Check if initial transaction exists
    const existingInitial = state.transactions.find(t => t.type === 'initial');
    let insertedData: Transaction | null = null;
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
      const updatedTransactions = existingInitial
        ? prev.transactions.map(t => (t.type === 'initial' ? { ...t, amount: capital, date } : t))
        : [...prev.transactions, {
            id: insertedData!.id,
            type: insertedData!.type,
            amount: insertedData!.amount,
            date: insertedData!.date,
          }];

      return {
        ...prev,
        initialCapital: capital,
        initialCapitalDate: date,
        transactions: updatedTransactions,
      };
    });
  };

  const addMyAccount = async (account: Omit<MyAccount, 'id'> & { cost?: number }) => {
    const { cost, ...accountData } = account;
    const { data, error } = await supabase
      .from('my_accounts')
      .insert([accountData])
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

    const costValue = cost ?? 0;
    if (costValue > 0) {
      await addTransaction({
        type: 'buy_account',
        amount: costValue,
        date: data.date,
        my_account_id: data.id,
      });
    }
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

