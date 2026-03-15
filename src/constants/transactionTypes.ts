
export const TRANSACTION_TYPES = {
  initial: 'Capital Inicial',
  buy_account: 'Compra Cuenta',
  activation_fee: 'Tarifa Activación',
  reset_account: 'Reset Cuenta',
  VPS: 'VPS',
  payout: 'Pago',
  dividends: 'Dividendos',
  income_tax: 'Impuesto Renta',
  // Agrega más tipos aquí si es necesario
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;