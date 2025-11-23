import axios from 'axios'
import tokenService from './token-service'


class HttpClient {
  constructor(baseURL = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  
  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenService.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        return this.handleError(error)
      }
    )
  }

  
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          console.error('Ошибка запроса:', data.message || 'Неверные данные')
          break
        case 401:
          console.error('Ошибка авторизации:', data.message || 'Требуется авторизация')
          break
        case 403:
          console.error('Ошибка доступа:', data.message || 'Доступ запрещен')
          break
        case 404:
          console.error('Ошибка:', data.message || 'Ресурс не найден')
          break
        case 500:
          console.error('Ошибка сервера:', data.message || 'Внутренняя ошибка сервера')
          break
        default:
          console.error('Ошибка:', data.message || 'Произошла ошибка')
      }
    } else if (error.request) {
      console.error('Ошибка сети: Нет ответа от сервера')
    } else {
      console.error('Ошибка:', error.message)
    }

    return Promise.reject(error)
  }

  
  get(url, config = {}) {
    return this.client.get(url, config)
  }

  
  post(url, data = {}, config = {}) {
    return this.client.post(url, data, config)
  }

  
  put(url, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }

  
  delete(url, config = {}) {
    return this.client.delete(url, config)
  }
}

export default new HttpClient()

