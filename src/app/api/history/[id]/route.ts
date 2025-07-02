import { NextRequest, NextResponse } from 'next/server';
import { getHistoryItem, deleteHistoryItem } from '@/lib/history';

// GET /api/history/[id] - 获取单个历史记录
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      );
    }

    const historyItem = await getHistoryItem(id);
    
    if (!historyItem) {
      return NextResponse.json(
        { error: 'History item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(historyItem);
  } catch (error) {
    console.error('Failed to get history item:', error);
    return NextResponse.json(
      { error: 'Failed to get history item' },
      { status: 500 }
    );
  }
}

// DELETE /api/history/[id] - 删除历史记录
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteHistoryItem(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'History item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete history item:', error);
    return NextResponse.json(
      { error: 'Failed to delete history item' },
      { status: 500 }
    );
  }
} 