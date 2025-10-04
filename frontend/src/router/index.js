import { createRouter, createWebHistory } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import UserLayout from "@/layouts/UserLayout.vue";

import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import CartView from "@/views/CartView.vue";
import OrdersView from "@/views/OrdersView.vue";
import ProfileView from "@/views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/auth",
      component: AuthLayout,
      children: [
        {
          path: "login",
          name: "login",
          component: LoginView,
        },
      ],
    },
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "home",
          component: HomeView,
        },
        {
          path: "cart",
          name: "cart", 
          component: CartView,
        },
      ],
    },
    {
      path: "/profile",
      component: UserLayout,
      children: [
        {
          path: "orders",
          name: "orders",
          component: OrdersView,
        },
        {
          path: "data",
          name: "profile",
          component: ProfileView,
        },
      ],
    },
    {
      path: "/login",
      redirect: "/auth/login",
    },
  ],
});

export default router;
