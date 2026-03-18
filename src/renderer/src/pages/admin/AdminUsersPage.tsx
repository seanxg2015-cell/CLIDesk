import { Typography } from 'antd'

const { Title, Paragraph } = Typography

const AdminUsersPage: React.FC = () => {
  return (
    <Typography>
      <Title level={2}>用户管理</Title>
      <Paragraph>管理团队成员</Paragraph>
    </Typography>
  )
}

export default AdminUsersPage
