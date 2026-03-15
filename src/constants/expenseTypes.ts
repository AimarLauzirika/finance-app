export const EXPENSE_TYPES = [
  { cost_of_sales: 'Costo de Ventas' },
  { operating_expenses: 'Gastos Operativos' },
  { financial_expenses: 'Gastos Financieros' },
  { other_expenses: 'Otros Gastos' },
  { tax_expense: 'Impuesto sobre la renta' },
] as const;

export type ExpenseType = keyof typeof EXPENSE_TYPES;