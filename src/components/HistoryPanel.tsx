'use client';

import { useState } from 'react';
import { History, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LocalHistoryItem } from '@/types';

interface HistoryPanelProps {
  localHistory: LocalHistoryItem[];
  onRetry: (item: LocalHistoryItem) => void;
  onView: (item: LocalHistoryItem) => void;
  onDelete: (id: string) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
}

export function HistoryPanel({ 
  localHistory, 
  onRetry, 
  onView, 
  onDelete, 
  onSearch, 
  searchTerm 
}: HistoryPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    // 清空本地历史记录
    localStorage.removeItem('formily_local_history');
    setShowClearConfirm(false);
    // 通知父组件重新加载
    onSearch('');
  };



  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">本地历史记录</h2>
          <span className="text-sm text-slate-500 bg-slate-700 px-2 py-1 rounded-full">
            {localHistory.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {localHistory.length > 0 && (
            <motion.button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="清空所有记录"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </motion.button>
          )}
        </div>
      </div>

      {/* 搜索框 */}
      {localHistory.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索本地记录..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-700 rounded"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>
      )}

      {/* 历史记录列表 */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence>
          {localHistory.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <History className="h-16 w-16 text-slate-600 mb-4" />
              <p className="text-slate-400 mb-2">暂无本地记录</p>
              <p className="text-sm text-slate-500">生成第一个 schema 后，记录将显示在这里</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {localHistory.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* 提示词预览 */}
                  <p className="text-slate-200 text-sm mb-3 line-clamp-2">
                    {item.prompt.length > 100 
                      ? item.prompt.substring(0, 100) + '...' 
                      : item.prompt}
                  </p>

                  {/* 状态和时间 */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.success
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {item.success ? '成功' : '失败'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {getTimeAgo(item.timestamp)}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRetry(item)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      重试
                    </button>
                    <button
                      onClick={() => onView(item)}
                      className="flex-1 px-3 py-2 text-sm bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 清空确认对话框 */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                确认清空
              </h3>
              <p className="text-slate-400 mb-6">
                此操作将删除所有本地历史记录，且无法恢复。确定要继续吗？
              </p>
              <div className="flex items-center space-x-3 gap-2">
                <motion.button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  确认清空
                </motion.button>
                <motion.button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  取消
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 