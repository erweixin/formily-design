import { kv } from '@vercel/kv';
import { put, del } from '@vercel/blob';
import { HistoryItem, HistoryListItem, HistoryQueryParams, HistoryResponse, FormilySchema, LocalHistoryItem } from '@/types';

const HISTORY_PREFIX = 'history:';
const HISTORY_INDEX = 'history_index';
const LOCAL_HISTORY_KEY = 'formily_local_history';
const MAX_LOCAL_HISTORY = 50; // 本地最多保存50条记录

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== 本地存储函数 ====================

// 获取本地历史记录
export function getLocalHistory(): LocalHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load local history:', error);
    return [];
  }
}

// 保存到本地历史记录
export function saveLocalHistoryItem(
  prompt: string,
  image: string, // base64
  schema: FormilySchema | null,
  success: boolean
): LocalHistoryItem {
  const history = getLocalHistory();
  const newItem: LocalHistoryItem = {
    id: generateId(),
    timestamp: Date.now(),
    prompt,
    image,
    schema,
    success,
  };

  // 添加到开头
  history.unshift(newItem);

  // 限制数量
  if (history.length > MAX_LOCAL_HISTORY) {
    history.splice(MAX_LOCAL_HISTORY);
  }

  // 保存到localStorage
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save local history:', error);
  }

  return newItem;
}

// 删除本地历史记录
export function deleteLocalHistoryItem(id: string): boolean {
  const history = getLocalHistory();
  const filtered = history.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete local history item:', error);
    return false;
  }
}

// 清空本地历史记录
export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear local history:', error);
  }
}

// 搜索本地历史记录
export function searchLocalHistory(searchTerm: string): LocalHistoryItem[] {
  const history = getLocalHistory();
  if (!searchTerm) return history;
  
  return history.filter(item =>
    item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// ==================== 远程存储函数 ====================

// 保存历史记录到远程
export async function saveHistoryItem(
  prompt: string,
  imageFile: File,
  schema: FormilySchema,
  processingTime: number
): Promise<HistoryItem> {
  const id = generateId();
  const timestamp = Date.now();

  // 上传图片到 Blob Storage
  const blob = await put(`images/${id}-${imageFile.name}`, imageFile, {
    access: 'public',
  });

  // 创建历史记录项
  const historyItem: HistoryItem = {
    id,
    timestamp,
    prompt,
    inputImageUrl: blob.url,
    generatedSchema: schema,
    metadata: {
      imageSize: imageFile.size,
      processingTime,
      success: true,
      originalFileName: imageFile.name,
    },
  };

  // 保存到 KV
  await kv.set(`${HISTORY_PREFIX}${id}`, historyItem);
  
  // 添加到索引
  await kv.zadd(HISTORY_INDEX, { score: timestamp, member: id });

  return historyItem;
}

// 获取历史记录列表（远程）
export async function getHistoryList(params: HistoryQueryParams = {}): Promise<HistoryResponse> {
  const { page = 1, limit = 12, search = '', success } = params;
  const offset = (page - 1) * limit;

  // 获取所有ID（按时间倒序）
  let ids = await kv.zrange(HISTORY_INDEX, 0, -1, { rev: true });
  
  // 如果有搜索条件，先过滤ID
  if (search || success !== undefined) {
    const filteredIds: string[] = [];
    for (const id of ids) {
      const item = await kv.get<HistoryItem>(`${HISTORY_PREFIX}${id}`);
      if (item) {
        const matchesSearch = !search || 
          item.prompt.toLowerCase().includes(search.toLowerCase());
        const matchesSuccess = success === undefined || item.metadata?.success === success;
        
        if (matchesSearch && matchesSuccess) {
          filteredIds.push(id);
        }
      }
    }
    ids = filteredIds;
  }

  const total = ids.length;
  const paginatedIds = ids.slice(offset, offset + limit);

  // 获取详细信息
  const items: HistoryListItem[] = [];
  for (const id of paginatedIds) {
    const item = await kv.get<HistoryItem>(`${HISTORY_PREFIX}${id}`);
    if (item) {
      items.push({
        id: item.id,
        timestamp: item.timestamp,
        prompt: item.prompt,
        inputImageUrl: item.inputImageUrl,
        promptPreview: item.prompt.length > 100 
          ? item.prompt.substring(0, 100) + '...' 
          : item.prompt,
        success: item.metadata?.success ?? true,
      });
    }
  }

  return {
    items,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  };
}

// 获取单个历史记录（远程）
export async function getHistoryItem(id: string): Promise<HistoryItem | null> {
  return await kv.get<HistoryItem>(`${HISTORY_PREFIX}${id}`);
}

// 删除历史记录（远程）
export async function deleteHistoryItem(id: string): Promise<boolean> {
  const item = await kv.get<HistoryItem>(`${HISTORY_PREFIX}${id}`);
  if (!item) {
    return false;
  }

  // 删除图片
  try {
    await del(item.inputImageUrl);
  } catch (error) {
    console.error('Failed to delete blob:', error);
  }

  // 删除KV记录
  await kv.del(`${HISTORY_PREFIX}${id}`);
  
  // 从索引中删除
  await kv.zrem(HISTORY_INDEX, id as string);

  return true;
}

// 获取统计信息（远程）
export async function getHistoryStats() {
  const total = await kv.zcard(HISTORY_INDEX);
  const successCount = await kv.zcard(HISTORY_INDEX); // 简化版本，实际应该统计成功数量
  
  return {
    total,
    successCount,
    failureCount: total - successCount,
  };
} 