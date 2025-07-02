'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { HistoryItem } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SchemaCodeTab } from '@/components/SchemaCodeTab';
import { FormRenderer } from '@/components/FormRenderer';
import Image from 'next/image';

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [historyItem, setHistoryItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const id = params.id as string;

  const fetchHistoryItem = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/history/${id}`);
      if (!response.ok) throw new Error('Failed to fetch history item');
      
      const data: HistoryItem = await response.json();
      setHistoryItem(data);
    } catch (error) {
      console.error('Error fetching history item:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchHistoryItem();
    }
  }, [id, fetchHistoryItem]);

  const handleDelete = async () => {
    if (!confirm('确定要删除这条历史记录吗？')) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/history');
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const handleCopyPrompt = async () => {
    if (!historyItem) return;

    try {
      await navigator.clipboard.writeText(historyItem.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const handleRegenerate = () => {
    // 跳转到主页并预填充数据
    router.push(`/?prompt=${encodeURIComponent(historyItem?.prompt || '')}&image=${encodeURIComponent(historyItem?.inputImageUrl || '')}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!historyItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">记录不存在</h2>
          <p className="text-gray-600 mb-4">该历史记录可能已被删除</p>
          <button
            onClick={() => router.push('/history')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回历史记录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/history')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                返回历史记录
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">历史记录详情</h1>
                <p className="text-sm text-gray-600">
                  创建时间：{formatDate(historyItem.timestamp)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                重新生成
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                删除
              </button>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：原始图片和提示词 */}
          <div className="space-y-6">
            {/* 原始图片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">原始图片</h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={historyItem.inputImageUrl}
                  alt="原始表单设计"
                  className="w-full h-full object-cover"
                />
              </div>
              {historyItem.metadata?.originalFileName && (
                <p className="mt-2 text-sm text-gray-600">
                  文件名：{historyItem.metadata.originalFileName}
                </p>
              )}
              {historyItem.metadata?.imageSize && (
                <p className="text-sm text-gray-600">
                  文件大小：{formatFileSize(historyItem.metadata.imageSize)}
                </p>
              )}
            </div>

            {/* 提示词 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">提示词</h3>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{historyItem.prompt}</p>
              </div>
              {historyItem.metadata?.processingTime && (
                <p className="mt-2 text-sm text-gray-600">
                  处理时间：{historyItem.metadata.processingTime}ms
                </p>
              )}
            </div>
          </div>

          {/* 右侧：生成的Schema */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">生成的Schema</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  预览
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeTab === 'code'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  代码
                </button>
              </div>
            </div>

            <div className="min-h-[500px]">
              {activeTab === 'preview' ? (
                <FormRenderer schema={historyItem.generatedSchema} />
              ) : (
                <SchemaCodeTab schema={historyItem.generatedSchema} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 