# AI Agent 工作台 - 设计文档

**版本**: 1.0  
**日期**: 2026-03-18  
**状态**: 待评审

---

## 1. 产品定位

**AI Agent 工作台** - 面向软件开发团队的一站式 Agent 平台，通过预设的 Agent 能力帮助产品经理、设计师、测试工程师、运维人员等非开发角色高效完成日常工作。

**核心价值**：
- 降低 AI 使用门槛，让非技术人员也能高效使用 AI
- 统一管理企业 AI 能力，保障数据安全
- 沉淀团队知识，提供个性化 Agent 服务

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue 3 前端                              │
│         (会话界面 / Agent 市场 / 个人 Agent 管理)             │
│                    http://localhost:5173                      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Java Spring Boot 后端                        │
│      (用户管理 / 会话管理 / Agent 配置 / 权限控制)            │
│                        :8080                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │ User模块    │  │ Session模块 │  │ Agent模块        │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js AI Service                        │
│         (复用 @cherrystudio/ai-core)                        │
│                     Agent调度 / 中间件                       │
│                        :3000                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │ Provider    │  │ Middleware  │  │ 流式输出(SSE)   │    │
│  │ (Copilot/   │  │ (日志/重试/ │  │                 │    │
│  │  OpenAI等)  │  │  错误处理)  │  │                 │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + TypeScript + Vite + Pinia + TailwindCSS | SPA 单页应用 |
| 后端 | Java Spring Boot 3 + MyBatis-Plus | REST API 服务 |
| AI 层 | Node.js + Express + @cherrystudio/ai-core | AI 能力封装 |
| 数据库 | PostgreSQL + pgvector | 结构化数据 + 向量存储 |
| 缓存 | Redis（可选） | 会话缓存、分布式锁 |
| 部署 | Docker Compose | 容器化部署 |

### 2.3 关键路径别名

| 别名 | 指向 |
|------|------|
| - | - |

---

## 3. 功能模块

### 3.1 用户与认证

**登录方式**：
- **SSO（主）** - Microsoft Entra ID 企业账号登录
- **邮箱密码（备）** - 备用入口 + 外部协作者

**权限模型**：

| 角色 | 权限 |
|------|------|
| 管理员 | 管理公共 Agent、组织成员、系统配置 |
| 普通成员 | 使用 Agent、创建个人 Agent |

**数据库表**：

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- SSO用户可为空
    name VARCHAR(100),
    external_id VARCHAR(255),     -- SSO提供商用户ID
    role VARCHAR(20) DEFAULT 'member',
    organization_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 组织表
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 组织成员关联
CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_id, user_id)
);

-- SSO配置表（预留）
CREATE TABLE sso_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,  -- 'azure_ad', 'okta', etc.
    config JSONB,
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Agent 管理

**Agent 类型**：

| 类型 | 创建者 | 可见范围 |
|------|--------|----------|
| 公共 Agent | 管理员 | 全组织成员 |
| 个人 Agent | 普通成员 | 仅创建者 |

**数据库表**：

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar VARCHAR(500),        -- 头像URL
    type VARCHAR(20) DEFAULT 'public',  -- 'public' | 'personal'
    owner_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    config JSONB NOT NULL,      -- Agent配置（含system prompt、model等）
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Agent 配置结构** (JSONB)：

```json
{
  "systemPrompt": "你是一个专业的技术文档助手...",
  "model": "openai/gpt-4o",
  "temperature": 0.7,
  "maxTokens": 4096,
  "tools": ["web-search", "code-executor"],
  "plugins": []
}
```

### 3.3 会话管理

**功能**：
- 创建/查询/删除会话
- 消息持久化
- 流式响应（SSE）

**数据库表**：

```sql
-- 会话表
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    role VARCHAR(20) NOT NULL,  -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,
    metadata JSONB,             -- 附件、模型信息等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 AI 调用

**与 Node.js AI Service 接口**：

```typescript
// 聊天请求
POST /ai/chat
Content-Type: application/json

{
  "agentId": "uuid",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "你好" }
  ],
  "stream": true
}

// 响应 (SSE)
data: {"type": "delta", "content": "你好"}
data: {"type": "delta", "content": "，有什么"}
data: [DONE]

// 获取可用模型
GET /ai/models

// 测试Provider连接
POST /ai/providers/test
```

**Java 后端调用 AI Service**：

```java
@Service
public class AiService {
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    public Flux<String> chat(ChatRequest request) {
        return webClient.post()
            .uri(aiServiceUrl + "/ai/chat")
            .bodyValue(request)
            .retrieve()
            .bodyToFlux(String.class);
    }
}
```

---

## 4. 前端页面

### 4.1 页面结构

```
├── 登录页
│   └── SSO登录 / 邮箱密码登录
├── Agent 市场
│   └── Agent列表 / 搜索 / 收藏
├── 会话聊天（主界面）
│   └── Agent选择 / 消息输入 / 文件上传
├── 个人 Agent
│   └── 我的Agent列表 / 创建 / 编辑
└── 管理后台
    ├── 公共Agent管理
    └── 用户管理
```

### 4.2 核心页面说明

**Agent 市场**：
- 展示所有公共 Agent
- 支持按名称、功能搜索
- 点击进入对应 Agent 聊天

**会话聊天**：
- 左侧：Agent 选择 + 会话列表
- 中间：消息流（Markdown 渲染、代码高亮）
- 右侧：Agent 配置面板

**个人 Agent 管理**：
- 创建新 Agent（填写名称、描述、配置）
- 编辑已有 Agent
- 删除 Agent

---

## 5. Node.js AI Service 设计

### 5.1 复用能力

| 能力 | 来源 | 说明 |
|------|------|------|
| Provider 管理 | @cherrystudio/ai-core | 支持 Copilot、OpenAI、Claude 等 |
| 中间件链 | @cherrystudio/ai-core | 日志、重试、错误处理 |
| Agent 调度 | @cherrystudio/ai-core | 解析配置、组装 system prompt |
| 流式输出 | @cherrystudio/ai-core | SSE 实时推送 |

### 5.2 Provider 配置

```typescript
// 支持的 Provider
const providers = {
  copilot: {
    auth: 'oauth',  // 用户各自的 OAuth token
    models: ['gpt-4o', 'gpt-4o-mini']
  },
  openai: {
    apiKey: 'org-xxx',  // 企业 API Key
    models: ['gpt-4o', 'gpt-4o-mini']
  }
};
```

### 5.3 与企业 AI 账号对接

**GitHub Copilot OAuth 流程**：

```
用户授权 Copilot
    ↓
获取用户 Access Token
    ↓
Token 存入用户会话/Redis
    ↓
AI 请求时携带 Token 调用 Copilot API
```

---

## 6. 部署方案

### 6.1 Docker Compose

```yaml
version: '3.8'

services:
  # Vue 前端
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  # Java 后端
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - REDIS_HOST=redis
      - AI_SERVICE_URL=http://ai-service:3000
    depends_on:
      - postgres
      - redis
      - ai-service

  # Node.js AI Service
  ai-service:
    build: ./ai-service
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ai-service/config:/app/config

  # PostgreSQL
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_DB=ai_agent_workbench
      - POSTGRES_USER=xxx
      - POSTGRES_PASSWORD=xxx
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis (可选)
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 6.2 环境变量

**Java 后端**：

| 变量 | 说明 | 示例 |
|------|------|------|
| DB_HOST | 数据库地址 | postgres |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | ai_agent_workbench |
| DB_USER | 数据库用户 | xxx |
| DB_PASSWORD | 数据库密码 | xxx |
| AI_SERVICE_URL | AI Service 地址 | http://ai-service:3000 |
| JWT_SECRET | JWT 密钥 | xxx |
| SSO_AZURE_CLIENT_ID | Azure AD 应用ID | xxx |
| SSO_AZURE_CLIENT_SECRET | Azure AD 密钥 | xxx |
| SSO_AZURE_TENANT_ID | Azure AD 租户ID | xxx |

**Node.js AI Service**：

| 变量 | 说明 | 示例 |
|------|------|------|
| NODE_ENV | 环境 | production |
| OPENAI_API_KEY | OpenAI API Key | sk-xxx |
| COPILOT_CLIENT_ID | Copilot Client ID | xxx |
| COPILOT_CLIENT_SECRET | Copilot Client Secret | xxx |

---

## 7. 安全考虑

- JWT Token 认证，过期自动刷新
- 数据库密码加密存储
- AI Provider API Keys 不暴露给前端
- CORS 配置限制
- 输入验证（防止注入）
- 敏感操作日志记录

---

## 8. 后续扩展

- [ ] SSO 集成（Microsoft Entra ID）
- [ ] Jira 集成（创建工单、同步状态）
- [ ] 知识库功能（向量检索）
- [ ] 使用统计与审计
- [ ] Slack/飞书通知集成

---

## 9. TODO

- [ ] 编写详细 API 文档
- [ ] 设计 Agent 配置 UI
- [ ] 实现 SSO 集成
- [ ] 编写部署文档
