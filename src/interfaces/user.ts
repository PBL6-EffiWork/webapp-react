export interface User {
  _id:         string;
  email:       string;
  username:    string;
  displayName: string;
  avatar:      string;
  role:        string;
  isActive:    boolean;
  createdAt:   number;
  updatedAt:   number;
}
