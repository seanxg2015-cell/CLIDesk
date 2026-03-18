import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input, Typography, message } from 'antd'
import { SearchOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

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

interface SkillWithSelection extends SkillRow {
  selected?: boolean
  enabled?: boolean
}

const SkillMarketPage: React.FC = () => {
  const { t } = useTranslation()
  const [skills, setSkills] = useState<SkillWithSelection[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const currentUserId = 'local-user'

  const fetchSkills = useCallback(async () => {
    setLoading(true)
    try {
      const publicSkills = await window.api.skillAdmin.listPublic()
      const selectedSkills = await window.api.skillUser.listSelected(currentUserId)

      const selectedIds = new Set((selectedSkills as SkillRow[]).map((s) => s.id))

      setSkills(
        (publicSkills as SkillWithSelection[]).map((skill) => ({
          ...skill,
          selected: selectedIds.has(skill.id),
          enabled: selectedIds.has(skill.id)
        }))
      )
    } catch (error) {
      message.error(t('skillMarket.fetchError'))
      console.error('Failed to fetch skills:', error)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const handleToggleSkill = async (skill: SkillWithSelection) => {
    try {
      if (skill.selected) {
        await window.api.skillUser.deselect(currentUserId, skill.id)
        message.success(t('skillMarket.deselectSuccess', { name: skill.name }))
      } else {
        await window.api.skillUser.select(currentUserId, skill.id)
        message.success(t('skillMarket.selectSuccess', { name: skill.name }))
      }
      fetchSkills()
    } catch (error) {
      message.error(t('skillMarket.toggleError'))
      console.error('Failed to toggle skill:', error)
    }
  }

  const filteredSkills = skills.filter((skill) => {
    if (!searchText) return true
    const search = searchText.toLowerCase()
    return skill.name?.toLowerCase().includes(search) || skill.description?.toLowerCase().includes(search)
  })

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          {t('skillMarket.title')}
        </Title>
        <Paragraph type="secondary">{t('skillMarket.description')}</Paragraph>
      </div>

      <Input
        placeholder={t('skillMarket.searchPlaceholder')}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 24 }}
        size="large"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filteredSkills.map((skill) => (
          <Card
            key={skill.id}
            hoverable
            style={{
              borderColor: skill.selected ? '#1890ff' : undefined,
              borderWidth: skill.selected ? 2 : 1
            }}
            actions={[
              <Button
                key="toggle"
                type={skill.selected ? 'default' : 'primary'}
                icon={skill.selected ? <CheckOutlined /> : <PlusOutlined />}
                onClick={() => handleToggleSkill(skill)}
                block>
                {skill.selected ? t('skillMarket.enabled') : t('skillMarket.enable')}
              </Button>
            ]}>
            <Card.Meta
              avatar={<span style={{ fontSize: 32 }}>{skill.icon || '⚡'}</span>}
              title={skill.name}
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>{skill.description}</p>
                  {skill.selected && (
                    <span style={{ color: '#52c41a', fontSize: 12 }}>✓ {t('skillMarket.selected')}</span>
                  )}
                </div>
              }
            />
          </Card>
        ))}
      </div>

      {filteredSkills.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
          {searchText ? t('skillMarket.noResults') : t('skillMarket.empty')}
        </div>
      )}
    </div>
  )
}

export default SkillMarketPage
