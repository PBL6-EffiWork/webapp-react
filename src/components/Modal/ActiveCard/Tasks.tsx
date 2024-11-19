'use client'

import { useCallback, useState } from 'react'
import { DeleteIcon, Plus, X, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Subtask, Task } from '../../../interfaces/task'
import { useSelector } from 'react-redux'
import { 
  createTaskThunk, 
  selectTasksByCardId, 
  createSubtaskThunk, 
  updateSubtaskThunk 
} from '../../../redux/task/taskSlice'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { v4 as uuidv4 } from 'uuid'
import { DeleteForeverOutlined, MoreVertOutlined, TaskAltOutlined } from '@mui/icons-material'

interface TasksProps {
  cardId?: string
  boardId?: string
}

const Tasks: React.FC<TasksProps> = ({ cardId, boardId }) => {
  const [addingSubtask, setAddingSubtask] = useState<string | null>(null)
  const [newSubtaskText, setNewSubtaskText] = useState('')
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null)
  const [editedSubtaskText, setEditedSubtaskText] = useState('')

  const dispatch = useAppDispatch()

  const tasks = useSelector(selectTasksByCardId(cardId || '')) || []

  const calculateProgress = (subtasks: Subtask[] | undefined): number => {
    if (!subtasks || subtasks.length === 0) return 0
    const completedTasks = subtasks.filter(task => task.completed).length
    return Math.round((completedTasks / subtasks.length) * 100)
  }

  const addSubtask = useCallback(
    (taskId: string) => {
      if (newSubtaskText.trim() && cardId && boardId) {
        const newSubtask: Subtask = {
          _id: uuidv4(),
          title: newSubtaskText.trim(),
          completed: false,
          cardId,
          boardId,
          taskId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        dispatch(createSubtaskThunk(newSubtask))
          .unwrap()
          .then(() => {
            setNewSubtaskText('')
            setAddingSubtask(null)
          })
          .catch((error) => {
            console.error('Failed to add subtask:', error)
          })
      } else {
        console.warn('Card ID and Board ID must be provided to add a subtask.')
      }
    },
    [dispatch, newSubtaskText, cardId, boardId]
  )

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string, currentStatus: boolean) => {
      if (subtaskId) {
        dispatch(updateSubtaskThunk({ _id: subtaskId, completed: !currentStatus }))
          .unwrap()
          .catch((error) => {
            console.error('Failed to toggle subtask:', error)
          })
      } else {
        console.warn('Subtask ID is required to toggle subtask status.')
      }
    },
    [dispatch]
  )

  const updateSubtaskTitle = useCallback(
    (subtaskId: string) => {
      if (subtaskId && editedSubtaskText.trim()) {
        dispatch(updateSubtaskThunk({ _id: subtaskId, title: editedSubtaskText.trim() }))
          .unwrap()
          .then(() => {
            setEditingSubtask(null)
            setEditedSubtaskText('')
          })
          .catch((error) => {
            console.error('Failed to update subtask title:', error)
          })
      } else {
        console.warn('Subtask ID and new title are required to update subtask.')
      }
    },
    [dispatch, editedSubtaskText]
  )

  const renderTask = (task: Task) => (
    <div key={task._id} className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium flex items-center">
          <TaskAltOutlined fontSize="small" className="mr-2" />
          {task.title || 'Untitled Task'}
        </Label>

        <Button variant="outline" size="sm" className="text-red-500">
          <DeleteForeverOutlined fontSize="small" />
          Delete
        </Button>
      </div>
      
      <Progress value={calculateProgress(task.subtasks)} className="h-2" />
      
      <div className="ml-4 space-y-3">
        {(task.subtasks || []).map(subtask => (
          <div key={subtask._id} className="flex items-center space-x-2">
            <Checkbox 
              id={`subtask-${subtask._id}`} 
              checked={subtask.completed}
              onCheckedChange={() => toggleSubtask(task._id, subtask._id, subtask.completed)}
            />
            {editingSubtask === subtask._id ? (
              <div className="flex-grow flex items-center space-x-2">
                <Input
                  value={editedSubtaskText}
                  onChange={(e) => setEditedSubtaskText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && updateSubtaskTitle(subtask._id)}
                  className="flex-grow"
                />
                <Button onClick={() => updateSubtaskTitle(subtask._id)} size="sm">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={() => setEditingSubtask(null)} size="sm" variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label 
                htmlFor={`subtask-${subtask._id}`}
                className={`flex-grow ${subtask.completed ? 'line-through text-muted-foreground' : ''} cursor-pointer hover:bg-gray-200 rounded-md p-2`}
                onClick={() => {
                  setEditingSubtask(subtask._id)
                  setEditedSubtaskText(subtask.title)
                }}
              >
                {subtask.title || 'Untitled Subtask'}
              </label>
            )}
          </div>
        ))}

        {addingSubtask === task._id && (
          <div className="flex flex-col space-y-2 mt-2">
            <Input
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSubtask(task._id)}
              placeholder="Enter subtask..."
              className="flex-grow"
            />
            <div className="flex items-center space-x-2">
              <Button onClick={() => addSubtask(task._id)} size="sm">
                <Plus className="h-4 w-4" />
                Add
              </Button>
              <Button onClick={() => setAddingSubtask(null)} size="sm" variant="outline">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setAddingSubtask(addingSubtask === task._id ? null : task._id)}
        >
          Add Subtask
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {(tasks || []).map(task => renderTask(task))}
      
      {(!cardId || !boardId) && (
        <p className="text-red-500 mt-2">
          Unable to add tasks. Card ID and Board ID are required.
        </p>
      )}
    </div>
  )
}

export default Tasks
