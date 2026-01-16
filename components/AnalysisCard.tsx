import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisCardProps {
  title: string;
  content: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, content }) => {
  return (
    <div className="bg-slate-850 rounded-xl border border-slate-700/50 p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
        {title}
      </h3>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
        {/* Simple markdown rendering handling mainly newlines and lists effectively */}
        {content.split('\n').map((line, i) => {
          if (line.startsWith('###')) return <h4 key={i} className="text-md font-semibold text-blue-300 mt-4 mb-2">{line.replace('###', '')}</h4>;
          if (line.startsWith('**')) return <p key={i} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>;
          if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-blue-500">{line.replace('- ', '')}</li>;
          if (line.trim() === '') return <br key={i}/>;
          return <p key={i} className="mb-2">{line}</p>;
        })}
      </div>
    </div>
  );
};