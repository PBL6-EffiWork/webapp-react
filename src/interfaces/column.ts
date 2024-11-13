import { Card } from "./card"

export interface Column {
  _id: string
  title: string
  boardId: string
  cardOrderIds: string[]
  createdAt: number
  updatedAt: number
  _destroy: boolean
  cards: Card[]
}
