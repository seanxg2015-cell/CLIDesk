import { Typography } from 'antd'

const { Title, Paragraph } = Typography

const AdminSkillsPage: React.FC = () => {
  return (
    <Typography>
      <Title level={2}>公共 Skill 管理</Title>
      <Paragraph>管理团队公共 Skill</Paragraph>
    </Typography>
  )
}

export default AdminSkillsPage
