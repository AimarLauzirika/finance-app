
export const TRANSACTION_TYPES = {
  // initial: 'Capital Inicial',
  buy_account: 'Compra Cuenta',
  activation_fee: 'Tarifa Activación',
  reset_account: 'Reset Cuenta',
  renew_subscription: 'Renovar Suscripción',
  VPS: 'VPS',
  payout: 'Pago',
  dividends: 'Dividendos',
  income_tax: 'Impuesto Renta',
  data: 'Data',
  // Agrega más tipos aquí si es necesario
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;