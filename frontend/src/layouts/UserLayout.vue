<template>
  <div>
    <AppHeader />
    <main class="layout">
      <div class="layout__sidebar sidebar">
        <router-link to="/" class="logo layout__logo">
          <img 
            src="@/assets/img/logo.svg" 
            alt="V!U!E! Pizza logo" 
            width="90" 
            height="40"
          />
        </router-link>

        <router-link 
          class="layout__link" 
          :class="{ 'layout__link--active': $route.name === 'orders' }"
          :to="{ name: 'orders' }"
        >
          История заказов
        </router-link>
        
        <router-link 
          class="layout__link"
          :class="{ 'layout__link--active': $route.name === 'profile' }"
          :to="{ name: 'profile' }"
        >
          Мои данные
        </router-link>
      </div>

      <div class="layout__content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from "./AppHeader.vue";

export default {
  name: "UserLayout",
  components: {
    AppHeader,
  },
};
</script>

<style lang="scss" scoped>
// Design System
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-typography";
@use "@/assets/scss/ds-system/ds-shadows";

.layout {
  display: flex;
  min-height: calc(100vh - 60px); // Высота header
  background-color: ds-colors.$white;
}

.layout__sidebar {
  width: 300px;
  flex-shrink: 0;
  background-color: ds-colors.$silver-100;
  padding: 30px 24px;
  
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.layout__logo {
  display: block;
  
  img {
    display: block;
    width: 90px;
    height: 40px;
  }
}

.layout__link {
  @include ds-typography.r-s16-h19;
  
  display: block;
  padding: 16px 20px;
  color: ds-colors.$black;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(ds-colors.$green-500, 0.1);
  }
  
  &--active {
    background-color: ds-colors.$green-500;
    color: ds-colors.$white;
    font-weight: 700;
  }
}

.layout__content {
  flex: 1;
  padding: 30px;
}

.sidebar {
  // Additional sidebar styles if needed
}

// Responsive
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .layout__sidebar {
    width: 100%;
    flex-direction: row;
    padding: 15px;
    gap: 12px;
  }
  
  .layout__content {
    padding: 20px 15px;
  }
}
</style>
