import React, { useState } from 'react';
import { LoadingState } from '../types';

interface SearchInputProps {
  onSearch: (ticker: string) => void;
  loadingState: LoadingState;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, loadingState }) => {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim() && loadingState !== LoadingState.LOADING) {
      onSearch(ticker.trim());
    }
  };

  const isLoading = loadingState === LoadingState.LOADING;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200 ${isLoading ? 'animate-pulse' : ''}`}></div>
        <div className="relative flex items-center bg-slate-850 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
          <span className="pl-4 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className="w-full bg-transparent text-white px-4 py-4 focus:outline-none placeholder-slate-500 font-medium tracking-wide"
            placeholder="输入美股代码 (例如 AAPL, NVDA, TSLA)..."
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!ticker.trim() || isLoading}
            className={`mr-2 px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200 
              ${!ticker.trim() || isLoading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/30'
              }`}
          >
            {isLoading ? '分析中...' : '开始分析'}
          </button>
        </div>
      </form>
      
      {/* Quick Suggestions */}
      {!isLoading && (
        <div className="mt-3 flex gap-2 justify-center text-xs text-slate-400">
          <span>热门股票:</span>
          {['NVDA', 'TSLA', 'AAPL', 'AMD', 'MSFT'].map(t => (
            <button 
              key={t}
              onClick={() => { setTicker(t); onSearch(t); }}
              className="hover:text-blue-400 transition-colors cursor-pointer underline decoration-dotted"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};