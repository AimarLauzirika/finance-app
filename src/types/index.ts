export interface Transaction {
  id: string;
  type: '' | 'income' | 'expense';
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
}

export interface FinanceState {
  initialCapital: number;
  transactions: Transaction[];
}

export type FinanceAction =
  | { type: 'SET_INITIAL_CAPITAL'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'DELETE_TRANSACTION'; payload: string };

export type FinanceContextValue = {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  balance: number;
};