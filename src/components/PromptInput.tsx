'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromptInputProps {
  onPromptChange: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onPromptChange, disabled = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setPrompt(value);
    onPromptChange(value);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const characterCount = prompt.length;
  const maxCharacters = 500;

  return (
    <div className="w-full space-y-3">
      {/* <div className="flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-slate-400" />
        <label htmlFor="prompt" className="text-sm font-medium text-slate-200">
          描述你的需求
        </label>
      </div> */}
      
      <motion.div
        className={`relative rounded-xl border-2 transition-all duration-300 ${
          isFocused
            ? 'border-blue-500 bg-slate-800/80'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
        }`}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
      >
        <textarea
          id="prompt"
          value={prompt}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="请详细描述额外需求..."
          className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-slate-200 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          rows={4}
          maxLength={maxCharacters}
        />
        
        <div className="absolute bottom-2 right-3 flex items-center space-x-2">
          {characterCount > maxCharacters * 0.8 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-1 text-xs"
            >
              <AlertCircle className="h-3 w-3 text-orange-400" />
              <span className={`text-xs ${
                characterCount >= maxCharacters ? 'text-red-400' : 'text-orange-400'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>例如：所属组织字段选择项来自服务端，dictKey 为 org_id</span>
        <span>{characterCount}/{maxCharacters}</span>
      </div>
    </div>
  );
} 