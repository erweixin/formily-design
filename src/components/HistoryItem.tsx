'use client';

import { useState } from 'react';
import { Clock, Trash2, RefreshCw, Copy, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import copy from 'copy-to-clipboard';
import type { HistoryRecord } from '@/types';

interface HistoryItemProps {
  record: HistoryRecord;
  onRetry: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  onView: (record: HistoryRecord) => void;
}

export function HistoryItem({ record, onRetry, onDelete, onView }: HistoryItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const schemaString = JSON.stringify(record.schema, null, 2);
    copy(schemaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className="glass rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start space-x-3">
        {/* 图片缩略图 */}
        <div className="flex-shrink-0">
          <img
            src={`data:image/png;base64,${record.image}`}
            alt="历史记录图片"
            className="w-16 h-16 rounded-lg object-cover border border-slate-600"
          />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">{formatTime(record.createdAt)}</span>
              {record.success && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <motion.button
                onClick={() => onView(record)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="查看详情"
              >
                <Eye className="h-4 w-4 text-slate-400" />
              </motion.button>
              <motion.button
                onClick={handleCopy}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="复制代码"
              >
                {copied ? (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </motion.button>
              <motion.button
                onClick={() => onRetry(record)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="重新生成"
              >
                <RefreshCw className="h-4 w-4 text-slate-400" />
              </motion.button>
              <motion.button
                onClick={() => onDelete(record.id)}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="删除记录"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </motion.button>
            </div>
          </div>

          {/* Prompt 预览 */}
          <p className="text-sm text-slate-300 line-clamp-2 mb-2">
            {record.prompt}
          </p>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => onRetry(record)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="h-3 w-3" />
              <span>重新生成</span>
            </motion.button>
            <motion.button
              onClick={() => onView(record)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="h-3 w-3" />
              <span>查看详情</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 