import { defineStore } from 'pinia'
import { authService, tokenService } from '@/services'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    
    currentUser: (state) => state.user,

    
    isLoggedIn: (state) => state.isAuthenticated,

    
    userName: (state) => state.user?.name || '',

    
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.login(credentials)
        const { token, ...userData } = response.data

        tokenService.setToken(token)

        this.user = userData
        this.isAuthenticated = true

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка входа в систему'
        throw error
      } finally {
        this.loading = false
      }
    },

    
    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Ошибка при выходе:', error)
      } finally {
        tokenService.removeToken()
        this.user = null
        this.isAuthenticated = false
      }
    },

    
    async checkAuth() {
      if (!tokenService.hasToken()) {
        this.isAuthenticated = false
        this.user = null
        return false
      }

      try {
        const response = await authService.whoAmI()
        this.user = response.data
        this.isAuthenticated = true
        return true
      } catch (error) {
        tokenService.removeToken()
        this.user = null
        this.isAuthenticated = false
        return false
      }
    },

    
    clearError() {
      this.error = null
    }
  }
})

