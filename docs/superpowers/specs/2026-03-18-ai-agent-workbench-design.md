# AI Agent 工作台 - 设计文档

**版本**: 2.0  
**日期**: 2026-03-18  
**状态**: 待评审

---

## 1. 产品定位

**AI Agent 工作台** - 基于 Cherry Studio 定制的团队 AI 协作平台，聚焦软件开发团队场景。

**核心价值**：
- 降低 AI 使用门槛，让产品、设计、测试、运维等非开发角色高效使用 AI
- 通过 Agent + Skill 机制，管理员统一配置，成员个性化调整
- 管理员集中管控企业 AI 能力，保障合规

---

## 2. 阶段规划

### 阶段一：快速 Demo
基于 Cherry Studio 进行定制，验证核心功能：
- 用户切换 + 管理员配置
- Agent + Skill 管理
- 个人化 Skill 挂载
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
| **普通成员** | 使用公共 Agent、创建个人 Skill、个性化 Skill 挂载 |

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
| 为 Agent 预设默认 Skill | ✅ | ❌ |
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
  "defaultTools": ["web-search"],
  "defaultSkills": ["skill-id-1", "skill-id-2"]
}
```

---

## 5. Skill 系统

### 5.1 什么是 Skill？

Skill 定义了 Agent 的**扩展能力**，可被 Agent 挂载使用。

| | Agent | Skill |
|--|-------|-------|
| **定位** | 角色定位 | 具体能力 |
| **数量** | 通常 1 个 | 可挂载多个 |
| **配置** | system prompt、默认模型 | 触发条件、执行步骤 |

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
| **自动触发** | Agent 根据上下文自动调用 | 用户发送代码 → 自动触发 |

### 5.4 Skill 可见性

| 创建者 | 可见范围 |
|--------|----------|
| **管理员** | 所有人（公共 Skill） |
| **普通成员** | 仅自己 + 可选择共享给团队 |

### 5.5 Agent 与 Skill 挂载

#### 管理员预设

```
Agent: 测试工程师
├── 默认 Skill: 代码审查、API 文档生成
└── 成员继承此默认值
```

#### 成员个性化

```
用户 A 的个性化挂载
├── 继承默认: 代码审查、API 文档生成
├── 增加: 日志分析
└── 移除: API 文档生成

用户 B 的个性化挂载
├── 继承默认: 代码审查、API 文档生成
├── 增加: 部署检查
└── 移除: 无
```

**挂载逻辑**：
1. 用户使用 Agent 时，查询个人挂载记录
2. 有记录 → 使用个人化 Skill 列表
3. 无记录 → 使用 Agent 的 defaultSkills（继承默认值）

---

## 6. 权限矩阵

| 操作 | 管理员 | 普通成员 |
|------|--------|----------|
| **Agent** |
| 创建 Agent | ✅ | ❌ |
| 编辑 Agent | ✅ | ❌ |
| 删除 Agent | ✅ | ❌ |
| 为 Agent 预设默认 Skill | ✅ | ❌ |
| 使用 Agent | ✅ | ✅ |
| **Skill** |
| 创建公共 Skill | ✅ | ❌ |
| 创建个人 Skill | ✅ | ✅ |
| 共享个人 Skill | ✅ | ✅ |
| **Skill 挂载** |
| 预设 Agent 默认 Skill | ✅ | ❌ |
| 个人化 Skill 挂载 | ✅ | ✅ |
| **其他** |
| 快捷短语（个人） | ✅ | ✅ |
| AI 配置 | ✅ | ❌ |
| 用户管理 | ✅ | ❌ |

---

## 7. 页面结构

### 7.1 普通成员界面

```
┌─────────────────────────────────────────────────┐
│  Logo  │  Agent市场  │  会话  │  快捷助手  │ 设置 │
└─────────────────────────────────────────────────┘

├── Agent 市场
│   └── 浏览/使用公共 Agent
├── 会话聊天
│   ├── Agent 配置（个性化 Skill 挂载）
│   ├── 消息输入
│   ├── 文件上传（文档处理）
│   └── 快捷短语
├── 我的 Skill 管理
│   ├── 创建/编辑个人 Skill
│   └── 设置共享
└── 快捷助手/划词助手
```

### 7.2 管理员界面

```
┌──────────────────────────────────────────────────────────────────┐
│  Logo  │  Agent市场  │  会话  │  快捷助手  │ 设置  │  管理后台  │
└──────────────────────────────────────────────────────────────────┘

├── Agent 市场
├── 会话聊天
├── 我的 Skill 管理
└── 管理后台
    ├── 公共 Agent 管理
    │   ├── 创建/编辑 Agent
    │   └── 配置默认 Skill
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
    default_skills JSONB DEFAULT '[]',
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

-- 用户对 Agent 的 Skill 挂载（个人化）
CREATE TABLE user_agent_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    skills JSONB NOT NULL DEFAULT '[]',
    UNIQUE(user_id, agent_id)
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
┌──────────┐       ┌──────────┐       ┌──────────┐
│   User   │───────│  Agent   │───────│  Skill   │
└──────────┘       └──────────┘       └──────────┘
      │                  │                  │
      │            ┌─────┴─────┐            │
      │            │  User     │            │
      │            │  Agent    │            │
      │            │  Skills   │            │
      │            │  (个人化)  │            │
      │            └───────────┘            │
      │                                      │
      └────────── QuickPhrases              │
                                             │
              (Personal Skills)──────────────┘
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
| Skill 管理 | 个人/公共 Skill CRUD、共享设置 |
| Agent-Skill 挂载 | 个人化挂载、继承默认 |
| 界面区分 | 管理员 vs 成员菜单 |

### 9.3 配置扩展

```json
{
  "organization": {
    "name": "XXX 技术团队",
    "adminUsers": ["user-id-1"]
  },
  "visibleAgents": ["agent-id-1", "agent-id-2"],
  "publicSkills": ["skill-id-1"]
}
```

---

## 10. 后续扩展

- [ ] 企业 SSO 登录（Microsoft Entra ID）
- [ ] 后端服务（用户管理、权限控制、数据同步）
- [ ] Jira 集成
- [ ] 使用统计与审计
