import React, { useReducer } from 'react';
import type { ReactNode } from 'react';
import type { FinanceState, FinanceAction, Transaction } from '../types';
import { FinanceContext } from './FinanceContextObject';

// Reducer function
const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'SET_INITIAL_CAPITAL':
      return { ...state, initialCapital: action.payload };
    case 'ADD_TRANSACTION':
      { const newTransaction: Transaction = {
        ...action.payload,
        id: Date.now().toString(), // Simple ID generation
      };
      return { ...state, transactions: [...state.transactions, newTransaction] }; }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    default:
      return state;
  }
};

// Initial state
const initialState: FinanceState = {
  initialCapital: 0,
  transactions: [],
};

// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Helper functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  // Calculate balance
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = state.initialCapital + totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{ state, dispatch, addTransaction, deleteTransaction, balance }}>
      {children}
    </FinanceContext.Provider>
  );
};

