import React from 'react';
import { ChartSpline } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { computeRunningBalance } from '../utils/balance';

interface BalanceChartProps {
  transactions: Array<import('../types').Transaction>;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ transactions }) => {
  // Calculate balance evolution data on demand (no stored `balanceAfter`)
  const balanceData = computeRunningBalance(transactions);

  return (
    <div className="w-full h-64 bg-transparent p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <span>{<ChartSpline className="inline h-6 w-6 text-gray-400" />}</span>
        <h3 className="text-lg font-semibold text-gray-400">Evolución de Resultados</h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={balanceData}>
          <CartesianGrid strokeDasharray="10 10 1 10" stroke='rgba(255, 255, 255, 0.1)'/>
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(value) => `Fecha: ${new Date(value).toLocaleDateString('es-ES')}`}
            formatter={(value) => typeof value === 'number' ? [`$${value.toFixed(2)}`, 'Balance'] : ['', 'Balance']}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceChart;