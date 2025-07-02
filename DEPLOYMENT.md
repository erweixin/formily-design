# 部署说明

## 环境变量配置

在 Vercel 部署时，需要配置以下环境变量：

### 必需的环境变量

1. **OPENROUTER_API_KEY**
   - 从 [OpenRouter](https://openrouter.ai/) 获取 API 密钥
   - 用于调用 AI 模型生成 schema

### Vercel 存储配置

部署到 Vercel 时，会自动配置以下存储服务：

1. **Vercel KV (Redis)**
   - 用于存储历史记录的元数据
   - 自动配置相关环境变量

2. **Vercel Blob Storage**
   - 用于存储上传的图片文件
   - 自动配置相关环境变量

## 部署步骤

1. **Fork 或克隆项目**
   ```bash
   git clone <repository-url>
   cd formily-design
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   - 复制 `.env.local.example` 为 `.env.local`
   - 填入你的 OpenRouter API 密钥

4. **本地测试**
   ```bash
   npm run dev
   ```

5. **部署到 Vercel**
   - 将代码推送到 GitHub
   - 在 Vercel 中导入项目
   - 配置环境变量 `OPENROUTER_API_KEY`
   - 部署

## 功能说明

### 历史记录功能

- **自动保存**: 每次生成 schema 时自动保存到历史记录
- **图片存储**: 使用 Vercel Blob Storage 存储图片
- **元数据存储**: 使用 Vercel KV 存储历史记录元数据
- **搜索筛选**: 支持按提示词搜索和成功/失败状态筛选
- **对比查看**: 支持查看原始图片和生成结果的对比

### API 端点

- `POST /api/generate-schema` - 生成 schema（支持 JSON 和 FormData）
- `GET /api/history` - 获取历史记录列表
- `POST /api/history` - 保存历史记录
- `GET /api/history/[id]` - 获取单个历史记录
- `DELETE /api/history/[id]` - 删除历史记录

### 页面路由

- `/` - 主页面（表单生成器）
- `/history` - 历史记录列表页面
- `/history/[id]` - 历史记录详情页面

## 注意事项

1. **API 限制**: OpenRouter API 有调用次数限制，请合理使用
2. **存储限制**: Vercel KV 和 Blob Storage 有免费额度限制
3. **图片格式**: 支持常见的图片格式（JPG、PNG、GIF 等）
4. **文件大小**: 建议图片大小不超过 10MB

## 故障排除

### 常见问题

1. **API 密钥错误**
   - 检查 `OPENROUTER_API_KEY` 是否正确配置
   - 确认 API 密钥有效且有足够余额

2. **存储服务错误**
   - 检查 Vercel 项目是否正确配置了 KV 和 Blob Storage
   - 确认环境变量是否正确设置

3. **图片上传失败**
   - 检查图片格式是否支持
   - 确认图片大小是否在限制范围内

### 调试模式

在开发环境中，可以查看浏览器控制台和 Vercel 函数日志来调试问题。 