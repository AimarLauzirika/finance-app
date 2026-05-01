import type { StrategyBacktest, PeriodMetrics } from '../types';

interface BacktestResultsProps {
  strategy: StrategyBacktest;
}

const MIN_PROFIT_FACTOR = 1.1;
const MIN_TRADES = 20;

export function BacktestResults({ strategy }: BacktestResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatProfitFactor = (value: number) => {
    return value.toFixed(2);
  };

  const isApprovedMetric = (metrics: PeriodMetrics): boolean => {
    return metrics.profit_factor >= MIN_PROFIT_FACTOR && metrics.num_trades >= MIN_TRADES;
  };

  const getMetricColor = (metrics: PeriodMetrics, fieldType: 'pf' | 'profit' | 'trades'): string => {
    const pfOk = metrics.profit_factor >= MIN_PROFIT_FACTOR;
    const tradesOk = metrics.num_trades >= MIN_TRADES;

    if (fieldType === 'pf') {
      return pfOk ? 'text-gray-200' : 'text-red-400';
    }
    if (fieldType === 'trades') {
      return tradesOk ? 'text-gray-200' : 'text-red-400';
    }
    // profit
    return 'text-gray-200';
  };

  const getRowBackground = (inS1: boolean, inS2: boolean, outOS: boolean): string => {
    const allApproved = inS1 && inS2 && outOS;
    if (allApproved) return 'bg-gray-800';
    return 'bg-red-900 bg-opacity-40';
  };

  const isVariantApproved = (variant: any): boolean => {
    const inS1Ok = isApprovedMetric(variant.in_sample_1);
    const inS2Ok = isApprovedMetric(variant.in_sample_2);
    const outOSok = isApprovedMetric(variant.out_of_sample);
    return inS1Ok && inS2Ok && outOSok;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">{strategy.name}</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
          <thead>
            <tr className="bg-gray-950 text-gray-100 border-b border-gray-700">
              <th className="px-4 py-3 text-left font-semibold">Variante</th>

              {/* In Sample 1 */}
              <th className="px-4 py-3 text-center font-semibold" colSpan={3}>
                In Sample 1 (2000-01-01 a 2019-05-05)
              </th>

              {/* In Sample 2 */}
              <th className="px-4 py-3 text-center font-semibold" colSpan={3}>
                In Sample 2 (2019-05-06 a 2024-08-31)
              </th>

              {/* Out of Sample */}
              <th className="px-4 py-3 text-center font-semibold" colSpan={3}>
                Out of Sample (2024-09-01 en adelante)
              </th>
            </tr>
            <tr className="bg-gray-850 text-gray-300 border-b border-gray-700">
              <th className="px-4 py-2 text-left text-xs"></th>
              <th className="px-4 py-2 text-center text-xs font-medium">PF</th>
              <th className="px-4 py-2 text-center text-xs font-medium">Profit</th>
              <th className="px-4 py-2 text-center text-xs font-medium">Trades</th>
              <th className="px-4 py-2 text-center text-xs font-medium">PF</th>
              <th className="px-4 py-2 text-center text-xs font-medium">Profit</th>
              <th className="px-4 py-2 text-center text-xs font-medium">Trades</th>
              <th className="px-4 py-2 text-center text-xs font-medium">PF</th>
              <th className="px-4 py-2 text-center text-xs font-medium">Profit</th>
              <th className="px-4 py-2 text-center text-xs font-medium">Trades</th>
            </tr>
          </thead>
          <tbody>
            {strategy.variants.map((variant) => {
              const inS1Ok = isApprovedMetric(variant.in_sample_1);
              const inS2Ok = isApprovedMetric(variant.in_sample_2);
              const outOSok = isApprovedMetric(variant.out_of_sample);
              const variantApproved = isVariantApproved(variant);

              return (
                <tr
                  key={variant.variant}
                  className={`${getRowBackground(inS1Ok, inS2Ok, outOSok)} border-b border-gray-700 transition-colors hover:bg-gray-750`}
                >
                  <td className="px-4 py-3 font-medium text-gray-200 border-r border-gray-700">
                    {variant.variant}
                    {variantApproved && <span className="ml-2 text-xs text-green-400">✓</span>}
                  </td>

                  {/* In Sample 1 */}
                  <td
                    className={`px-4 py-3 text-center text-sm border-r border-gray-700 ${getMetricColor(variant.in_sample_1, 'pf')}`}
                  >
                    {formatProfitFactor(variant.in_sample_1.profit_factor)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm border-r border-gray-700 text-gray-200">
                    {formatCurrency(variant.in_sample_1.total_profit)}
                  </td>
                  <td
                    className={`px-4 py-3 text-center text-sm border-r border-gray-700 ${getMetricColor(variant.in_sample_1, 'trades')}`}
                  >
                    {variant.in_sample_1.num_trades}
                  </td>

                  {/* In Sample 2 */}
                  <td
                    className={`px-4 py-3 text-center text-sm border-r border-gray-700 ${getMetricColor(variant.in_sample_2, 'pf')}`}
                  >
                    {formatProfitFactor(variant.in_sample_2.profit_factor)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm border-r border-gray-700 text-gray-200">
                    {formatCurrency(variant.in_sample_2.total_profit)}
                  </td>
                  <td
                    className={`px-4 py-3 text-center text-sm border-r border-gray-700 ${getMetricColor(variant.in_sample_2, 'trades')}`}
                  >
                    {variant.in_sample_2.num_trades}
                  </td>

                  {/* Out of Sample */}
                  <td
                    className={`px-4 py-3 text-center text-sm border-r border-gray-700 ${getMetricColor(variant.out_of_sample, 'pf')}`}
                  >
                    {formatProfitFactor(variant.out_of_sample.profit_factor)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm border-r border-gray-700 text-gray-200">
                    {formatCurrency(variant.out_of_sample.total_profit)}
                  </td>
                  <td
                    className={`px-4 py-3 text-center text-sm ${getMetricColor(variant.out_of_sample, 'trades')}`}
                  >
                    {variant.out_of_sample.num_trades}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-200 mb-2">Leyenda:</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>
            <strong>PF (Profit Factor):</strong> Ganancia total / Pérdida total
          </li>
          <li>
            <strong>Profit:</strong> Ganancia neta en USD para el período
          </li>
          <li>
            <strong>Trades:</strong> Número de operaciones ejecutadas en el período
          </li>
          <li className="pt-2 border-t border-gray-600">
            <strong>Condiciones de aprobación por período:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>✓ PF ≥ 1.1 (Profit Factor mínimo)</li>
              <li>✓ Trades ≥ 20 (Mínimo número de operaciones)</li>
            </ul>
          </li>
          <li className="pt-2 border-t border-gray-600">
            <strong className="text-green-400">✓ Verde:</strong> Variante que cumple con todas las condiciones en los tres períodos
          </li>
          <li>
            <strong className="text-red-400">Rojo:</strong> Métrica que no cumple con los requisitos mínimos (PF &lt; 1.1 o Trades &lt; 20)
          </li>
          <li>
            <strong className="text-red-300">Fondo rojo:</strong> Variante que no cumple las condiciones en al menos un período
          </li>
        </ul>
      </div>
    </div>
  );
}
