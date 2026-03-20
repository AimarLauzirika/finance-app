// import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { FinanceProvider } from './context/FinanceContext';
import BalanceDisplay from './components/BalanceDisplay';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ActiveAccounts from './components/ActiveAccounts';
import Login from './components/Login';
import { Sidebar } from './components/Sidebar';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'balance' | 'accounts' | 'transactions' | 'active'>('balance');

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
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            <div className="lg:w-1/3">
              <AccountForm />
            </div>
            <div className="lg:flex-1 h-full">
              <AccountList />
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            <div className="lg:w-1/2">
              <TransactionForm />
            </div>
            <div className="lg:flex-1 h-full">
              <TransactionList />
            </div>
          </div>
        );
      case 'active':
        return <ActiveAccounts />;
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
        <div className="flex-1 flex flex-col py-8">
          <div className="container mx-auto px-4 flex-1 flex flex-col">
            <main className="flex-1">
              {renderMainContent()}
            </main>
          </div>
        </div>
      </div>
    </FinanceProvider>
  );
}

export default App;
