export interface History {
  _id: string;
  boardId: string;
  cardId: string;
  actor: {
    userId: string;
    userEmail: string;
    displayName: string;
    avatar: string;
  };
  type: HistoryType;
  previous: {
    [key: string]: any;
  },
  current: {
    [key: string]: any;
  },
  createdAt: number;
  updateAt: number;
}

export enum HistoryType {
  CREATE_NEW_CARD,
  UPDATE_MEMBERS_CARD,
  UPDATE_CARD_COVER,
  UPDATE_INFO_CARD,
  DELETE_CARD,
  UPDATE_CARD_DUE_DATE,
  UPDATE_CARD_STATUS,
  UPDATE_CARD_COMMENT,

  // COLUMN ACTIONS
  CREATE_NEW_COLUMN,
  UPDATE_COLUMN_TITLE,
  DELETE_COLUMN
}
