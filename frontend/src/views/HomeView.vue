<template>
  <main class="content">
    <form action="#" method="post">

      <div class="content__wrapper">
        <h1 class="title title--big">Конструктор пиццы</h1>

        <div class="content__dough">

          <div class="sheet">
            <h2 class="title title--small sheet__title">Выберите тесто</h2>

            <div class="sheet__content dough">
              <label 
                v-for="(doughType, index) in dough" 
                :key="doughType.id"
                :class="`dough__input dough__input--${doughType.id === 1 ? 'light' : 'large'}`"
              >
                <input 
                  type="radio" 
                  name="dought" 
                  :value="doughType.id" 
                  class="visually-hidden"
                  :checked="index === 0"
                >
                <b>{{ doughType.name }}</b>
                <span>{{ doughType.description }}</span>
              </label>
            </div>

          </div>

        </div>

        <div class="content__diameter">
          <div class="sheet">
            <h2 class="title title--small sheet__title">Выберите размер</h2>

            <div class="sheet__content diameter">
              <label 
                v-for="(size, index) in sizes" 
                :key="size.id"
                :class="`diameter__input diameter__input--${index === 0 ? 'small' : index === 1 ? 'normal' : 'big'}`"
              >
                <input 
                  type="radio" 
                  name="diameter" 
                  :value="size.id" 
                  class="visually-hidden"
                  :checked="index === 1"
                >
                <span>{{ size.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="content__ingredients">
          <div class="sheet">
            <h2 class="title title--small sheet__title">Выберите ингредиенты</h2>

            <div class="sheet__content ingredients">

              <div class="ingredients__sauce">
                <p>Основной соус:</p>

                <label 
                  v-for="(sauce, index) in sauces" 
                  :key="sauce.id" 
                  class="radio ingredients__input"
                >
                  <input 
                    type="radio" 
                    name="sauce" 
                    :value="sauce.id"
                    :checked="index === 0"
                  >
                  <span>{{ sauce.name }}</span>
                </label>
              </div>

              <div class="ingredients__filling">
                <p>Начинка:</p>

                <ul class="ingredients__list">
                  <li 
                    v-for="ingredient in ingredients" 
                    :key="ingredient.id" 
                    class="ingredients__item"
                  >
                    <span :class="`filling filling--${getIngredientClass(ingredient.name)}`">{{ ingredient.name }}</span>

                    <div class="counter counter--orange ingredients__counter">
                      <button type="button" class="counter__button counter__button--minus" disabled>
                        <span class="visually-hidden">Меньше</span>
                      </button>
                      <input type="text" name="counter" class="counter__input" value="0">
                      <button type="button" class="counter__button counter__button--plus">
                        <span class="visually-hidden">Больше</span>
                      </button>
                    </div>
                  </li>
                </ul>

              </div>

            </div>
          </div>
        </div>

        <div class="content__pizza">
          <label class="input">
            <span class="visually-hidden">Название пиццы</span>
            <input type="text" name="pizza_name" placeholder="Введите название пиццы">
          </label>

          <div class="content__constructor">
            <div class="pizza pizza--foundation--big-tomato">
              <div class="pizza__wrapper">
                <div class="pizza__filling pizza__filling--ananas"></div>
                <div class="pizza__filling pizza__filling--bacon"></div>
                <div class="pizza__filling pizza__filling--cheddar"></div>
              </div>
            </div>
          </div>

          <div class="content__result">
            <p>Итого: 0 ₽</p>
            <button type="button" class="button" disabled>Готовьте!</button>
          </div>
        </div>

      </div>

    </form>
  </main>
</template>

<script>
import doughData from '@/mocks/dough.json'
import sizesData from '@/mocks/sizes.json'
import ingredientsData from '@/mocks/ingredients.json'
import saucesData from '@/mocks/sauces.json'

export default {
  name: 'HomeView',
  data() {
    return {
      dough: doughData,
      sizes: sizesData,
      ingredients: ingredientsData,
      sauces: saucesData
    }
  },
  methods: {
    getIngredientClass(ingredientName) {
      // Сопоставляем названия ингредиентов с их CSS классами
      const classMap = {
        'Грибы': 'mushrooms',
        'Чеддер': 'cheddar',
        'Салями': 'salami',
        'Ветчина': 'ham',
        'Ананас': 'ananas',
        'Бекон': 'bacon',
        'Лук': 'onion',
        'Чили': 'chile',
        'Халапеньо': 'jalapeno',
        'Маслины': 'olives',
        'Томаты': 'tomatoes',
        'Лосось': 'salmon',
        'Моцарелла': 'mozzarella',
        'Пармезан': 'parmesan',
        'Блю чиз': 'blue_cheese'
      }
      return classMap[ingredientName] || 'default'
    }
  }
}
</script>
