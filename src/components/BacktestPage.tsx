import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import type { StrategyBacktest } from '../types';
import { loadAllStrategies } from '../utils/backtestParser';
import { SelectStrategy } from './SelectStrategy';
import { BacktestResults } from './BacktestResults';

export function BacktestPage() {
  const [strategies, setStrategies] = useState<StrategyBacktest[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyBacktest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedStrategies = await loadAllStrategies();
        setStrategies(loadedStrategies);

        if (loadedStrategies.length === 0) {
          setError('No se encontraron estrategias. Asegúrate de que los archivos CSV estén en public/strategies/');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar estrategias';
        setError(`Error al cargar estrategias: ${errorMessage}`);
        console.error('Error loading strategies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStrategies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Análisis de Backtests</h1>
          <p className="text-gray-400">
            Visualiza los resultados de tus backtests de estrategias de trading
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-400 mr-3" />
            <span className="text-gray-300 text-lg">Cargando estrategias...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200 font-medium">Error</p>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!isLoading && strategies.length > 0 && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
              <SelectStrategy
                strategies={strategies}
                selectedStrategy={selectedStrategy}
                onSelect={setSelectedStrategy}
                isLoading={isLoading}
              />
            </div>

            {selectedStrategy && (
              <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
                <BacktestResults strategy={selectedStrategy} />
              </div>
            )}
          </div>
        )}

        {!isLoading && strategies.length === 0 && !error && (
          <div className="bg-yellow-950 border border-yellow-700 rounded-lg p-6 text-center">
            <p className="text-yellow-200 font-medium mb-2">No hay estrategias disponibles</p>
            <p className="text-yellow-300 text-sm">
              Asegúrate de que los archivos CSV estén en la carpeta public/strategies/
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
