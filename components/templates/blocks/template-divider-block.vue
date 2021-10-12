<template>
  <hr class="solid" />
</template>

<script>
import globalMixins from "../../../mixins/globals";

export default {
  name: "TemplateDividerBlock",
  mixins: [globalMixins],
  props: {
    pageIndex: {
      type: Number,
      required: true
    },
    editMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      color: "#00B5E2"
    };
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
// .solid {
//   border-top: 2px solid #00B5E2;
// }
</style>
