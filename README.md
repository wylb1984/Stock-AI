# 美股 AI 分析师 (Daily Stock Analysis AI)

这是一个基于 React + Vite + Google Gemini API 的美股分析应用。它利用 Gemini 的联网搜索能力 (Search Grounding) 来获取实时股价和新闻，并根据缠论 (Chan Lun) 进行技术分析。

## 🛠️ 本地运行

1.  安装依赖:
    ```bash
    npm install
    ```

2.  设置环境变量:
    复制 `.env.example` 为 `.env`，并填入你的 Google API Key。
    ```bash
    API_KEY=AIzaSy...
    ```

3.  启动开发服务器:
    ```bash
    npm run dev
    ```

## 🚀 部署到 Vercel (推荐)

此项目是一个纯前端应用 (SPA)，可以直接免费部署到 Vercel。

1.  **Fork 或上传** 此代码到你的 GitHub 仓库。
2.  登录 [Vercel](https://vercel.com)。
3.  点击 **"Add New..."** -> **"Project"**。
4.  选择你的 GitHub 仓库并点击 **Import**。
5.  **关键步骤**: 在 **Environment Variables** (环境变量) 部分：
    *   Key: `API_KEY`
    *   Value: `你的Google_Gemini_API_Key` (以 `AIza` 开头)
6.  点击 **Deploy**。

### 注意事项

*   **API Key 安全性**: 由于这是纯前端应用，API Key 会在构建时被打包进前端代码中。这是为了演示方便。在生产环境中，建议限制 API Key 的 HTTP Referrer (来源网址) 为你的 Vercel 域名 (例如 `https://your-project.vercel.app`)，以防止被滥用。你可以在 [Google AI Studio API Key 设置](https://aistudio.google.com/app/apikey) 中配置限制。
*   **配额 (Quota)**: 免费的 API Key 有速率限制。如果出现 "API 配额不足" 的错误，请稍等几十秒后再试，或升级到付费计划。
