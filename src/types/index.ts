export interface FormilySchema {
  type: 'object';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GenerateSchemaRequest {
  image: string; // base64 编码的图片
  prompt: string;
}

export interface GenerateSchemaResponse {
  schema: FormilySchema;
  success: boolean;
  error?: string;
}

export interface UploadedImage {
  file: File;
  preview: string;
}

// 本地历史记录（主页面使用）
export interface LocalHistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  image: string; // base64 图片
  schema: FormilySchema | null; // 生成成功时有 schema，失败时为 null
  success: boolean;
}

// 远程历史记录（历史页面使用）
export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  inputImageUrl: string; // Vercel Blob URL
  generatedSchema: FormilySchema;
  metadata?: {
    imageSize: number;
    processingTime: number;
    success: boolean;
    originalFileName?: string;
  };
}

// 历史记录列表项（用于列表展示）
export interface HistoryListItem {
  id: string;
  timestamp: number;
  prompt: string;
  inputImageUrl: string;
  promptPreview: string; // 截取的prompt预览
  success: boolean;
}

// 历史记录查询参数
export interface HistoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  success?: boolean;
}

// 历史记录响应
export interface HistoryResponse {
  items: HistoryListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 保留原有的类型以保持兼容性
export interface HistoryRecord {
  id: string;
  image: string; // base64 图片
  prompt: string;
  schema: FormilySchema;
  createdAt: number;
  success: boolean;
} 