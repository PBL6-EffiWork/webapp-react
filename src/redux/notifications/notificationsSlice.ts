import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '../../utils/authorizeAxios'
import { API_ROOT } from '../../utils/constants'

// Define interfaces for notifications and state
interface Notification {
  [key: string]: any
  // Additional properties of a notification
}

interface NotificationsState {
  currentNotifications: Notification[] | null
  [key: string]: any
}

// Initial state
const initialState: NotificationsState = {
  currentNotifications: null
}

// Fetch invitations action
export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async (): Promise<Notification[]> => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/invitations`)
    return response.data
  }
)

// Update board invitation action
export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ status, invitationId }: { status: string; invitationId: string }): Promise<Notification> => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/invitations/board/${invitationId}`, { status })
    return response.data
  }
)

// Notifications slice
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },
    updateCurrentNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.currentNotifications = action.payload
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      const incomingInvitation = action.payload
      state.currentNotifications?.unshift(incomingInvitation)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action: PayloadAction<Notification[]>) => {
      state.currentNotifications = Array.isArray(action.payload) ? action.payload.reverse() : []
    })
    builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action: PayloadAction<Notification>) => {
      const incomingInvitation = action.payload
      const getInvitation = state.currentNotifications?.find(i => i._id === incomingInvitation._id)
      if (getInvitation) {
        getInvitation.boardInvitation = incomingInvitation.boardInvitation
      }
    })
  }
})

// Action creators
export const {
  clearCurrentNotifications,
  updateCurrentNotifications,
  addNotification
} = notificationsSlice.actions

// Selector
export const selectCurrentNotifications = (state: { notifications: NotificationsState }) => {
  return state.notifications.currentNotifications
}

// Export the reducer
export const notificationsReducer = notificationsSlice.reducer
