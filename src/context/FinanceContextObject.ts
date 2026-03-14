import { createContext } from 'react';
import type { FinanceContextValue } from '../types';

export const FinanceContext = createContext<FinanceContextValue | null>(null);
