import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '../../utils/authorizeAxios'
import { API_ROOT } from '../../utils/constants'
import { mapOrder } from '../../utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '../../utils/formatters'
import { Column } from '../../interfaces/column'
import { moveCardToDifferentColumnAPI } from '../../apis'
import { isIdPlaceholder } from '../../utils/validators'

// Define the structure of a Card, Column, and Board
interface Card {
  _id: string
  columnId: string
  title: string
  // Add other properties as needed
}

interface Board {
  _id: string
  owners: any[] // Replace with specific owner type if known
  members: any[] // Replace with specific member type if known
  columns: Column[]
  columnOrderIds: string[]
  FE_allUsers?: any[] // Add specific type if known
}

// Define the structure of the initial state
interface ActiveBoardState {
  currentActiveBoard: Board | null,
  error: string | undefined
}

// Initial state
const initialState: ActiveBoardState = {
  currentActiveBoard: null,
  error: undefined
}

// Fetch board details action
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId: string): Promise<Board> => {
    // console.log('fetchBoardDetailsAPI', boardId);
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    return response.data
  }
)

// Create the activeBoard slice
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action: PayloadAction<Board | null>) => {
      state.currentActiveBoard = action.payload
      state.error = undefined
    },
    updateCardInBoard: (state, action: PayloadAction<Card>) => {
      const incomingCard = action.payload
      const column = state.currentActiveBoard?.columns.find(i => i._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find((i: Card) => i._id === incomingCard._id)
        if (card) {
          Object.keys(incomingCard).forEach(key => {
            (card as any)[key] = (incomingCard as any)[key]
          })
        }
      }
    },
    updateCardColumnInBoard: (state, action: PayloadAction<{ cardId: string, nextColumnId: string, currentColumnId: string }>) => {
      const { cardId, nextColumnId, currentColumnId } = action.payload

      if (!state.currentActiveBoard) return

      // Find the columns
      const currentColumn = state.currentActiveBoard.columns.find(column => column._id === currentColumnId)
      const nextColumn = state.currentActiveBoard.columns.find(column => column._id === nextColumnId)

      if (!currentColumn || !nextColumn) return

      // Find and remove card from current column
      const card = currentColumn.cards.find(card => card._id === cardId)
      if (!card) return

      // Update the columns
      const updatedCurrentColumn = {
        ...currentColumn,
        cards: currentColumn.cards.filter(card => card._id !== cardId),
        cardOrderIds: currentColumn.cardOrderIds.filter(id => id !== cardId)
      }

      const updatedNextColumn = {
        ...nextColumn,
        cards: [...nextColumn.cards, { ...card, columnId: nextColumnId }],
        cardOrderIds: [...nextColumn.cardOrderIds, cardId]
      }

      // Update the state immutably
      state.currentActiveBoard = {
        ...state.currentActiveBoard,
        columns: state.currentActiveBoard.columns.map(column => {
          if (column._id === currentColumnId) return updatedCurrentColumn
          if (column._id === nextColumnId) return updatedNextColumn
          return column
        })
      }

      moveCardToDifferentColumnAPI({
        currentCardId: cardId,
        prevColumnId: currentColumnId,
        prevCardOrderIds: updatedCurrentColumn.cardOrderIds.filter(id => !isIdPlaceholder(id)),
        nextColumnId: nextColumnId,
        nextCardOrderIds: updatedNextColumn.cardOrderIds.filter(id => !isIdPlaceholder(id))
      })
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action: PayloadAction<Board>) => {
      const board = action.payload

      board.FE_allUsers = board.owners.concat(board.members)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column) as any]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      state.currentActiveBoard = board
      state.error = undefined
    }),
    builder.addCase(fetchBoardDetailsAPI.rejected, (state, action) => {
      // console.log('fetchBoardDetailsAPI rejected', action);
      state.currentActiveBoard = null;
      state.error = 'Failed to fetch board details';
    }),
    builder.addCase('root/clearError', (state) => {
      state.error = undefined;
    })
  }
})

// Export action creators
export const { updateCurrentActiveBoard, updateCardInBoard, updateCardColumnInBoard } = activeBoardSlice.actions

// Selectors
export const currentActiveBoard = (state: { activeBoard: ActiveBoardState }) => state.activeBoard
export const selectCurrentActiveBoard = createSelector(
  currentActiveBoard,
  (board) => board.currentActiveBoard
)

export const selectColumnsOfBoard = createSelector(
  selectCurrentActiveBoard,
  (board) => board?.columns
)

export const selectError = (state: { activeBoard: ActiveBoardState }) => state.activeBoard.error

// Export reducer
export const activeBoardReducer = activeBoardSlice.reducer
