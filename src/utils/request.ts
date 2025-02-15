import axios from 'axios'
import store from '@/store'
import router from '@/router'
import qs from 'qs'
import { Message } from 'element-ui'
const request = axios.create({
  // 配置选项
  // baseURL,
  // timeout
})
let isRefresh = false // 控制刷新 token 的状态
let requests: any[] = [] // 存储刷新 token 期间过来的401 请求
function redirectLogin () {
  router.push({
    name: 'login',
    query: { redirect: router.currentRoute.fullPath }
  })
}

function refreshToken () {
  return axios.create()({
    method: 'POST',
    url: '/front/user/refresh_token',
    data: qs.stringify({
      refreshtoken: store.state.user.refresh_token
    })
  })
}
// 请求拦截器
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
request.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  //  如果是自定义状态码，错误处理在这里
  // console.log('请求响应成功了 =》', response)
  return response
}, async function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  //  如果是HTTP状态码，错误处理在这里
  // console.log('请求响应失败了 =》', error)
  // console.dir(error)

  if (error.response) {
    // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
    const { status } = error.response
    if (status === 400) {
      Message.error('请求参数错误')
    } else if (status === 401) {
      // token 无效(没有提供token、token是无效的、token过期)
      // 如果有 refresh_token,则尝试使用refresh_token 获取新的access_token
      if (!store.state.user) {
        redirectLogin()
        return Promise.reject(error)
      }
      // 刷新token
      if (!isRefresh) {
        isRefresh = true
        // 尝试刷新token
        return refreshToken().then(res => {
          if (!res.data.success) {
            throw new Error('刷新 Token 失败')
          }
          // 刷新token 成功
          store.commit('setUser', res.data.content)
          // 把requests队列中的请求重新发出去
          requests.forEach(cb => cb())
          // 重置requests 数组
          requests = []
          return request(error.config)
        }).catch(err => {
          console.log(err)
          store.commit('setUser', null)
          redirectLogin()
          return Promise.reject(error)
        }).finally(() => {
          isRefresh = false // 重置刷新状态
        })
      }
      // 刷新状态下，把请求挂起放到 requests 数组中
      return new Promise(resolve => {
        requests.push(() => {
          resolve(request(error.config))
        })
      })
      /* try {
        const { data } = await axios.create()({
          method: 'POST',
          url: '/front/user/refresh_token',
          data: qs.stringify({
            refreshtoken: store.state.user.refresh_token
          })
        })
        // 成功-> 把本次失败的请求重新发出去
        // 把刷新拿到的access_token 更新到容器和本地存储中
        store.commit('setUser', data.content)
        // 把本次失败的请求重新发出去
        // console.log(error.config, 'error.config')
        return request(error.config)
      } catch (error) {
        // 把当前登录用户状态清除
        store.commit('setUser', null)
        // 刷新token失败了，去重新登录
        redirectLogin()
        return Promise.reject(error)
      } */
    } else if (status === 403) {
      Message.error('没有权限，请联系管理员')
    } else if (status === 404) {
      Message.error('请求资源不存在')
    } else if (status >= 500) {
      Message.error('服务端错误，请联系管理员')
    }
  } else if (error.request) {
    // 请求已经成功发起，但没有收到响应
    // `error.request` 在浏览器中是 XMLHttpRequest 的实例，
    // 而在node.js中是 http.ClientRequest 的实例
    // console.log(error.request);
    Message.error('请求超时，请刷新重试')
  } else {
    // 发送请求时出了点问题
    // console.log(error, 'status =-1')
    Message.error(`请求失败: ${error.message}`)
  }
  return Promise.reject(error)
})

export default request
