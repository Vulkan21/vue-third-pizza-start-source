<template>
  <div class="sign-form">
    <router-link to="/" class="close close--white">
      <span class="visually-hidden">Закрыть форму авторизации</span>
    </router-link>
    
    <div class="sign-form__title">
      <h1 class="title title--small">Авторизуйтесь на сайте</h1>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <div class="sign-form__input">
        <label class="input">
          <span>E-mail</span>
          <input 
            v-model="form.email"
            type="email" 
            name="email" 
            placeholder="example@mail.ru"
            required
          />
        </label>
      </div>

      <div class="sign-form__input">
        <label class="input">
          <span>Пароль</span>
          <input 
            v-model="form.password"
            type="password" 
            name="password" 
            placeholder="***********"
            required
          />
        </label>
      </div>
      
      <button type="submit" class="button" :disabled="isLoading">
        {{ isLoading ? 'Вход...' : 'Авторизоваться' }}
      </button>
    </form>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const isLoading = ref(false)
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const handleSubmit = async () => {
      isLoading.value = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Логин:', form)
        
        router.push({ name: 'home' })
        
        alert(`Добро пожаловать! Вы вошли как ${form.email}`)
      } catch (error) {
        console.error('Login error:', error)
        alert('Ошибка входа. Попробуйте еще раз.')
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      form,
      isLoading,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-typography";
@use "@/assets/scss/ds-system/ds-shadows";

.sign-form {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: ds-colors.$white;
  border-radius: 16px;
  box-shadow: ds-shadows.$shadow-medium;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: ds-colors.$purple-800;
  text-decoration: none;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(ds-colors.$black, 0.1);
  }
  
  &--white {
    color: ds-colors.$white;
    
    &:hover {
      background-color: rgba(ds-colors.$white, 0.1);
    }
  }
  
  &::before {
    content: "×";
    font-size: 24px;
    font-weight: bold;
  }
}

.sign-form__title {
  margin-bottom: 32px;
  text-align: center;
}

.sign-form__input {
  margin-bottom: 24px;
  
  &:last-of-type {
    margin-bottom: 32px;
  }
}

.button {
  width: 100%;
  padding: 16px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
