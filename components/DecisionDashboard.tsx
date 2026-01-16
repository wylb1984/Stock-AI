import React from 'react';
import { TradeSetup, ChecklistItem } from '../types';

interface DecisionDashboardProps {
  setup: TradeSetup;
  checklist: ChecklistItem[];
}

export const DecisionDashboard: React.FC<DecisionDashboardProps> = ({ setup, checklist }) => {
  const isBullish = setup.verdict === 'BULLISH';
  const isBearish = setup.verdict === 'BEARISH';
  
  const accentColor = isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-yellow-400';
  const bgAccent = isBullish ? 'bg-green-500/10 border-green-500/30' : isBearish ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30';
  const progressColor = isBullish ? 'bg-green-500' : isBearish ? 'bg-red-500' : 'bg-yellow-500';

  const getIcon = (status: string) => {
    switch(status) {
      case 'PASS': return '✅';
      case 'WARN': return '⚠️';
      case 'FAIL': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Core Verdict Card */}
      <div className={`col-span-1 lg:col-span-2 rounded-xl border p-6 flex flex-col justify-between ${bgAccent}`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">AI 决策结论</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-700 ${accentColor}`}>
              信心指数: {setup.confidenceScore}%
            </span>
          </div>
          <h2 className={`text-4xl font-extrabold mb-2 ${accentColor} tracking-tight`}>
            {setup.verdict === 'BULLISH' ? '看涨 (Bullish)' : setup.verdict === 'BEARISH' ? '看跌 (Bearish)' : '观望 (Neutral)'}
          </h2>
          <p className="text-xl text-white font-medium leading-relaxed">
            "{setup.verdictReason}"
          </p>
        </div>

        {/* Trade Plan Strip */}
        <div className="mt-8 grid grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <div>
            <p className="text-xs text-slate-500 uppercase">🎯 买入区间</p>
            <p className="text-lg font-mono font-bold text-blue-300">{setup.entryZone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">🚀 目标价位</p>
            <p className="text-lg font-mono font-bold text-green-400">{setup.targetPrice}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">🛡️ 止损位</p>
            <p className="text-lg font-mono font-bold text-red-400">{setup.stopLoss}</p>
          </div>
        </div>
      </div>

      {/* 2. Safety Checklist */}
      <div className="bg-slate-850 rounded-xl border border-slate-700/50 p-6 shadow-sm flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">
          交易检查清单
        </h3>
        <div className="flex-1 flex flex-col justify-center space-y-4">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <span className="text-xl mt-0.5">{getIcon(item.status)}</span>
              <div>
                <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  {item.name}
                  <span className={`text-[10px] px-1.5 rounded border ${
                    item.status === 'PASS' ? 'border-green-800 text-green-500' : 
                    item.status === 'WARN' ? 'border-yellow-800 text-yellow-500' : 
                    'border-red-800 text-red-500'
                  }`}>
                    {item.status}
                  </span>
                </p>
                <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
          {checklist.length === 0 && (
            <p className="text-slate-500 text-sm italic">暂无检查清单数据</p>
          )}
        </div>
      </div>
    </div>
  );
};