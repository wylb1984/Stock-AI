import { GoogleGenAI } from "@google/genai";
import { StockAnalysisResult } from '../types';

// Declare the global constant injected by Vite
declare const __API_KEY__: string;

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

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeStock = async (ticker: string): Promise<StockAnalysisResult> => {
  console.log(`Starting analysis for ${ticker}...`);

  // Use the injected global constant
  let key: string | undefined;
  try {
    key = __API_KEY__;
  } catch (e) {
    console.error("Error accessing __API_KEY__", e);
  }

  // Strict check for empty string
  if (!key || key === "" || key === "undefined") {
    console.error("API Key is missing in runtime.");
    throw new Error("API Key is missing. Please check your Vercel Environment Variables (Settings -> Environment Variables -> API_KEY) and then REDEPLOY the project.");
  }

  // Sanity check for SDK
  if (typeof GoogleGenAI === 'undefined') {
     throw new Error("GoogleGenAI SDK not loaded. Please check your internet connection.");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const prompt = `
    Role: You are a strict, algorithmic Wall Street Trading AI specialized in the US Market and Chan Lun (缠论) Technical Analysis.
    
    CRITICAL INSTRUCTION FOR REAL-TIME DATA:
    You DO NOT have internal knowledge of today's stock price.
    You MUST Use the 'googleSearch' tool IMMEDIATELY to find:
    1. "${ticker} stock price today live" (Get the exact current price, change, and percentage).
    2. "${ticker} stock news last 24 hours" (Find specific catalysts).
    3. "${ticker} technical analysis indicators" (RSI, Moving Averages).
    
    IF YOU DO NOT SEARCH, YOU WILL FAIL. DO NOT HALLUCINATE PRICE DATA.

    Objective: Analyze ticker "${ticker}" to generate a "Daily Decision Dashboard".
    
    Philosophy (Strictly Enforce):
    1. NO CHASING HIGHS: If price is significantly above the 20-day Moving Average (Bias Rate > 5%), mark as High Risk (Warning).
    2. CHAN LUN STRUCTURE: Base trend judgment on Central Pivots (中枢) and Buy/Sell Points (买卖点).
    3. SAFETY FIRST: Always provide a Stop Loss.

    Analysis Tasks:
    1. **Real-time Data Retrieval**: Confirm the *current* market price and volume via Google Search.
    2. **Technical Scan**: Analyze RSI, MACD status, Moving Averages (MA5, MA20, MA60).
    3. **Chan Lun (缠论) Analysis**:
       - Identify the current trend type (Upward/Downward/Consolidation).
       - Locate Central Pivots (中枢) and define the current level.
       - Check for Trend Divergence (背驰/盘整背驰).
       - Identify valid Buy/Sell Points (1st/2nd/3rd Buy or Sell Points).
    4. **News/Catalysts**: Summarize top 3 recent news items found via search.

    Output Format:
    Return strictly valid JSON inside \`\`\`json\`\`\` blocks.
    All text fields must be in Simplified Chinese (简体中文).

    JSON Structure:
    {
      "metrics": {
        "currentPrice": "string ($X.XX) - Must be real-time",
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
      "technicalAnalysis": "Detailed technical analysis. **MUST** include a dedicated section titled '### 🧘 缠论形态分析 (Chan Lun Analysis)' that explicitly analyzes the Central Pivot (中枢), Divergence (背驰), and Buy/Sell Points. (Markdown supported).",
      "chartData": [
        { "time": "HH:MM", "price": number } // Provide ~10-15 data points representing the intraday trend found via search/reasoning.
      ],
      "news": [
        { "title": "News Headline", "source": "Source Name", "snippet": "Short summary", "url": "URL if available" }
      ]
    }
  `;

  try {
    let response;
    
    // Strategy: 
    // 1. Try Gemini 3 Pro (Smartest, Low Quota)
    // 2. Try Gemini 3 Flash (Fast, Medium Quota)
    // 3. Try Gemini 2.0 Flash Exp (High Quota / Separate Bucket)
    
    try {
      console.log("Attempting Gemini 3 Pro...");
      response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
    } catch (e: any) {
      console.warn("Gemini 3 Pro failed (likely quota), waiting 2s before fallback...", e);
      await delay(2000); // Cool down

      try {
         console.log("Attempting Fallback 1: Gemini 3 Flash...");
         response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview', 
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
        });
      } catch (e2: any) {
         console.warn("Gemini 3 Flash failed, waiting 2s before final fallback...", e2);
         await delay(2000); 

         // Final Fallback: Gemini 2.0 Flash Exp
         // This model often has a separate quota bucket for free users, making it a great safety net.
         console.log("Attempting Fallback 2: Gemini 2.0 Flash Exp...");
         response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp', 
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
        });
      }
    }

    const text = response?.text || "";
    if (!text) {
        throw new Error("No content generated from any model.");
    }

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
      tradeSetup: parsedData.tradeSetup || { verdict: 'NEUTRAL', verdictReason: 'AI 无法生成明确结论', entryZone: '-', targetPrice: '-', stopLoss: '-', confidenceScore: 0 },
      checklist: parsedData.checklist || [],
      summary: parsedData.summary || "暂无摘要。",
      technicalAnalysis: parsedData.technicalAnalysis || "暂无技术分析。",
      chartData: parsedData.chartData || [],
      news: parsedData.news || [],
      groundingSources: uniqueSources as any[],
      timestamp: new Date().toLocaleTimeString('zh-CN')
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // User-friendly error message for Quota issues
    const errString = JSON.stringify(error);
    if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("API 调用过于频繁 (Quota Exceeded)。所有备用模型均繁忙，请等待 30 秒后再次尝试。");
    }
    
    throw error;
  }
};