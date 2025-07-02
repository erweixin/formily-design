import type { HistoryRecord } from '@/types';

const HISTORY_STORAGE_KEY = 'formily_history';
const MAX_HISTORY_COUNT = 10;

export class HistoryManager {
  static getHistory(): HistoryRecord[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  static addHistory(record: Omit<HistoryRecord, 'id' | 'createdAt'>): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getHistory();
      const newRecord: HistoryRecord = {
        ...record,
        id: this.generateId(),
        createdAt: Date.now(),
      };

      // 添加到开头
      history.unshift(newRecord);

      // 限制数量
      if (history.length > MAX_HISTORY_COUNT) {
        history.splice(MAX_HISTORY_COUNT);
      }

      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  static removeHistory(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getHistory();
      const filtered = history.filter(record => record.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove history:', error);
    }
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  static getHistoryById(id: string): HistoryRecord | null {
    const history = this.getHistory();
    return history.find(record => record.id === id) || null;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 