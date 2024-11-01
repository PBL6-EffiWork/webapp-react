import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '../../utils/authorizeAxios'
import { API_ROOT } from '../../utils/constants'
import { mapOrder } from '../../utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '../../utils/formatters'

// Define the structure of a Card, Column, and Board
interface Card {
  _id: string
  columnId: string
  title: string
  // Add other properties as needed
}

interface Column {
  [key: string]: any
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
  currentActiveBoard: Board | null
}

// Initial state
const initialState: ActiveBoardState = {
  currentActiveBoard: null
}

// Fetch board details action
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId: string): Promise<Board> => {
    console.log('fetchBoardDetailsAPI', boardId);
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    return response.data
  }
)

// Create the activeBoard slice
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action: PayloadAction<Board>) => {
      state.currentActiveBoard = action.payload
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
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action: PayloadAction<Board>) => {
      const board = action.payload

      board.FE_allUsers = board.owners.concat(board.members)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      state.currentActiveBoard = board
    })
  }
})

// Export action creators
export const { updateCurrentActiveBoard, updateCardInBoard } = activeBoardSlice.actions

// Selectors
export const selectCurrentActiveBoard = (state: { activeBoard: ActiveBoardState }) => state.activeBoard.currentActiveBoard

// Export reducer
export const activeBoardReducer = activeBoardSlice.reducer
