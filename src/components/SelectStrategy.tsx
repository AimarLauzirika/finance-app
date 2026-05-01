import { ChevronDown } from 'lucide-react';
import type { StrategyBacktest } from '../types';

interface SelectStrategyProps {
  strategies: StrategyBacktest[];
  selectedStrategy: StrategyBacktest | null;
  onSelect: (strategy: StrategyBacktest) => void;
  isLoading: boolean;
}

export function SelectStrategy({
  strategies,
  selectedStrategy,
  onSelect,
  isLoading,
}: SelectStrategyProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <label htmlFor="strategy-select" className="block text-sm font-medium text-gray-300 mb-2">
        Selecciona una estrategia
      </label>
      <div className="relative">
        <select
          id="strategy-select"
          value={selectedStrategy?.name || ''}
          onChange={(e) => {
            const strategy = strategies.find((s) => s.name === e.target.value);
            if (strategy) {
              onSelect(strategy);
            }
          }}
          disabled={isLoading || strategies.length === 0}
          className="w-full px-4 py-2 pr-10 border border-gray-600 rounded-lg appearance-none bg-gray-900 text-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {isLoading
              ? 'Cargando estrategias...'
              : strategies.length === 0
                ? 'No hay estrategias disponibles'
                : 'Selecciona una estrategia'}
          </option>
          {strategies.map((strategy) => (
            <option key={strategy.name} value={strategy.name}>
              {strategy.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none h-5 w-5" />
      </div>
    </div>
  );
}
