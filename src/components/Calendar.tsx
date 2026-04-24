import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, getMonth, getYear, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const Calendar: React.FC = () => {
  const { state } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'year'>('month');

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const calendarStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);

  const calendarDays = useMemo(() => eachDayOfInterval({ start: calendarStart, end: calendarEnd }), [calendarStart, calendarEnd]);

  // Calculate results by day
  const resultsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    
    state.transactions.forEach(tx => {
      const dateKey = tx.date;
      if (!map[dateKey]) {
        map[dateKey] = 0;
      }
      
      if (tx.type === 'payout' || tx.type === 'dividends') {
        map[dateKey] += tx.amount;
      } else if (tx.type === 'buy_account' || tx.type === 'reset_account' || tx.type === 'activation_fee' || tx.type === 'renew_subscription' || tx.type === 'VPS' || tx.type === 'income_tax') {
        map[dateKey] -= tx.amount;
      }
    });
    
    return map;
  }, [state.transactions]);

  const getDayResult = (day: Date): number => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return resultsByDay[dateKey] ?? 0;
  };

  const getWeekResult = (weekStart: Date): number => {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      total += getDayResult(date);
    }
    return total;
  };

  const monthResult = useMemo(() => {
    let total = 0;
    calendarDays.forEach(day => {
      if (isSameMonth(day, currentDate)) {
        total += getDayResult(day);
      }
    });
    return total;
  }, [calendarDays, currentDate, getDayResult]);

  const monthAverage = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
    return daysInMonth > 0 ? monthResult / daysInMonth : 0;
  }, [monthResult, monthStart, monthEnd]);

  // Calculate monthly results by company
  const monthlyResultsByCompany = useMemo(() => {
    const results: Record<string, number> = {};
    const currentMonth = getMonth(currentDate);
    const currentYear = getYear(currentDate);

    state.transactions.forEach(tx => {
      const txYear = getYear(new Date(tx.date));
      const txMonth = getMonth(new Date(tx.date));
      
      if (txMonth === currentMonth && txYear === currentYear) {
        const company = state.companies.find(c => c.id === tx.company_id);
        const companyName = company?.name ?? 'Sin compañía';
        
        const amount = (tx.type === 'payout' || tx.type === 'dividends') ? tx.amount :
                      (tx.type === 'buy_account' || tx.type === 'reset_account' || tx.type === 'activation_fee' || tx.type === 'renew_subscription' || tx.type === 'VPS' || tx.type === 'income_tax') ? -tx.amount : 0;
        
        if (!results[companyName]) {
          results[companyName] = 0;
        }
        results[companyName] += amount;
      }
    });

    return Object.entries(results)
      .map(([company, total]) => ({ company, total }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [currentDate, state.transactions, state.companies]);

  // Calculate monthly results for current and previous year
  const monthlyData = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const previousYear = currentYear - 1;
    const data = [];
    const currentYearStr = currentYear.toString();
    const previousYearStr = previousYear.toString();

    for (let month = 0; month < 12; month++) {
      const monthName = format(new Date(currentYear, month, 1), 'MMM', { locale: es });
      let currentYearResult = 0;
      let previousYearResult = 0;

      state.transactions.forEach(tx => {
        const txYear = getYear(new Date(tx.date));
        const txMonth = getMonth(new Date(tx.date));
        const amount = (tx.type === 'payout' || tx.type === 'dividends') ? tx.amount : 
                      (tx.type === 'buy_account' || tx.type === 'reset_account' || tx.type === 'activation_fee' || tx.type === 'renew_subscription' || tx.type === 'VPS' || tx.type === 'income_tax') ? -tx.amount : 0;

        if (txMonth === month && txYear === currentYear) {
          currentYearResult += amount;
        } else if (txMonth === month && txYear === previousYear) {
          previousYearResult += amount;
        }
      });

      data.push({
        month: monthName,
        [currentYearStr]: currentYearResult,
        [previousYearStr]: previousYearResult,
      });
    }

    return data;
  }, [currentDate, state.transactions]);

  // Calculate quarterly results
  const quarterlyData = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const previousYear = currentYear - 1;
    const quarters = [];

    for (let q = 0; q < 4; q++) {
      let currentYearResult = 0;
      let previousYearResult = 0;
      const monthsInQuarter = [q * 3, q * 3 + 1, q * 3 + 2];

      state.transactions.forEach(tx => {
        const txYear = getYear(new Date(tx.date));
        const txMonth = getMonth(new Date(tx.date));
        const amount = (tx.type === 'payout' || tx.type === 'dividends') ? tx.amount : 
                      (tx.type === 'buy_account' || tx.type === 'reset_account' || tx.type === 'activation_fee' || tx.type === 'renew_subscription' || tx.type === 'VPS' || tx.type === 'income_tax') ? -tx.amount : 0;

        if (monthsInQuarter.includes(txMonth)) {
          if (txYear === currentYear) currentYearResult += amount;
          else if (txYear === previousYear) previousYearResult += amount;
        }
      });

      quarters.push({
        quarter: `Q${q + 1}`,
        currentYear: currentYearResult,
        previousYear: previousYearResult,
      });
    }

    return quarters;
  }, [currentDate, state.transactions]);

  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      w.push(calendarDays.slice(i, i + 7));
    }
    return w;
  }, [calendarDays]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getColorClass = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getDayBgClass = (value: number) => {
    if (value > 0) return 'bg-green-900 bg-opacity-20';
    if (value < 0) return 'bg-red-900 bg-opacity-20';
    return '';
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl text-gray-400 font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
            >
              Hoy
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded text-sm ${
              viewMode === 'month' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded text-sm ${
              viewMode === 'week' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-4 py-2 rounded text-sm ${
              viewMode === 'year' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Total Mes</p>
          <p className={`text-lg font-bold ${getColorClass(monthResult)}`}>
            {formatCurrency(monthResult)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Media Diaria</p>
          <p className={`text-lg font-bold ${getColorClass(monthAverage)}`}>
            {formatCurrency(monthAverage)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-1">Días Positivos</p>
          <p className="text-lg font-bold text-gray-300">
            {calendarDays.filter(day => isSameMonth(day, currentDate) && getDayResult(day) > 0).length}
          </p>
        </div>
      </div>

      {/* Monthly Results by Company (only in month view) */}
      {viewMode === 'month' && monthlyResultsByCompany.length > 0 && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg text-gray-300 font-semibold mb-4">Resultados por Compañía</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthlyResultsByCompany.map((item, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-2 truncate">{item.company}</p>
                <p className={`font-bold text-sm ${getColorClass(item.total)}`}>
                  {formatCurrency(item.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' ? (
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom', 'Total'].map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-semibold py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="space-y-2">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-8 gap-2">
                    {/* Week days */}
                    {week.map((day, dayIdx) => {
                      const dayResult = getDayResult(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      return (
                        <div
                          key={dayIdx}
                          className={`p-3 rounded text-center text-sm ${
                            isCurrentMonth ? `bg-gray-700 ${getDayBgClass(dayResult)}` : 'bg-gray-900 opacity-50'
                          }`}
                        >
                          <p className="text-xs text-gray-400 mb-1">{format(day, 'd')}</p>
                          <p className={`font-bold text-xs ${getColorClass(dayResult)}`}>
                            {dayResult !== 0 ? formatCurrency(dayResult) : '-'}
                          </p>
                        </div>
                      );
                    })}
                    
                    {/* Week total */}
                    <div className="bg-gray-750 border-l-2 border-blue-500 p-3 rounded text-center">
                      <p className="text-xs text-blue-400 mb-1">Semana {getWeek(week[0])}</p>
                      <p className={`font-bold text-sm ${getColorClass(getWeekResult(week[0]))}`}>
                        {formatCurrency(getWeekResult(week[0]))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'week' ? (
          // Week view
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'].map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-semibold py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weeks[0].map((day, dayIdx) => {
                const dayResult = getDayResult(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                return (
                  <div
                    key={dayIdx}
                    className={`p-4 rounded text-center ${
                      isCurrentMonth ? `bg-gray-700 ${getDayBgClass(dayResult)}` : 'bg-gray-900 opacity-50'
                    }`}
                  >
                    <p className="text-sm text-gray-400 mb-2">{format(day, 'EEE', { locale: es })}</p>
                    <p className="text-lg mb-1">{format(day, 'd')}</p>
                    <p className={`font-bold text-lg ${getColorClass(dayResult)}`}>
                      {dayResult !== 0 ? formatCurrency(dayResult) : '-'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-700 rounded">
              <p className="text-sm text-gray-400">
                Total semana: <span className={`font-bold text-lg ${getColorClass(getWeekResult(weeks[0][0]))}`}>
                  {formatCurrency(getWeekResult(weeks[0][0]))}
                </span>
              </p>
            </div>
          </div>
        ) : (
          // Year view
          <div className="space-y-6">
            {/* Monthly comparison chart */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg text-gray-300 font-semibold mb-4">Comparación Mensual (Año Actual vs Anterior)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="10 10 1 10" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey={currentDate.getFullYear().toString()} fill="#3b82f6" />
                  <Bar dataKey={(currentDate.getFullYear() - 1).toString()} fill="#60a5fa" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quarterly comparison */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg text-gray-300 font-semibold mb-4">Resultados por Trimestre</h3>
              <div className="grid grid-cols-4 gap-4">
                {quarterlyData.map((quarter, idx) => (
                  <div key={idx} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">{quarter.quarter}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Año Actual</p>
                        <p className={`font-bold ${getColorClass(quarter.currentYear)}`}>
                          {formatCurrency(quarter.currentYear)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Año Anterior</p>
                        <p className={`font-bold text-sm opacity-70 ${getColorClass(quarter.previousYear)}`}>
                          {formatCurrency(quarter.previousYear)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
