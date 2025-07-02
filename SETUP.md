# Formily 表单生成器 - 设置说明

## 环境配置

### 1. OpenRouter API 密钥配置

1. 访问 [OpenRouter](https://openrouter.ai/) 注册账号
2. 获取你的 API 密钥
3. 在项目根目录创建 `.env.local` 文件，内容如下：

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

请将 `your_openrouter_api_key_here` 替换为你的实际 API 密钥。

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

## 功能说明

1. **图片上传**：支持拖拽或点击上传图片
2. **需求描述**：输入你想要生成的表单类型和字段
3. **AI 生成**：调用 OpenRouter API 生成 Formily 2.x schema
4. **结果展示**：在抽屉中查看生成的代码和表单预览

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Formily 2.x
- Ant Design v5
- Radix UI
- OpenRouter API 