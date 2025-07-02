'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import copy from 'copy-to-clipboard';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-json';
import type { FormilySchema } from '@/types';

interface SchemaCodeTabProps {
  schema: FormilySchema;
}

export function SchemaCodeTab({ schema }: SchemaCodeTabProps) {
  const [copied, setCopied] = useState(false);
  const [codeRef, setCodeRef] = useState<HTMLPreElement | null>(null);

  const schemaString = JSON.stringify(schema, null, 2);

  useEffect(() => {
    if (codeRef) {
      Prism.highlightElement(codeRef);
    }
  }, [codeRef, schema]);

  const handleCopy = () => {
    copy(schemaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([schemaString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formily-schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <h3 className="text-lg font-medium text-slate-200">Schema 代码</h3>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={16} />
            <span>下载</span>
          </motion.button>
          <motion.button
            onClick={handleCopy}
            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>复制代码</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-400 ml-2">formily-schema.json</span>
          </div>
        </div>
        <div className="p-4 overflow-auto max-h-96">
          <pre
            ref={setCodeRef}
            className="text-sm font-mono text-slate-200 leading-relaxed"
          >
            <code className="language-json">{schemaString}</code>
          </pre>
        </div>
      </div>
    </div>
  );
} 