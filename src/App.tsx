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
import { Sidebar } from './components/Sidebar';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'balance' | 'accounts' | 'transactions'>('balance');

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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

  const renderMainContent = () => {
    switch (currentView) {
      case 'balance':
        return <BalanceDisplay />;
      case 'accounts':
        return (
          <>
            <AccountForm />
            <AccountList />
          </>
        );
      case 'transactions':
        return (
          <>
            <TransactionForm />
            <TransactionList />
          </>
        );
      default:
        return <BalanceDisplay />;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
        />
        <div className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <main className="max-w-4xl mx-auto">
              {renderMainContent()}
            </main>
          </div>
        </div>
      </div>
    </FinanceProvider>
  );
}

export default App;
