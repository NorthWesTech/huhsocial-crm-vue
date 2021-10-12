<template>
  <header v-if="content">{{ content }}</header>
</template>

<script>
export default {
  name: "TemplatePageHeader",
  props: {
    content: {
      type: String,
      default: null
    },
    pageNumber: {
      type: Number,
      default: 1
    }
  }
};
</script>

<style lang="scss" scoped>
// header {
//   text-align: center;
//   font-size: 0.9em;
//   color: rgb(165, 164, 164);
//   padding: 2em 0 1em;
// }
</style>
