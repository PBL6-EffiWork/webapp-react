export interface Card {
  _id: string
  title: string
  columnId: string
  boardId: string
  cover: string | null
  memberIds: string[]
  createdAt: number
  updatedAt: number | null
  startDate: number | null
  dueDate: number | null
  _destroy: boolean
}
