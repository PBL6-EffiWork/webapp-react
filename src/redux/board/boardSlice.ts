import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../interfaces/user";
import { changeStatusUserAPI, getBoardsAPIAdmin, getCardStatusAPI, getCardStatusOfBoardAPI, getMembersOfBoardAPI, getUpcomingTaskAPI, getUsersAPI, removeMemberFromBoardAPI } from "../../apis";
import { CardStatus } from "../../interfaces/task";
import { get } from "lodash";
import { Card } from "../../interfaces/card";
import { toast } from "react-toastify";

interface BoardState {
  members: {
    [key: string]: User[]
  },
  cardStatus: {
    [key: string]: {
      [key: string]: boolean
    }
  },
  upcomingTask: {
    [key: string]: Card
  },
  boards: any[],
  allMembers: User[]
}

const initialState: BoardState = {
  members: {},
  cardStatus: {},
  upcomingTask: {},
  boards: [],
  allMembers: []
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

export const loadUpcomingTaskThunk = createAsyncThunk(
  'board/loadUpcomingTask',
  async (memberId: string) => {
    const response = await getUpcomingTaskAPI(memberId)
    return {memberId, upcomingTask: response}
  }
)

export const removeMemberFromBoardThunk = createAsyncThunk(
  'board/removeMemberFromBoard',
  async ({boardId, memberId}: {boardId: string, memberId: string}) => {
    const response = await removeMemberFromBoardAPI(boardId, memberId)
    return {boardId, memberId, response}
  }
)

export const deactivateUserThunk = createAsyncThunk(
  'board/deactivateUser',
  async (userId: string) => {
    const response = await changeStatusUserAPI(userId, false)
    return {userId, response}
  }
)

export const activateUserThunk = createAsyncThunk(
  'board/activateUser',
  async (userId: string) => {
    const response = await changeStatusUserAPI(userId, true)
    return {userId, response}
  }
)

export const loadBoardsAdminThunk = createAsyncThunk(
  'board/loadBoardsAdmin',
  async () => {
    const response = await getBoardsAPIAdmin()
    return {boards: response}
  }
)

export const loadAllMembersThunk = createAsyncThunk(
  'board/loadAllMembers',
  async () => {
    const response = await getUsersAPI()
    console.log(response)
    return {members: response}
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
      const { boardId, members } = action.payload;
      state.members[boardId] = members;
    })
    .addCase(loadMembersBoardThunk.rejected, () => {
      toast.error('Failed to load members')
    })
    .addCase(loadMembersBoardThunk.pending, () => {})
    .addCase(loadCardStatusThunk.fulfilled, (state, action) => {
      const { cardId, cardStatus } = action.payload;
      state.cardStatus[cardId] = get(cardStatus, 'status', {});
    })
    .addCase(loadCardStatusThunk.rejected, () => {
      toast.error('Failed to load card status')
    })
    .addCase(loadCardStatusThunk.pending, () => {})
    .addCase(loadCardsStatusOfBoardThunk.fulfilled, (state, action) => {
      const { cardStatus } = action.payload;
      cardStatus.forEach((card: CardStatus) => {
        state.cardStatus[card.cardId] = card.status;
      });
    })
    .addCase(loadCardsStatusOfBoardThunk.rejected, () => {
      toast.error('Failed to load card status of board')
    })
    .addCase(loadCardsStatusOfBoardThunk.pending, () => {})
    .addCase(loadUpcomingTaskThunk.fulfilled, (state, action) => {
      const { memberId, upcomingTask } = action.payload;
      state.upcomingTask[memberId] = upcomingTask;
    })
    .addCase(loadUpcomingTaskThunk.rejected, () => {
      toast.error('Failed to load upcoming task')
    })
    .addCase(loadUpcomingTaskThunk.pending, () => {})
    .addCase(removeMemberFromBoardThunk.fulfilled, (state, action) => {
      const { boardId, memberId, response } = action.payload;
      state.members[boardId] = state.members[boardId].filter((member) => member._id !== memberId);
    })
    .addCase(removeMemberFromBoardThunk.rejected, () => {
      toast.error('Failed to remove member from board')
    })
    .addCase(removeMemberFromBoardThunk.pending, () => {})
    .addCase(loadBoardsAdminThunk.fulfilled, (state, action) => {
      const { boards } = action.payload;
      state.boards = boards;
    })
    .addCase(loadBoardsAdminThunk.rejected, () => {
      toast.error('Failed to load boards')
    })
    .addCase(loadBoardsAdminThunk.pending, () => {})
    .addCase(loadAllMembersThunk.fulfilled, (state, action) => {
      const { members } = action.payload;
      state.allMembers = members;
    })
    .addCase(loadAllMembersThunk.rejected, () => {
      toast.error('Failed to load all members')
    })
    .addCase(loadAllMembersThunk.pending, () => {})
    .addCase(deactivateUserThunk.fulfilled, (state, action) => {
      const { userId, response } = action.payload;
      state.allMembers = [...state.allMembers.map((member) => member._id === userId ? {...member, isActive: response.isActive} : member)];
    })
    .addCase(deactivateUserThunk.rejected, () => {
      toast.error('Failed to deactivate user')
    })
    .addCase(deactivateUserThunk.pending, () => {})
    .addCase(activateUserThunk.fulfilled, (state, action) => {
      const { userId, response } = action.payload;
      state.allMembers = [...state.allMembers.map((member) => member._id === userId ? {...member, isActive: response.isActive} : member)];
    })
    .addCase(activateUserThunk.rejected, () => {
      toast.error('Failed to activate user')
    })
    .addCase(activateUserThunk.pending, () => {})
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

export const selectAllMembersBoard = (state: { board: BoardState }) => {
  // Get array of all members
  return state.board.allMembers
}

export const selectCardStatus = (cardId: string) => createSelector(
  selectBoardCardStatus,
  (cardStatus) => cardStatus[cardId]
)

const selectBoardUpcomingTask = (state: { board: BoardState }) => state.board.upcomingTask

export const selectMembersUpcomingTask = (boardId: string) => createSelector(
  selectBoardUpcomingTask,
  selectBoardMembersId(boardId),
  (upcomingTask, members) => members.map((member) => upcomingTask[member._id])
)

export const selectMembersUpcomingTaskAll = (state: { board: BoardState }) => {
  return Object.values(state.board.upcomingTask).flat()
}
