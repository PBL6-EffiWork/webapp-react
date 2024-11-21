export interface Task {
  _id: string;
  title: string;
  cardId: string;
  boardId: string;
  description: string;
  createdAt?: number;
  updatedAt?: number;

  subtasks: Subtask[];
}

export interface Subtask {
  _id: string;
  boardId: string;
  cardId: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt?: number;
  updatedAt?: number;
}
