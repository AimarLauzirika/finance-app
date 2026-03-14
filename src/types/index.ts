export interface Transaction {
  id: string;
  type: '' |'initial' | 'income' | 'expense';
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  balanceAfter: number; // Se calcula al agregar la transacción
}

export interface FinanceState {
  initialCapital: number;
  initialCapitalDate: string; // YYYY-MM-DD
  transactions: Transaction[];
}

export type FinanceAction =
  | { type: 'SET_INITIAL_CAPITAL'; payload: number }
  | { type: 'SET_INITIAL_CAPITAL_DATE'; payload: string }
  | { type: 'SET_BALANCE_AFTER'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'DELETE_TRANSACTION'; payload: string };

export type FinanceContextValue = {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  balance: number;
  profit: number;
  transactionFormVisible: boolean;
  initialCapitalFormVisible: boolean;
  transactionListVisible: boolean;
};