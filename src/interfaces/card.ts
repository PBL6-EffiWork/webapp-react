export interface Card {
  _id: string
  title: string
  columnId: string
  boardId: string
  cover: string | null
  memberIds: string[]
  createdAt: number
  updatedAt: number | null
  startDate?: any
  dueDate?: any
  comments?: string[];
  attachments?: string[];
  FE_PlaceholderCard?: boolean;
  isDone?: boolean;
  [key: string]: any
}
