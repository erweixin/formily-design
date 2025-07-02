'use client';

import { FormRenderer } from './FormRenderer';
import type { FormilySchema } from '@/types';

interface FormPreviewTabProps {
  schema: FormilySchema;
}

export function FormPreviewTab({ schema }: FormPreviewTabProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">表单预览</h3>
        <p className="text-sm text-gray-600 mt-1">
          基于生成的 schema 实时渲染的表单，你可以进行交互测试
        </p>
      </div>
      
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-auto">
        <FormRenderer schema={schema} />
      </div>
    </div>
  );
} 