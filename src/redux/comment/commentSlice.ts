import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit"
import { getCommentsAPI, createCommentAPI  } from "../../apis"

interface CommentState {
  comments: {
    [key: string]: Comment[]
  },
}

const initialState: CommentState = {
  comments: {},
}

export const loadCommentsThunk = createAsyncThunk(
  'comment/loadComments',
  async (cardId: string) => {
    const response = await getCommentsAPI(cardId)
    return {cardId, comments: response.data}
  }
)

export const addCommentThunk = createAsyncThunk(
  'comment/addComment',
  async (newCommentData: { cardId: string; userId: string; content: string }) => {
    const response = await createCommentAPI(newCommentData)
    return {cardId: newCommentData.cardId, comments: response.data}
  }
)

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadCommentsThunk.fulfilled, (state, action) => {
      const { cardId, comments } = action.payload
      state.comments[cardId] = comments
    }),
    builder.addCase(loadCommentsThunk.rejected, (state, action) => {
      console.log(action.error)
    }),
    builder.addCase(loadCommentsThunk.pending, (state) => {
      console.log('loading')
    }),
    builder.addCase(addCommentThunk.fulfilled, (state, action) => {
      const { cardId, comments } = action.payload
      const oldComments = state.comments[cardId] || []
      state.comments[cardId] = [...oldComments, comments]
    }),
    builder.addCase(addCommentThunk.rejected, (state, action) => {
      console.log(action.error)
    }),
    builder.addCase(addCommentThunk.pending, (state) => {
      console.log('loading')
    })
  }
})

export const commentReducer = commentSlice.reducer

export const selectComments = (state: { comments: CommentState }) => state.comments.comments

export const selectCommentsByCardId = (cardId?: string) => createSelector(
  selectComments,
  (comments) => comments[cardId as string] || []
)
