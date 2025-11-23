import httpClient from './http-client'


class AuthService {
  
  login(credentials) {
    return httpClient.post('/login', credentials)
  }

  
  logout() {
    return httpClient.delete('/logout')
  }

  
  whoAmI() {
    return httpClient.get('/whoAmI')
  }
}

export default new AuthService()

