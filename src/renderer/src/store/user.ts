import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LocalUser {
  id: string
  name: string
  createdAt: string
}

interface UserState {
  users: LocalUser[]
  currentUserId: string | null
}

const initialState: UserState = {
  users: [],
  currentUserId: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<LocalUser>) => {
      state.users.push(action.payload)
      state.currentUserId = action.payload.id
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload)
      if (state.currentUserId === action.payload) {
        state.currentUserId = state.users[0]?.id || null
      }
    },
    switchUser: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload
    },
    setUsers: (state, action: PayloadAction<LocalUser[]>) => {
      state.users = action.payload
    }
  }
})

export const { addUser, removeUser, switchUser, setUsers } = userSlice.actions

export const userReducer = userSlice.reducer
