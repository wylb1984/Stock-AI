export interface ChartDataPoint {
  time: string;
  price: number;
}

export interface NewsItem {
  title: string;
  source: string;
  url?: string;
  snippet: string;
}

export interface KeyMetrics {
  currentPrice: string;
  changeAmount: string;
  changePercent: string;
  marketCap: string;
  volume: string;
  peRatio: string;
  rating: 'Buy' | 'Sell' | 'Hold' | 'Strong Buy' | 'Strong Sell';
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface TradeSetup {
  verdict: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  verdictReason: string; // "One sentence core conclusion"
  entryZone: string;
  targetPrice: string;
  stopLoss: string;
  confidenceScore: number; // 0-100
}

export interface ChecklistItem {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL'; // Corresponds to ✅ ⚠️ ❌
  detail: string;
}

export interface StockAnalysisResult {
  ticker: string;
  metrics: KeyMetrics;
  tradeSetup: TradeSetup;
  checklist: ChecklistItem[];
  summary: string;
  technicalAnalysis: string;
  chartData: ChartDataPoint[];
  news: NewsItem[];
  groundingSources: GroundingSource[];
  timestamp: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}