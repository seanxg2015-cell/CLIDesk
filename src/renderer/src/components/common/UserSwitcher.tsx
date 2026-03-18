import { Avatar, Dropdown, Input, message, Space, Tag, Typography } from 'antd'
import { UserOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { addUser, switchUser } from '@renderer/store/user'
import { useState } from 'react'
import { nanoid } from '@reduxjs/toolkit'

const { Text } = Typography

export const UserSwitcher = () => {
  const dispatch = useAppDispatch()
  const { users, currentUserId } = useAppSelector((state) => state.user)
  const { isAdmin } = useAppSelector((state) => state.settings)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  const currentUser = users.find((u) => u.id === currentUserId)

  const handleAddUser = () => {
    const name = newUserName.trim()
    if (!name) {
      message.error('请输入用户名')
      return
    }
    const newUser = {
      id: nanoid(),
      name,
      createdAt: new Date().toISOString()
    }
    dispatch(addUser(newUser))
    setNewUserName('')
    setAddModalOpen(false)
    message.success(`已添加用户: ${name}`)
  }

  const handleSwitchUser = (userId: string) => {
    dispatch(switchUser(userId))
    const user = users.find((u) => u.id === userId)
    message.success(`已切换到: ${user?.name}`)
  }

  const menuItems = [
    ...users.map((u) => ({
      key: u.id,
      label: (
        <Space>
          <span>{u.name}</span>
          {u.id === currentUserId && <CheckOutlined style={{ color: '#52c41a' }} />}
        </Space>
      ),
      onClick: () => handleSwitchUser(u.id)
    })),
    { type: 'divider' as const },
    {
      key: 'add',
      label: (
        <Space>
          <PlusOutlined />
          <span>添加新用户</span>
        </Space>
      ),
      onClick: () => setAddModalOpen(true)
    }
  ]

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <Text strong>{currentUser?.name || '未选择用户'}</Text>
          {isAdmin && <Tag color="gold">管理员</Tag>}
        </Space>
      </Dropdown>

      {/* Simple add user modal using Input */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setAddModalOpen(false)}>
          <div
            style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 8,
              width: 320
            }}
            onClick={(e) => e.stopPropagation()}>
            <Text strong style={{ display: 'block', marginBottom: 16 }}>
              添加新用户
            </Text>
            <Input
              placeholder="输入用户名"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onPressEnter={handleAddUser}
              autoFocus
            />
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setAddModalOpen(false)} style={{ padding: '6px 16px' }}>
                取消
              </button>
              <button
                onClick={handleAddUser}
                style={{
                  padding: '6px 16px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4
                }}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
