import type { TransactionType } from '../constants/transactionTypes';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  my_account_id?: string; // Optional foreign key to my_accounts.id
  info?: string; // Optional comment/note about the transaction
}

export interface Company {
  id: number;
  short_name: string;
  long_name: string;
  close_time?: string;
  auto_close?: boolean;
  ddd_soft_breach?: boolean;
}

export interface AccountTable {
  id: number;
  name: string;
  company_id: number;
  f_min_profit_days?: number;
  a_profit_day_usd?: number;
  news_minutes?: number;
  e_ddd_usd?: number;
  f_ddd_usd?: number;
}

export interface MyAccount {
  id: string;
  account_id: number;
  date: string; // YYYY-MM-DD
  ref: string;
  state: 'active' | 'closed' | 'pending';
  eval_pass?: boolean;
  cost?: number;
}

export interface ActiveAccount {
  ref: string; // primary key and matches my_accounts.ref
  stage: string;
  last_trade: string; // YYYY-MM-DD
  withdrawal_date: string; // YYYY-MM-DD
  balance: number;
  criteria?: string;
  current_mdd?: number;
  target_account?: number;
  profit_days?: number;
}

export interface FundResult {
  id?: number;
  account_id: number;
  criteria: string;
  tp: number;
  sl: number;
  current_mdd: number;
  target_account: number;
  profit_days?: number;
  cut_profit?: boolean;
}

export interface BankAccount {
  id?: string;
  date: string; // YYYY-MM-DD
  wise_usd: number;
  rise_usd: number;
  plane_usd?: number;
}

export interface FinanceState {
  transactions: Transaction[];
  myAccounts: MyAccount[];
  accounts: AccountTable[];
  companies: Company[];
  activeAccounts: ActiveAccount[];
  bankAccounts: BankAccount[];
  fundResults: FundResult[];
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'DELETE_TRANSACTION'; payload: string };

export type FinanceContextValue = {
  state: FinanceState;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | undefined>;
  deleteTransaction: (id: string) => Promise<void>;
  addMyAccount: (account: Omit<MyAccount, 'id'> & { cost?: number }) => Promise<void>;
  updateMyAccount: (id: string, updates: Partial<Omit<MyAccount, 'id'>>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  addActiveAccount: (account: ActiveAccount) => Promise<void>;
  updateActiveAccount: (ref: string, updates: Partial<Omit<ActiveAccount, 'ref'>>) => Promise<void>;
  closeAccount: (ref: string) => Promise<void>;
  balance: number;
  profit: number;
  transactionFormVisible: boolean;
  transactionListVisible: boolean;
};

// Backtest Types
export interface Trade {
  trade: number;
  instrument: string;
  strategy: string;
  version: string;
  qty: number;
  direction: string;
  entry_time: string;
  entry_price: number;
  exit_time: string;
  exit_price: number;
  profit: number;
  commission: number;
  mae: number;
  mfe: number;
}

export interface PeriodMetrics {
  profit_factor: number;
  total_profit: number;
  num_trades: number;
}

export interface StrategyVariantResults {
  variant: string;
  in_sample_1: PeriodMetrics;
  in_sample_2: PeriodMetrics;
  out_of_sample: PeriodMetrics;
}

export interface StrategyBacktest {
  name: string;
  variants: StrategyVariantResults[];
}
