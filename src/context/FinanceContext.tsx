import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FinanceState, Transaction, MyAccount, AccountTable, Company, ActiveAccount, BankAccount } from '../types';
import { FinanceContext } from './FinanceContextObject';
import { supabase } from '../lib/supabase';

// Initial state
const initialState: FinanceState = {
  transactions: [],
  myAccounts: [],
  accounts: [],
  companies: [],
  activeAccounts: [],
  bankAccounts: [],
};

// Load initial data from Supabase
const getInitialData = async (): Promise<{
  transactions: Transaction[];
  myAccounts: MyAccount[];
  accounts: AccountTable[];
  companies: Company[];
  activeAccounts: ActiveAccount[];
  bankAccounts: BankAccount[];
}> => {
  const [transactionsRes, myAccountsRes, accountsRes, companiesRes, activeAccountsRes, bankAccountsRes] = await Promise.all([
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
      .select('*'),
    supabase
      .from('my_active_accounts')
      .select('*'),
    supabase
      .from('bank_accounts')
      .select('*')
      .order('date', { ascending: false }),
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
    info: t.info,
  }));

  const myAccounts = (myAccountsRes.data || []).map((a: any) => ({
    id: a.id,
    account_id: a.account_id,
    date: a.date,
    ref: a.ref,
    state: a.state,
    eval_pass: a.eval_pass,
  }));

  const activeAccounts = (activeAccountsRes.data || []).map((a: any) => ({
    ref: a.ref,
    stage: a.stage,
    last_trade: a.last_trade,
    withdrawal_date: a.withdrawal_date,
    balance: a.balance,
    current_mdd: a.current_mdd,
    target_account: a.target_account,
  }));

  const accounts = accountsRes.data || [];
  const companies = companiesRes.data || [];
  
  const bankAccounts = (bankAccountsRes.data || []).map((b: any) => ({
    date: b.date,
    wise_usd: b.wise_usd,
    rise_usd: b.rise_usd,
  }));

  return { transactions, myAccounts, accounts, companies, activeAccounts, bankAccounts };
};


// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>(initialState);

  useEffect(() => {
    const loadData = async () => {
      const { transactions, myAccounts, accounts, companies, activeAccounts, bankAccounts } = await getInitialData();
      setState({
        transactions,
        myAccounts,
        accounts,
        companies,
        activeAccounts,
        bankAccounts,
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
        info: transaction.info,
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
      info: data.info,
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

  const addMyAccount = async (account: Omit<MyAccount, 'id'> & { cost?: number }) => {
    const { cost, ...accountData } = account;
    const { data, error } = await supabase
      .from('my_accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) {
      console.error('Error adding my_account:', error);
      throw new Error(error.message || 'Error al agregar la cuenta. Verifica que la referencia sea única.');
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

  const updateMyAccount = async (id: string, updates: Partial<Omit<MyAccount, 'id'>>) => {
    const { error } = await supabase
      .from('my_accounts')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating my_account:', error);
      return;
    }

    setState(prev => ({
      ...prev,
      myAccounts: prev.myAccounts.map(a => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      return;
    }

    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const updateActiveAccount = async (ref: string, updates: Partial<Omit<ActiveAccount, 'ref'>>) => {
    const { error } = await supabase
      .from('my_active_accounts')
      .update(updates)
      .eq('ref', ref);

    if (error) {
      console.error('Error updating active account:', error);
      return;
    }

    setState(prev => ({
      ...prev,
      activeAccounts: prev.activeAccounts.map(a => (a.ref === ref ? { ...a, ...updates } : a)),
    }));
  };

  const addActiveAccount = async (account: ActiveAccount) => {
    const { data, error } = await supabase
      .from('my_active_accounts')
      .insert([account])
      .select()
      .single();

    if (error) {
      console.error('Error adding active account:', error);
      return;
    }

    setState(prev => ({
      ...prev,
      activeAccounts: [...prev.activeAccounts, {
        ref: data.ref,
        stage: data.stage,
        last_trade: data.last_trade,
        withdrawal_date: data.withdrawal_date,
        balance: data.balance,
        current_mdd: data.current_mdd,
        target_account: data.target_account,
      }],
    }));
  };

  const closeAccount = async (ref: string) => {
    try {
      // Update my_accounts state to 'closed'
      const { error: updateError } = await supabase
        .from('my_accounts')
        .update({ state: 'closed' })
        .eq('ref', ref);

      if (updateError) {
        console.error('Error closing account:', updateError);
        return;
      }

      // Delete from my_active_accounts
      const { error: deleteError } = await supabase
        .from('my_active_accounts')
        .delete()
        .eq('ref', ref);

      if (deleteError) {
        console.error('Error deleting active account:', deleteError);
        return;
      }

      // Update local state
      setState(prev => ({
        ...prev,
        myAccounts: prev.myAccounts.map(a => a.ref === ref ? { ...a, state: 'closed' } : a),
        activeAccounts: prev.activeAccounts.filter(a => a.ref !== ref),
      }));
    } catch (error) {
      console.error('Error in closeAccount:', error);
    }
  };

  // Calculate balance and profit
  const totalIncome = state.transactions
    .filter(t => t.type === 'payout')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type !== 'payout')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const profit = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{
      state,
      addTransaction,
      deleteTransaction,
      addMyAccount,
      updateMyAccount,
      updateTransaction,
      addActiveAccount,
      updateActiveAccount,
      closeAccount,
      balance,
      profit,
      transactionFormVisible: false,
      transactionListVisible: true,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

