'use client';

import { useState, useEffect } from 'react';
import { History, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from './HistoryItem';
import { HistoryManager } from '@/lib/history';
import type { HistoryRecord } from '@/types';

interface HistoryPanelProps {
  onRetry: (record: HistoryRecord) => void;
  onView: (record: HistoryRecord) => void;
}

export function HistoryPanel({ onRetry, onView }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const records = HistoryManager.getHistory();
    setHistory(records);
  };

  const handleDelete = (id: string) => {
    HistoryManager.removeHistory(id);
    loadHistory();
  };

  const handleClearAll = () => {
    HistoryManager.clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const filteredHistory = history.filter(record =>
    record.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">历史记录</h2>
          <span className="text-sm text-slate-500 bg-slate-700 px-2 py-1 rounded-full">
            {history.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {history.length > 0 && (
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
      {history.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
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
          {history.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <History className="h-16 w-16 text-slate-600 mb-4" />
              <p className="text-slate-400 mb-2">暂无历史记录</p>
              <p className="text-sm text-slate-500">生成第一个 schema 后，记录将显示在这里</p>
            </motion.div>
          ) : filteredHistory.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="h-16 w-16 text-slate-600 mb-4" />
              <p className="text-slate-400">未找到匹配的记录</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((record) => (
                <HistoryItem
                  key={record.id}
                  record={record}
                  onRetry={onRetry}
                  onDelete={handleDelete}
                  onView={onView}
                />
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
                此操作将删除所有历史记录，且无法恢复。确定要继续吗？
              </p>
              <div className="flex items-center space-x-3">
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