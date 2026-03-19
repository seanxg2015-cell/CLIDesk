import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Modal, Popconfirm, Space, Switch, Table, Typography, message } from 'antd'

const { Title, Paragraph } = Typography

interface AgentEntity {
  id: string
  name?: string
  description?: string
  avatar?: string
  instructions?: string
  model: string
  is_public?: boolean
  is_active?: boolean
  [key: string]: any
}

interface AgentFormData {
  id?: string
  name: string
  description: string
  avatar: string
  instructions: string
  model: string
  is_public: boolean
  is_active: boolean
}

const initialFormData: AgentFormData = {
  name: '',
  description: '',
  avatar: '🤖',
  instructions: '',
  model: 'claude-sonnet-4-20250514',
  is_public: false,
  is_active: true
}

const AdminAgentsPage: React.FC = () => {
  const { t } = useTranslation()
  const [agents, setAgents] = useState<AgentEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AgentEntity | null>(null)
  const [formData, setFormData] = useState<AgentFormData>(initialFormData)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await window.api.agentAdmin.listPublic()
      setAgents(data as AgentEntity[])
    } catch (error) {
      message.error(t('admin.agents.fetchError'))
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleCreate = () => {
    setEditingAgent(null)
    setFormData(initialFormData)
    setModalOpen(true)
  }

  const handleEdit = (record: AgentEntity) => {
    setEditingAgent(record)
    setFormData({
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      avatar: record.avatar || '🤖',
      instructions: record.instructions || '',
      model: record.model || 'claude-sonnet-4-20250514',
      is_public: record.is_public || false,
      is_active: record.is_active ?? true
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await window.api.agentAdmin.delete(id)
      message.success(t('admin.agents.deleteSuccess'))
      fetchAgents()
    } catch (error) {
      message.error(t('admin.agents.deleteError'))
      console.error('Failed to delete agent:', error)
    }
  }

  const handleToggleActive = async (record: AgentEntity) => {
    try {
      await window.api.agentAdmin.update(record.id, { is_active: !record.is_active } as any)
      message.success(t('admin.agents.updateSuccess'))
      fetchAgents()
    } catch (error) {
      message.error(t('admin.agents.updateError'))
      console.error('Failed to update agent:', error)
    }
  }

  const handleTogglePublic = async (record: AgentEntity) => {
    try {
      await window.api.agentAdmin.update(record.id, { is_public: !record.is_public } as any)
      message.success(t('admin.agents.updateSuccess'))
      fetchAgents()
    } catch (error) {
      message.error(t('admin.agents.updateError'))
      console.error('Failed to update agent:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.model) {
      message.error(t('admin.agents.validationError'))
      return
    }

    try {
      if (editingAgent?.id) {
        await window.api.agentAdmin.update(editingAgent.id, formData as any)
        message.success(t('admin.agents.updateSuccess'))
      } else {
        await window.api.agentAdmin.create({
          ...formData,
          id: crypto.randomUUID(),
          type: 'claude-code',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        message.success(t('admin.agents.createSuccess'))
      }
      setModalOpen(false)
      fetchAgents()
    } catch (error) {
      message.error(editingAgent?.id ? t('admin.agents.updateError') : t('admin.agents.createError'))
      console.error('Failed to save agent:', error)
    }
  }

  const columns = [
    {
      title: t('admin.agents.avatar'),
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar: string) => <span style={{ fontSize: 24 }}>{avatar || '🤖'}</span>
    },
    {
      title: t('admin.agents.name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('admin.agents.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: t('admin.agents.model'),
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: t('admin.agents.isPublic'),
      dataIndex: 'is_public',
      key: 'is_public',
      width: 100,
      render: (isPublic: boolean, record: AgentEntity) => (
        <Switch
          checked={isPublic}
          onChange={() => handleTogglePublic(record)}
          checkedChildren={t('common.yes')}
          unCheckedChildren={t('common.no')}
        />
      )
    },
    {
      title: t('admin.agents.isActive'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean, record: AgentEntity) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren={t('common.yes')}
          unCheckedChildren={t('common.no')}
        />
      )
    },
    {
      title: t('admin.agents.actions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: AgentEntity) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('admin.agents.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}>
            <Button size="small" danger>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            {t('admin.agents.title')}
          </Title>
          <Paragraph type="secondary">{t('admin.agents.description')}</Paragraph>
        </div>
        <Button type="primary" onClick={handleCreate}>
          {t('admin.agents.create')}
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={agents} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingAgent?.id ? t('admin.agents.editTitle') : t('admin.agents.createTitle')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>{t('admin.agents.name')} *</label>
            <input
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.agents.namePlaceholder')}
            />
          </div>
          <div>
            <label>{t('admin.agents.avatar')}</label>
            <input
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder={t('admin.agents.avatarPlaceholder')}
            />
          </div>
          <div>
            <label>{t('admin.agents.description')}</label>
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.agents.descriptionPlaceholder')}
              rows={2}
            />
          </div>
          <div>
            <label>{t('admin.agents.model')} *</label>
            <input
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="claude-sonnet-4-20250514"
            />
          </div>
          <div>
            <label>{t('admin.agents.instructions')}</label>
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder={t('admin.agents.instructionsPlaceholder')}
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <Switch
                checked={formData.is_public}
                onChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
              <span style={{ marginLeft: 8 }}>{t('admin.agents.isPublic')}</span>
            </div>
            <div>
              <Switch
                checked={formData.is_active}
                onChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <span style={{ marginLeft: 8 }}>{t('admin.agents.isActive')}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminAgentsPage
