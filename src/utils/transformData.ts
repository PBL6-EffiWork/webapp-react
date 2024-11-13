import { Column } from "../interfaces/column"
import { BoardTableRow } from "../interfaces/table"

export const transformData = (columnsData: Column[]): BoardTableRow[] => {
  const rows: BoardTableRow[] = []

  columnsData.forEach((column) => {
    column.cards.forEach((card) => {
      rows.push({
        id: card._id,
        title: card.title,
        status: column.title,
        members: card.memberIds,
        dueDate: card.dueDate,
        startDate: card.startDate,
      })
    })
  })

  return rows
}
