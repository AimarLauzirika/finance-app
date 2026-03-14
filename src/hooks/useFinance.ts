import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContextObject';
import type { FinanceContextValue } from '../types';

export const useFinance = (): FinanceContextValue => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
