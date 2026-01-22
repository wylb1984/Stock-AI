import { GoogleGenAI } from "@google/genai";
import { StockAnalysisResult } from '../types';

// Ensure TypeScript recognizes process.env.API_KEY if types aren't fully loaded
declare const process: { env: { API_KEY: string } };

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

  // Access the API Key injected by Vite via define plugin
  // Vite replaces 'process.env.API_KEY' with the actual string literal at build time.
  const key = process.env.API_KEY;

  // Strict check for empty string
  if (!key || key === "") {
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
    
    **LANGUAGE REQUIREMENT (ABSOLUTE):**
    - **ALL TEXT OUTPUT MUST BE IN SIMPLIFIED CHINESE (简体中文)**.
    - Translate all analysis, news summaries, and reasons into Chinese.
    - Only keep the "ticker" and specific Enum values (e.g., "BULLISH", "Strong Buy") in English for code compatibility.

    **DATA SOURCE & FRESHNESS (CRITICAL):**
    1. You DO NOT have internal real-time knowledge. You MUST use 'googleSearch'.
    2. **SEARCH QUERIES**: Perform these specific searches:
       - "${ticker} stock price quote investing.com" (Primary Source for Price)
       - "${ticker} stock technical analysis investing.com" (Primary Source for Rating)
       - "${ticker} stock news today" (For catalysts)
    3. **TIMESTAMP VERIFICATION**: 
       - Look for "Live", "Real-time", or today's date in the search snippets. 
       - **IF INVESTING.COM DATA IS OLD/MISSING**: Fallback to Yahoo Finance or CNBC immediately to get the *latest* price.
       - Do not report data from 2 days ago as "current".
    
    Philosophy (Strictly Enforce):
    1. NO CHASING HIGHS: If price is significantly above the 20-day Moving Average (Bias Rate > 5%), mark as High Risk (Warning).
    2. CHAN LUN STRUCTURE: Base trend judgment on Central Pivots (中枢) and Buy/Sell Points (买卖点).
    3. SAFETY FIRST: Always provide a Stop Loss.

    Analysis Tasks:
    1. **Real-time Data**: Extract exact Price, Change ($), and Change (%) from the *latest* available source.
    2. **Technical Scan**: Analyze RSI, MACD status, Moving Averages.
    3. **Chan Lun (缠论)**: Identify Trend (Up/Down/盘整), Central Pivot (中枢), Divergence (背驰), and Buy/Sell Points (买卖点).
    4. **News**: Summarize top 3 recent news items in Chinese.

    Output Format:
    Return strictly valid JSON inside \`\`\`json\`\`\` blocks.

    JSON Structure:
    {
      "metrics": {
        "currentPrice": "string ($X.XX) - MUST be latest market price",
        "changeAmount": "string (+/-X.XX)",
        "changePercent": "string (+/-X.XX%)",
        "marketCap": "string",
        "volume": "string",
        "peRatio": "string",
        "rating": "Buy | Sell | Hold | Strong Buy | Strong Sell" 
      },
      "tradeSetup": {
        "verdict": "BULLISH | BEARISH | NEUTRAL",
        "verdictReason": "One concise sentence in CHINESE summarizing the core decision.",
        "entryZone": "Price range in CHINESE/Numbers (e.g., $100-$102)",
        "targetPrice": "Specific price target",
        "stopLoss": "Specific stop loss price",
        "confidenceScore": number (0-100)
      },
      "checklist": [
        { "name": "缠论结构 (Chan Structure)", "status": "PASS | WARN | FAIL", "detail": "Short explanation in CHINESE" },
        { "name": "趋势形态 (Trend)", "status": "PASS | WARN | FAIL", "detail": "Short explanation in CHINESE" },
        { "name": "资金/情绪 (Sentiment)", "status": "PASS | WARN | FAIL", "detail": "Short explanation in CHINESE" },
        { "name": "成交量 (Volume)", "status": "PASS | WARN | FAIL", "detail": "Short explanation in CHINESE" },
        { "name": "支撑/压力 (S/R)", "status": "PASS | WARN | FAIL", "detail": "Short explanation in CHINESE" }
      ],
      "summary": "Detailed executive summary in CHINESE (Markdown supported).",
      "technicalAnalysis": "Detailed technical analysis in CHINESE. **MUST** include a dedicated section titled '### 🧘 缠论形态分析' analyzing Central Pivots (中枢) and Buy/Sell Points. (Markdown supported).",
      "chartData": [
        { "time": "HH:MM", "price": number } // Provide ~10-15 data points to simulate the intraday trend based on High/Low/Current found.
      ],
      "news": [
        { "title": "News Headline in CHINESE", "source": "Source Name", "snippet": "Short summary in CHINESE", "url": "URL" }
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