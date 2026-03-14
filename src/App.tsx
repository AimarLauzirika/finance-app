// import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import BalanceDisplay from './components/BalanceDisplay';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

function App() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-200">Control de Finanzas</h1>
          </header>
          <main className="max-w-4xl mx-auto">
            <BalanceDisplay />
            <TransactionForm />
            <TransactionList />
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
}

export default App;
