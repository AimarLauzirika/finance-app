// import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { FinanceProvider } from './context/FinanceContext';
import BalanceDisplay from './components/BalanceDisplay';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-200">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => setUser(supabase.auth.getUser().then(({ data }) => data.user))} />;
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="container mx-auto px-4">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-200">Control de Finanzas</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            >
              Cerrar Sesión
            </button>
          </header>
          <main className="max-w-4xl mx-auto">
            <BalanceDisplay />
            <AccountForm />
            <AccountList />
            <TransactionForm />
            <TransactionList />
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
}

export default App;
