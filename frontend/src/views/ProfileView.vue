<template>
  <div>
    <div class="layout__title">
      <h1 class="title title--big">Мои данные</h1>
    </div>

    
    <div class="user">
      <picture>
        <source 
          type="image/webp" 
          :srcset="`${user.avatar}@2x.webp 1x, ${user.avatar}@4x.webp 2x`"
        />
        <img 
          :src="`${user.avatar}@2x.jpg`" 
          :srcset="`${user.avatar}@4x.jpg`"
          :alt="user.name" 
          width="72" 
          height="72"
        />
      </picture>
      
      <div class="user__name">
        <span>{{ user.name }}</span>
      </div>
      
      <p class="user__phone">
        Контактный телефон: 
        <span>{{ user.phone }}</span>
      </p>
    </div>

    
    <div 
      v-for="address in addresses" 
      :key="address.id"
      class="layout__address"
    >
      <div v-if="!address.isEditing" class="sheet address-form">
        <div class="address-form__header">
          <b>{{ address.name }}</b>
          <div class="address-form__edit">
            <button 
              type="button" 
              class="icon"
              @click="startEditing(address.id)"
            >
              <span class="visually-hidden">Изменить адрес</span>
            </button>
          </div>
        </div>
        
        <p>{{ formatAddress(address) }}</p>
        
        <small v-if="address.comment">{{ address.comment }}</small>
      </div>

      
      <form 
        v-else
        @submit.prevent="saveAddress(address.id)"
        class="address-form address-form--opened sheet"
      >
        <div class="address-form__header">
          <b>{{ address.name || 'Новый адрес' }}</b>
        </div>

        <div class="address-form__wrapper">
          <div class="address-form__input">
            <label class="input">
              <span>Название адреса*</span>
              <input 
                v-model="address.editData.name"
                type="text" 
                placeholder="Введите название адреса" 
                required
              />
            </label>
          </div>
          
          <div class="address-form__input address-form__input--size--normal">
            <label class="input">
              <span>Улица*</span>
              <input 
                v-model="address.editData.street"
                type="text" 
                placeholder="Введите название улицы" 
                required
              />
            </label>
          </div>
          
          <div class="address-form__input address-form__input--size--small">
            <label class="input">
              <span>Дом*</span>
              <input 
                v-model="address.editData.house"
                type="text" 
                placeholder="Введите номер дома" 
                required
              />
            </label>
          </div>
          
          <div class="address-form__input address-form__input--size--small">
            <label class="input">
              <span>Квартира</span>
              <input 
                v-model="address.editData.apartment"
                type="text" 
                placeholder="Введите № квартиры"
              />
            </label>
          </div>
          
          <div class="address-form__input">
            <label class="input">
              <span>Комментарий</span>
              <input 
                v-model="address.editData.comment"
                type="text" 
                placeholder="Введите комментарий"
              />
            </label>
          </div>
        </div>

        <div class="address-form__buttons">
          <button 
            type="button" 
            class="button button--transparent"
            @click="deleteAddress(address.id)"
          >
            Удалить
          </button>
          
          <button type="submit" class="button">
            Сохранить
          </button>
        </div>
      </form>
    </div>

    
    <div class="layout__button">
      <button 
        type="button" 
        class="button button--border"
        @click="addNewAddress"
      >
        Добавить новый адрес
      </button>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useProfileStore } from '@/stores'

export default {
  name: 'ProfileView',
  setup() {
    const profileStore = useProfileStore()
    
    onMounted(async () => {
      if (!profileStore.isAuthenticated) {
        await profileStore.login({
          name: 'Василий Ложкин',
          phone: '+7 999-999-99-99',
          email: 'vasily@example.com'
        })
      }
    })
    
    const user = computed(() => ({
      name: profileStore.fullUserInfo?.name || 'Пользователь',
      phone: profileStore.formattedPhone,
      avatar: profileStore.user.avatar || '@/assets/img/users/user5'
    }))
    
    const addresses = computed(() => {
      return profileStore.formattedAddresses.map(addr => ({
        ...addr,
        isEditing: addr.isEditing || false,
        editData: addr.editData || {}
      }))
    })
    
    const formatAddress = (address) => {
      return address.formatted || `${address.street}, д. ${address.building}${address.apartment ? `, кв. ${address.apartment}` : ''}`
    }
    
    const startEditing = async (addressId) => {
      const address = profileStore.getAddressById(addressId)
      if (address) {
        address.isEditing = true
        address.editData = {
          name: address.name || '',
          street: address.street || '',
          house: address.building || address.house || '',
          apartment: address.apartment || address.flat || '',
          comment: address.comment || ''
        }
      }
    }
    
    const saveAddress = async (addressId) => {
      try {
        const address = profileStore.getAddressById(addressId)
        if (address && address.editData) {
          await profileStore.updateAddress(addressId, {
            name: address.editData.name,
            street: address.editData.street,
            building: address.editData.house,
            apartment: address.editData.apartment,
            comment: address.editData.comment
          })
          
          address.isEditing = false
          address.editData = {}
          
          console.log('Адрес сохранен:', address)
        }
      } catch (error) {
        console.error('Ошибка сохранения адреса:', error)
        alert('Ошибка при сохранении адреса')
      }
    }
    
    const deleteAddress = async (addressId) => {
      if (confirm('Вы уверены, что хотите удалить адрес?')) {
        try {
          await profileStore.deleteAddress(addressId)
          console.log(`Адрес #${addressId} удален`)
        } catch (error) {
          console.error('Ошибка удаления адреса:', error)
          alert('Ошибка при удалении адреса')
        }
      }
    }
    
    const addNewAddress = async () => {
      try {
        const newAddress = await profileStore.addAddress({
          name: '',
          street: '',
          building: '',
          apartment: '',
          comment: ''
        })
        
        if (newAddress) {
          newAddress.isEditing = true
          newAddress.editData = {
            name: '',
            street: '',
            house: '',
            apartment: '',
            comment: ''
          }
        }
      } catch (error) {
        console.error('Ошибка добавления адреса:', error)
        alert('Ошибка при добавлении нового адреса')
      }
    }
    
    return {
      user,
      addresses,
      formatAddress,
      startEditing,
      saveAddress,
      deleteAddress,
      addNewAddress
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-typography";

.layout__title {
  margin-bottom: 30px;
}

.user {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  
  picture,
  img {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

.user__name {
  flex: 1;
  
  span {
    font-size: 20px;
    font-weight: 700;
    line-height: 23px;
    color: ds-colors.$black;
  }
}

.user__phone {
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  margin: 0;
  color: ds-colors.$purple-800;
  
  span {
    color: ds-colors.$black;
    font-weight: 600;
  }
}

.layout__address {
  margin-bottom: 20px;
  
  &:last-of-type {
    margin-bottom: 30px;
  }
}

.address-form {
  padding: 24px;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    b {
      font-size: 16px;
      font-weight: 700;
      line-height: 19px;
      color: ds-colors.$black;
    }
  }
  
  &__edit {
    .icon {
      width: 24px;
      height: 24px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: rgba(ds-colors.$black, 0.1);
      }
      
      &::before {
        content: "✎";
        font-size: 14px;
        color: ds-colors.$purple-800;
      }
    }
  }
  
  &__wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  
  &__input {
    &--size--normal {
    }
    
    &--size--small {
    }
  }
  
  &__buttons {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
  }
  
  &--opened {
    border: 2px solid ds-colors.$green-500;
  }
  
  p {
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
    margin: 0 0 8px 0;
    color: ds-colors.$black;
  }
  
  small {
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    color: ds-colors.$purple-800;
    font-style: italic;
  }
}

.layout__button {
  text-align: center;
  
  .button {
    min-width: 200px;
    padding: 16px 32px;
  }
}

@media (max-width: 768px) {
  .user {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
    gap: 16px;
  }
  
  .address-form__wrapper {
    grid-template-columns: 1fr;
  }
  
  .address-form__buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
