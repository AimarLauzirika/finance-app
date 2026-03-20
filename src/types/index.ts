import type { TransactionType } from '../constants/transactionTypes';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  my_account_id?: string; // Optional foreign key to my_accounts.id
}

export interface Company {
  id: number;
  short_name: string;
  long_name: string;
}

export interface AccountTable {
  id: number;
  name: string;
  company_id: number;
}

export interface MyAccount {
  id: string;
  account_id: number;
  date: string; // YYYY-MM-DD
  ref: string;
  state: 'active' | 'closed' | 'pending';
  eval_pass?: boolean;
}

export interface ActiveAccount {
  ref: string; // primary key and matches my_accounts.ref
  last_trade: string; // YYYY-MM-DD
  withdrawal_date: string; // YYYY-MM-DD
  balance: number;
  current_mdd: number;
  target_account: number;
}

export interface FinanceState {
  initialCapital: number;
  initialCapitalDate: string; // YYYY-MM-DD
  transactions: Transaction[];
  myAccounts: MyAccount[];
  accounts: AccountTable[];
  companies: Company[];
  activeAccounts: ActiveAccount[];
}

export type FinanceAction =
  | { type: 'SET_INITIAL_CAPITAL'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'DELETE_TRANSACTION'; payload: string };

export type FinanceContextValue = {
  state: FinanceState;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | undefined>;
  deleteTransaction: (id: string) => Promise<void>;
  setInitialCapital: (capital: number, date: string) => Promise<void>;
  addMyAccount: (account: Omit<MyAccount, 'id'> & { cost?: number }) => Promise<void>;
  updateMyAccount: (id: string, updates: Partial<Omit<MyAccount, 'id'>>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  addActiveAccount: (account: ActiveAccount) => Promise<void>;
  updateActiveAccount: (ref: string, updates: Partial<Omit<ActiveAccount, 'ref'>>) => Promise<void>;
  balance: number;
  profit: number;
  transactionFormVisible: boolean;
  initialCapitalFormVisible: boolean;
  transactionListVisible: boolean;
};
