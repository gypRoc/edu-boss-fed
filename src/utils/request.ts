import axios from 'axios'
import store from '@/store'
const request = axios.create({
  // 配置选项
  // baseURL,
  // timeout
})

// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // 我们就在这里通过改写config 配置信息来实现业务功能统一处理
  const { user } = store.state
  if (user && user.access_token) {
    config.headers.Authorization = user.access_token
  }
  // 注意：这里一定要返回 config ，否则请求发不出去
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 响应拦截器

export default request
