import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HistoryType, History } from "../../interfaces/history";
import { loadHistoryCardAPI } from "../../apis";

interface HistoryCardState {
  historiesCard: {
    [key: string]: History[]
  },
}

const initialState: HistoryCardState = {
  historiesCard: {},
}

export const loadHistoryCardThunk = createAsyncThunk(
  'historyCard/loadHistoryCard',
  async (cardId: string) => {
    const response = await loadHistoryCardAPI(cardId)
    return {cardId, histories: response}
  }
)

const historySlice = createSlice({
  name: 'historyCard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadHistoryCardThunk.fulfilled, (state, action) => {
      console.log(action.payload);
      const { cardId, histories } = action.payload
      state.historiesCard[cardId] = histories
    }),
    builder.addCase(loadHistoryCardThunk.rejected, (state, action) => {
      console.log(action.error)
    }),
    builder.addCase(loadHistoryCardThunk.pending, (state) => {
      console.log('loading')
    })
  }
})

export const historiesReducer = historySlice.reducer

export const selectHistories = (state: { histories: HistoryCardState }) => state.histories.historiesCard

export const selectHistoryByCardId = (cardId: string) => (state: { histories: HistoryCardState }) => state.histories.historiesCard[cardId]
