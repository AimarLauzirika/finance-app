import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import AccountItem from './AccountItem';

const AccountList: React.FC = () => {
  const { state } = useFinance();
  const [listVisible, setListVisible] = useState(true);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl text-gray-400 font-semibold hover:cursor-pointer hover:text-blue-500 hover:opacity-75 select-none flex items-center justify-between" onClick={() => setListVisible(!listVisible)}>
        Mis Cuentas {listVisible ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
      </h2>
      {listVisible && (
        <div className="mt-6 space-y-4">
          {state.accounts.length === 0 ? (
            <p className="text-gray-500">No hay cuentas agregadas.</p>
          ) : (
            state.accounts.map(account => (
              <AccountItem key={account.id} account={account} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AccountList;