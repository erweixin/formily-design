'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X, Code, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SchemaCodeTab } from './SchemaCodeTab';
import { FormPreviewTab } from './FormPreviewTab';
import type { FormilySchema } from '@/types';

interface SchemaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: FormilySchema | null;
}

export function SchemaDrawer({ isOpen, onClose, schema }: SchemaDrawerProps) {
  if (!schema) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay
                asChild
                forceMount
              >
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                forceMount
              >
                <motion.div
                  className="fixed right-0 top-0 h-full w-[900px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <Dialog.Title className="text-xl font-semibold text-slate-200">
                        生成的 Schema
                      </Dialog.Title>
                    </div>
                    <motion.button
                      onClick={onClose}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} className="text-slate-400" />
                    </motion.button>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-hidden">
                    <Tabs.Root defaultValue="code" className="h-full flex flex-col">
                      <Tabs.List className="flex space-x-1 border-b border-slate-700 mb-6">
                        <Tabs.Trigger
                          value="code"
                          className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 transition-all duration-200"
                        >
                          <Code size={16} />
                          <span>Schema 代码</span>
                        </Tabs.Trigger>
                        <Tabs.Trigger
                          value="preview"
                          className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400 transition-all duration-200"
                        >
                          <Eye size={16} />
                          <span>表单预览</span>
                        </Tabs.Trigger>
                      </Tabs.List>
                      
                      <Tabs.Content value="code" className="flex-1 overflow-hidden">
                        <SchemaCodeTab schema={schema} />
                      </Tabs.Content>
                      
                      <Tabs.Content value="preview" className="flex-1 overflow-hidden">
                        <FormPreviewTab schema={schema} />
                      </Tabs.Content>
                    </Tabs.Root>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 