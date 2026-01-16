import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartDataPoint } from '../types';

interface StockChartProps {
  data: ChartDataPoint[];
  isPositive: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({ data, isPositive }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-850/50 rounded-xl border border-slate-700/50">
        <span className="text-slate-500">暂无图表数据</span>
      </div>
    );
  }

  const color = isPositive ? '#22c55e' : '#ef4444'; // green-500 : red-500
  const gradientId = isPositive ? 'colorGreen' : 'colorRed';

  return (
    <div className="h-[300px] w-full bg-slate-850 rounded-xl border border-slate-700/50 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">价格走势</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#64748b" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
            formatter={(value: number) => [`$${value}`, '价格']}
            labelFormatter={(label) => `时间: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#${gradientId})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};