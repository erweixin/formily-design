 
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

export interface HistoryRecord {
  id: string;
  image: string; // base64 图片
  prompt: string;
  schema: FormilySchema;
  createdAt: number;
  success: boolean;
} 