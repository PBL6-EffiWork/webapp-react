import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '../../utils/authorizeAxios'
import { API_ROOT } from '../../utils/constants'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '../../helpers/storage'
import { getDetailUserAPI, loadInfoUserAPI } from '../../apis'
import { build } from 'vite'

// Define types for the initial state and user
interface User {
  [key: string]: any
  // Add any other properties related to the user object as needed
}

interface UserState {
  [key: string]: any
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  error: null,
  userDetailView: null
}

// Thunk action types
interface LoginData {
  [key: string]: any
}

interface UpdateData {
  [key: string]: any
  // Add any other updatable fields here
}

// Logout action
export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage: boolean = true) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data
  }
)

// Login action
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data: LoginData) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    return response.data as User
  }
)

// Update user action
export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data: UpdateData) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    return response.data as User
  }
)

export const getDetailsUserThunk = createAsyncThunk(
  'user/getDetailsUserAPI',
  async (userId: string) => {
    const response = await getDetailUserAPI(userId)
    return response as User
  }
)

export const updateUserThunk = createAsyncThunk(
  'user/updateUserThunk',
  async ({userId, data}:{userId: string, data: UpdateData}) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/${userId}`, data)
    return response.data as User
  }
)

export const loadInfoThunk = createAsyncThunk(
  'user/loadInfoThunk',
  async () => {
    const response = await loadInfoUserAPI()
    return response as User 
  }
)

// User slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Login handling
    builder.addCase(loginUserAPI.fulfilled, (state, action: PayloadAction<User>) => {
      const { accessToken, refreshToken, ...userData } = action.payload
      state.currentUser = userData
      LocalStorageHelper.setItem('accessToken', accessToken)
      LocalStorageHelper.setItem('refreshToken', refreshToken)
    }),

    // Logout handling
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.currentUser = null
      LocalStorageHelper.removeItem('accessToken')
      LocalStorageHelper.removeItem('refreshToken')
    }),

    // User update handling
    builder.addCase(updateUserAPI.fulfilled, (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
    }),

    // User details handling
    builder
      .addCase(getDetailsUserThunk.pending, (state) => {
        state.error = null
      })
      .addCase(getDetailsUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.userDetailView = action.payload
        state.error = null
      })
      .addCase(getDetailsUserThunk.rejected, (state) => {
        state.error = 'Failed to get user details'
      }),

    // User update thunk handling
    builder
      .addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.userDetailView = action.payload
      })
      .addCase(updateUserThunk.rejected, () => {
        toast.error('Failed to update user')
      }),

    // Load user info handling
    builder
      .addCase(loadInfoThunk.fulfilled, (state, action: PayloadAction<User>) => {
        console.log('loadInfoThunk.fulfilled', action.payload);
        state.currentUser = {
          ...state.currentUser,
          ...action.payload
        }
      })
      .addCase(loadInfoThunk.rejected, () => {
        toast.error('Failed to load user info')
      })
  }
})

// Selector
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser

export const selectUserDetailView = (state: { user: UserState }) => state.user.userDetailView
export const selectUserError = (state: { user: UserState }) => state.user.error

export const userReducer = userSlice.reducer
