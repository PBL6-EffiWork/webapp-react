"use client"

import React, { useState, useCallback } from "react"
import { Plus, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { createTaskThunk } from '../../../redux/task/taskSlice'
import { v4 as uuidv4 } from 'uuid'
import { Task } from "../../../interfaces/task"

interface ChecklistProps {
  cardId: string
  boardId: string
  button?: React.ReactElement
}

const Checklist: React.FC<ChecklistProps> = ({ cardId, boardId, button }) => {
  const [newTaskText, setNewTaskText] = useState('')
  
  const dispatch = useAppDispatch()

  const addTask = useCallback(() => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        _id: uuidv4(),
        title: newTaskText.trim(),
        cardId,
        boardId,
        description: '',
        subtasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      dispatch(createTaskThunk(newTask))
        .unwrap()
        .then(() => {
          setNewTaskText('')
        })
        .catch((error) => {
          console.error('Failed to add task:', error)
        })
    } else {
      console.warn('Task title cannot be empty.')
    }
  }, [newTaskText, dispatch, cardId, boardId])

  return (
    <Popover>
      <PopoverTrigger asChild>
        {button || (
          <Button variant="secondary" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Checklist
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex flex-col space-y-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Enter checklist title..."
            className="flex-grow"
          />
          <div className="flex items-center space-x-2">
            <Button onClick={addTask} variant="default" size="sm">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {(!cardId || !boardId) && (
          <p className="text-red-500 mt-2">
            Unable to add checklist. Card ID and Board ID are required.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default Checklist
