import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../ui/select'
import { useSelector } from 'react-redux'
import { selectColumnsOfBoard, updateCardColumnInBoard } from '../../../redux/activeBoard/activeBoardSlice'
import { Column } from '../../../interfaces/column'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { updateCardColumn } from '../../../redux/activeCard/activeCardSlice'
import { moveCardToDifferentColumnAPI } from '../../../apis'

interface SelectColumnProps {
  cardId?: string,
  currentColumnId?: string,
  isShow?: boolean
} 

function SelectColumn({ cardId, currentColumnId, isShow }: SelectColumnProps) {
  const columns = useSelector(selectColumnsOfBoard)
  const dispatch = useAppDispatch()

  const onChange = (nextColumnId: string) => {
    if (nextColumnId === currentColumnId) return
    dispatch(updateCardColumnInBoard({ cardId: cardId as string, nextColumnId: nextColumnId as string, currentColumnId: currentColumnId as string }))
    dispatch(updateCardColumn({ nextColumnId: nextColumnId as string }))
  }

  const currentColumn = columns?.find((column: Column) => column._id === currentColumnId)
  return (
    <div className={`z-[99999] ${isShow ? 'opacity-100' : 'opacity-0'}`}>
      <Select defaultValue={currentColumnId} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={currentColumn?.title || 'Select a column'} />
        </SelectTrigger>
        <SelectContent className='z-[99999]'>
          <SelectGroup>
            {(columns || []).map((column: Column) => (
              <SelectItem key={column._id} value={column._id} >
                {column.title}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default SelectColumn
