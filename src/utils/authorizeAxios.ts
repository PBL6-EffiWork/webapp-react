import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { interceptorLoadingElements } from '../utils/formatters';
import { refreshTokenAPI } from '../apis';
import { logoutUserAPI } from '../redux/user/userSlice';
import { Store } from 'redux';
import { LocalStorageHelper } from '../helpers/storage';

/**
 * Không thể import { store } từ 'store' theo cách thông thường như các file jsx component
 * Giải pháp: Inject store: là kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi react component như file authorizeAxios hiện tại
 * Hiểu đơn giản: khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi hàm injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này.
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore: Store | undefined;
export const injectStore = (mainStore: Store): void => {
  axiosReduxStore = mainStore;
};

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án.
let authorizedAxiosInstance = axios.create();
// Thời gian chờ tối đa của 1 request: để 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10;
// withCredentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ việc chúng ta sẽ lưu JWT tokens (refresh & access) vào trong httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true;

/**
 * Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi Request & Response)
 * https://axios-http.com/docs/interceptors
 */
// Interceptor Request: Can thiệp vào giữa những cái request API
authorizedAxiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(true);

    const accessToken = LocalStorageHelper.getItem('accessToken');

    // Nếu có accessToken, thêm vào Authorization header
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;

  },
  (error: AxiosError): Promise<AxiosError> => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api bị lỗi trước đó.
let refreshTokenPromise: Promise<string | undefined> | null = null;

// Interceptor Response: Can thiệp vào giữa những cái response nhận về
authorizedAxiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(false);

    return response;
  },
  (error: AxiosError): Promise<never> => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    /* Mọi mã http status code nằm ngoài khoảng 200 - 299 sẽ là error và rơi vào đây */

    // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatters chứa function)
    interceptorLoadingElements(false);

    /** Quan trọng: Xử lý Refresh Token tự động */
    // Trường hợp 1: Nếu như nhận mã 401 từ BE, thì gọi api đăng xuất luôn
    if (error.response?.status === 401 && axiosReduxStore) {
      axiosReduxStore.dispatch(logoutUserAPI(false) as any);
    }

    // Trường hợp 2: Nếu như nhận mã 410 từ BE, thì sẽ gọi api refresh token để làm mới lại accessToken
    // Trường hợp 2 > Bước 1: Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
    const originalRequest = error.config as AxiosRequestConfig;

    if (error.response?.status === 410 && originalRequest) {
      // UPDATE THÊM: Có thể bỏ không cần thêm cái _retry giống như nhiều bài hướng dẫn khác trên mạng nữa vì chúng ta đang làm chuẩn với biến refreshTokenPromise ở trên rồi
      // Gán thêm một giá trị _retry luôn = true trong khoảng thời gian chờ, đảm bảo việc refresh token này chỉ luôn gọi 1 lần tại 1 thời điểm (nhìn lại điều kiện if ngay phía trên)
      // originalRequest._retry = true

      // Trường hợp 2 > Bước 2: Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gán việc gọi api refresh_token đồng thời gán vào cho cái refreshTokenPromise
      if (!refreshTokenPromise) {
        const refreshToken = LocalStorageHelper.getItem('refreshToken') as string
        refreshTokenPromise = refreshTokenAPI(refreshToken)
          .then((data) => {
            /**
             * Đối với Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết thêm code xử lý ở đây.
             * Hiện tại ở đây không cần làm gì vì đồng thời accessToken đã nằm trong httpOnly cookie (xử lý từ phía BE) sau khi api refreshToken được gọi thành công.
             */
            return data?.accessToken;
          })
          .catch((_error) => {
            // Nếu nhận bất kỳ lỗi nào từ api refresh token thì cứ logout luôn
            if (axiosReduxStore) {
              axiosReduxStore.dispatch(logoutUserAPI(false) as any);
            }
            // Trả về promise reject
            return Promise.reject(_error);
          })
          .finally(() => {
            // Dù API refresh_token có thành công hay lỗi thì vẫn luôn gán lại cái refreshTokenPromise về null như ban đầu
            refreshTokenPromise = null;
          });
      }

      // Trường hợp 2 > Bước 3: Cuối cùng mới return cái refreshTokenPromise trong trường hợp success ở đây
      return refreshTokenPromise.then((accessToken) => {
        /**
         * Case 1: Đối với Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết thêm code xử lý ở đây.
         * Hiện tại ở đây không cần bước 1 này vì chúng ta đã đưa accessToken vào cookie (xử lý từ phía BE) sau khi api refreshToken được gọi thành công.
         */

        LocalStorageHelper.setItem('accessToken', accessToken)

        // Case 2: Bước Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để gọi lại những api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequest);
      });
    }

    // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
    // console.log error ra là sẽ thấy cấu trúc data đẫn tới message lỗi như dưới đây
    let errorMessage = error?.message;
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string };
      errorMessage = data.message || errorMessage;
    }
    // Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh lại token.
    if (error.response?.status !== 410) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default authorizedAxiosInstance;
