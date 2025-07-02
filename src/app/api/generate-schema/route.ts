import { NextRequest, NextResponse } from 'next/server';
import type { GenerateSchemaRequest, GenerateSchemaResponse } from '@/types';
import { saveHistoryItem } from '@/lib/history';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let imageFile: File | null = null;
  let imageBase64: string | null = null;
  let prompt: string | null = null;

  try {
    // 检查Content-Type来决定如何处理请求
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // 处理FormData（包含文件）
      const formData = await request.formData();
      imageFile = formData.get('image') as File;
      prompt = formData.get('prompt') as string;
      
      if (!imageFile) {
        return NextResponse.json(
          { success: false, error: '图片和提示词都是必需的' },
          { status: 400 }
        );
      }

      // 将File转换为base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = buffer.toString('base64');
    } else {
      // 处理JSON（兼容原有格式）
      const body: GenerateSchemaRequest = await request.json();
      imageBase64 = body.image;
      prompt = body.prompt;

      if (!imageBase64) {
        return NextResponse.json(
          { success: false, error: '图片和提示词都是必需的' },
          { status: 400 }
        );
      }
    }

    // 这里需要配置你的 OpenRouter API 密钥
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API 密钥未配置' },
        { status: 500 }
      );
    }

    // 构建发送给 OpenRouter 的提示词
    const systemPrompt = `你是一个专业的 formily 表单设计专家。请根据用户上传的图片和描述，生成一个符合 Formily 2.x 规范的 JSON Schema。

要求：
1. 生成的 schema 必须是有效的 JSON 格式
2. 使用 Formily 2.x 的 schema 规范
3. 根据图片内容推断表单字段类型和布局
5. 添加适当的验证规则
6. 返回的 JSON 不要包含任何解释文字，只返回 schema 对象
7. 组件是使用的 @formily/antd-v5
8. 使用 FormGrid 和 FormLayout 来完成布局，特别注意 FormLayout 的 layout 属性来控制 layout mode, 请保证布局的 100% 正确。
9. 如果某个 select 字段选择项来源于服务端，且声明 dictKey，则为该字段增加 'x-reactions': [
          '{{useFieldUnitDictSource({「dictKey」)}}',
        ],
10. properties 使用英文替换
11. 要保证必填项的展示正确
12. 详细区分 RadioGroup 的 optionType

使用的组件如下：
  components: {
    FormItem,
    Input,
    Select,
    DatePicker,
    Switch,
    Radio,
    RadioGroup: Radio.Group,
    Checkbox,
    CheckboxGroup: Checkbox.Group,
    NumberPicker,
    Upload,
    Transfer,
    Cascader,
    TimePicker,
    TreeSelect,
    FormGrid,
    FormButtonGroup,
    FormCollapse,
    FormTab,
    FormLayout,
    FormStep,
    TextArea: Input.TextArea,
  },

示例格式：
{
  "type": "object",
  "properties": {
    "fieldName": {
      "type": "string",
      "title": "字段标题",
      "x-decorator": "FormItem",
      "x-component": "Input"
    }
  }
}`;

    // 多模态 user prompt
    const userPromptContent = [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${imageBase64}`
        }
      },
      {
        type: 'text',
        text: `图片描述：${prompt}\n\n请根据以上描述生成 Formily 2.x 的 schema。`
      }
    ];

    // 调用 OpenRouter API (gpt-4o)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Formily Design'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-4-sonnet-20250522',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPromptContent
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('OpenRouter API 返回内容为空');
    }

    // 尝试解析返回的 JSON
    let schema;
    try {
      // 提取 JSON 部分（去除可能的 markdown 代码块标记）
      const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedContent.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, generatedContent];
      
      const jsonString = jsonMatch[1] || generatedContent;
      schema = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      throw new Error('生成的 schema 格式无效');
    }

    const processingTime = Date.now() - startTime;

    // 保存到历史记录（如果有文件的话）
    if (imageFile) {
      try {
        await saveHistoryItem(prompt, imageFile, schema, processingTime);
      } catch (historyError) {
        console.error('保存历史记录失败:', historyError);
        // 不阻止主要流程，只记录错误
      }
    }

    const result: GenerateSchemaResponse = {
      schema,
      success: true
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('生成 schema 时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
} 