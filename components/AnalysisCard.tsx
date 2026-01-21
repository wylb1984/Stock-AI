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
      <div className="text-slate-300 leading-relaxed text-sm">
        <ReactMarkdown
          components={{
            h1: ({...props}) => <h1 className="text-xl font-bold text-white mt-4 mb-3 border-b border-slate-700 pb-1" {...props} />,
            h2: ({...props}) => <h2 className="text-lg font-bold text-blue-300 mt-4 mb-2" {...props} />,
            h3: ({...props}) => <h3 className="text-md font-bold text-blue-200 mt-3 mb-2" {...props} />,
            h4: ({...props}) => <h4 className="text-sm font-bold text-slate-200 mt-2 mb-1" {...props} />,
            strong: ({...props}) => <strong className="font-bold text-white" {...props} />,
            ul: ({...props}) => <ul className="list-disc ml-5 space-y-1 my-2" {...props} />,
            ol: ({...props}) => <ol className="list-decimal ml-5 space-y-1 my-2" {...props} />,
            li: ({...props}) => <li className="marker:text-blue-500 pl-1" {...props} />,
            p: ({...props}) => <p className="mb-3" {...props} />,
            blockquote: ({...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-slate-400 bg-slate-800/30 py-2 pr-2 rounded-r" {...props} />,
            code: ({...props}) => <code className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-blue-300 border border-slate-700" {...props} />,
            pre: ({...props}) => <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto my-3 border border-slate-700" {...props} />,
            hr: ({...props}) => <hr className="border-slate-700 my-4" {...props} />,
            a: ({...props}) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};