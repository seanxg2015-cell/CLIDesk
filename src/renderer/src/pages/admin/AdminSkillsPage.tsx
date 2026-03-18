import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Modal, Popconfirm, Space, Switch, Table, Typography, message } from 'antd'

interface SkillRow {
  id: string
  name: string
  description?: string
  icon?: string
  trigger_config?: string
  instruction?: string
  steps?: string
  owner_id?: string
  is_shared?: boolean
  is_public?: boolean
  sort_order?: number
  created_at: string
  updated_at: string
}

const { Title, Paragraph } = Typography

interface SkillFormData {
  id?: string
  name: string
  description: string
  icon: string
  trigger_config: string
  instruction: string
  steps: string
  is_public: boolean
}

const initialFormData: SkillFormData = {
  name: '',
  description: '',
  icon: '⚡',
  trigger_config: '{}',
  instruction: '',
  steps: '[]',
  is_public: false
}

const AdminSkillsPage: React.FC = () => {
  const { t } = useTranslation()
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillRow | null>(null)
  const [formData, setFormData] = useState<SkillFormData>(initialFormData)

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    try {
      const data = await window.api.skillAdmin.listPublic()
      setSkills(data as SkillRow[])
    } catch (error) {
      message.error(t('admin.skills.fetchError'))
      console.error('Failed to fetch skills:', error)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const handleCreate = () => {
    setEditingSkill(null)
    setFormData(initialFormData)
    setModalOpen(true)
  }

  const handleEdit = (record: SkillRow) => {
    setEditingSkill(record)
    setFormData({
      id: record.id,
      name: record.name || '',
      description: record.description || '',
      icon: record.icon || '⚡',
      trigger_config: record.trigger_config || '{}',
      instruction: record.instruction || '',
      steps: record.steps || '[]',
      is_public: record.is_public || false
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await window.api.skillAdmin.delete(id)
      message.success(t('admin.skills.deleteSuccess'))
      fetchSkills()
    } catch (error) {
      message.error(t('admin.skills.deleteError'))
      console.error('Failed to delete skill:', error)
    }
  }

  const handleTogglePublic = async (record: SkillRow) => {
    try {
      await window.api.skillAdmin.update(record.id, { is_public: !record.is_public } as any)
      message.success(t('admin.skills.updateSuccess'))
      fetchSkills()
    } catch (error) {
      message.error(t('admin.skills.updateError'))
      console.error('Failed to update skill:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.instruction) {
      message.error(t('admin.skills.validationError'))
      return
    }

    try {
      let triggerConfig: object
      let stepsData: object[]
      try {
        triggerConfig = JSON.parse(formData.trigger_config)
        stepsData = JSON.parse(formData.steps)
      } catch {
        message.error(t('admin.skills.jsonError'))
        return
      }

      const skillData = {
        ...formData,
        trigger_config: JSON.stringify(triggerConfig),
        steps: JSON.stringify(stepsData)
      }

      if (editingSkill?.id) {
        await window.api.skillAdmin.update(editingSkill.id, skillData as any)
        message.success(t('admin.skills.updateSuccess'))
      } else {
        await window.api.skillAdmin.create({
          ...skillData,
          id: crypto.randomUUID(),
          owner_id: null,
          is_shared: false,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        message.success(t('admin.skills.createSuccess'))
      }
      setModalOpen(false)
      fetchSkills()
    } catch (error) {
      message.error(editingSkill?.id ? t('admin.skills.updateError') : t('admin.skills.createError'))
      console.error('Failed to save skill:', error)
    }
  }

  const columns = [
    {
      title: t('admin.skills.icon'),
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string) => <span style={{ fontSize: 24 }}>{icon || '⚡'}</span>
    },
    {
      title: t('admin.skills.name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('admin.skills.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: t('admin.skills.isPublic'),
      dataIndex: 'is_public',
      key: 'is_public',
      width: 100,
      render: (isPublic: boolean, record: SkillRow) => (
        <Switch
          checked={isPublic}
          onChange={() => handleTogglePublic(record)}
          checkedChildren={t('common.yes')}
          unCheckedChildren={t('common.no')}
        />
      )
    },
    {
      title: t('admin.skills.actions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: SkillRow) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('admin.skills.deleteConfirm')}
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
            {t('admin.skills.title')}
          </Title>
          <Paragraph type="secondary">{t('admin.skills.description')}</Paragraph>
        </div>
        <Button type="primary" onClick={handleCreate}>
          {t('admin.skills.create')}
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={skills} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingSkill?.id ? t('admin.skills.editTitle') : t('admin.skills.createTitle')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>{t('admin.skills.name')} *</label>
            <input
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.skills.namePlaceholder')}
            />
          </div>
          <div>
            <label>{t('admin.skills.icon')}</label>
            <input
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder={t('admin.skills.iconPlaceholder')}
            />
          </div>
          <div>
            <label>{t('admin.skills.description')}</label>
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.skills.descriptionPlaceholder')}
              rows={2}
            />
          </div>
          <div>
            <label>{t('admin.skills.instruction')} *</label>
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              placeholder={t('admin.skills.instructionPlaceholder')}
              rows={4}
            />
          </div>
          <div>
            <label>{t('admin.skills.triggerConfig')}</label>
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.trigger_config}
              onChange={(e) => setFormData({ ...formData, trigger_config: e.target.value })}
              placeholder='{"keywords": ["code", "review"]}'
              rows={3}
            />
          </div>
          <div>
            <label>{t('admin.skills.steps')}</label>
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: 4 }}
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              placeholder='[{"step": 1, "action": "..."}]'
              rows={3}
            />
          </div>
          <div>
            <Switch
              checked={formData.is_public}
              onChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
            <span style={{ marginLeft: 8 }}>{t('admin.skills.isPublic')}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminSkillsPage
