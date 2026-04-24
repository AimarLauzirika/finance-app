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
}

export interface AccountTable {
  id: number;
  name: string;
  company_id: number;
  f_min_profit_days?: number;
  a_profit_day_usd?: number;
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
  current_mdd: number;
  target_account: number;
  profit_days?: number;
}

export interface BankAccount {
  id?: string;
  date: string; // YYYY-MM-DD
  wise_usd: number;
  rise_usd: number;
}

export interface FinanceState {
  transactions: Transaction[];
  myAccounts: MyAccount[];
  accounts: AccountTable[];
  companies: Company[];
  activeAccounts: ActiveAccount[];
  bankAccounts: BankAccount[];
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
