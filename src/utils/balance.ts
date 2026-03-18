import type { Transaction } from '../types';

export type RunningBalancePoint = {
  date: string;
  balance: number;
};

export function computeRunningBalance(transactions: Transaction[]): RunningBalancePoint[] {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let balance = 0;
  return sorted.map(tx => {
    balance += tx.type === 'payout' || tx.type === 'initial' ? tx.amount : -tx.amount;
    return {
      date: tx.date,
      balance,
    };
  });
}
