import React from 'react';
import { KeyMetrics } from '../types';

interface MetricsGridProps {
  metrics: KeyMetrics;
}

const getRatingLabel = (rating: string) => {
  if (!rating) return '未知';
  const r = rating.toLowerCase();
  if (r.includes('strong buy')) return '强力买入';
  if (r.includes('strong sell')) return '强力卖出';
  if (r.includes('buy')) return '买入';
  if (r.includes('sell')) return '卖出';
  if (r.includes('hold')) return '持有';
  return rating; // Fallback
};

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const items = [
    { label: '市值', value: metrics.marketCap },
    { label: '成交量', value: metrics.volume },
    { label: '市盈率 (P/E)', value: metrics.peRatio },
    { label: '分析师评级', value: getRatingLabel(metrics.rating), highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
          <p className={`text-lg font-semibold truncate ${
            item.highlight 
              ? (metrics.rating?.toLowerCase().includes('buy') ? 'text-green-400' : metrics.rating?.toLowerCase().includes('sell') ? 'text-red-400' : 'text-yellow-400')
              : 'text-white'
          }`}>
            {item.value || 'N/A'}
          </p>
        </div>
      ))}
    </div>
  );
};