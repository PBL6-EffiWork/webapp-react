// src/redux/task/taskSlice.ts

import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Subtask, Task } from "../../interfaces/task";
import { 
  createSubtaskAPI, 
  createTaskAPI, 
  getTasksAPI, 
  updateSubtaskAPI 
} from "../../apis";

// Define the structure of the TaskState
interface TaskState {
  tasks: {
    [cardId: string]: Task[];
  };
  error: string | null;
}

// Initialize the state
const initialState: TaskState = {
  tasks: {},
  error: null,
};

// Thunk to load tasks by cardId
export const loadTasksThunk = createAsyncThunk(
  'task/loadTasks',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const response = await getTasksAPI(cardId);
      return { cardId, tasks: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load tasks');
    }
  }
);

// Thunk to create a new task
export const createTaskThunk = createAsyncThunk(
  'task/createTask',
  async (newTaskData: Task, { rejectWithValue }) => {
    try {
      const response = await createTaskAPI(newTaskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create task');
    }
  }
);

// Thunk to create a new subtask
export const createSubtaskThunk = createAsyncThunk(
  'task/createSubtask',
  async (newSubtaskData: Subtask, { rejectWithValue }) => {
    try {
      const response = await createSubtaskAPI(newSubtaskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create subtask');
    }
  }
);

// Thunk to update an existing subtask
export const updateSubtaskThunk = createAsyncThunk(
  'task/updateSubtask',
  async (updatedSubtaskData: Partial<Subtask>, { rejectWithValue }) => {
    try {
      if (!updatedSubtaskData._id) {
        throw new Error('Subtask ID is required');
      }
      const response = await updateSubtaskAPI(
        updatedSubtaskData._id,
        updatedSubtaskData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update subtask');
    }
  }
);

// Create the task slice
export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle fulfilled state for loading tasks
      .addCase(loadTasksThunk.fulfilled, (state, action) => {
        const { cardId, tasks } = action.payload;
        state.tasks[cardId] = tasks;
        state.error = null;
      })
      // Handle rejected state for loading tasks
      .addCase(loadTasksThunk.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to load tasks';
      })
      // Handle fulfilled state for creating a task
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        const newTask = action.payload;
        const { cardId } = newTask;
        if (!state.tasks[cardId]) {
          state.tasks[cardId] = [];
        }
        state.tasks[cardId].push(newTask);
        state.error = null;
      })
      // Handle rejected state for creating a task
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to create task';
      })
      // Handle fulfilled state for creating a subtask
      .addCase(createSubtaskThunk.fulfilled, (state, action) => {
        const newSubtask = action.payload;
        const { cardId, taskId } = newSubtask;
        const taskList = state.tasks[cardId];
        if (taskList) {
          const task = taskList.find(task => task._id === taskId);
          if (task) {
            if (!task.subtasks) {
              task.subtasks = [];
            }
            task.subtasks.push(newSubtask);
          }
        }
        state.error = null;
      })
      // Handle rejected state for creating a subtask
      .addCase(createSubtaskThunk.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to create subtask';
      })
      // Handle fulfilled state for updating a subtask
      .addCase(updateSubtaskThunk.fulfilled, (state, action) => {
        const updatedSubtask = action.payload;
        const { cardId, taskId } = updatedSubtask;
        const taskList = state.tasks[cardId];
        if (taskList) {
          const task = taskList.find(task => task._id === taskId);
          if (task && task.subtasks) {
            const subtaskIndex = task.subtasks.findIndex(sub => sub._id === updatedSubtask._id);
            if (subtaskIndex !== -1) {
              task.subtasks[subtaskIndex] = {
                ...task.subtasks[subtaskIndex],
                ...updatedSubtask,
                updatedAt: Date.now(),
              };
            }
          }
        }
        state.error = null;
      })
      // Handle rejected state for updating a subtask
      .addCase(updateSubtaskThunk.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to update subtask';
      });
  },
});

// Export the reducer to be included in the store
export const taskReducer = taskSlice.reducer;

// Selectors

// Select all tasks
export const selectTasks = (state: { tasks: TaskState }) => state.tasks.tasks;

// Select tasks by cardId using createSelector for memoization
export const selectTasksByCardId = (cardId: string) => createSelector(
  selectTasks,
  (tasks) => tasks[cardId] || []
);

// Select any error from the task state
export const selectError = (state: { tasks: TaskState }) => state.tasks.error;
