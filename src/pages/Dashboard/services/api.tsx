import axios from 'axios';

const countUser = async () => {
  try {
    const response = await axios.get('http://localhost:8017/v1/users/count');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const countBoard = async () => {
  try {
    const response = await axios.get('http://localhost:8017/v1/boards/helpers/count');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const dashboardHelper = {
  countUser,
  countBoard
}