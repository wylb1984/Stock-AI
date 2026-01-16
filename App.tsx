import React, { useState, useEffect } from 'react';
import { SearchInput } from './components/SearchInput';
import { StockChart } from './components/StockChart';
import { AnalysisCard } from './components/AnalysisCard';
import { MetricsGrid } from './components/MetricsGrid';
import { DecisionDashboard } from './components/DecisionDashboard';
import { Watchlist } from './components/Watchlist';
import { analyzeStock } from './services/geminiService';
import { StockAnalysisResult, LoadingState } from './types';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [data, setData] = useState<StockAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Watchlist State with LocalStorage persistence
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('user_watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'NVDA', 'TSLA'];
  });

  useEffect(() => {
    localStorage.setItem('user_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (ticker: string) => {
    if (!watchlist.includes(ticker)) {
      setWatchlist([...watchlist, ticker]);
    }
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(watchlist.filter(t => t !== ticker));
  };

  const toggleWatchlist = (ticker: string) => {
    if (watchlist.includes(ticker)) {
      removeFromWatchlist(ticker);
    } else {
      addToWatchlist(ticker);
    }
  };

  const handleSearch = async (ticker: string) => {
    setLoadingState(LoadingState.LOADING);
    setError(null);
    setData(null);

    try {
      const result = await analyzeStock(ticker);
      setData(result);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("获取分析失败，请稍后重试或检查股票代码。");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const isPositive = data?.metrics.changePercent?.includes('+') ?? true;
  const isSaved = data ? watchlist.includes(data.ticker) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Alpha<span className="text-blue-400">Signal</span>
              <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">US Market</span>
            </h1>
          </div>
          <div className="hidden sm:block text-xs text-slate-500 font-mono">
            Powered by Gemini 3 Pro
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingState === LoadingState.IDLE && (
           <div className="text-center mb-10 pt-10">
            <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold mb-4 border border-blue-500/20">
               ✨ AI 驱动的机构级投研
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
              美股 AI 决策仪表盘
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              不仅仅是行情。获取包含<span className="text-slate-200 font-semibold">买卖点位</span>、<span className="text-slate-200 font-semibold">风险检查清单</span>和<span className="text-slate-200 font-semibold">趋势预警</span>的深度日报。
            </p>
          </div>
        )}

        <SearchInput onSearch={handleSearch} loadingState={loadingState} />

        {/* Watchlist Section */}
        <Watchlist 
          items={watchlist} 
          onSelect={handleSearch} 
          onRemove={removeFromWatchlist}
          onAdd={addToWatchlist}
        />

        {error && (
          <div className="max-w-2xl mx-auto mt-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {loadingState === LoadingState.LOADING && (
           <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
             <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-t-4 border-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
             </div>
             <p className="text-xl font-medium text-white mb-2">AI 正在生成决策报告...</p>
             <div className="flex flex-col items-center gap-1 text-sm text-slate-500 font-mono">
                <p>🔍 检索实时行情与技术指标</p>
                <p>🧠 计算乖离率与趋势形态</p>
                <p>📋 生成风险检查清单</p>
             </div>
           </div>
        )}

        {loadingState === LoadingState.SUCCESS && data && (
          <div className="space-y-6 animate-fade-in-up mt-8">
            
            {/* Top Header: Price & Ticker */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-5xl font-bold text-white tracking-tight">{data.ticker}</h2>
                  <button 
                    onClick={() => toggleWatchlist(data.ticker)}
                    className="group p-2 rounded-full hover:bg-slate-800 transition-colors"
                    title={isSaved ? "从自选股移除" : "加入自选股"}
                  >
                    {isSaved ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 fill-current" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">US Stock</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                  <span>Last Updated: {data.timestamp}</span>
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-6xl font-mono font-bold text-white tracking-tighter">
                  {data.metrics.currentPrice}
                </div>
                <div className={`text-xl font-medium flex items-center md:justify-end gap-2 ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span>{isPositive ? '▲' : '▼'}</span>
                  <span>{data.metrics.changeAmount} ({data.metrics.changePercent})</span>
                </div>
              </div>
            </div>

            {/* AI Decision Dashboard (New Feature) */}
            <DecisionDashboard setup={data.tradeSetup} checklist={data.checklist} />

            <MetricsGrid metrics={data.metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content: Chart & Technicals */}
              <div className="lg:col-span-2 space-y-6">
                <StockChart data={data.chartData} isPositive={isPositive} />
                <AnalysisCard title="📈 技术面深度分析" content={data.technicalAnalysis} />
              </div>

              {/* Sidebar: Summary & News */}
              <div className="space-y-6">
                <AnalysisCard title="📝 执行摘要" content={data.summary} />
                
                <div className="bg-slate-850 rounded-xl border border-slate-700/50 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center justify-between">
                    <span>🔥 市场情报</span>
                  </h3>
                  <div className="space-y-5">
                    {data.news.map((item, idx) => (
                      <a 
                        key={idx} 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                             {item.source}
                           </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-200 group-hover:text-blue-300 transition-colors leading-snug">
                          {item.title}
                        </h4>
                      </a>
                    ))}
                    {data.news.length === 0 && (
                      <p className="text-slate-500 text-sm italic">暂无相关新闻。</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Sources */}
            {data.groundingSources && data.groundingSources.length > 0 && (
              <div className="mt-12 border-t border-slate-800 pt-6">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="uppercase font-bold tracking-wider">Sources:</span>
                  {data.groundingSources.map((source, i) => (
                     <a 
                       key={i} 
                       href={source.uri} 
                       target="_blank" 
                       rel="noreferrer"
                       className="hover:text-blue-400 transition-colors underline decoration-slate-700 underline-offset-2"
                     >
                       {source.title}
                     </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;