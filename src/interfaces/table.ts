import { User } from "./user"

export type BoardTableRow = {
  id: string
  title: string
  status: string
  members: User[]
  dueDate: number | null
  startDate: number | null
}
