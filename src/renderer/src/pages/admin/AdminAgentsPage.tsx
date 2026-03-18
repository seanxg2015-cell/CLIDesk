import { Typography } from 'antd'

const { Title, Paragraph } = Typography

const AdminAgentsPage: React.FC = () => {
  return (
    <Typography>
      <Title level={2}>公共 Agent 管理</Title>
      <Paragraph>管理团队公共 Agent</Paragraph>
    </Typography>
  )
}

export default AdminAgentsPage
