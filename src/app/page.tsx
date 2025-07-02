'use client';

import { useState } from 'react';
import { Wand2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from '@/components/ImageUploader';
import { PromptInput } from '@/components/PromptInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SchemaDrawer } from '@/components/SchemaDrawer';
import { HistoryPanel } from '@/components/HistoryPanel';
import { HistoryManager } from '@/lib/history';
import type { UploadedImage, FormilySchema, HistoryRecord } from '@/types';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSchema, setGeneratedSchema] = useState<FormilySchema | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 处理历史记录重试
  const handleRetry = (record: HistoryRecord) => {
    // 将历史记录的数据填充到当前表单
    setUploadedImage({
      file: new File([], 'history-image.png'),
      preview: `data:image/png;base64,${record.image}`
    });
    setPrompt(record.prompt);
    // 自动触发生成
    handleGenerateSchemaFromHistory(record);
  };

  // 处理历史记录查看
  const handleViewHistory = (record: HistoryRecord) => {
    setGeneratedSchema(record.schema);
    setIsDrawerOpen(true);
  };

  // 从历史记录生成
  const handleGenerateSchemaFromHistory = async (record: HistoryRecord) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: record.image,
          prompt: record.prompt,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      setGeneratedSchema(data.schema);
      setIsDrawerOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSchema = async () => {
    if (!uploadedImage || !prompt.trim()) {
      setError('请上传图片并输入描述');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 将图片转换为 base64
      const base64Image = uploadedImage.preview.split(',')[1];

      const response = await fetch('/api/generate-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      // 保存到历史记录
      HistoryManager.addHistory({
        image: base64Image,
        prompt: prompt.trim(),
        schema: data.schema,
        success: true,
      });

      setGeneratedSchema(data.schema);
      setIsDrawerOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = uploadedImage && prompt.trim() && !isLoading;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-slate-100">
              Formily 表单生成器
            </h1>
            <Sparkles className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            上传图片并描述你的需求，AI 将为你生成 Formily 2.x 的 schema
          </p>
        </motion.div>

        {/* 特性介绍 */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass rounded-xl p-6 text-center">
            <Zap className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">智能识别</h3>
            <p className="text-slate-400">AI 自动识别图片中的表单元素和布局</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Wand2 className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">一键生成</h3>
            <p className="text-slate-400">快速生成符合 Formily 2.x 规范的 schema</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Sparkles className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">历史记录</h3>
            <p className="text-slate-400">保存生成历史，支持快速重试和查看</p>
          </div>
        </motion.div>

        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* 图片上传区域 */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>上传参考图片</span>
              </h2>
              <ImageUploader onImageChange={setUploadedImage} />
            </div>

            {/* Prompt 输入区域 */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>描述你的需求</span>
              </h2>
              <PromptInput 
                onPromptChange={setPrompt} 
                disabled={isLoading}
              />
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="flex items-center space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle className="text-red-400" size={20} />
                  <span className="text-red-300">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 生成按钮 */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                onClick={handleGenerateSchema}
                disabled={!canSubmit}
                className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  canSubmit
                    ? 'btn-gradient text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                whileHover={canSubmit ? { scale: 1.05 } : {}}
                whileTap={canSubmit ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={24} />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={24} />
                    <span>生成 Schema</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* 右侧：历史记录 */}
          <motion.div 
            className="h-[600px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <HistoryPanel 
              onRetry={handleRetry}
              onView={handleViewHistory}
            />
          </motion.div>
        </div>
      </div>

      {/* Schema 展示抽屉 */}
      <SchemaDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        schema={generatedSchema}
      />
    </div>
  );
}
