/**
 * Created by effiwork.com's author on Jun 28, 2023
 */
/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val: string) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

/**
 * Video 37.2 hàm generatePlaceholderCard: Cách xử lý bug logic thư viện Dnd-kit khi Column là rỗng:
 * Phía FE sẽ tự tạo ra một cái card đặc biệt: Placeholder Card, không liên quan tới Back-end
 * Card đặc biệt này sẽ được ẩn ở giao diện UI người dùng.
 * Cấu trúc Id của cái card này để Unique rất đơn giản, không cần phải làm random phức tạp:
 * "columnId-placeholder-card" (mỗi column chỉ có thể có tối đa một cái Placeholder Card)
 * Quan trọng khi tạo: phải đầy đủ: (_id, boardId, columnId, FE_PlaceholderCard)
*/
interface Column {
  [key: string]: any;
}

export const generatePlaceholderCard = (column: Column) => {
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

