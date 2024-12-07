import { Actions, Action } from '../constants/action';
import { Categories, Category } from '../constants/category';
import { MongoAbility, createMongoAbility } from '@casl/ability';

// Định nghĩa type cho MongoAbility
export type AppAbility = MongoAbility<[Action, Category]>;

// Tạo abilities cho các role khác nhau
const defineAbilitiesFor = (role: 'admin' | 'manager' | 'client') => {
  const { MANAGE, CREATE, READ, UPDATE, DELETE } = Actions;
  const { ALL, BOARD, COLUMN, CARD, USER } = Categories;

  switch (role) {
    case 'admin':
      return createMongoAbility<[Action, Category]>([
        { action: MANAGE, subject: ALL }, // Admin có toàn quyền
        { action: [READ, CREATE, UPDATE, DELETE], subject: [BOARD, COLUMN, CARD, USER] },
      ]);

    case 'manager':
      return createMongoAbility<[Action, Category]>([
        { action: MANAGE, subject: [BOARD, COLUMN, CARD] },
        { action: [READ, CREATE, UPDATE, DELETE], subject: [BOARD, COLUMN, CARD] },
        { action: READ, subject: USER }, // Manager chỉ có thể đọc thông tin người dùng
      ]);

    case 'client':
      return createMongoAbility<[Action, Category]>([
        { action: [READ, CREATE], subject: [CARD] }, // Client chỉ có thể đọc và tạo card
        { action: READ, subject: BOARD }, // Client có thể đọc board
      ]);

    default:
      return createMongoAbility<[Action, Category]>([]); // Không có quyền nếu không thuộc role nào
  }
};

export default defineAbilitiesFor;
