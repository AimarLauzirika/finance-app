import type { Trade, PeriodMetrics, StrategyVariantResults, StrategyBacktest } from '../types';

const IN_SAMPLE_1_START = new Date('2000-01-01');
const IN_SAMPLE_1_END = new Date('2019-05-05');
const IN_SAMPLE_2_START = new Date('2019-05-06');
const IN_SAMPLE_2_END = new Date('2024-08-31');
const OUT_OF_SAMPLE_START = new Date('2024-09-01');

export function parseCSV(csvContent: string): Trade[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(';');
  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length === header.length) {
      trades.push({
        trade: parseInt(values[0], 10),
        instrument: values[1],
        strategy: values[2],
        version: values[3],
        qty: parseInt(values[4], 10),
        direction: values[5],
        entry_time: values[6],
        entry_price: parseFloat(values[7]),
        exit_time: values[8],
        exit_price: parseFloat(values[9]),
        profit: parseFloat(values[10]),
        commission: parseFloat(values[11]),
        mae: parseFloat(values[12]),
        mfe: parseFloat(values[13]),
      });
    }
  }

  return trades;
}

function getPeriod(dateString: string): 'in_sample_1' | 'in_sample_2' | 'out_of_sample' | null {
  // Parse date format "14/01/2008 12:05:00"
  const parts = dateString.split(' ')[0].split('/');
  const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

  if (date >= IN_SAMPLE_1_START && date <= IN_SAMPLE_1_END) {
    return 'in_sample_1';
  } else if (date >= IN_SAMPLE_2_START && date <= IN_SAMPLE_2_END) {
    return 'in_sample_2';
  } else if (date >= OUT_OF_SAMPLE_START) {
    return 'out_of_sample';
  }

  return null;
}

export function calculatePeriodMetrics(trades: Trade[]): Record<string, PeriodMetrics> {
  const periods: Record<string, { profits: number[]; wins: number; losses: number }> = {
    in_sample_1: { profits: [], wins: 0, losses: 0 },
    in_sample_2: { profits: [], wins: 0, losses: 0 },
    out_of_sample: { profits: [], wins: 0, losses: 0 },
  };

  trades.forEach((trade) => {
    const period = getPeriod(trade.entry_time);
    if (period && periods[period]) {
      periods[period].profits.push(trade.profit);
      if (trade.profit > 0) {
        periods[period].wins++;
      } else if (trade.profit < 0) {
        periods[period].losses++;
      }
    }
  });

  const metrics: Record<string, PeriodMetrics> = {};

  Object.keys(periods).forEach((period) => {
    const { profits } = periods[period];
    const totalProfit = profits.reduce((a, b) => a + b, 0);
    const totalWins = profits.filter((p) => p > 0).reduce((a, b) => a + b, 0) || 0;
    const totalLosses = Math.abs(profits.filter((p) => p < 0).reduce((a, b) => a + b, 0)) || 1;

    metrics[period] = {
      profit_factor: totalWins > 0 ? totalWins / totalLosses : 0,
      total_profit: totalProfit,
      num_trades: profits.length,
    };
  });

  return metrics;
}

export async function loadAllStrategies(): Promise<StrategyBacktest[]> {
  try {
    // Cargar la lista de estrategias desde el archivo JSON
    const response = await fetch('/strategies/strategies.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de estrategias');
    }
    
    const data = await response.json();
    const strategyNames: string[] = data.strategies || [];

    const strategies: StrategyBacktest[] = [];

    for (const strategyName of strategyNames) {
      const strategy = await loadStrategy(strategyName);
      if (strategy) {
        strategies.push(strategy);
      }
    }

    return strategies.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error loading strategies:', error);
    return [];
  }
}

export async function loadStrategy(strategyName: string): Promise<StrategyBacktest | null> {
  try {
    // Cargar el índice de archivos CSV de la estrategia
    const indexResponse = await fetch(`/strategies/${strategyName}/index.json`);
    if (!indexResponse.ok) {
      console.warn(`No se encontró index.json para ${strategyName}`);
      return null;
    }

    const indexData = await indexResponse.json();
    const csvFiles: string[] = indexData.files || [];

    if (csvFiles.length === 0) {
      return null;
    }

    const variants: StrategyVariantResults[] = [];

    for (const csvFile of csvFiles) {
      const csvResponse = await fetch(`/strategies/${strategyName}/${csvFile}`);
      if (!csvResponse.ok) {
        console.warn(`No se pudo cargar ${csvFile}`);
        continue;
      }

      const csvContent = await csvResponse.text();
      const trades = parseCSV(csvContent);

      if (trades.length > 0) {
        const metrics = calculatePeriodMetrics(trades);
        variants.push({
          variant: csvFile.replace('.csv', ''),
          in_sample_1: metrics.in_sample_1,
          in_sample_2: metrics.in_sample_2,
          out_of_sample: metrics.out_of_sample,
        });
      }
    }

    if (variants.length === 0) {
      return null;
    }

    return {
      name: strategyName,
      variants: variants.sort((a, b) => a.variant.localeCompare(b.variant)),
    };
  } catch (error) {
    console.error(`Error loading strategy ${strategyName}:`, error);
    return null;
  }
}

function extractCsvFiles(html: string): string[] {
  const csvFiles: string[] = [];
  const regex = /href=["']([^"']+\.csv)["']/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    csvFiles.push(match[1]);
  }

  return csvFiles;
}
