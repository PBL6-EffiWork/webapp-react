let apiRoot = ''
// console.log('import.meta.env: ', import.meta.env)
// console.log('process.env: ', process.env)

// Môi trường Dev sẽ chạy localhost với port 8017
if (process.env.BUILD_MODE === 'dev') {
  // apiRoot = 'http://localhost:8017'
  // apiRoot = 'http://18.207.127.179:3000'
  apiRoot = 'https://api.tusgino.tech'
}

// Môi trường Production sẽ cần api endpoint chuẩn của các bạn
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://api.tusgino.tech'
}
export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
