# AI Agent 工作台 - 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Cherry Studio 构建团队 AI Agent 工作台，支持用户切换、管理员配置、Agent/Skill 管理

**Architecture:** 
- 在 Cherry Studio 基础上增加用户切换、角色区分、管理后台
- Skill 系统类 OpenCode，管理员配置 Skill，用户自主选择
- 复用 Cherry Studio 现有设置页面（管理员专属）

**Tech Stack:** Electron + React + TypeScript + Redux + SQLite (Drizzle)

---

## 文件结构概览

```
src/
├── main/
│   ├── services/
│   │   └── agent-workbench/           # 新增：工作台服务
│   │       ├── SkillService.ts        # Skill CRUD
│   │       └── UserService.ts         # 用户管理
│   └── apiServer/
│       └── routes/
│           ├── agents.ts              # 修改：Agent 路由
│           └── skills.ts              # 新增：Skill 路由
├── renderer/src/
│   ├── pages/
│   │   ├── settings/
│   │   │   ├── AgentSettings/         # 新增：公共 Agent 管理
│   │   │   ├── SkillSettings/         # 新增：公共 Skill 管理
│   │   │   └── UserSettings/          # 新增：用户管理
│   │   ├── skill-market/              # 新增：Skill 市场
│   │   └── common/
│   │       └── UserSwitcher.tsx       # 新增：用户切换器
│   ├── store/
│   │   ├── settings.ts                # 修改：增加 admin 配置
│   │   └── user.ts                    # 新增：用户状态
│   └── components/
│       ├── layout/
│       │   └── Header.tsx             # 修改：增加管理后台入口
│       └── skill/
│           └── SkillCard.tsx          # 新增：Skill 卡片
├── preload/
│   └── index.ts                       # 修改：暴露新 API
config/
└── admin-config.json                  # 新增：管理员配置
```

---

## 阶段一：基础架构（用户系统 + 角色区分）

### Task 1: 配置管理员

**Files:**
- Create: `config/admin-config.json`
- Modify: `src/renderer/src/store/settings.ts:1-100`

- [ ] **Step 1: 创建管理员配置文件**

```json
// config/admin-config.json
{
  "adminUsers": [],
  "organizationName": "我的团队"
}
```

- [ ] **Step 2: 在 settings slice 中增加 isAdmin 字段**

```typescript
// src/renderer/src/store/settings.ts
// 在 SettingsState 接口中增加:
interface SettingsState {
  // ... existing fields
  isAdmin: boolean;
  adminConfig: {
    organizationName: string;
  };
}
```

- [ ] **Step 3: 加载配置时检查管理员身份**

在 settings 初始化逻辑中添加：从 `admin-config.json` 读取并设置 `isAdmin`

- [ ] **Step 4: 提交**

```bash
git add config/admin-config.json src/renderer/src/store/settings.ts
git commit -m "feat: add admin config and isAdmin state"
```

---

### Task 2: 用户切换器

**Files:**
- Create: `src/renderer/src/components/common/UserSwitcher.tsx`
- Create: `src/renderer/src/store/user.ts`
- Modify: `src/renderer/src/components/layout/Header.tsx`

- [ ] **Step 1: 创建用户 slice**

```typescript
// src/renderer/src/store/user.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocalUser {
  id: string;
  name: string;
  createdAt: string;
}

interface UserState {
  users: LocalUser[];
  currentUserId: string | null;
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    currentUserId: null,
  } as UserState,
  reducers: {
    addUser: (state, action: PayloadAction<LocalUser>) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    switchUser: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload;
    },
  },
});
```

- [ ] **Step 2: 创建用户切换组件**

```tsx
// src/renderer/src/components/common/UserSwitcher.tsx
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { userSlice } from '@/store/user';
import { nanoid } from 'nanoid';

export const UserSwitcher = () => {
  const dispatch = useDispatch();
  const { users, currentUserId } = useSelector((s: RootState) => s.user);
  const currentUser = users.find(u => u.id === currentUserId);
  const isAdmin = useSelector((s: RootState) => s.settings.isAdmin);

  const handleAddUser = () => {
    const name = prompt('输入用户名:');
    if (name) {
      dispatch(userSlice.actions.addUser({
        id: nanoid(),
        name,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  return (
    <Dropdown menu={{
      items: [
        ...users.map(u => ({
          key: u.id,
          label: u.name + (u.id === currentUserId ? ' ✓' : ''),
          onClick: () => dispatch(userSlice.actions.switchUser(u.id)),
        })),
        { type: 'divider' },
        { key: 'add', label: '添加用户', onClick: handleAddUser },
      ],
    }}>
      <Space>
        <Avatar icon={<UserOutlined />} />
        <span>{currentUser?.name || '未选择'}</span>
        {isAdmin && <Tag color="gold">管理员</Tag>}
      </Space>
    </Dropdown>
  );
};
```

- [ ] **Step 3: 在 Header 中集成用户切换器**

在 `Header.tsx` 中找到用户信息显示位置，用 `<UserSwitcher />` 替换

- [ ] **Step 4: 提交**

```bash
git add src/renderer/src/store/user.ts src/renderer/src/components/common/UserSwitcher.tsx src/renderer/src/components/layout/Header.tsx
git commit -m "feat: add user switcher component"
```

---

### Task 3: 管理员界面区分

**Files:**
- Modify: `src/renderer/src/components/layout/Header.tsx`
- Modify: `src/renderer/src/Router.tsx`

- [ ] **Step 1: 在 Header 中增加管理后台入口**

```tsx
// 在 Header.tsx 中
const isAdmin = useSelector((s: RootState) => s.settings.isAdmin);

// 在导航菜单中增加:
{isAdmin && (
  <Menu.Item key="admin" icon={<SettingOutlined />}>
    <Link to="/admin">管理后台</Link>
  </Menu.Item>
)}
```

- [ ] **Step 2: 创建管理后台路由**

```tsx
// 在 Router.tsx 中
<Route path="/admin/*" element={<AdminLayout />}>
  <Route path="agents" element={<AdminAgentsPage />} />
  <Route path="skills" element={<AdminSkillsPage />} />
  <Route path="users" element={<AdminUsersPage />} />
</Route>
```

- [ ] **Step 3: 创建基础管理后台布局**

```tsx
// src/renderer/src/pages/admin/AdminLayout.tsx
export const AdminLayout = () => {
  const isAdmin = useSelector((s: RootState) => s.settings.isAdmin);
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Sider>
        <Menu>
          <Menu.Item key="agents"><Link to="/admin/agents">公共 Agent</Link></Menu.Item>
          <Menu.Item key="skills"><Link to="/admin/skills">公共 Skill</Link></Menu.Item>
          <Menu.Item key="users"><Link to="/admin/users">用户管理</Link></Menu.Item>
        </Menu>
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};
```

- [ ] **Step 4: 提交**

```bash
git add src/renderer/src/components/layout/Header.tsx src/renderer/src/Router.tsx
git commit -m "feat: add admin menu and routes"
```

---

## 阶段二：Agent 管理

### Task 4: Agent 管理页面

**Files:**
- Create: `src/renderer/src/pages/settings/AdminAgentSettings/index.tsx`
- Create: `src/renderer/src/pages/settings/AdminAgentSettings/AgentForm.tsx`
- Create: `src/renderer/src/pages/settings/AdminAgentSettings/AgentList.tsx`
- Modify: `src/main/apiServer/routes/agents.ts`

- [ ] **Step 1: 创建 Agent 列表组件**

```tsx
// src/renderer/src/pages/settings/AdminAgentSettings/AgentList.tsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
}

export const AgentList = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.invoke('agent:list').then(setAgents).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    { title: '状态', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag> },
    {
      title: '操作',
      render: (_: any, record: Agent) => (
        <Space>
          <Button size="small">编辑</Button>
          <Button size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>创建 Agent</Button>
      </Space>
      <Table columns={columns} dataSource={agents} loading={loading} rowKey="id" />
    </div>
  );
};
```

- [ ] **Step 2: 创建 Agent 表单组件**

```tsx
// src/renderer/src/pages/settings/AdminAgentSettings/AgentForm.tsx
import { Form, Input, Select, Modal } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  initialValues?: any;
}

export const AgentForm = ({ open, onClose, onSave, initialValues }: Props) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={onClose} onOk={() => form.submit()}>
      <Form form={form} initialValues={initialValues} layout="vertical">
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="avatar" label="图标">
          <Input placeholder="🧪" />
        </Form.Item>
        <Form.Item name="systemPrompt" label="系统提示词">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="model" label="默认模型">
          <Select options={[]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

- [ ] **Step 3: 创建主页面**

```tsx
// src/renderer/src/pages/settings/AdminAgentSettings/index.tsx
import { useState } from 'react';
import { AgentList } from './AgentList';
import { AgentForm } from './AgentForm';

export const AdminAgentSettings = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <h2>公共 Agent 管理</h2>
      <AgentList />
      <AgentForm open={formOpen} onClose={() => setFormOpen(false)} onSave={() => {}} />
    </div>
  );
};
```

- [ ] **Step 4: 在路由中注册**

```tsx
// Router.tsx
<Route path="admin/agents" element={<AdminAgentSettings />} />
```

- [ ] **Step 5: 提交**

```bash
git add src/renderer/src/pages/settings/AdminAgentSettings/
git commit -m "feat: add admin agent management page"
```

---

### Task 5: 后端 Agent API

**Files:**
- Modify: `src/main/apiServer/routes/agents.ts`
- Modify: `src/main/services/agents/services/AgentService.ts`

- [ ] **Step 1: 在 AgentService 中添加公开 Agent 查询**

```typescript
// src/main/services/agents/services/AgentService.ts
async listPublicAgents() {
  return this.db.select().from(agentsTable).where(eq(agentsTable.isPublic, true));
}
```

- [ ] **Step 2: 添加创建/更新 Agent 接口**

```typescript
// src/main/services/agents/services/AgentService.ts
async createAgent(data: CreateAgentDTO) {
  return this.db.insert(agentsTable).values(data).returning();
}

async updateAgent(id: string, data: UpdateAgentDTO) {
  return this.db.update(agentsTable).set(data).where(eq(agentsTable.id, id));
}
```

- [ ] **Step 3: 在 API 路由中注册**

```typescript
// src/main/apiServer/routes/agents.ts
router.get('/public', async (ctx) => {
  const agents = await agentService.listPublicAgents();
  ctx.body = agents;
});

router.post('/', async (ctx) => {
  const data = ctx.request.body;
  const agent = await agentService.createAgent(data);
  ctx.body = agent;
});
```

- [ ] **Step 4: 在 preload 中暴露 API**

```typescript
// src/preload/index.ts
window.api = {
  // ... existing
  agent: {
    list: () => ipcRenderer.invoke('agent:list'),
    create: (data) => ipcRenderer.invoke('agent:create', data),
    update: (id, data) => ipcRenderer.invoke('agent:update', id, data),
  },
};
```

- [ ] **Step 5: 提交**

```bash
git add src/main/apiServer/routes/agents.ts src/preload/index.ts
git commit -m "feat: add agent CRUD API"
```

---

## 阶段三：Skill 系统

### Task 6: Skill 数据模型

**Files:**
- Create: `src/main/services/agent-workbench/schema/skills.schema.ts`
- Modify: `src/main/services/agents/database/index.ts`

- [ ] **Step 1: 创建 Skill 数据库 Schema**

```typescript
// src/main/services/agent-workbench/schema/skills.schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  triggerConfig: text('trigger_config').notNull(), // JSON
  instruction: text('instruction').notNull(),
  steps: text('steps'), // JSON
  ownerId: text('owner_id'),
  isShared: integer('is_shared', { mode: 'boolean' }).default(false),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userSelectedSkills = sqliteTable('user_selected_skills', {
  userId: text('user_id').notNull(),
  skillId: text('skill_id').notNull().references(() => skills.id),
});
```

- [ ] **Step 2: 在数据库初始化中注册表**

```typescript
// src/main/services/agents/database/index.ts
import { skills, userSelectedSkills } from '../schema/skills.schema';

export const db = drizzle(..., { schema: { ...agentsSchema, skills, userSelectedSkills } });
```

- [ ] **Step 3: 提交**

```bash
git add src/main/services/agent-workbench/schema/skills.schema.ts
git commit -m "feat: add skill database schema"
```

---

### Task 7: Skill Service

**Files:**
- Create: `src/main/services/agent-workbench/SkillService.ts`

- [ ] **Step 1: 创建 Skill Service**

```typescript
// src/main/services/agent-workbench/SkillService.ts
import { db } from '../agents/database';
import { skills, userSelectedSkills } from './schema/skills.schema';
import { eq, and } from 'drizzle-orm';

export interface CreateSkillDTO {
  name: string;
  description?: string;
  icon?: string;
  triggerConfig: {
    manual: boolean;
    autoKeywords?: string[];
  };
  instruction: string;
  steps?: string[];
  ownerId?: string;
  isPublic?: boolean;
}

export class SkillService {
  async listPublicSkills() {
    return db.select().from(skills).where(eq(skills.isPublic, true));
  }

  async listUserSkills(userId: string) {
    return db.select().from(skills).where(eq(skills.ownerId, userId));
  }

  async createSkill(data: CreateSkillDTO) {
    const now = new Date().toISOString();
    return db.insert(skills).values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
  }

  async updateSkill(id: string, data: Partial<CreateSkillDTO>) {
    return db.update(skills).set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(skills.id, id)).returning();
  }

  async deleteSkill(id: string) {
    return db.delete(skills).where(eq(skills.id, id));
  }

  async getUserSelectedSkills(userId: string) {
    const selected = await db.select().from(userSelectedSkills)
      .where(eq(userSelectedSkills.userId, userId));
    const skillIds = selected.map(s => s.skillId);
    return db.select().from(skills).where(/* skill.id in skillIds */);
  }

  async setUserSelectedSkills(userId: string, skillIds: string[]) {
    await db.delete(userSelectedSkills).where(eq(userSelectedSkills.userId, userId));
    if (skillIds.length > 0) {
      await db.insert(userSelectedSkills).values(
        skillIds.map(skillId => ({ userId, skillId }))
      );
    }
  }
}

export const skillService = new SkillService();
```

- [ ] **Step 2: 提交**

```bash
git add src/main/services/agent-workbench/SkillService.ts
git commit -m "feat: add SkillService"
```

---

### Task 8: Skill 管理页面

**Files:**
- Create: `src/renderer/src/pages/settings/AdminSkillSettings/index.tsx`
- Create: `src/renderer/src/pages/settings/AdminSkillSettings/SkillList.tsx`
- Create: `src/renderer/src/pages/settings/AdminSkillSettings/SkillForm.tsx`

- [ ] **Step 1: 创建 Skill 列表组件**

```tsx
// src/renderer/src/pages/settings/AdminSkillSettings/SkillList.tsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPublic: boolean;
}

export const SkillList = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.invoke('skill:listPublic').then(setSkills).finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '图标', dataIndex: 'icon', render: (v: string) => v || '🔧' },
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    { title: '状态', dataIndex: 'isPublic', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '公共' : '私有'}</Tag> },
    {
      title: '操作',
      render: (_: any, record: Skill) => (
        <Space>
          <Button size="small">编辑</Button>
          <Button size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {}}>
          创建 Skill
        </Button>
      </Space>
      <Table columns={columns} dataSource={skills} loading={loading} rowKey="id" />
    </div>
  );
};
```

- [ ] **Step 2: 创建 Skill 表单**

```tsx
// src/renderer/src/pages/settings/AdminSkillSettings/SkillForm.tsx
import { Form, Input, Switch, Modal, List } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  initialValues?: any;
}

export const SkillForm = ({ open, onClose, onSave, initialValues }: Props) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={onClose} onOk={() => form.submit()} title="创建 Skill" width={600}>
      <Form form={form} initialValues={initialValues} layout="vertical">
        <Form.Item name="name" label="名称" rules={[{ required: true }]}>
          <Input placeholder="代码审查" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="对代码进行安全性和质量审查" />
        </Form.Item>
        <Form.Item name="icon" label="图标">
          <Input placeholder="🔍" />
        </Form.Item>
        <Form.Item label="触发配置" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name={['triggerConfig', 'manual']} valuePropName="checked" noStyle>
              <Switch checkedChildren="手动触发" unCheckedChildren="禁用手动" />
            </Form.Item>
            <Form.Item name={['triggerConfig', 'autoKeywords']} label="自动触发关键词">
              <Input.TextArea placeholder="帮我看看这段代码, review, 审查代码" />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item name="instruction" label="指令" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="你是一个专业的代码审查助手..." />
        </Form.Item>
        <Form.Item name="steps" label="执行步骤">
          <List
            dataSource={[]}
            renderItem={() => null}
            header={<Button icon={<PlusOutlined />} size="small">添加步骤</Button>}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

- [ ] **Step 3: 创建主页面**

```tsx
// src/renderer/src/pages/settings/AdminSkillSettings/index.tsx
import { SkillList } from './SkillList';
import { SkillForm } from './SkillForm';
import { useState } from 'react';

export const AdminSkillSettings = () => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <h2>公共 Skill 管理</h2>
      <SkillList />
      <SkillForm open={formOpen} onClose={() => setFormOpen(false)} onSave={() => {}} />
    </div>
  );
};
```

- [ ] **Step 4: 注册路由**

```tsx
// Router.tsx
<Route path="admin/skills" element={<AdminSkillSettings />} />
```

- [ ] **Step 5: 提交**

```bash
git add src/renderer/src/pages/settings/AdminSkillSettings/
git commit -m "feat: add admin skill management page"
```

---

## 阶段四：Skill 市场

### Task 9: Skill 市场页面

**Files:**
- Create: `src/renderer/src/pages/skill-market/SkillMarketPage.tsx`
- Create: `src/renderer/src/components/skill/SkillCard.tsx`

- [ ] **Step 1: 创建 Skill 卡片组件**

```tsx
// src/renderer/src/components/skill/SkillCard.tsx
import { Card, Switch, Tag, Space } from 'antd';

interface Props {
  skill: {
    id: string;
    name: string;
    description: string;
    icon: string;
    isPublic: boolean;
    ownerName?: string;
  };
  selected: boolean;
  onToggle: (selected: boolean) => void;
}

export const SkillCard = ({ skill, selected, onToggle }: Props) => {
  return (
    <Card
      size="small"
      style={{ borderColor: selected ? '#1890ff' : undefined }}
      extra={
        <Switch checked={selected} onChange={onToggle} />
      }
    >
      <Space>
        <span style={{ fontSize: 20 }}>{skill.icon || '🔧'}</span>
        <span strong>{skill.name}</span>
        <Tag>{skill.isPublic ? '公共' : '共享'}</Tag>
      </Space>
      <p style={{ margin: '8px 0 0', color: '#666' }}>{skill.description}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
        {skill.ownerName ? `创建者: ${skill.ownerName}` : '管理员'}
      </p>
    </Card>
  );
};
```

- [ ] **Step 2: 创建 Skill 市场页面**

```tsx
// src/renderer/src/pages/skill-market/SkillMarketPage.tsx
import { useState, useEffect } from 'react';
import { Input, Row, Col, Empty, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { SkillCard } from '@/components/skill/SkillCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPublic: boolean;
  ownerName?: string;
}

export const SkillMarketPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const currentUserId = useSelector((s: RootState) => s.settings.userId);

  useEffect(() => {
    Promise.all([
      window.api.invoke('skill:listAll'),
      window.api.invoke('skill:getUserSelected', currentUserId),
    ]).then(([allSkills, selected]) => {
      setSkills(allSkills);
      setSelectedIds(selected.map((s: Skill) => s.id));
    }).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (skillId: string, selected: boolean) => {
    let newIds: string[];
    if (selected) {
      newIds = [...selectedIds, skillId];
    } else {
      newIds = selectedIds.filter(id => id !== skillId);
    }
    setSelectedIds(newIds);
    await window.api.invoke('skill:setUserSelected', currentUserId, newIds);
    message.success(selected ? '已启用' : '已禁用');
  };

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>Skill 市场</h2>
      <Input
        placeholder="搜索 Skill..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 24, maxWidth: 400 }}
      />
      <Row gutter={[16, 16]}>
        {filteredSkills.map(skill => (
          <Col span={12} key={skill.id}>
            <SkillCard
              skill={skill}
              selected={selectedIds.includes(skill.id)}
              onToggle={(s) => handleToggle(skill.id, s)}
            />
          </Col>
        ))}
      </Row>
      {!loading && filteredSkills.length === 0 && (
        <Empty description="暂无 Skill" />
      )}
    </div>
  );
};
```

- [ ] **Step 3: 注册路由**

```tsx
// Router.tsx
<Route path="/skill-market" element={<SkillMarketPage />} />
```

- [ ] **Step 4: 在 Header 添加 Skill 市场入口**

```tsx
// Header.tsx
<Menu.Item key="skill-market" icon={<AppstoreOutlined />}>
  <Link to="/skill-market">Skill 市场</Link>
</Menu.Item>
```

- [ ] **Step 5: 提交**

```bash
git add src/renderer/src/pages/skill-market/ src/renderer/src/components/skill/
git commit -m "feat: add skill market page"
```

---

## 阶段五：Skill 触发机制

### Task 10: Skill 上下文注入

**Files:**
- Modify: `packages/aiCore/src/core/runtime/`
- Modify: `src/main/services/agent-workbench/SkillService.ts`

- [ ] **Step 1: 在对话开始时获取用户已选 Skill**

```typescript
// 在 Agent 执行前注入 Skill
async function executeWithSkills(userId: string, agentId: string, messages: any[]) {
  const selectedSkills = await skillService.getUserSelectedSkills(userId);
  
  const systemMessages = messages.filter(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  // 构建 Skill 上下文
  const skillContext = selectedSkills.map(skill => `
## Skill: ${skill.name}
${skill.description}
${skill.instruction}
${skill.steps ? `步骤: ${skill.steps.join('\n')}` : ''}
`).join('\n\n');
  
  const newSystemPrompt = systemMessages[0]?.content + '\n\n' + skillContext;
  
  return executeAgent(agentId, [{ ...systemMessages[0], content: newSystemPrompt }, ...userMessages]);
}
```

- [ ] **Step 2: 添加手动触发检测**

```typescript
function detectManualSkill(text: string, skills: any[]) {
  for (const skill of skills) {
    if (skill.triggerConfig?.manual) {
      const trigger = '/' + skill.name.toLowerCase();
      if (text.toLowerCase().startsWith(trigger)) {
        return skill;
      }
    }
  }
  return null;
}
```

- [ ] **Step 3: 提交**

```bash
git add packages/aiCore/src/core/runtime/
git commit -m "feat: integrate skill context injection"
```

---

## 测试清单

- [ ] 用户切换功能正常
- [ ] 管理员可见管理后台入口
- [ ] 非管理员不可见管理后台入口
- [ ] 创建/编辑/删除 Agent
- [ ] 创建/编辑/删除公共 Skill
- [ ] Skill 市场显示所有可用 Skill
- [ ] 用户启用/禁用 Skill 正常工作
- [ ] Agent 对话时加载用户已选 Skill
- [ ] 手动 `/skillName` 触发正常
