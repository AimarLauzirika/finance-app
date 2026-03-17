import type { TransactionType } from '../constants/transactionTypes';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  balanceAfter: number; // Se calcula al agregar la transacción
  my_account_id?: string; // Optional foreign key to my_accounts.id
}

export interface Company {
  id: number;
  short_name: string;
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
  state: string;
  eval_pass: boolean;
}

export interface FinanceState {
  initialCapital: number;
  initialCapitalDate: string; // YYYY-MM-DD
  transactions: Transaction[];
  myAccounts: MyAccount[];
  accounts: AccountTable[];
  companies: Company[];
}

export type FinanceAction =
  | { type: 'SET_INITIAL_CAPITAL'; payload: number }
  | { type: 'SET_BALANCE_AFTER'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'DELETE_TRANSACTION'; payload: string };

export type FinanceContextValue = {
  state: FinanceState;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'balanceAfter'>) => Promise<Transaction | undefined>;
  deleteTransaction: (id: string) => Promise<void>;
  setInitialCapital: (capital: number, date: string) => Promise<void>;
  addMyAccount: (account: Omit<MyAccount, 'id'>) => Promise<void>;
  balance: number;
  profit: number;
  transactionFormVisible: boolean;
  initialCapitalFormVisible: boolean;
  transactionListVisible: boolean;
};
