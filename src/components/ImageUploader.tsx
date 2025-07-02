'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UploadedImage } from '@/types';

interface ImageUploaderProps {
  onImageChange: (image: UploadedImage | null) => void;
}

export function ImageUploader({ onImageChange }: ImageUploaderProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const imageData: UploadedImage = { file, preview };
      setUploadedImage(imageData);
      onImageChange(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processFile(file);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          uploadedImage
            ? 'border-blue-500 bg-blue-50/10'
            : isDragOver
            ? 'border-blue-400 bg-blue-50/20 scale-105'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: uploadedImage ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {uploadedImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              <img
                src={uploadedImage.preview}
                alt="上传的图片"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <motion.button
                onClick={handleRemoveImage}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <motion.div
                animate={{ 
                  scale: isDragOver ? 1.1 : 1,
                  rotate: isDragOver ? 5 : 0 
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ImageIcon className="mx-auto h-16 w-16 text-slate-400" />
              </motion.div>
              <div className="space-y-3">
                <p className="text-lg font-medium text-slate-200">
                  {isDragOver ? '释放图片以上传' : '拖拽图片到此处'}
                </p>
                <p className="text-sm text-slate-400">
                  或{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    点击上传
                  </button>
                </p>
                <p className="text-xs text-slate-500">
                  支持 JPG、PNG、GIF 格式，最大 5MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 