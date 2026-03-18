import { Layout, Menu } from 'antd'
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@renderer/store'
import { RobotOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useNavbarPosition } from '@renderer/hooks/useSettings'

const { Sider, Content } = Layout

const AdminLayout: React.FC = () => {
  const isAdmin = useAppSelector((state) => state.settings.isAdmin)
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { isLeftNavbar } = useNavbarPosition()

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const selectedKey = pathname.split('/').pop() || 'agents'

  return (
    <AdminLayoutContainer $isLeftNavbar={isLeftNavbar}>
      <Sider width={200} style={{ background: 'var(--color-background)' }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ height: '100%', borderRight: 0 }}
          items={[
            {
              key: 'agents',
              icon: <RobotOutlined />,
              label: <Link to="/admin/agents">{t('admin.agents.title')}</Link>
            },
            {
              key: 'skills',
              icon: <ThunderboltOutlined />,
              label: <Link to="/admin/skills">{t('admin.skills.title')}</Link>
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: <Link to="/admin/users">{t('admin.users.title')}</Link>
            }
          ]}
        />
      </Sider>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </AdminLayoutContainer>
  )
}

const AdminLayoutContainer = styled(Layout)<{ $isLeftNavbar: boolean }>`
  min-height: calc(100vh - ${({ $isLeftNavbar }) => ($isLeftNavbar ? '0px' : 'var(--navbar-height)')});
  margin-top: ${({ $isLeftNavbar }) => ($isLeftNavbar ? 'var(--navbar-height)' : '0px')};
`

export default AdminLayout
