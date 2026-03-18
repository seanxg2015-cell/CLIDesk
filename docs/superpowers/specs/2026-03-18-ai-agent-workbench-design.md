# AI Agent 工作台 - 设计文档

**版本**: 3.0  
**日期**: 2026-03-18  
**状态**: 待评审

---

## 1. 产品定位

**AI Agent 工作台** - 基于 Cherry Studio 定制的团队 AI 协作平台，聚焦软件开发团队场景。

**核心价值**：
- 降低 AI 使用门槛，让产品、设计、测试、运维等非开发角色高效使用 AI
- Skill 市场机制，类 OpenCode，管理员统一配置 Skill，用户自主选择
- 管理员集中管控企业 AI 能力，保障合规

---

## 2. 阶段规划

### 阶段一：快速 Demo
基于 Cherry Studio 进行定制，验证核心功能：
- 用户切换 + 管理员配置
- Agent 管理
- Skill 市场 + 用户选择
- 聚焦软件开发团队场景

### 阶段二：团队协作
增加后台服务：
- 企业 SSO 登录
- 用户/团队管理
- 数据同步

---

## 3. 用户系统

### 3.1 角色

| 角色 | 说明 |
|------|------|
| **管理员** | 企业内部指定，负责配置公共 Agent、公共 Skill、AI 能力 |
| **普通成员** | 使用公共 Agent、选择 Skill、创建个人 Skill |

### 3.2 管理员指定

通过配置文件指定管理员：

```json
// config/admin-config.json
{
  "adminUsers": [
    "user-id-1",
    "user-id-2"
  ],
  "organizationName": "XXX 技术团队"
}
```

### 3.3 用户切换

简单用户切换器（本地存储）：
- 点击头像/名称打开下拉菜单
- 选择用户切换
- 新用户添加后自动进入

---

## 4. Agent 系统

### 4.1 权限策略

| 操作 | 管理员 | 普通成员 |
|------|--------|----------|
| 创建 Agent | ✅ | ❌ |
| 编辑 Agent | ✅ | ❌ |
| 删除 Agent | ✅ | ❌ |
| 使用 Agent | ✅ | ✅ |

**原则**：管理员统一管控 Agent，成员仅可使用。

### 4.2 预置 Agent（聚焦软件开发团队）

| 类别 | Agent 示例 |
|------|-----------|
| **开发** | 代码审查、单元测试生成、代码解释、技术文档 |
| **产品** | PRD 撰写、需求分析、用户故事、竞品对比 |
| **测试** | 测试用例生成、测试报告、回归测试分析 |
| **运维** | 部署脚本、日志分析、故障排查、服务器配置 |
| **通用** | 翻译助手、会议纪要、总结归纳 |

### 4.3 Agent 配置

```json
{
  "name": "测试工程师",
  "description": "专业的测试工程师助手",
  "avatar": "🧪",
  "systemPrompt": "你是一个专业的测试工程师...",
  "model": "gpt-4o",
  "temperature": 0.7,
  "tools": ["web-search"]
}
```

---

## 5. Skill 系统

### 5.1 什么是 Skill？

Skill 定义了 Agent 的**扩展能力**，类 OpenCode 模式，按需加载。

| | Agent | Skill |
|--|-------|-------|
| **定位** | 角色定位 | 具体能力 |
| **使用方式** | 选择使用 | 自动/手动触发 |

### 5.2 Skill 定义

```json
{
  "name": "代码审查",
  "description": "对代码进行安全性和质量审查",
  "icon": "🔍",
  "trigger": {
    "manual": true,
    "autoKeywords": [
      "帮我看看这段代码",
      "review",
      "审查代码"
    ]
  },
  "instruction": "你是一个专业的代码审查助手...",
  "steps": [
    "检查 SQL 注入风险",
    "检查 XSS 漏洞",
    "检查敏感信息泄露",
    "检查代码规范"
  ]
}
```

### 5.3 Skill 触发方式

| 方式 | 说明 | 示例 |
|------|------|------|
| **手动触发** | 用户输入 `/skillName` | `/代码审查` |
| **自动触发** | Agent 根据上下文 + 用户已选 Skill 自动调用 | 用户发送代码 → 自动触发 |

### 5.4 Skill 可见性

| 创建者 | 可见范围 |
|--------|----------|
| **管理员** | 所有人（公共 Skill） |
| **普通成员** | 仅自己 + 可选择共享给团队 |

---

## 6. Skill 市场

### 6.1 用户旅程

```
1. 管理员创建公共 Skill
    ↓
2. 用户在 Skill 市场浏览/搜索
    ↓
3. 用户选择需要的 Skill（启用/禁用）
    ↓
4. 使用 Agent 时，只调用已选择的 Skill
```

### 6.2 Skill 市场界面

```
┌─────────────────────────────────────────────────┐
│  Skill 市场                                      │
├─────────────────────────────────────────────────┤
│  🔍 搜索 Skill...                               │
├─────────────────────────────────────────────────┤
│  ☑ 代码审查        [已启用]  管理员 · 公共       │
│     对代码进行安全性和质量审查                    │
│                                                │
│  ☑ API 文档生成    [已启用]  管理员 · 公共       │
│     生成规范的 API 文档                          │
│                                                │
│  ☐ 日志分析        [未启用]  张三 · 共享          │
│     分析日志，定位问题                           │
│                                                │
│  ☐ 部署检查        [未启用]  李四 · 个人          │
│     检查部署脚本是否正确                         │
└─────────────────────────────────────────────────┘
```

### 6.3 权限矩阵

| 操作 | 管理员 | 普通成员 |
|------|--------|----------|
| **Agent** |
| 创建/编辑/删除 Agent | ✅ | ❌ |
| 使用 Agent | ✅ | ✅ |
| **Skill** |
| 创建公共 Skill | ✅ | ❌ |
| 创建个人 Skill | ✅ | ✅ |
| 共享个人 Skill | ✅ | ✅ |
| **Skill 市场** |
| 在 Skill 市场选择 Skill | ✅ | ✅ |
| 管理公共 Skill | ✅ | ❌ |
| **其他** |
| 快捷短语（个人） | ✅ | ✅ |
| AI 配置 | ✅ | ❌ |
| 用户管理 | ✅ | ❌ |

---

## 7. 页面结构

### 7.1 普通成员界面

```
┌─────────────────────────────────────────────────┐
│  Logo  │  Agent市场  │  会话  │ Skill市场  │ 设置 │
└─────────────────────────────────────────────────┘

├── Agent 市场
│   └── 浏览/使用公共 Agent
├── 会话聊天
│   ├── 消息输入
│   ├── 文件上传（文档处理）
│   └── 快捷短语
├── Skill 市场      ← 用户选择需要的 Skill
└── 快捷助手/划词助手
```

### 7.2 管理员界面

```
┌──────────────────────────────────────────────────────────────────┐
│  Logo  │  Agent市场  │  会话  │ Skill市场  │ 设置  │  管理后台  │
└──────────────────────────────────────────────────────────────────┘

├── Agent 市场
├── 会话聊天
├── Skill 市场
└── 管理后台
    ├── 公共 Agent 管理
    │   └── 创建/编辑 Agent
    ├── 公共 Skill 管理
    │   └── 创建/编辑公共 Skill
    ├── AI 配置
    │   ├── Provider 管理
    │   ├── 模型管理
    │   └── MCP Server
    ├── 快捷短语（公共）
    ├── 全局记忆配置
    └── 用户管理
```

---

## 8. 数据库设计

### 8.1 表结构

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    is_admin BOOLEAN DEFAULT false,
    organization_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent 表
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar VARCHAR(50),
    type VARCHAR(20) DEFAULT 'public',
    owner_id UUID REFERENCES users(id),
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill 表
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    trigger_config JSONB NOT NULL,
    instruction TEXT NOT NULL,
    steps JSONB,
    owner_id UUID REFERENCES users(id),
    is_shared BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户选择的 Skill（用户自选列表）
CREATE TABLE user_selected_skills (
    user_id UUID REFERENCES users(id),
    skill_id UUID REFERENCES skills(id),
    PRIMARY KEY (user_id, skill_id)
);

-- 快捷短语
CREATE TABLE quick_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 ER 关系

```
┌──────────┐       ┌──────────┐
│   User   │───────│  Agent   │
└──────────┘       └──────────┘
      │
      │      ┌──────────┐
      ├──────│  Skill   │
      │      └──────────┘
      │            │
      └───── user_selected_skills (用户自选)
```

---

## 9. 技术实现

### 9.1 复用 Cherry Studio

| 功能 | 复用方式 |
|------|----------|
| Agent 系统 | 直接复用 |
| MCP 集成 | 直接复用 |
| 知识库/RAG | 直接复用 |
| 全局记忆 | 直接复用 |
| 文档处理 | 直接复用 |
| 划词助手 | 直接复用 |
| 快捷助手 | 直接复用 |
| 会话聊天 | 直接复用 |

### 9.2 需要开发

| 功能 | 说明 |
|------|------|
| 用户切换 | 本地存储、界面切换 |
| 管理后台 | Agent/Skill CRUD |
| Skill 市场 | 浏览、选择/取消 Skill |
| 界面区分 | 管理员 vs 成员菜单 |
| Skill 上下文注入 | 将用户选择的 Skill 注入对话 |

### 9.3 配置扩展

```json
{
  "organization": {
    "name": "XXX 技术团队",
    "adminUsers": ["user-id-1"]
  }
}
```

---

## 10. 后续扩展

- [ ] 企业 SSO 登录（Microsoft Entra ID）
- [ ] 后端服务（用户管理、权限控制、数据同步）
- [ ] Jira 集成
- [ ] 使用统计与审计
