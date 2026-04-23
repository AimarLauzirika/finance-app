import React from 'react';
import { Home, CreditCard, Receipt, Activity, Calendar, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: 'balance' | 'accounts' | 'transactions' | 'active' | 'calendar';
  onViewChange: (view: 'balance' | 'accounts' | 'transactions' | 'active' | 'calendar') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Finance App</h1>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onViewChange('balance')}
              className={`w-full text-left px-4 py-2 rounded flex items-center space-x-2 ${
                currentView === 'balance' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <Home size={20} />
              <span>Balance</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('accounts')}
              className={`w-full text-left px-4 py-2 rounded flex items-center space-x-2 ${
                currentView === 'accounts' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <CreditCard size={20} />
              <span>Accounts</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('transactions')}
              className={`w-full text-left px-4 py-2 rounded flex items-center space-x-2 ${
                currentView === 'transactions' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <Receipt size={20} />
              <span>Transactions</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('active')}
              className={`w-full text-left px-4 py-2 rounded flex items-center space-x-2 ${
                currentView === 'active' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <Activity size={20} />
              <span>Active Accounts</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('calendar')}
              className={`w-full text-left px-4 py-2 rounded flex items-center space-x-2 ${
                currentView === 'calendar' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <Calendar size={20} />
              <span>Calendar</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 rounded flex items-center space-x-2 hover:bg-gray-700"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};