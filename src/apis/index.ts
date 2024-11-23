import { Subtask, Task } from '../interfaces/task'
import authorizedAxiosInstance from '../utils/authorizeAxios'
import { API_ROOT } from '../utils/constants'
import { toast } from 'react-toastify'


/** Boards */
// Đã move vào redux
// export const fetchBoardDetailsAPI = async (boardId) => {
//   const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
//   // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
//   return response.data
// }

export const updateBoardDetailsAPI = async (boardId: any, updateData: { columnOrderIds: any }) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const getMembersOfBoardAPI = async (boardId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}/members`)

  return response.data
}

export const moveCardToDifferentColumnAPI = async (updateData: { currentCardId: string; prevColumnId: string; prevCardOrderIds: string[]; nextColumnId: string; nextCardOrderIds: string[] }) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  return response.data
}

/** Columns */
export const createNewColumnAPI = async (newColumnData: { boardId: any; title: string }) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailsAPI = async (columnId: string, updateData: { title?: any; cardOrderIds?: any }) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailsAPI = async (columnId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}

/** Cards */
export const createNewCardAPI = async (newCardData: { boardId: any; title: string; columnId: string }) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

/** Comments */
export const createCommentAPI = async (newCommentData: { cardId: string; userId: string; content: string }) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/comments`, newCommentData)
  return response.data
}

export const getCommentsAPI = async (cardId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/comments/${cardId}`)
  return response.data
}

/** History */
export const loadHistoryCardAPI = async (cardId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/history/card/${cardId}`)
  return response.data
}

/** Users */
export const registerUserAPI = async (data: { email: any; password: any }) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Account created successfully! Please check and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const verifyUserAPI = async (data: { email: string; token: string }) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! Now you can login to enjoy our services! Have a good day!', { theme: 'colored' })
  return response.data
}

export const refreshTokenAPI = async (refreshToken: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`, {
    params: {
      refreshToken
    }
  })
  return response.data
}

/** Boards */
export const fetchBoardsAPI = async (searchPath: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const fetchColumnsOfBoardAPI = async (boardId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}/columns`)
  return response.data
}

export const createNewBoardAPI = async (data: any) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Board created successfully')
  return response.data
}

export const updateCardDetailsAPI = async (cardId: any, updateData: any) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

export const inviteUserToBoardAPI = async (data: { inviteeEmail: any; boardId: any }) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('User invited to board successfully!')
  return response.data
}

/** Tasks */
export const getTasksAPI = async (cardId: string) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/tasks/${cardId}`)
  return response.data
}

export const createTaskAPI = async (newTaskData: Task) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/tasks`, newTaskData)
  return response.data
}

export const removeTaskAPI = async (taskId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/tasks/${taskId}`)
  return response.data
}

/** Subtasks */
export const createSubtaskAPI = async (newSubtaskData: Subtask) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/subtasks`, newSubtaskData)
  return response.data
}

export const updateSubtaskAPI = async (subtaskId: string, updateData: any) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/subtasks/${subtaskId}`, updateData)
  return response.data
}

export const removeSubtaskAPI = async (subtaskId: string) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/subtasks/${subtaskId}`)
  return response.data
}

export const countUser = async () => {
  try {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/count`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const countBoard = async (memberID: string) => {
  try {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/helpers/count/${memberID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const top5Cards = async (memberId: string): Promise<any> => {
  try {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/cards/top5/${memberId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const countCard = async (timeframe: string ,memberID: string) => {
  try {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/cards/helpers/count/${timeframe}&${memberID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const countEvent = async (memberID: string) => {
  try {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/events/count/${memberID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

