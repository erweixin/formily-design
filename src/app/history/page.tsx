'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { HistoryResponse } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Image from 'next/image';

export default function HistoryPage() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSuccess, setFilterSuccess] = useState<boolean | undefined>(undefined);

  const fetchHistory = async (page = 1, search = '', success?: boolean) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(success !== undefined && { success: success.toString() }),
      });

      const response = await fetch(`/api/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data: HistoryResponse = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage, searchTerm, filterSuccess);
  }, [currentPage, searchTerm, filterSuccess]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterSuccess = (value: boolean | undefined) => {
    setFilterSuccess(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条历史记录吗？')) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 重新获取数据
        fetchHistory(currentPage, searchTerm, filterSuccess);
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
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

  if (loading && !historyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
          <p className="mt-2 text-gray-600">
            查看和管理所有生成的表单设计历史记录
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索提示词..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterSuccess(undefined)}
              className={`px-4 py-2 rounded-lg border ${
                filterSuccess === undefined
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleFilterSuccess(true)}
              className={`px-4 py-2 rounded-lg border ${
                filterSuccess === true
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              成功
            </button>
            <button
              onClick={() => handleFilterSuccess(false)}
              className={`px-4 py-2 rounded-lg border ${
                filterSuccess === false
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              失败
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        {historyData && (
          <div className="mb-6 text-sm text-gray-600">
            共找到 {historyData.total} 条记录
          </div>
        )}

        {/* 历史记录网格 */}
        {historyData?.items && historyData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {historyData.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 图片预览 */}
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={item.inputImageUrl}
                    alt="表单设计"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.success ? '成功' : '失败'}
                    </span>
                  </div>
                </div>

                {/* 内容 */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.promptPreview}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(item.timestamp)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.timestamp)}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/history/${item.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      查看
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {loading ? '加载中...' : '暂无历史记录'}
            </h3>
            <p className="text-gray-600">
              {loading ? '正在获取历史记录...' : '开始生成你的第一个表单设计吧！'}
            </p>
          </div>
        )}

        {/* 分页 */}
        {historyData && historyData.hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 