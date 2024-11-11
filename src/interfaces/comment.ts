export interface Comment {
  userId: string;
  cardId: string;
  content: string;
  createdAt?: number;
  updateAt?: number;
  [key: string]: any;
}
