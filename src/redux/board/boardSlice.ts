import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/user";
import { getMembersOfBoardAPI } from "../../apis";

interface BoardState {
  members: {
    [key: string]: User[]
  },
}

const initialState: BoardState = {
  members: {},
}

export const loadMembersBoardThunk = createAsyncThunk(
  'board/loadMembers',
  async (boardId: string) => {
    const response = await getMembersOfBoardAPI(boardId)
    return {boardId, members: response}
  }
)

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {},
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
    })
  }
})

export const boardReducer = boardSlice.reducer

export const selectBoard = (state: { board: BoardState }) => state.board.members

export const selectBoardMembersId = (boardId: string) => createSelector(
  selectBoard,
  (members) => {
    return members[boardId];
  }
)
