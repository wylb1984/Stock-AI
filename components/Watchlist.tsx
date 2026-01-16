import React, { useState, useRef, useEffect } from 'react';

interface WatchlistProps {
  items: string[];
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  onAdd: (ticker: string) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ items, onSelect, onRemove, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicker.trim()) {
      onAdd(newTicker.trim().toUpperCase());
      setNewTicker('');
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          我的自选股 (Watchlist)
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {items.map((ticker) => (
          <div 
            key={ticker}
            className="group relative flex items-center bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all duration-200"
          >
            <button
              onClick={() => onSelect(ticker)}
              className="px-3 py-1.5 text-sm font-bold text-slate-200 hover:text-blue-300 font-mono tracking-wide"
            >
              {ticker}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(ticker);
              }}
              className="pr-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              className="w-24 bg-slate-900 border border-blue-500 text-white text-sm px-2 py-1.5 rounded-lg focus:outline-none uppercase font-mono"
              placeholder="Ticker"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onBlur={() => {
                // Small delay to allow form submission if clicking enter
                setTimeout(() => {
                   if (!newTicker.trim()) setIsAdding(false);
                }, 150);
              }}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-800/50 border border-dashed border-slate-700 hover:text-blue-400 hover:border-blue-500/50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            添加
          </button>
        )}
      </div>
    </div>
  );
};