<template>
  <RouterView />
</template>

<style lang="scss">
@import "@/assets/scss/app.scss";
@use "@/assets/scss/ds-system/ds-colors";
@use "@/assets/scss/ds-system/ds-shadows";
@use "@/assets/scss/ds-system/ds-typography";

body {
  justify-content: center;
  align-items: center;
}

.main__wrapper {
  padding-bottom: 30px;

  background-color: ds-colors.$white;
  box-shadow: ds-shadows.$shadow-light;

  h1 {
    margin-bottom: 0;
    padding: 0 95px;

    text-align: center;

    @include ds-typography.b-s36-h42;
  }

  p {
    padding: 0 95px;

    text-align: center;

    font-size: 20px;
    line-height: 30px;
  }

  b {
    font-size: 1.2em;
  }
}

.main__header {
  margin-bottom: 30px;
  padding: 20px 0;

  background-color: ds-colors.$green-600;

  img {
    display: block;

    margin: 0 auto;
  }
}
</style>
