import { GoogleGenAI } from "@google/genai";
import { StockAnalysisResult } from '../types';

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string): any => {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON", e);
    }
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

export const analyzeStock = async (ticker: string): Promise<StockAnalysisResult> => {
  console.log(`Starting analysis for ${ticker}...`);

  if (!process.env.API_KEY) {
    console.error("API Key is missing or undefined.");
    throw new Error("API Key is missing. Please check your Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Role: You are a strict, algorithmic Wall Street Trading AI specialized in the US Market and Chan Lun (缠论) Technical Analysis.
    Objective: Analyze ticker "${ticker}" to generate a "Daily Decision Dashboard".
    
    Philosophy (Strictly Enforce):
    1. NO CHASING HIGHS: If price is significantly above the 20-day Moving Average (Bias Rate > 5%), mark as High Risk (Warning).
    2. CHAN LUN STRUCTURE: Base trend judgment on Central Pivots (中枢) and Buy/Sell Points (买卖点).
    3. SAFETY FIRST: Always provide a Stop Loss.

    Tasks:
    1. Use Google Search to find real-time data: Price, Change, Market Cap, Volume, P/E.
    2. Search for Technical Indicators: RSI, MACD status, Moving Averages (MA5, MA20, MA60).
    3. **Perform Chan Lun (缠论) Analysis**:
       - Identify the current trend type (Upward/Downward/Consolidation).
       - Locate Central Pivots (中枢) and define the current level.
       - Check for Trend Divergence (背驰/盘整背驰) using MACD as an auxiliary.
       - Identify valid Buy/Sell Points (1st/2nd/3rd Buy or Sell Points - 一买/二买/三买).
    4. Search for latest News/Catalysts (last 48 hours).
    5. Formulate a Trade Setup based on the data.

    Output Format:
    Return strictly valid JSON inside \`\`\`json\`\`\` blocks. No conversational text outside the JSON.
    All text fields must be in Simplified Chinese (简体中文).

    JSON Structure:
    {
      "metrics": {
        "currentPrice": "string ($X.XX)",
        "changeAmount": "string (+/-X.XX)",
        "changePercent": "string (+/-X.XX%)",
        "marketCap": "string",
        "volume": "string",
        "peRatio": "string",
        "rating": "Buy | Sell | Hold | Strong Buy | Strong Sell"
      },
      "tradeSetup": {
        "verdict": "BULLISH | BEARISH | NEUTRAL",
        "verdictReason": "One concise, impactful sentence summarizing the core decision logic (incorporating Chan Lun view).",
        "entryZone": "Specific price range or 'Market Price'",
        "targetPrice": "Specific price target based on Chan Pivot pressure or Fibonacci",
        "stopLoss": "Specific stop loss price based on Chan Pivot support (中枢下沿) or volatility",
        "confidenceScore": number (0-100)
      },
      "checklist": [
        { "name": "缠论结构 (Chan Structure)", "status": "PASS | WARN | FAIL", "detail": "e.g., 3rd Buy Point Confirmed (三买确认) or Divergence (顶背驰)" },
        { "name": "趋势形态 (Trend)", "status": "PASS | WARN | FAIL", "detail": "e.g., MA Alignment" },
        { "name": "资金/情绪 (Sentiment)", "status": "PASS | WARN | FAIL", "detail": "e.g., Institutional inflow" },
        { "name": "成交量 (Volume)", "status": "PASS | WARN | FAIL", "detail": "e.g., Volume matches trend" },
        { "name": "支撑/压力 (S/R)", "status": "PASS | WARN | FAIL", "detail": "e.g., Above key support" }
      ],
      "summary": "Detailed executive summary (Markdown supported).",
      "technicalAnalysis": "Detailed technical analysis. **MUST** include a dedicated section titled '### 🧘 缠论形态分析 (Chan Lun Analysis)' that explicitly analyzes the Central Pivot (中枢), Divergence (背驰), and Buy/Sell Points. Then provide standard analysis for RSI, MACD, KDJ, Bollinger Bands. (Markdown supported).",
      "chartData": [
        { "time": "HH:MM", "price": number } // Provide ~15 intraday points if open, or daily points if closed.
      ],
      "news": [
        { "title": "News Headline", "source": "Source Name", "snippet": "Short summary", "url": "URL if available" }
      ]
    }
  `;

  try {
    let response;
    try {
      console.log("Attempting Gemini 3 Pro...");
      // Attempt with Gemini 3 Pro first (best reasoning)
      response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
    } catch (e: any) {
      console.warn("Primary model failed, attempting fallback to Gemini 3 Flash...", e);
      // Fallback to Flash if Pro fails (500 errors are often transient or model-load related)
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
    }

    const text = response.text || "";
    const parsedData = extractJson(text);

    if (!parsedData) {
      throw new Error("Failed to parse analysis data from Gemini response.");
    }

    // Extract grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || new URL(chunk.web.uri).hostname
      }));

    const uniqueSources = Array.from(new Map(groundingSources.map((s: any) => [s.uri, s])).values());

    return {
      ticker: ticker.toUpperCase(),
      metrics: parsedData.metrics || {},
      tradeSetup: parsedData.tradeSetup || { verdict: 'NEUTRAL', verdictReason: '无法生成交易计划', entryZone: '-', targetPrice: '-', stopLoss: '-', confidenceScore: 0 },
      checklist: parsedData.checklist || [],
      summary: parsedData.summary || "暂无摘要。",
      technicalAnalysis: parsedData.technicalAnalysis || "暂无技术分析。",
      chartData: parsedData.chartData || [],
      news: parsedData.news || [],
      groundingSources: uniqueSources as any[],
      timestamp: new Date().toLocaleTimeString('zh-CN')
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};