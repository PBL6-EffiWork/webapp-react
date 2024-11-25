import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/user";
import { getCardStatusAPI, getCardStatusOfBoardAPI, getMembersOfBoardAPI } from "../../apis";
import { CardStatus } from "../../interfaces/task";
import { get } from "lodash";

interface BoardState {
  members: {
    [key: string]: User[]
  },
  cardStatus: {
    [key: string]: {
      [key: string]: boolean
    }
  }
}

const initialState: BoardState = {
  members: {},
  cardStatus: {}
}

export const loadMembersBoardThunk = createAsyncThunk(
  'board/loadMembers',
  async (boardId: string) => {
    const response = await getMembersOfBoardAPI(boardId)
    return {boardId, members: response}
  }
)

export const loadCardStatusThunk = createAsyncThunk(
  'board/loadCardStatus',
  async ({cardId, boardId}: {cardId: string, boardId: string}) => {
    const response = await getCardStatusAPI(cardId, boardId)
    return {boardId, cardId, cardStatus: response}
  }
)

export const loadCardsStatusOfBoardThunk = createAsyncThunk(
  'board/loadCardsStatusOfBoard',
  async (boardId: string) => {
    const response = await getCardStatusOfBoardAPI(boardId)
    return {boardId, cardStatus: response}
  }
)

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    updateCardStatus: (state, action: PayloadAction<{ cardId: string, columnId: string, status: boolean }>) => {
      const { cardId, columnId, status } = action.payload
      state.cardStatus[cardId][columnId] = status
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadMembersBoardThunk.fulfilled, (state, action) => {
      const { boardId, members } = action.payload
      state.members[boardId] = members
    }),
    builder.addCase(loadMembersBoardThunk.rejected, (state, action) => {
      // console.log(action.error)
    }),
    builder.addCase(loadMembersBoardThunk.pending, (state) => {
      // console.log('loading')
    }),
    builder.addCase(loadCardStatusThunk.fulfilled, (state, action) => {
      const { boardId, cardId, cardStatus } = action.payload
      state.cardStatus[cardId] = get(cardStatus, 'status', {})
    }),
    builder.addCase(loadCardStatusThunk.rejected, (state, action) => {
      // console.log(action.error)
    }),
    builder.addCase(loadCardStatusThunk.pending, (state) => {
      // console.log('loading')
    }),
    builder.addCase(loadCardsStatusOfBoardThunk.fulfilled, (state, action) => {
      const { cardStatus } = action.payload
      // Update card status of board [{cardId: status}]
      // save to cardStatus[cardId] = status
      cardStatus.forEach((card: CardStatus) => {
        state.cardStatus[card.cardId] = card.status
      })
    }),
    builder.addCase(loadCardsStatusOfBoardThunk.rejected, (state, action) => {
      // console.log(action.error)
    }),
    builder.addCase(loadCardsStatusOfBoardThunk.pending, (state) => {
      // console.log('loading')
    })
  }
})

export const boardReducer = boardSlice.reducer

export const { updateCardStatus } = boardSlice.actions

export const selectBoard = (state: { board: BoardState }) => state.board.members
const selectBoardCardStatus = (state: { board: BoardState }) => state.board.cardStatus

export const selectBoardMembersId = (boardId: string) => createSelector(
  selectBoard,
  (members) => {
    return members[boardId];
  }
)

export const selectCardStatus = (cardId: string) => createSelector(
  selectBoardCardStatus,
  (cardStatus) => cardStatus[cardId]
)
