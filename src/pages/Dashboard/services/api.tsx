import axios from 'axios';

const countUser = async () => {
  try {
    const response = await axios.get('http://localhost:8017/v1/cards/helpers/count/month');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const countBoard = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:8017/v1/boards/helpers/count/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const top5Cards = async (memberId: string): Promise<any> => {
  try {
    const response = await axios.get(`http://localhost:8017/v1/cards/top5/${memberId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const dashboardHelper = {
  countUser,
  countBoard,
  top5Cards
}