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
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Role: You are a strict, algorithmic Wall Street Trading AI specialized in the US Market.
    Objective: Analyze ticker "${ticker}" to generate a "Daily Decision Dashboard".
    
    Philosophy (Strictly Enforce):
    1. NO CHASING HIGHS: If price is significantly above the 20-day Moving Average (Bias Rate > 5%), mark as High Risk (Warning).
    2. TREND IS KING: Look for Moving Average alignment (MA5 > MA10 > MA20).
    3. SAFETY FIRST: Always provide a Stop Loss.

    Tasks:
    1. Use Google Search to find real-time data: Price, Change, Market Cap, Volume, P/E.
    2. Search for Technical Indicators: RSI, MACD status, Moving Averages (MA5, MA20, MA60).
    3. Search for latest News/Catalysts (last 48 hours).
    4. Formulate a Trade Setup based on the data.

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
        "verdictReason": "One concise, impactful sentence summarizing the core decision logic.",
        "entryZone": "Specific price range or 'Market Price'",
        "targetPrice": "Specific price target based on resistance/fibonacci",
        "stopLoss": "Specific stop loss price based on support/volatility",
        "confidenceScore": number (0-100)
      },
      "checklist": [
        { "name": "趋势形态 (Trend)", "status": "PASS | WARN | FAIL", "detail": "e.g., Multi-head arrangement" },
        { "name": "乖离率 (Bias Risk)", "status": "PASS | WARN | FAIL", "detail": "e.g., Price near MA20 vs Price overextended" },
        { "name": "成交量 (Volume)", "status": "PASS | WARN | FAIL", "detail": "e.g., Volume surge vs Shrinking" },
        { "name": "资金/情绪 (Sentiment)", "status": "PASS | WARN | FAIL", "detail": "e.g., Institutional inflow vs Net outflow" },
        { "name": "支撑/压力 (S/R)", "status": "PASS | WARN | FAIL", "detail": "e.g., Above key support" }
      ],
      "summary": "Detailed executive summary (Markdown supported).",
      "technicalAnalysis": "Detailed technical analysis regarding RSI, MACD, KDJ, Bollinger Bands (Markdown supported).",
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