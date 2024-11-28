export const Categories = {
  ALL: 'all',
  BOARD: 'board',
  COLUMN: 'column',
  CARD: 'card',
  USER: 'user',
} as const;

export type Category = typeof Categories[keyof typeof Categories];
