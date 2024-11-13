import axios from 'axios';

export const countUser = async () => {
  try {
    const response = await axios.get('http://localhost:8017/v1/users/count');
    return response.data;
  } catch (error) {
    throw error;
  }
};