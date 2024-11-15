import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card } from '../../interfaces/card'

// Define the structure of the initial state
interface ActiveCardState {
  currentActiveCard: Card | null
  isShowModalActiveCard: boolean
}

// Initial state
const initialState: ActiveCardState = {
  currentActiveCard: null,
  isShowModalActiveCard: false
}

// Create the active card slice
export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  reducers: {
    // Show modal
    showModalActiveCard: (state) => {
      state.isShowModalActiveCard = true
    },
    // Clear and hide modal
    clearAndHideCurrentActiveCard: (state) => {
      state.currentActiveCard = null
      state.isShowModalActiveCard = false
    },
    // Update the current active card
    updateCurrentActiveCard: (state, action: PayloadAction<Card>) => {
      const fullCard = action.payload
      state.currentActiveCard = fullCard
    }
  },
  extraReducers: (builder) => {}
})

// Export action creators
export const {
  clearAndHideCurrentActiveCard,
  updateCurrentActiveCard,
  showModalActiveCard
} = activeCardSlice.actions

// Selectors
export const selectCurrentActiveCard = (state: { activeCard: ActiveCardState }) => state.activeCard.currentActiveCard
export const selectIsShowModalActiveCard = (state: { activeCard: ActiveCardState }) => state.activeCard.isShowModalActiveCard

// Export reducer
export const activeCardReducer = activeCardSlice.reducer
