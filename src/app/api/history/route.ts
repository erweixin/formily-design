import { NextRequest, NextResponse } from 'next/server';
import { getHistoryList, saveHistoryItem } from '@/lib/history';

// GET /api/history - 获取历史记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const success = searchParams.get('success');
    
    const params = {
      page,
      limit,
      search,
      success: success ? success === 'true' : undefined,
    };

    const result = await getHistoryList(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get history list:', error);
    return NextResponse.json(
      { error: 'Failed to get history list' },
      { status: 500 }
    );
  }
}

// POST /api/history - 保存新的历史记录
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File;
    const schema = JSON.parse(formData.get('schema') as string);
    const processingTime = parseInt(formData.get('processingTime') as string);

    if (!prompt || !imageFile || !schema) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const historyItem = await saveHistoryItem(
      prompt,
      imageFile,
      schema,
      processingTime
    );

    return NextResponse.json(historyItem);
  } catch (error) {
    console.error('Failed to save history item:', error);
    return NextResponse.json(
      { error: 'Failed to save history item' },
      { status: 500 }
    );
  }
} 