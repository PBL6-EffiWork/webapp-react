/**
 * Created by effiwork.com's author on Jun 28, 2023
 */

import { Column } from "../interfaces/column"

/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val: string) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

export const generatePlaceholderCard = (column: any) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}

// Kỹ thuật dùng css pointer-event để chặn user spam click tại bất kỳ chỗ nào có hành động click gọi api
// Đây là một kỹ thuật rất hay tận dụng Axios Interceptors và CSS Pointer-events để chỉ phải viết code xử lý một lần cho toàn bộ dự án
// Cách sử dụng: Với tất cả các link hoặc button mà có hành động gọi api thì thêm class "interceptor-loading" cho nó là xong.
export const interceptorLoadingElements = (calling: boolean): void => {
  // DOM lấy ra toàn bộ phần tử trên page hiện tại có className là 'interceptor-loading'
  const elements = document.querySelectorAll('.interceptor-loading');
  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      if (calling) {
        // Nếu đang trong thời gian chờ gọi API (calling === true) thì sẽ làm mờ phần tử và chặn click bằng css pointer-events
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
      } else {
        // Ngược lại thì trả về như ban đầu, không làm gì cả
        element.style.opacity = 'initial';
        element.style.pointerEvents = 'initial';
      }
    }
  });
};

